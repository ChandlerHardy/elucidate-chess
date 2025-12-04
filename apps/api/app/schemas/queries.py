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
    def games(self) -> List[GameType]:
        # Placeholder - will implement with database
        return []

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
