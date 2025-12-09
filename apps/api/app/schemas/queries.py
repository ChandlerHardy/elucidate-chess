import strawberry
from typing import List

from app.schemas.types import (
    UserType,
    GameType,
    ConceptType,
    AnalysisResult,
    EngineScore,
    BestMove,
)
from app.services.engine import get_engine_service


@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello from Elucidate Chess API!"

    @strawberry.field
    def users(self) -> List[UserType]:
        # Placeholder - will implement with database
        return []

    @strawberry.field
    def game(
        self,
        gameId: int,
        info: strawberry.Info = None
    ) -> GameType:
        """
        Fetch a single game by ID

        Args:
            gameId: Game ID to fetch
            info: Strawberry info context

        Returns:
            GameType object

        Raises:
            Exception if game not found
        """
        from app.database.connection import SessionLocal
        from app.database.models import Game

        db = SessionLocal()
        try:
            game = db.query(Game).filter(Game.id == gameId).first()

            if not game:
                raise Exception(f"Game with ID {gameId} not found")

            return GameType(
                id=game.id,
                user_id=game.user_id,
                pgn=game.pgn,
                source=game.source,
                source_url=game.source_url,
                white_player=game.white_player,
                black_player=game.black_player,
                white_elo=game.white_elo,
                black_elo=game.black_elo,
                result=game.result,
                event=game.event,
                site=game.site,
                eco_code=game.eco_code,
                opening_name=game.opening_name,
                move_count=game.move_count,
                date_played=game.date_played,
                created_at=game.created_at
            )
        finally:
            db.close()

    @strawberry.field
    def games(
        self,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
        info: strawberry.Info = None
    ) -> List[GameType]:
        """
        Fetch games for a user with pagination

        Args:
            user_id: User ID to fetch games for
            limit: Maximum number of games to return (default: 50)
            offset: Number of games to skip (default: 0)
            info: Strawberry info context

        Returns:
            List of GameType objects
        """
        from app.database.connection import SessionLocal
        from app.database.models import Game

        db = SessionLocal()
        try:
            games = db.query(Game).filter(
                Game.user_id == user_id
            ).order_by(
                Game.created_at.desc()
            ).limit(limit).offset(offset).all()

            return [
                GameType(
                    id=game.id,
                    user_id=game.user_id,
                    pgn=game.pgn,
                    source=game.source,
                    source_url=game.source_url,
                    white_player=game.white_player,
                    black_player=game.black_player,
                    white_elo=game.white_elo,
                    black_elo=game.black_elo,
                    result=game.result,
                    event=game.event,
                    site=game.site,
                    eco_code=game.eco_code,
                    opening_name=game.opening_name,
                    move_count=game.move_count,
                    date_played=game.date_played,
                    created_at=game.created_at
                )
                for game in games
            ]
        finally:
            db.close()

    @strawberry.field
    def concepts(self) -> List[ConceptType]:
        # Placeholder - will implement with database
        return []

    @strawberry.field
    async def analyze_position(
        self,
        fen: str,
        depth: int = 20,
        multipv: int = 1
    ) -> AnalysisResult:
        """
        Analyze a chess position using Stockfish engine

        Args:
            fen: Position in FEN notation
            depth: Search depth (default: 20, range: 10-30)
            multipv: Number of best moves to return (default: 1, max: 5)

        Returns:
            AnalysisResult with best moves and evaluations

        Example:
            query {
                analyzePosition(
                    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                    depth: 20
                    multipv: 3
                ) {
                    fen
                    depth
                    bestMoves {
                        move
                        san
                        score {
                            type
                            value
                        }
                        pv
                        multipv
                    }
                }
            }
        """
        # Get engine service
        engine = await get_engine_service()

        # Analyze position
        result = await engine.analyze_position(fen, depth, multipv)

        # Convert to GraphQL types
        best_moves = [
            BestMove(
                move=bm.move,
                san=bm.san,
                score=EngineScore(type=bm.score.type, value=bm.score.value),
                depth=bm.depth,
                pv=bm.pv,
                multipv=bm.multipv,
                nps=bm.nps,
            )
            for bm in result.best_moves
        ]

        return AnalysisResult(
            fen=result.fen,
            best_moves=best_moves,
            depth=result.depth,
        )
