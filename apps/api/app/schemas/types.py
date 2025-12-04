import strawberry
from typing import List, Optional
from datetime import datetime


@strawberry.type
class UserType:
    id: int
    email: str
    rating: int
    subscription_tier: str
    is_active: bool
    created_at: datetime


@strawberry.type
class GameType:
    id: int
    user_id: int
    pgn: str
    source: str
    source_url: Optional[str]
    white_player: Optional[str]
    black_player: Optional[str]
    result: Optional[str]
    date_played: Optional[datetime]
    created_at: datetime


@strawberry.type
class PositionType:
    id: int
    game_id: int
    fen: str
    move_number: int
    side_to_move: str
    evaluation: Optional[float]
    best_move: Optional[str]
    explanation: Optional[str]
    difficulty_level: Optional[str]


@strawberry.type
class ConceptType:
    id: int
    name: str
    category: str
    difficulty: str
    description: Optional[str]


# Chess Engine Types

@strawberry.type
class EngineScore:
    """Engine evaluation score"""
    type: str  # "cp" (centipawns) or "mate"
    value: int  # Centipawns or moves to mate


@strawberry.type
class BestMove:
    """Best move from engine analysis"""
    move: str  # UCI format (e.g., "e2e4")
    san: str  # SAN format (e.g., "e4")
    score: EngineScore
    depth: int
    pv: List[str]  # Principal variation (sequence of moves)
    multipv: int  # MultiPV index (1 = best, 2 = second best, etc.)
    nps: int  # Nodes per second


@strawberry.type
class AnalysisResult:
    """Complete analysis result for a position"""
    fen: str
    best_moves: List[BestMove]
    depth: int
    ai_explanation: Optional[str] = None  # Gemini-generated explanation


@strawberry.type
class ConceptProgressType:
    id: int
    user_id: int
    concept_id: int
    times_seen: int
    times_understood: int
    mastery_level: float
    last_seen: Optional[datetime]
