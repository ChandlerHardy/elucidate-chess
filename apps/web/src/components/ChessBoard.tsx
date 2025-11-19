"use client";

import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

interface ChessBoardProps {
  initialFen?: string;
  boardWidth?: number;
  onMove?: (move: { from: string; to: string; san: string }) => void;
  orientation?: "white" | "black";
  arePiecesDraggable?: boolean;
}

export function ChessBoard({
  initialFen = "start",
  boardWidth = 400,
  onMove,
  orientation = "white",
  arePiecesDraggable = true,
}: ChessBoardProps) {
  // Use useState with proper initialization to avoid hydration mismatches
  const [game, setGame] = useState<Chess>(() => {
    // Only create Chess instance on client side
    if (typeof window !== "undefined") {
      return new Chess(initialFen === "start" ? undefined : initialFen);
    }
    // Return a dummy game for server-side rendering
    return null as any;
  });

  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(orientation);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);

    // Initialize game if not already done
    if (!game && typeof window !== "undefined") {
      setGame(new Chess(initialFen === "start" ? undefined : initialFen));
    }
  }, [initialFen, game]);

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    if (!mounted || !game) return false;

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // Always promote to queen for simplicity
    });

    if (move === null) return false; // Illegal move

    // Create new game instance to ensure reactivity
    setGame(new Chess(game.fen()));

    // Call move callback if provided
    if (onMove) {
      onMove({
        from: sourceSquare,
        to: targetSquare,
        san: move.san,
      });
    }

    return true;
  };

  const flipBoard = () => {
    setBoardOrientation(prev => prev === "white" ? "black" : "white");
  };

  const resetGame = () => {
    if (mounted && typeof window !== "undefined") {
      setGame(new Chess());
    }
  };

  // Return a placeholder during SSR or before mounting
  if (!mounted || !game) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
        style={{ width: boardWidth, height: boardWidth }}
      >
        <div className="text-gray-500 dark:text-gray-400">Loading chess board...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onPieceDrop}
          boardOrientation={boardOrientation}
          boardWidth={boardWidth}
          arePiecesDraggable={arePiecesDraggable}
          customBoardStyle={{
            borderRadius: "0.375rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={flipBoard}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          Flip Board
        </button>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
        >
          Reset Game
        </button>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        <p>FEN: {game.fen()}</p>
        <p>Turn: {game.turn() === "w" ? "White" : "Black"}</p>
        {game.isCheckmate() && <p className="text-red-500 font-bold">Checkmate!</p>}
        {game.isStalemate() && <p className="text-yellow-500 font-bold">Stalemate!</p>}
        {game.isCheck() && <p className="text-orange-500 font-bold">Check!</p>}
      </div>
    </div>
  );
}

export default ChessBoard;