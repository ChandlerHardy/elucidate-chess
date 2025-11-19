# Chess APIs - Backend Architecture

## FastAPI GraphQL Schema

### Chess Types
```python
import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class ChessMove:
    from_square: str
    to_square: str
    piece: str
    notation: str
    timestamp: datetime

@strawberry.type
class ChessPosition:
    fen: str
    evaluation: Optional[float]
    best_moves: List[str]
    tactical_patterns: List[str]
    explanation: Optional[str]

@strawberry.type
class ChessGame:
    id: str
    pgn: str
    white_player: str
    black_player: str
    result: Optional[str]
    date: datetime
    moves: List[ChessMove]
    positions: List[ChessPosition]
```

### Chess Queries
```python
@strawberry.type
class ChessQuery:
    @strawberry.field
    async def game(self, game_id: str) -> Optional[ChessGame]:
        return await chess_service.get_game(game_id)

    @strawberry.field
    async def analyze_position(self, fen: str, depth: int = 20) -> ChessPosition:
        analysis = await stockfish_service.analyze_position(fen, depth)

        # Get AI explanation
        explanation = await ai_service.explain_position(fen, analysis)

        return ChessPosition(
            fen=fen,
            evaluation=analysis["score"],
            best_moves=analysis["pv"][:3],
            tactical_patterns=await self.detect_tactics(fen),
            explanation=explanation
        )

    @strawberry.field
    async def search_games(
        self,
        opening: Optional[str] = None,
        result: Optional[str] = None,
        limit: int = 50
    ) -> List[ChessGame]:
        return await chess_service.search_games(opening, result, limit)
```

### Chess Mutations
```python
@strawberry.input
class GameImportInput:
    pgn: str
    source: str  # "lichess", "chess.com", "upload"

@strawberry.input
class PositionAnalysisInput:
    fen: str
    depth: int = 20
    include_explanation: bool = True

@strawberry.type
class ChessMutation:
    @strawberry.mutation
    async def import_game(self, input: GameImportInput) -> ChessGame:
        game = await chess_service.import_pgn(input.pgn, input.source)

        # Analyze key positions
        await self.analyze_game_positions(game)

        return game

    @strawberry.mutation
    async def create_position_analysis(
        self,
        input: PositionAnalysisInput
    ) -> ChessPosition:
        # Get engine analysis
        engine_analysis = await stockfish_service.analyze_position(
            input.fen, input.depth
        )

        # Get AI explanation if requested
        explanation = None
        if input.include_explanation:
            explanation = await ai_service.explain_position(
                input.fen, engine_analysis
            )

        return ChessPosition(
            fen=input.fen,
            evaluation=engine_analysis["score"],
            best_moves=engine_analysis["pv"][:5],
            tactical_patterns=await self.detect_tactics(input.fen),
            explanation=explanation
        )
```

## REST API Endpoints (Alternative)

### Game Management
```python
@app.post("/api/chess/games/import")
async def import_game(request: GameImportRequest):
    """Import game from PGN or URL"""
    try:
        game = await chess_service.import_game(request.pgn, request.source)
        return {"game_id": game.id, "status": "imported"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/chess/games/{game_id}")
async def get_game(game_id: str):
    """Get full game details"""
    game = await chess_service.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game
```

### Analysis Endpoints
```python
@app.post("/api/chess/analysis/position")
async def analyze_position(request: PositionAnalysisRequest):
    """Analyze chess position"""
    analysis = await stockfish_service.analyze_position(
        request.fen, request.depth
    )

    if request.include_explanation:
        explanation = await ai_service.explain_position(request.fen, analysis)
        analysis["explanation"] = explanation

    return analysis

@app.post("/api/chess/analysis/game")
async def analyze_game(game_id: str):
    """Full game analysis"""
    game = await chess_service.get_game(game_id)
    analysis = await chess_service.analyze_full_game(game)
    return analysis
```

## Database Models

### SQLAlchemy Models
```python
from sqlalchemy import Column, String, DateTime, Float, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid

class ChessGame(Base):
    __tablename__ = "chess_games"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pgn = Column(Text, nullable=False)
    source = Column(String(50))  # lichess, chess.com, manual
    white_player = Column(String(100))
    black_player = Column(String(100))
    result = Column(String(10))
    date_played = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChessPosition(Base):
    __tablename__ = "chess_positions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("chess_games.id"))
    fen = Column(String(100), nullable=False)
    move_number = Column(Integer)
    evaluation = Column(Float)
    best_moves = Column(JSON)  # Array of UCI moves
    tactical_patterns = Column(JSON)  # Array of pattern names
    ai_explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## Service Layer

### Chess Service
```python
class ChessService:
    def __init__(self, db: Session, stockfish: StockfishEngine, ai: AIService):
        self.db = db
        self.stockfish = stockfish
        self.ai = ai

    async def import_pgn(self, pgn: str, source: str) -> ChessGame:
        """Import PGN and create game record"""
        game_data = self.parse_pgn(pgn)

        game = ChessGame(
            pgn=pgn,
            source=source,
            white_player=game_data["white"],
            black_player=game_data["black"],
            date_played=game_data["date"]
        )

        self.db.add(game)
        self.db.commit()

        # Analyze game asynchronously
        asyncio.create_task(self.analyze_game_positions(game))

        return game

    async def analyze_game_positions(self, game: ChessGame):
        """Analyze all positions in a game"""
        positions = self.extract_positions_from_pgn(game.pgn)

        for pos_data in positions:
            analysis = await self.stockfish.analyze_position(
                pos_data["fen"], depth=15
            )

            explanation = await self.ai.explain_position(
                pos_data["fen"], analysis
            )

            position = ChessPosition(
                game_id=game.id,
                fen=pos_data["fen"],
                move_number=pos_data["move_number"],
                evaluation=float(str(analysis["score"])),
                best_moves=analysis["pv"][:3],
                tactical_patterns=self.detect_tactics(pos_data["fen"]),
                ai_explanation=explanation
            )

            self.db.add(position)

        self.db.commit()
```

## Performance Optimization

### Caching Strategy
```python
from redis import Redis
import json

class ChessCache:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.ttl = 3600  # 1 hour

    async def get_position_analysis(self, fen: str) -> Optional[dict]:
        cache_key = f"position_analysis:{fen}"
        cached = await self.redis.get(cache_key)
        return json.loads(cached) if cached else None

    async def set_position_analysis(self, fen: str, analysis: dict):
        cache_key = f"position_analysis:{fen}"
        await self.redis.setex(
            cache_key,
            self.ttl,
            json.dumps(analysis)
        )

# Usage in service
class OptimizedChessService:
    def __init__(self, cache: ChessCache):
        self.cache = cache

    async def analyze_position_cached(self, fen: str):
        # Check cache first
        cached = await self.cache.get_position_analysis(fen)
        if cached:
            return cached

        # Perform analysis
        analysis = await self.stockfish.analyze_position(fen)

        # Cache result
        await self.cache.set_position_analysis(fen, analysis)

        return analysis
```

## Error Handling
```python
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class ChessServiceError(Exception):
    pass

class InvalidFENError(ChessServiceError):
    pass

class EngineNotFoundError(ChessServiceError):
    pass

@app.exception_handler(ChessServiceError)
async def chess_service_handler(request, exc: ChessServiceError):
    logger.error(f"Chess service error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"error": str(exc)}
    )
```