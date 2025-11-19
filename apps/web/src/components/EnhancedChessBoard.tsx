"use client";

import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { useChessGame } from "@/contexts/ChessGameContext";
import { Square } from "chess.js";

interface EnhancedChessBoardProps {
  boardWidth?: number;
  orientation?: "white" | "black";
  arePiecesDraggable?: boolean;
  showMoveHistory?: boolean;
  showControls?: boolean;
}

export function EnhancedChessBoard({
  boardWidth = 400,
  orientation = "white",
  arePiecesDraggable = true,
  showMoveHistory = true,
  showControls = true,
}: EnhancedChessBoardProps) {
  const {
    state,
    makeMove,
    resetGame,
    undoMove,
    loadFen,
    setSelectedSquare,
  } = useChessGame();

  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(orientation);
  const [mounted, setMounted] = useState(false);
  const [fenInput, setFenInput] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (!mounted || !state.game) return false;

    // Try to make the move
    const move = state.game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // Always promote to queen for simplicity
    });

    if (move === null) return false; // Illegal move

    // Use context to make the move
    return makeMove(sourceSquare, targetSquare, move.san);
  };

  const onSquareClick = (square: Square) => {
    if (!mounted || !state.game) return;

    if (state.selectedSquare === square) {
      // Deselect if clicking the same square
      setSelectedSquare(null);
    } else if (state.selectedSquare && state.validMoves.includes(square)) {
      // Make move if clicking a valid destination
      makeMove(state.selectedSquare, square, "");
      setSelectedSquare(null);
    } else {
      // Select new square
      setSelectedSquare(square);
    }
  };

  const flipBoard = () => {
    setBoardOrientation(prev => prev === "white" ? "black" : "white");
  };

  const handleFenLoad = () => {
    if (fenInput.trim()) {
      loadFen(fenInput.trim());
      setFenInput("");
    }
  };

  // Return a placeholder during SSR or before mounting
  if (!mounted) {
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
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Chessboard
            position={state.currentFen}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            boardOrientation={boardOrientation}
            boardWidth={boardWidth}
            arePiecesDraggable={arePiecesDraggable}
            customBoardStyle={{
              borderRadius: "0.375rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            customSquareStyles={{
              ...(state.selectedSquare && {
                [state.selectedSquare]: {
                  backgroundColor: "rgba(255, 255, 0, 0.5)",
                },
              }),
              ...state.validMoves.reduce((acc, move) => {
                acc[move] = {
                  backgroundColor: "rgba(0, 255, 0, 0.3)",
                };
                return acc;
              }, {} as Record<string, React.CSSProperties>),
            }}
          />
        </div>

        {showControls && (
          <div className="flex flex-wrap gap-2 justify-center">
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
            <button
              onClick={undoMove}
              disabled={state.moveHistory.length === 0}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-md transition-colors disabled:cursor-not-allowed"
            >
              Undo Move
            </button>
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400 text-center space-y-1">
          <p>FEN: {state.currentFen}</p>
          <p>Turn: {state.isWhiteTurn ? "White" : "Black"}</p>
          {state.isCheckmate && <p className="text-red-500 font-bold">Checkmate!</p>}
          {state.isStalemate && <p className="text-yellow-500 font-bold">Stalemate!</p>}
          {state.isCheck && <p className="text-orange-500 font-bold">Check!</p>}
        </div>
      </div>

      {(showMoveHistory || showControls) && (
        <div className="flex flex-col gap-4 min-w-64">
          {showMoveHistory && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Move History</h3>
              <div className="max-h-64 overflow-y-auto">
                {state.moveHistory.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No moves yet</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {state.moveHistory.map((move, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-gray-700 dark:text-gray-300"
                      >
                        <span>{Math.floor(index / 2) + 1}.</span>
                        <span>{index % 2 === 0 ? "White" : "Black"}</span>
                        <span className="font-mono">{move.san}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {showControls && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Load Position</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={fenInput}
                  onChange={(e) => setFenInput(e.target.value)}
                  placeholder="Enter FEN notation"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <button
                  onClick={handleFenLoad}
                  disabled={!fenInput.trim()}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-md transition-colors disabled:cursor-not-allowed"
                >
                  Load FEN
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Game Info</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>Total moves: {state.moveHistory.length}</p>
              <p>Current turn: {state.isWhiteTurn ? "White" : "Black"}</p>
              <p>Game status: {state.isCheckmate ? "Checkmate" : state.isStalemate ? "Stalemate" : state.isCheck ? "Check" : "Active"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedChessBoard;