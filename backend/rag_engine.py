"""
rag_engine.py
─────────────
RAG pipeline for Lucknow Foodie.

Khidmatgar is the chatbot persona — a warm Awadhi dining guide for IIIT Lucknow students.
This module handles:
  - ChromaDB collections: restaurants, reviews, qna
  - Hybrid retrieval: rule-based filter pre-filtering + semantic search
  - Grounded Gemini generation with source attribution
  - Session memory (multi-turn conversation)
"""

import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

import chromadb
from sentence_transformers import SentenceTransformer
import google.generativeai as genai

from lucknow_foodie_data_utils import RestaurantDB

load_dotenv()


# ── System prompt for Khidmatgar ──────────────────────────────────────────────
KHIDMATGAR_SYSTEM_PROMPT = """You are Khidmatgar — "the one who serves and attends to guests" — a warm, knowledgeable Awadhi dining guide built specifically for students of IIIT Lucknow.

Your personality:
- Warm, friendly, occasionally uses Hinglish (yaar, ekdum mast, must try kar, bilkul sahi)
- Deep knowledge of Lucknow's food culture — you can distinguish Awadhi dum from Mughlai style, know the difference between Tunday's galouti and a regular seekh
- You understand student life: budget constraints, late-night hunger, delivery options, study sessions, birthday dinners

Your strict rules:
1. ONLY recommend or discuss restaurants from the provided context chunks. Never make up restaurant names, ratings, addresses, or details.
2. If the retrieved context does not contain enough information to answer a specific question, say: "Khidmatgar ko pakki jaankari nahi hai iske baare mein — I don't have enough verified info on that. Try asking about something in the dataset!"
3. When recommending places, always mention: restaurant name, area, approximate budget per person (₹ symbol), distance from campus, and 1-2 signature dishes.
4. End every recommendation with a practical tip (e.g., "Get there before 8 PM or it sells out!" or "Tuesday pe app coupons check karo for deals!").
5. If student reviews or Q&A context is provided, reference it naturally: "Students mention the portions are generous here" or "A student noted it's great for takeout."
6. For questions about non-food topics, politely redirect: "Main sirf khane-peene ke baare mein jaanta hoon! Ask me about food near IIIT Lucknow."
"""


