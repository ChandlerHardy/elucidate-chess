import strawberry
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.schemas.types import UserType, GameType, PGNImportResult
from app.database.models import Game
from app.database.connection import SessionLocal
from app.services.pgn import pgn_service
import logging

logger = logging.getLogger(__name__)


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_mutation(self) -> str:
        return "Mutations will be implemented here"

    @strawberry.mutation
    async def import_pgn(
        self,
        pgn_text: str,
        user_id: int,
        source: str = "imported"
    ) -> PGNImportResult:
        """
        Import PGN text and save games to database

        Args:
            pgn_text: PGN format text (can contain multiple games)
            user_id: ID of user importing the games
            source: Source of import (imported, lichess, chess.com)

        Returns:
            PGNImportResult with imported games and any errors
        """
        # Create database session
        db = SessionLocal()

        try:
            # Parse PGN using PGN service
            parse_result = pgn_service.parse_pgn(pgn_text)

            if not parse_result.success:
                return PGNImportResult(
                    success=False,
                    games_parsed=0,
                    games_imported=0,
                    errors=parse_result.errors,
                    games=[]
                )

            imported_games = []
            import_errors = list(parse_result.errors)

            # Save each parsed game to database
            for parsed_game in parse_result.games:
                try:
                    # Create Game model instance
                    game = Game(
                        user_id=user_id,
                        pgn=parsed_game.pgn_text,
                        moves_san=parsed_game.moves_san,
                        moves_uci=parsed_game.moves,
                        source=source,

                        # Metadata
                        event=parsed_game.metadata.event,
                        site=parsed_game.metadata.site,
                        round=parsed_game.metadata.round,
                        date_played=_parse_date(parsed_game.metadata.date),

                        # Players
                        white_player=parsed_game.metadata.white,
                        black_player=parsed_game.metadata.black,
                        white_elo=parsed_game.metadata.white_elo,
                        black_elo=parsed_game.metadata.black_elo,

                        # Result and opening
                        result=parsed_game.metadata.result,
                        eco_code=parsed_game.metadata.eco,
                        opening_name=parsed_game.metadata.opening,

                        # Position data
                        fen_start=parsed_game.fen_start,
                        fen_final=parsed_game.fen_final,
                        move_count=parsed_game.move_count,

                        # Additional metadata
                        time_control=parsed_game.metadata.time_control,
                        termination=parsed_game.metadata.termination
                    )

                    db.add(game)
                    db.flush()  # Get the ID without committing

                    # Convert to GraphQL type
                    game_type = GameType(
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
                    imported_games.append(game_type)

                except Exception as e:
                    error_msg = f"Failed to save game: {str(e)}"
                    logger.error(error_msg)
                    import_errors.append(error_msg)

            # Commit all games
            db.commit()

            return PGNImportResult(
                success=len(imported_games) > 0,
                games_parsed=parse_result.games_parsed,
                games_imported=len(imported_games),
                errors=import_errors,
                games=imported_games
            )

        except Exception as e:
            logger.error(f"PGN import failed: {e}")
            db.rollback()
            return PGNImportResult(
                success=False,
                games_parsed=0,
                games_imported=0,
                errors=[f"Import failed: {str(e)}"],
                games=[]
            )
        finally:
            db.close()


def _parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse PGN date string to datetime"""
    if not date_str or date_str == "????.??.??":
        return None

    try:
        # PGN dates are typically in format: YYYY.MM.DD
        parts = date_str.replace("?", "01").split(".")
        if len(parts) == 3:
            year, month, day = map(int, parts)
            return datetime(year, month, day)
    except (ValueError, AttributeError):
        pass

    return None
