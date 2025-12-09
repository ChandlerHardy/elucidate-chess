"""
PGN Service

Provides PGN (Portable Game Notation) import/export functionality.
Uses python-chess library for parsing and validation.
"""

import io
import chess
import chess.pgn
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class GameMetadata:
    """Metadata extracted from PGN headers"""
    event: Optional[str] = None
    site: Optional[str] = None
    date: Optional[str] = None
    round: Optional[str] = None
    white: Optional[str] = None
    black: Optional[str] = None
    result: Optional[str] = None
    white_elo: Optional[int] = None
    black_elo: Optional[int] = None
    eco: Optional[str] = None
    opening: Optional[str] = None
    time_control: Optional[str] = None
    termination: Optional[str] = None


@dataclass
class ParsedGame:
    """A parsed chess game from PGN"""
    metadata: GameMetadata
    moves: List[str]  # UCI format moves (e.g., ["e2e4", "e7e5", ...])
    moves_san: List[str]  # SAN format moves (e.g., ["e4", "e5", ...])
    pgn_text: str  # Original PGN text
    fen_start: str  # Starting position FEN
    fen_final: str  # Final position FEN
    move_count: int


@dataclass
class PGNImportResult:
    """Result of PGN import operation"""
    success: bool
    games_parsed: int
    games_imported: int
    errors: List[str]
    games: List[ParsedGame]


class PGNService:
    """
    PGN import/export service

    Provides functionality to:
    - Parse PGN text into structured game data
    - Validate PGN format
    - Extract game metadata
    - Convert games to database format
    - Export games to PGN
    """

    @staticmethod
    def parse_pgn(pgn_text: str, max_games: int = 100) -> PGNImportResult:
        """
        Parse PGN text and extract game data

        Args:
            pgn_text: PGN format text (can contain multiple games)
            max_games: Maximum number of games to parse (default 100)

        Returns:
            PGNImportResult with parsed games and any errors
        """
        games: List[ParsedGame] = []
        errors: List[str] = []

        try:
            # Create string IO for python-chess parser
            pgn_io = io.StringIO(pgn_text)

            game_count = 0
            while game_count < max_games:
                # Parse next game
                game = chess.pgn.read_game(pgn_io)
                if game is None:
                    break  # No more games

                game_count += 1

                try:
                    parsed_game = PGNService._parse_single_game(game)
                    games.append(parsed_game)
                except Exception as e:
                    error_msg = f"Game {game_count}: {str(e)}"
                    logger.error(f"Failed to parse game {game_count}: {e}")
                    errors.append(error_msg)

            return PGNImportResult(
                success=len(games) > 0,
                games_parsed=len(games),
                games_imported=0,  # Will be set after database save
                errors=errors,
                games=games
            )

        except Exception as e:
            logger.error(f"Failed to parse PGN: {e}")
            return PGNImportResult(
                success=False,
                games_parsed=0,
                games_imported=0,
                errors=[f"Parse error: {str(e)}"],
                games=[]
            )

    @staticmethod
    def _parse_single_game(game: chess.pgn.Game) -> ParsedGame:
        """
        Parse a single game object from python-chess

        Args:
            game: chess.pgn.Game object

        Returns:
            ParsedGame with extracted data
        """
        # Extract metadata from headers
        headers = game.headers
        metadata = GameMetadata(
            event=headers.get("Event"),
            site=headers.get("Site"),
            date=headers.get("Date"),
            round=headers.get("Round"),
            white=headers.get("White"),
            black=headers.get("Black"),
            result=headers.get("Result"),
            white_elo=PGNService._parse_elo(headers.get("WhiteElo")),
            black_elo=PGNService._parse_elo(headers.get("BlackElo")),
            eco=headers.get("ECO"),
            opening=headers.get("Opening"),
            time_control=headers.get("TimeControl"),
            termination=headers.get("Termination")
        )

        # Extract moves
        board = game.board()
        fen_start = board.fen()

        moves_uci: List[str] = []
        moves_san: List[str] = []

        for move in game.mainline_moves():
            moves_san.append(board.san(move))
            moves_uci.append(move.uci())
            board.push(move)

        fen_final = board.fen()

        # Get PGN text
        exporter = chess.pgn.StringExporter(headers=True, variations=False, comments=False)
        pgn_text = game.accept(exporter)

        return ParsedGame(
            metadata=metadata,
            moves=moves_uci,
            moves_san=moves_san,
            pgn_text=pgn_text,
            fen_start=fen_start,
            fen_final=fen_final,
            move_count=len(moves_uci)
        )

    @staticmethod
    def _parse_elo(elo_str: Optional[str]) -> Optional[int]:
        """Parse ELO rating from string"""
        if not elo_str or elo_str == "?":
            return None
        try:
            return int(elo_str)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def validate_pgn(pgn_text: str) -> tuple[bool, Optional[str]]:
        """
        Validate PGN format

        Args:
            pgn_text: PGN text to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            pgn_io = io.StringIO(pgn_text)
            game = chess.pgn.read_game(pgn_io)

            if game is None:
                return False, "No valid game found in PGN"

            # Try to replay the game to validate moves
            board = game.board()
            for move in game.mainline_moves():
                if move not in board.legal_moves:
                    return False, f"Illegal move: {move}"
                board.push(move)

            return True, None

        except Exception as e:
            return False, str(e)

    @staticmethod
    def export_to_pgn(
        moves: List[str],
        metadata: Optional[Dict[str, Any]] = None,
        fen_start: Optional[str] = None
    ) -> str:
        """
        Export a game to PGN format

        Args:
            moves: List of moves in UCI format
            metadata: Optional game metadata (event, white, black, etc.)
            fen_start: Optional starting FEN (if not standard position)

        Returns:
            PGN formatted string
        """
        game = chess.pgn.Game()

        # Set metadata
        if metadata:
            for key, value in metadata.items():
                if value is not None:
                    game.headers[key] = str(value)

        # Set starting position
        if fen_start and fen_start != chess.STARTING_FEN:
            game.setup(fen_start)

        # Add moves
        node = game
        board = chess.Board(fen_start) if fen_start else chess.Board()

        for move_uci in moves:
            try:
                move = chess.Move.from_uci(move_uci)
                if move in board.legal_moves:
                    node = node.add_variation(move)
                    board.push(move)
                else:
                    logger.warning(f"Skipping illegal move: {move_uci}")
            except Exception as e:
                logger.warning(f"Invalid move format: {move_uci}: {e}")

        # Export to string
        exporter = chess.pgn.StringExporter(headers=True, variations=False, comments=False)
        return game.accept(exporter)

    @staticmethod
    def extract_opening_info(moves: List[str], max_moves: int = 15) -> Dict[str, Any]:
        """
        Extract opening information from game moves

        Args:
            moves: List of moves in UCI format
            max_moves: Number of moves to analyze for opening

        Returns:
            Dictionary with opening info (eco code, name, etc.)
        """
        # This would require an opening book/database
        # For now, return basic info
        # TODO: Integrate with opening database in future

        board = chess.Board()
        opening_moves = []

        for move_uci in moves[:max_moves]:
            try:
                move = chess.Move.from_uci(move_uci)
                if move in board.legal_moves:
                    opening_moves.append(board.san(move))
                    board.push(move)
                else:
                    break
            except:
                break

        return {
            "moves": opening_moves,
            "fen": board.fen(),
            "move_count": len(opening_moves)
        }


# Global PGN service instance
pgn_service = PGNService()
