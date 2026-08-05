"""
main.py
───────
FastAPI server for Lucknow Foodie.

Endpoints:
    GET  /api/restaurants                        — list with filters
    GET  /api/restaurant/{id}                    — single restaurant detail
    GET  /api/health                             — health check

    POST /api/chat                               — Khidmatgar RAG chatbot

    POST /api/restaurants/{id}/reviews           — post a review
    GET  /api/restaurants/{id}/reviews           — list reviews
    GET  /api/restaurants/{id}/rating-summary    — average rating + count

    POST /api/restaurants/{id}/questions         — post a question (Dastarkhwan Talk)
    GET  /api/restaurants/{id}/questions         — get Q&A thread
    POST /api/questions/{qid}/answers            — answer a question
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from datetime import datetime

from rag_engine import RAGEngine
from database import init_db, get_db, Review, Question, Answer


# ── Startup / Shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[Startup] Initialising SQLite tables...")
    init_db()
    print("[Startup] Initialising RAG Engine (Khidmatgar)...")
    app.state.rag = RAGEngine()
    print("[Startup] Khidmatgar is ready to serve! 🍽️")
    yield
    # Shutdown (nothing to clean up)


app = FastAPI(
    title="Lucknow Foodie — Khidmatgar API",
    description="RAG-powered restaurant guide for IIIT Lucknow students",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class ReviewCreate(BaseModel):
    nickname: str = Field(default="Anonymous", max_length=50)
    rating:   float = Field(..., ge=1, le=5)
    text:     str = Field(..., min_length=5, max_length=1000)

class QuestionCreate(BaseModel):
    nickname: str = Field(default="Anonymous", max_length=50)
    text:     str = Field(..., min_length=5, max_length=500)

class AnswerCreate(BaseModel):
    nickname: str = Field(default="Anonymous", max_length=50)
    text:     str = Field(..., min_length=3, max_length=1000)


# ── Helper: serialize datetime ────────────────────────────────────────────────
def fmt_dt(dt: Optional[datetime]) -> Optional[str]:
    return dt.isoformat() if dt else None


# ── Helper: get rag from app state ───────────────────────────────────────────
def get_rag() -> RAGEngine:
    return app.state.rag


# ═══════════════════════════════════════════════════════════════════════════════
#  RESTAURANT ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/restaurants")
async def get_restaurants(
    diet:       Optional[str]  = None,
    budget_max: Optional[int]  = None,
    vibe:       Optional[str]  = None,
    area:       Optional[str]  = None,
    dish:       Optional[str]  = None,
    delivery:   Optional[bool] = None,
    sort_by:    str            = "rating",
    rag: RAGEngine = Depends(get_rag),
):
    if diet and diet.lower() in ("all", ""): diet = None
    if area and area.lower() in ("all areas", ""): area = None

    results = rag.db.search(
        diet=diet, budget_max=budget_max, vibe=vibe,
        area=area, dish=dish, delivery=delivery,
        sort_by=sort_by, top_n=50,
    )
    return [r.__dict__ for r in results]


@app.get("/api/restaurant/{restaurant_id}")
async def get_restaurant(restaurant_id: str, rag: RAGEngine = Depends(get_rag)):
    r = rag.db.get_by_id(restaurant_id)
    if r:
        return r.__dict__
    raise HTTPException(status_code=404, detail="Restaurant not found")


@app.get("/api/health")
async def health_check(rag: RAGEngine = Depends(get_rag)):
    return {
        "status": "ok",
        "persona": "Khidmatgar",
        "restaurants_loaded": len(rag.db.restaurants),
        "chroma_ready": True,
        "gemini_ready": rag.gemini_ready,
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  CHAT ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest, rag: RAGEngine = Depends(get_rag)):
    try:
        result = rag.process_chat(req.message, req.history)
        return {
            "reply":       result["reply"],
            "restaurants": [r.__dict__ for r in result["restaurants"]],
            "sources":     result.get("sources", []),
            "sources_count": len(result.get("sources", [])),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
#  REVIEWS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/restaurants/{restaurant_id}/reviews", status_code=201)
async def post_review(
    restaurant_id: str,
    body: ReviewCreate,
    db:  Session    = Depends(get_db),
    rag: RAGEngine  = Depends(get_rag),
):
    # Verify restaurant exists
    if not rag.db.get_by_id(restaurant_id):
        raise HTTPException(status_code=404, detail="Restaurant not found")

    review = Review(
        restaurant_id=restaurant_id,
        nickname=body.nickname.strip() or "Anonymous",
        rating=body.rating,
        text=body.text.strip(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Embed into ChromaDB reviews collection
    try:
        rag.upsert_review(review.id, restaurant_id, body.text, body.rating, body.nickname)
    except Exception as e:
        print(f"[Warning] ChromaDB upsert failed for review {review.id}: {e}")

    return {
        "id":            review.id,
        "restaurant_id": review.restaurant_id,
        "nickname":      review.nickname,
        "rating":        review.rating,
        "text":          review.text,
        "created_at":    fmt_dt(review.created_at),
    }


@app.get("/api/restaurants/{restaurant_id}/reviews")
async def get_reviews(restaurant_id: str, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        {
            "id":         r.id,
            "nickname":   r.nickname,
            "rating":     r.rating,
            "text":       r.text,
            "created_at": fmt_dt(r.created_at),
        }
        for r in reviews
    ]


@app.get("/api/restaurants/{restaurant_id}/rating-summary")
async def get_rating_summary(restaurant_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
    if not reviews:
        return {"average": None, "count": 0}
    avg = round(sum(r.rating for r in reviews) / len(reviews), 1)
    return {"average": avg, "count": len(reviews)}


# ═══════════════════════════════════════════════════════════════════════════════
#  Q&A ENDPOINTS — "Dastarkhwan Talk"
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/restaurants/{restaurant_id}/questions", status_code=201)
async def post_question(
    restaurant_id: str,
    body: QuestionCreate,
    db:  Session   = Depends(get_db),
    rag: RAGEngine = Depends(get_rag),
):
    if not rag.db.get_by_id(restaurant_id):
        raise HTTPException(status_code=404, detail="Restaurant not found")

    q = Question(
        restaurant_id=restaurant_id,
        nickname=body.nickname.strip() or "Anonymous",
        text=body.text.strip(),
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    try:
        rag.upsert_question(q.id, restaurant_id, body.text, body.nickname)
    except Exception as e:
        print(f"[Warning] ChromaDB upsert failed for question {q.id}: {e}")

    return {
        "id":            q.id,
        "restaurant_id": q.restaurant_id,
        "nickname":      q.nickname,
        "text":          q.text,
        "created_at":    fmt_dt(q.created_at),
        "answers":       [],
    }


@app.get("/api/restaurants/{restaurant_id}/questions")
async def get_questions(restaurant_id: str, db: Session = Depends(get_db)):
    questions = (
        db.query(Question)
        .filter(Question.restaurant_id == restaurant_id)
        .order_by(Question.created_at.desc())
        .all()
    )
    return [
        {
            "id":         q.id,
            "nickname":   q.nickname,
            "text":       q.text,
            "created_at": fmt_dt(q.created_at),
            "answers": [
                {
                    "id":         a.id,
                    "nickname":   a.nickname,
                    "text":       a.text,
                    "created_at": fmt_dt(a.created_at),
                }
                for a in sorted(q.answers, key=lambda x: x.created_at)
            ],
        }
        for q in questions
    ]


@app.post("/api/questions/{question_id}/answers", status_code=201)
async def post_answer(
    question_id: int,
    body: AnswerCreate,
    db:  Session   = Depends(get_db),
    rag: RAGEngine = Depends(get_rag),
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    a = Answer(
        question_id=question_id,
        nickname=body.nickname.strip() or "Anonymous",
        text=body.text.strip(),
    )
    db.add(a)
    db.commit()
    db.refresh(a)

    try:
        rag.upsert_answer(a.id, question_id, q.restaurant_id, body.text, body.nickname)
    except Exception as e:
        print(f"[Warning] ChromaDB upsert failed for answer {a.id}: {e}")

    return {
        "id":          a.id,
        "question_id": a.question_id,
        "nickname":    a.nickname,
        "text":        a.text,
        "created_at":  fmt_dt(a.created_at),
    }
