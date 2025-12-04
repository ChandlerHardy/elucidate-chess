"""
Chess Engine Service

Provides Stockfish UCI chess engine integration for position analysis.
Inspired by en-croissant's engine implementation, adapted for Python/FastAPI.
"""

import asyncio
import chess
import chess.engine
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class EngineScore:
    """Engine evaluation score"""
    type: str  # "cp" (centipawns) or "mate"
    value: int  # Centipawns or moves to mate


@dataclass
class BestMove:
    """Best move analysis from engine"""
    move: str  # UCI format (e.g., "e2e4")
    san: str  # SAN format (e.g., "e4")
    score: EngineScore
    depth: int
    pv: List[str]  # Principal variation (sequence of moves)
    multipv: int  # MultiPV index (1 = best, 2 = second best, etc.)
    nps: int  # Nodes per second


@dataclass
class AnalysisResult:
    """Complete analysis result for a position"""
    fen: str
    best_moves: List[BestMove]
    depth: int


class EngineService:
    """
    Chess engine service for position analysis

    Uses python-chess library to communicate with Stockfish via UCI protocol.
    Supports MultiPV (multiple principal variations) for showing alternative moves.
    """

    def __init__(self, engine_path: str = "/usr/games/stockfish"):
        """
        Initialize engine service

        Args:
            engine_path: Path to Stockfish binary
        """
        self.engine_path = engine_path
        self.engine: Optional[chess.engine.SimpleEngine] = None
        self._lock = asyncio.Lock()

    async def start(self) -> None:
        """Start the chess engine process"""
        if self.engine is not None:
            logger.warning("Engine already started")
            return

        try:
            async with self._lock:
                transport, engine = await chess.engine.popen_uci(self.engine_path)
                self.engine = engine
                logger.info(f"Stockfish engine started: {engine.id}")
        except FileNotFoundError:
            logger.error(f"Stockfish binary not found at {self.engine_path}")
            raise
        except Exception as e:
            logger.error(f"Failed to start engine: {e}")
            raise

    async def stop(self) -> None:
        """Stop the chess engine process"""
        if self.engine is None:
            return

        async with self._lock:
            await self.engine.quit()
            self.engine = None
            logger.info("Stockfish engine stopped")

    async def analyze_position(
        self,
        fen: str,
        depth: int = 20,
        multipv: int = 1
    ) -> AnalysisResult:
        """
        Analyze a chess position

        Args:
            fen: Position in FEN notation
            depth: Search depth (default 20)
            multipv: Number of best moves to return (default 1)

        Returns:
            AnalysisResult with best moves and evaluations

        Raises:
            ValueError: If FEN is invalid
            RuntimeError: If engine is not started
        """
        if self.engine is None:
            raise RuntimeError("Engine not started. Call start() first.")

        try:
            # Parse FEN into chess.Board
            board = chess.Board(fen)
        except ValueError as e:
            logger.error(f"Invalid FEN: {fen}")
            raise ValueError(f"Invalid FEN: {e}")

        # Analyze position
        try:
            info = await self.engine.analyse(
                board,
                chess.engine.Limit(depth=depth),
                multipv=multipv
            )
        except Exception as e:
            logger.error(f"Engine analysis failed: {e}")
            raise

        # Parse results
        best_moves = []

        # Handle both single and multiple PV results
        if isinstance(info, list):
            # MultiPV mode - list of info dicts
            for idx, pv_info in enumerate(info, start=1):
                best_move = self._parse_analysis_info(pv_info, board, multipv=idx)
                if best_move:
                    best_moves.append(best_move)
        else:
            # Single PV mode - one info dict
            best_move = self._parse_analysis_info(info, board, multipv=1)
            if best_move:
                best_moves.append(best_move)

        return AnalysisResult(
            fen=fen,
            best_moves=best_moves,
            depth=depth
        )

    def _parse_analysis_info(
        self,
        info: chess.engine.InfoDict,
        board: chess.Board,
        multipv: int
    ) -> Optional[BestMove]:
        """
        Parse engine analysis info into BestMove

        Args:
            info: Analysis info from engine
            board: Current chess board
            multipv: MultiPV index

        Returns:
            BestMove or None if parsing fails
        """
        try:
            # Get score
            score = info.get("score")
            if score is None:
                return None

            # Get principal variation (best line)
            pv = info.get("pv", [])
            if not pv:
                return None

            # First move in PV is the best move
            best_move_uci = pv[0]

            # Convert to SAN notation
            best_move_san = board.san(best_move_uci)

            # Parse score
            if score.is_mate():
                engine_score = EngineScore(
                    type="mate",
                    value=score.relative.mate() or 0
                )
            else:
                engine_score = EngineScore(
                    type="cp",
                    value=score.relative.score() or 0
                )

            # Get depth
            depth = info.get("depth", 0)

            # Get nodes per second
            nps = info.get("nps", 0)

            # Convert PV to UCI strings
            pv_uci = [move.uci() for move in pv]

            return BestMove(
                move=best_move_uci.uci(),
                san=best_move_san,
                score=engine_score,
                depth=depth,
                pv=pv_uci,
                multipv=multipv,
                nps=nps
            )

        except Exception as e:
            logger.error(f"Failed to parse analysis info: {e}")
            return None

    async def quick_eval(self, fen: str) -> AnalysisResult:
        """
        Quick evaluation (low depth for fast response)

        Args:
            fen: Position in FEN notation

        Returns:
            AnalysisResult with quick evaluation
        """
        return await self.analyze_position(fen, depth=10, multipv=1)

    async def deep_analysis(self, fen: str, lines: int = 3) -> AnalysisResult:
        """
        Deep analysis with multiple lines

        Args:
            fen: Position in FEN notation
            lines: Number of best moves to analyze (default 3)

        Returns:
            AnalysisResult with deep analysis of multiple lines
        """
        return await self.analyze_position(fen, depth=25, multipv=lines)


# Global engine instance (singleton)
_engine_service: Optional[EngineService] = None


async def get_engine_service() -> EngineService:
    """
    Get or create global engine service instance

    Returns:
        EngineService instance
    """
    global _engine_service

    if _engine_service is None:
        _engine_service = EngineService()
        await _engine_service.start()

    return _engine_service


async def shutdown_engine_service() -> None:
    """Shutdown global engine service"""
    global _engine_service

    if _engine_service is not None:
        await _engine_service.stop()
        _engine_service = None
