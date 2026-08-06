# 🍢 BuzzIIIT Guide

## Live at : https://buzziiit.onrender.com/

> *"Budget bhi chahiye aur taste bhi."*
> An AI-powered, RAG-based restaurant recommendation system built exclusively for students of **IIIT Lucknow** — anchored in Awadhi food culture, not generic food-app templates.

<br/>

## ✨ What Makes This Different

| Feature | How it works |
|---------|-------------|
| 🤖 **Khidmatgar** | AI chatbot persona ("the one who serves") — answers only from verified restaurant + student review data, never hallucinates |
| 🪔 **Dastarkhwan Strip** | One-tap category tiles (Kebabs / Biryani / Chaat / Late-Night / Budget Eats…) that wire directly into filter state |
| ⭐ **Reviews → RAG** | Student reviews are embedded into ChromaDB, so Khidmatgar can say *"students mention the biryani portions are generous"* |
| 💬 **Dastarkhwan Talk** | Per-restaurant student Q&A threads — ask/answer things like "is it crowded on weekends?" |
| 🗺️ **Interactive Map** | Leaflet + OpenStreetMap, custom marigold markers, IIIT Lucknow as reference center |
| 🎨 **Awadhi Design** | Baloo 2 + Poppins + JetBrains Mono fonts, 5-color palette grounded in Lucknow — not a generic food template |

<br/>

## 🚀 Quick Start

### 1 — Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Add your Gemini API key
# Edit backend/.env → GEMINI_API_KEY=your_key_here

# Start the server
uvicorn main:app --reload --port 8000
```

> **First run:** Khidmatgar will load 28 restaurants, create the SQLite database (`foodie.db`), and build ChromaDB embeddings. Takes ~20–30 seconds.

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

<br/>

## 🏗️ Tech Stack

### Frontend
| Library | Version | Role |
|---------|---------|------|
| React | 19 | UI framework |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | v4 | Styling (custom Awadhi design system) |
| React Leaflet | 5 | Interactive restaurant map |
| Axios | 1.15 | API communication |
| Lucide React | Latest | Icons |

### Backend
| Library | Role |
|---------|------|
| FastAPI | REST API server |
| Google Gemini 2.5 Flash | Language model for Khidmatgar |
| Sentence Transformers (`all-MiniLM-L6-v2`) | Local text embeddings |
| ChromaDB | Persistent vector store (restaurants + reviews + Q&A) |
| SQLAlchemy + SQLite | Structured storage for reviews & Q&A |
| python-dotenv | API key management |

<br/>

## 📁 Project Structure

```
Lucknow-foddie/
│
├── backend/
│   ├── main.py                      # FastAPI app — all endpoints
│   ├── rag_engine.py                # Khidmatgar RAG pipeline
│   ├── database.py                  # SQLite + SQLAlchemy (reviews, Q&A)
│   ├── lucknow_foodie_data_utils.py # RestaurantDB — filter + search engine
│   ├── lucknow_restaurants.json     # 28 restaurants with full metadata
│   ├── requirements.txt
│   ├── .env                         # GEMINI_API_KEY goes here
│   ├── chroma_db/                   # Auto-generated vector store
│   └── foodie.db                    # Auto-generated SQLite database
│
└── frontend/
    ├── index.html                   # Fonts, title, meta
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx                 # React entry point
        ├── App.jsx                  # App shell — nav, hero, sections
        ├── index.css                # Awadhi design system tokens
        │
        ├── api/
        │   └── client.js            # Axios API client
        │
        ├── hooks/
        │   └── useChat.js           # Chat state + Khidmatgar session
        │
        └── components/
            ├── DastarkhwanStrip.jsx # Category tiles (the signature strip)
            ├── FilterBar.jsx        # Pill chip filters
            ├── RestaurantCard.jsx   # Tiffin-box style card
            ├── ChatWindow.jsx       # Khidmatgar chat UI
            ├── MessageBubble.jsx    # Bot/user bubbles + source citation
            ├── QuickChips.jsx       # Suggested questions
            ├── MapView.jsx          # Leaflet map with custom markers
            ├── StarInput.jsx        # Interactive star rating
            ├── ReviewSection.jsx    # Reviews list + post form
            └── QnASection.jsx       # Dastarkhwan Talk threads