class RAGEngine:
    def __init__(self):
        # Load restaurant data
        json_path = "lucknow_restaurants.json"
        if not os.path.exists(json_path):
            # Try one level up (if run from a subdirectory)
            json_path = os.path.join(os.path.dirname(__file__), "lucknow_restaurants.json")
        self.db = RestaurantDB(json_path)

        # ChromaDB — persistent storage
        chroma_path = os.path.join(os.path.dirname(__file__), "chroma_db")
        self.chroma_client = chromadb.PersistentClient(path=chroma_path)

        # Sentence transformer model
        print("[RAGEngine] Loading sentence-transformer model...")
        self.embed_model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[RAGEngine] Model loaded.")

        # Initialise Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_ready = bool(api_key and api_key != "your_gemini_api_key_here")
        if self.gemini_ready:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=KHIDMATGAR_SYSTEM_PROMPT,
            )
            print("[RAGEngine] Gemini 2.5 Flash ready — Khidmatgar online.")
        else:
            print("[RAGEngine] WARNING: No valid GEMINI_API_KEY. Chat will return placeholder.")

        # ── Collections ───────────────────────────────────────────────────────
        self.restaurants_col = self._get_or_create_collection("lucknow_restaurants")
        self.reviews_col     = self._get_or_create_collection("lucknow_reviews")
        self.qna_col         = self._get_or_create_collection("lucknow_qna")

        # Populate restaurants collection if empty
        if self.restaurants_col.count() == 0:
            self._embed_all_restaurants()

    # ── Collection helpers ────────────────────────────────────────────────────

    def _get_or_create_collection(self, name: str):
        try:
            col = self.chroma_client.get_collection(name=name)
            print(f"[RAGEngine] Found existing collection '{name}' ({col.count()} docs).")
            return col
        except Exception:
            print(f"[RAGEngine] Creating new collection '{name}'.")
            return self.chroma_client.create_collection(name=name)

    def _embed_all_restaurants(self):
        docs = self.db.all_rag_documents()
        texts     = [d["text"]     for d in docs]
        ids       = [d["id"]       for d in docs]
        metadatas = [d["metadata"] for d in docs]

        print(f"[RAGEngine] Embedding {len(docs)} restaurant documents...")
        embeddings = self.embed_model.encode(texts).tolist()
        self.restaurants_col.add(ids=ids, embeddings=embeddings, documents=texts, metadatas=metadatas)
        print("[RAGEngine] Restaurant embeddings complete.")

    # ── Review / Q&A upsert ───────────────────────────────────────────────────

    def upsert_review(self, review_id: int, restaurant_id: str, text: str, rating: float, nickname: str):
        """Embed a new review and upsert into the reviews ChromaDB collection."""
        doc_id  = f"review_{review_id}"
        content = f"Student review for restaurant {restaurant_id} (rating: {rating}/5 by {nickname}): {text}"
        embedding = self.embed_model.encode(content).tolist()
        self.reviews_col.upsert(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[content],
            metadatas=[{"restaurant_id": restaurant_id, "rating": rating, "type": "review"}],
        )

    def upsert_question(self, q_id: int, restaurant_id: str, text: str, nickname: str):
        doc_id  = f"question_{q_id}"
        content = f"Student question about restaurant {restaurant_id} (asked by {nickname}): {text}"
        embedding = self.embed_model.encode(content).tolist()
        self.qna_col.upsert(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[content],
            metadatas=[{"restaurant_id": restaurant_id, "type": "question"}],
        )

    def upsert_answer(self, a_id: int, q_id: int, restaurant_id: str, text: str, nickname: str):
        doc_id  = f"answer_{a_id}"
        content = f"Student answer about restaurant {restaurant_id} (answered by {nickname}): {text}"
        embedding = self.embed_model.encode(content).tolist()
        self.qna_col.upsert(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[content],
            metadatas=[{"restaurant_id": restaurant_id, "q_id": q_id, "type": "answer"}],
        )

    # ── Intent extraction (rule-based) ────────────────────────────────────────

    def parse_filters(self, query: str) -> Dict[str, Any]:
        """Extract structured filters from a natural language query."""
        ql = query.lower()
        filters: Dict[str, Any] = {}

        # Diet
        if "veg" in ql and "non-veg" not in ql and "nonveg" not in ql:
            filters["diet"] = "veg"
        elif "non-veg" in ql or "nonveg" in ql or "chicken" in ql or "mutton" in ql or "kebab" in ql:
            filters["diet"] = "non-veg"

        # Budget
        budget_map = {
            "under 100": 100, "under ₹100": 100,
            "under 200": 200, "under ₹200": 200,
            "under 300": 300, "under ₹300": 300,
            "under 500": 500, "under ₹500": 500,
            "under 1000": 1000,
            "cheap": 200, "budget": 300, "affordable": 300,
        }
        for kw, cap in budget_map.items():
            if kw in ql:
                filters["budget_max"] = cap
                break

        # Dish
        for dish in ["biryani", "kebab", "chaat", "pizza", "burger", "coffee", "chai", "kulfi", "momos", "dosa", "thali"]:
            if dish in ql:
                filters["dish"] = dish
                break

        # Distance
        if any(w in ql for w in ["near", "close", "nearby", "campus"]):
            filters["max_distance_km"] = 5

        # Delivery
        if "delivery" in ql:
            filters["delivery"] = True

        # Vibe
        if any(w in ql for w in ["late night", "late-night", "midnight", "1 am", "2 am"]):
            filters["vibe"] = "late-night"
        elif any(w in ql for w in ["date", "romantic", "special"]):
            filters["vibe"] = "date-night"
        elif any(w in ql for w in ["study", "work", "cafe", "coffee shop"]):
            filters["vibe"] = "study-cafe"
        elif any(w in ql for w in ["group", "friends", "outing", "party", "birthday"]):
            filters["vibe"] = "group-outing"

        return filters

    # ── Main chat process ─────────────────────────────────────────────────────

    def process_chat(self, query: str, history: List[Dict[str, str]]):
        """
        Full RAG pipeline:
        1. Parse intent → pre-filter DB
        2. Semantic search on restaurants + reviews + qna
        3. Merge and deduplicate
        4. Build grounded Gemini prompt
        5. Return reply + restaurants + sources
        """
        # 1. Intent-based pre-filtering
        filters = self.parse_filters(query)
        db_results = self.db.search(**filters, top_n=5)

        # 2. Semantic search across all three collections
        query_embedding = self.embed_model.encode(query).tolist()

        def safe_query(collection, n=5):
            try:
                count = collection.count()
                if count == 0:
                    return {"ids": [[]], "documents": [[]], "metadatas": [[]]}
                return collection.query(query_embeddings=[query_embedding], n_results=min(n, count))
            except Exception:
                return {"ids": [[]], "documents": [[]], "metadatas": [[]]}

        rest_results    = safe_query(self.restaurants_col, n=5)
        review_results  = safe_query(self.reviews_col,     n=3)
        qna_results     = safe_query(self.qna_col,         n=3)

        # 3. Merge restaurant IDs (DB filter + vector search)
        db_ids     = {r.id for r in db_results}
        merged_ids = list(db_ids)
        for vid in (rest_results["ids"][0] if rest_results["ids"] else []):
            if vid not in db_ids:
                merged_ids.append(vid)

        final_restaurants = []
        for rid in merged_ids[:5]:
            r = self.db.get_by_id(rid)
            if r:
                final_restaurants.append(r)

        # 4. Build context
        restaurant_context = "\n\n".join(r.to_rag_text() for r in final_restaurants)

        review_context = ""
        review_docs = review_results.get("documents", [[]])[0]
        if review_docs:
            review_context = "\n\nSTUDENT REVIEWS:\n" + "\n".join(f"- {d}" for d in review_docs[:3])

        qna_context = ""
        qna_docs = qna_results.get("documents", [[]])[0]
        if qna_docs:
            qna_context = "\n\nSTUDENT Q&A:\n" + "\n".join(f"- {d}" for d in qna_docs[:3])

        if final_restaurants:
            prompt = (
                f"User Query: {query}\n\n"
                f"RESTAURANT CONTEXT:\n{restaurant_context}"
                f"{review_context}"
                f"{qna_context}\n\n"
                f"Use ONLY the above context to answer. Do not invent any restaurant names or details."
            )
        else:
            prompt = (
                f"User Query: {query}\n\n"
                f"No restaurants matched the specific criteria. "
                f"Let the student know politely in Hinglish, and suggest they broaden their search."
            )

        # 5. Build Gemini history
        gemini_history = []
        for msg in history[-6:]:  # Keep last 3 turns (6 messages) for context window
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.get("content", "")]})
        gemini_history.append({"role": "user", "parts": [prompt]})

        # 6. Generate
        if not self.gemini_ready:
            reply = "Khidmatgar yahan hai! But I need a Gemini API key to respond. Here are some places I found:"
        else:
            try:
                response = self.model.generate_content(gemini_history)
                reply = response.text
            except Exception as e:
                try:
                    response = self.model.generate_content(prompt)
                    reply = response.text
                except Exception as e2:
                    reply = f"Sorry yaar, kuch technical issue aa gayi. Error: {e2}"

        # 7. Build sources list
        sources = [{"name": r.name, "collection": "restaurants", "snippet": r.review_summary[:80]} for r in final_restaurants]

        return {
            "reply": reply,
            "restaurants": final_restaurants,
            "sources": sources,
        }
