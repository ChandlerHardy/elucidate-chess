from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, JSON, LargeBinary, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    rating = Column(Integer, default=1200)
    subscription_tier = Column(String, default="free")  # free, pro
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)

    # Relationships
    games = relationship("Game", back_populates="user", cascade="all, delete-orphan")
    concept_progress = relationship("ConceptProgress", back_populates="user", cascade="all, delete-orphan")


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # PGN and move data
    pgn = Column(Text, nullable=False)  # Full PGN text
    moves_san = Column(JSON, nullable=True)  # SAN moves: ["e4", "e5", "Nf3", ...]
    moves_uci = Column(JSON, nullable=True)  # UCI moves: ["e2e4", "e7e5", "g1f3", ...]
    moves_binary = Column(LargeBinary, nullable=True)  # Binary encoding (future optimization)

    # Game metadata
    event = Column(String, nullable=True, index=True)  # Tournament/event name
    site = Column(String, nullable=True)  # Location or platform
    round = Column(String, nullable=True)  # Round number
    date_played = Column(Date, nullable=True, index=True)  # Game date (Date type for proper indexing)

    # Players
    white_player = Column(String, nullable=True, index=True)
    black_player = Column(String, nullable=True, index=True)
    white_elo = Column(Integer, nullable=True)
    black_elo = Column(Integer, nullable=True)

    # Result and opening
    result = Column(String, nullable=True, index=True)  # 1-0, 0-1, 1/2-1/2, *
    eco_code = Column(String, nullable=True, index=True)  # ECO opening code (e.g., "B12")
    opening_name = Column(String, nullable=True)  # Opening name

    # Position data
    fen_start = Column(String, nullable=True)  # Starting FEN (if not standard)
    fen_final = Column(String, nullable=True)  # Final position FEN
    move_count = Column(Integer, default=0)  # Total half-moves

    # Source tracking
    source = Column(String, default="manual")  # lichess, chess.com, manual, imported
    source_url = Column(String, nullable=True)
    time_control = Column(String, nullable=True)  # e.g., "600+0"
    termination = Column(String, nullable=True)  # Normal, Time forfeit, etc.

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="games")
    positions = relationship("Position", back_populates="game", cascade="all, delete-orphan")


class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    fen = Column(String, index=True, nullable=False)
    move_number = Column(Integer, nullable=False)
    side_to_move = Column(String, nullable=False)  # white, black

    # Stockfish analysis
    evaluation = Column(Float, nullable=True)  # Centipawn evaluation
    best_move = Column(String, nullable=True)  # UCI notation
    top_lines = Column(JSON, nullable=True)  # Top 3 engine lines

    # AI explanation
    explanation = Column(Text, nullable=True)
    concepts_detected = Column(JSON, nullable=True)  # List of concept IDs
    difficulty_level = Column(String, nullable=True)  # beginner, intermediate, advanced

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    game = relationship("Game", back_populates="positions")


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # tactics, strategy, endgame
    difficulty = Column(String, nullable=False)  # beginner, intermediate, advanced
    description = Column(Text, nullable=True)
    example_positions = Column(JSON, nullable=True)  # List of FENs

    # Relationships
    progress = relationship("ConceptProgress", back_populates="concept", cascade="all, delete-orphan")


class ConceptProgress(Base):
    __tablename__ = "concept_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)

    times_seen = Column(Integer, default=0)
    times_understood = Column(Integer, default=0)
    mastery_level = Column(Float, default=0.0)  # 0-100
    last_seen = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="concept_progress")
    concept = relationship("Concept", back_populates="progress")


class ExplanationCache(Base):
    __tablename__ = "explanation_cache"

    id = Column(Integer, primary_key=True, index=True)
    fen = Column(String, index=True, nullable=False)
    user_rating_range = Column(String, nullable=False)  # "1000-1200", "1200-1400"
    explanation = Column(Text, nullable=False)
    ai_model_used = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