```

<br/>

## 🌐 API Reference

### Restaurants
```
GET  /api/restaurants                         List & filter restaurants
GET  /api/restaurant/{id}                     Single restaurant detail
GET  /api/health                              Health check
```

**Filter params for `GET /api/restaurants`:**
| Param | Values | Example |
|-------|--------|---------|
| `diet` | `Veg`, `Non-Veg` | `?diet=Veg` |
| `budget_max` | integer (₹) | `?budget_max=300` |
| `vibe` | `late-night`, `date-night`, `study-cafe` | `?vibe=late-night` |
| `area` | `Gomti Nagar`, `Hazratganj`, etc. | `?area=Gomti+Nagar` |
| `sort_by` | `rating`, `distance`, `budget` | `?sort_by=distance` |

### Khidmatgar Chat
```
POST /api/chat
```
```json
// Request
{ "message": "Best kebab near campus", "history": [] }

// Response
{
  "reply": "Yaar, Tunday Kababi in Aminabad is legendary...",
  "restaurants": [ { "id": "R001", "name": "Tunday Kababi", ... } ],
  "sources": [ { "name": "Tunday Kababi", "collection": "restaurants", "snippet": "..." } ]
}
```

### Reviews
```
POST /api/restaurants/{id}/reviews            Post a review
GET  /api/restaurants/{id}/reviews            List reviews
GET  /api/restaurants/{id}/rating-summary     { average, count }
```

### Student Q&A — Dastarkhwan Talk
```
POST /api/restaurants/{id}/questions          Post a question
GET  /api/restaurants/{id}/questions          Full Q&A thread (with answers)
POST /api/questions/{id}/answers              Answer a question
```

<br/>

## 🎨 Design System

### Color Palette

| Token | Hex | Used for |
|-------|-----|---------|
| `marigold` | `#F5B92C` | Primary buttons, active chips, CTAs, hover states |
| `ittar-cream` | `#FFF8E9` | Page background |
| `kebab-brown` | `#2B1710` | Headlines, nav text, dark surfaces, user bubbles |
| `chili-red` | `#E1483C` | Star ratings, "spicy"/trending tags, CTAs |
| `pudina-green` | `#4C7A52` | Veg tags, Q&A accents, positive review indicators |

### Typography
| Font | Role | Why |
|------|------|-----|
| **Baloo 2** | Display / Headlines | Rounded, chunky, bold — reads as local, not corporate |
| **Poppins** | Body text | Clean, readable at small sizes |
| **JetBrains Mono** | Numbers only (ratings, ₹ price, km distance) | Distinct "precise tool" feel — separates data from prose |

<br/>

## 🤖 How the RAG Pipeline Works

```
User query
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  1. Intent extraction (rule-based)                       │
│     → budget / diet / vibe / dish / distance keywords    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  2. Hybrid retrieval (parallel)                          │
│     ├── DB filter → top 5 structured matches             │
│     ├── ChromaDB: restaurants collection (semantic)      │
│     ├── ChromaDB: reviews collection (student feedback)  │
│     └── ChromaDB: qna collection (student discussions)   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  3. Merge & deduplicate → top 5 restaurants              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  4. Gemini 2.5 Flash (Khidmatgar system prompt)          │
│     → answers ONLY from retrieved context               │
│     → says "pakki jaankari nahi" if info is missing     │
│     → uses last 3 turns for session memory              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
              Reply + restaurants + sources
```

<br/>

## 📊 Dataset

28 restaurants near IIIT Lucknow (Ahmamau, Lucknow), each with:

- GPS coordinates (latitude/longitude)
- Budget per person (₹) + label (very-budget → expensive)
- Cuisine types, signature dishes, vibe tags
- Hours (open/close), phone, address
- UPI, delivery, dine-in, takeaway flags
- Student review summary
- Distance from IIIT Lucknow campus

Covers: Tunday Kababi, Wahid Biryani, Dastarkhwan, Royal Cafe, Sharma Ji ki Chai, Sardar Ji ka Dhaba, Domino's (campus-adjacent), Social, Farzi Cafe, and more.

<br/>

## 🔑 Getting a Free Gemini API Key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with Google → Create API Key
3. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

Free tier: **15 requests/min · 1M tokens/day** — more than enough for a student project.

<br/>

## 🚫 Constraints (by design)

- ✅ No paid APIs (Leaflet + OpenStreetMap, local embeddings)
- ✅ No cloud vector DB (ChromaDB runs locally)
- ✅ No auth system — nickname-only for reviews & Q&A (student MVP)
- ✅ No new frontend framework — React + Vite + Tailwind v4 only
- ✅ SQLite only for structured data (no PostgreSQL overhead)

<br/>

## 👨‍💻 Built For

> Students of IIIT Lucknow who know Lucknow's food scene is legendary — and deserve a guide that actually knows the difference between Aminabad's kebabs and Gomti Nagar's cafes.

---

*Khidmatgar yahan hai.* 🍽️
