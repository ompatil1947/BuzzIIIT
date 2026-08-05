"""
database.py
───────────
SQLite + SQLAlchemy setup for Lucknow Foodie reviews and Q&A.
Creates foodie.db automatically in the backend directory.

Tables:
    reviews   — per-restaurant student reviews with 1-5 star ratings
    questions — per-restaurant student questions (Dastarkhwan Talk)
    answers   — answers to student questions
"""

import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float,
    DateTime, Text, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# ── DB path (same directory as this file) ─────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), "foodie.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite in FastAPI
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ────────────────────────────────────────────────────────────────────

class Review(Base):
    __tablename__ = "reviews"

    id              = Column(Integer, primary_key=True, index=True)
    restaurant_id   = Column(String, index=True, nullable=False)
    nickname        = Column(String, nullable=False, default="Anonymous")
    rating          = Column(Float, nullable=False)          # 1.0 – 5.0
    text            = Column(Text, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)


class Question(Base):
    __tablename__ = "questions"

    id              = Column(Integer, primary_key=True, index=True)
    restaurant_id   = Column(String, index=True, nullable=False)
    nickname        = Column(String, nullable=False, default="Anonymous")
    text            = Column(Text, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    answers         = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id              = Column(Integer, primary_key=True, index=True)
    question_id     = Column(Integer, ForeignKey("questions.id"), nullable=False)
    nickname        = Column(String, nullable=False, default="Anonymous")
    text            = Column(Text, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    question        = relationship("Question", back_populates="answers")


# ── Helpers ───────────────────────────────────────────────────────────────────

def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
    print("[DB] SQLite tables ready at:", DB_PATH)


def get_db():
    """Dependency for FastAPI routes — yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
