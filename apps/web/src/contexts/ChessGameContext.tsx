"use client";

import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from "react";
import { Chess, Square } from "chess.js";

interface ChessMove {
  from: Square;
  to: Square;
  san: string;
  fen: string;
  timestamp: Date;
}

interface ChessGameState {
  game: Chess | null;
  moveHistory: ChessMove[];
  currentFen: string;
  isWhiteTurn: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  selectedSquare: Square | null;
  validMoves: string[];
}

type ChessGameAction =
  | { type: "INITIALIZE_GAME"; fen?: string }
  | { type: "MAKE_MOVE"; from: Square; to: Square; san: string }
  | { type: "RESET_GAME" }
  | { type: "SET_SELECTED_SQUARE"; square: Square | null }
  | { type: "UNDO_MOVE" }
  | { type: "LOAD_FEN"; fen: string };

const initialState: ChessGameState = {
  game: null,
  moveHistory: [],
  currentFen: "",
  isWhiteTurn: true,
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  selectedSquare: null,
  validMoves: [],
};

function chessGameReducer(state: ChessGameState, action: ChessGameAction): ChessGameState {
  switch (action.type) {
    case "INITIALIZE_GAME": {
      if (typeof window === "undefined") return state;

      const game = new Chess(action.fen);
      return {
        ...state,
        game,
        currentFen: game.fen(),
        isWhiteTurn: game.turn() === "w",
        isCheck: game.inCheck(),
        isCheckmate: game.isCheckmate(),
        isStalemate: game.isStalemate(),
        validMoves: [],
      };
    }

    case "MAKE_MOVE": {
      if (!state.game) return state;

      const newGame = new Chess(state.game.fen());
      const move = newGame.move({
        from: action.from,
        to: action.to,
      });

      if (!move) return state;

      const newMove: ChessMove = {
        from: action.from,
        to: action.to,
        san: action.san,
        fen: newGame.fen(),
        timestamp: new Date(),
      };

      return {
        ...state,
        game: newGame,
        moveHistory: [...state.moveHistory, newMove],
        currentFen: newGame.fen(),
        isWhiteTurn: newGame.turn() === "w",
        isCheck: newGame.inCheck(),
        isCheckmate: newGame.isCheckmate(),
        isStalemate: newGame.isStalemate(),
        selectedSquare: null,
        validMoves: [],
      };
    }

    case "RESET_GAME": {
      if (typeof window === "undefined") return state;

      const game = new Chess();
      return {
        ...state,
        game,
        moveHistory: [],
        currentFen: game.fen(),
        isWhiteTurn: game.turn() === "w",
        isCheck: game.inCheck(),
        isCheckmate: game.isCheckmate(),
        isStalemate: game.isStalemate(),
        selectedSquare: null,
        validMoves: [],
      };
    }

    case "SET_SELECTED_SQUARE": {
      if (!state.game) return state;

      const validMoves = action.square
        ? state.game
            .moves({ square: action.square, verbose: true })
            .map(move => move.to)
        : [];

      return {
        ...state,
        selectedSquare: action.square,
        validMoves,
      };
    }

    case "UNDO_MOVE": {
      if (state.moveHistory.length === 0 || !state.game) return state;

      const newHistory = [...state.moveHistory];
      newHistory.pop();

      const newGame = new Chess(newHistory.length > 0 ? newHistory[newHistory.length - 1].fen : undefined);

      return {
        ...state,
        game: newGame,
        moveHistory: newHistory,
        currentFen: newGame.fen(),
        isWhiteTurn: newGame.turn() === "w",
        isCheck: newGame.inCheck(),
        isCheckmate: newGame.isCheckmate(),
        isStalemate: newGame.isStalemate(),
        selectedSquare: null,
        validMoves: [],
      };
    }

    case "LOAD_FEN": {
      if (typeof window === "undefined") return state;

      try {
        const game = new Chess(action.fen);
        return {
          ...state,
          game,
          currentFen: game.fen(),
          isWhiteTurn: game.turn() === "w",
          isCheck: game.inCheck(),
          isCheckmate: game.isCheckmate(),
          isStalemate: game.isStalemate(),
          selectedSquare: null,
          validMoves: [],
        };
      } catch {
        return state; // Invalid FEN, don't update state
      }
    }

    default:
      return state;
  }
}

interface ChessGameContextType {
  state: ChessGameState;
  dispatch: React.Dispatch<ChessGameAction>;
  makeMove: (from: Square, to: Square, san: string) => boolean;
  resetGame: () => void;
  undoMove: () => void;
  loadFen: (fen: string) => boolean;
  setSelectedSquare: (square: Square | null) => void;
}

const ChessGameContext = createContext<ChessGameContextType | undefined>(undefined);

export function ChessGameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chessGameReducer, initialState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch({ type: "INITIALIZE_GAME" });
  }, []);

  const makeMove = (from: Square, to: Square, san: string): boolean => {
    if (!mounted || !state.game) return false;

    const move = state.game.move({ from, to });
    if (!move) return false;

    dispatch({ type: "MAKE_MOVE", from, to, san: move.san });
    return true;
  };

  const resetGame = () => {
    if (!mounted) return;
    dispatch({ type: "RESET_GAME" });
  };

  const undoMove = () => {
    if (!mounted) return;
    dispatch({ type: "UNDO_MOVE" });
  };

  const loadFen = (fen: string): boolean => {
    if (!mounted) return false;
    try {
      new Chess(fen); // Validate FEN
      dispatch({ type: "LOAD_FEN", fen });
      return true;
    } catch {
      return false;
    }
  };

  const setSelectedSquare = (square: Square | null) => {
    if (!mounted) return;
    dispatch({ type: "SET_SELECTED_SQUARE", square });
  };

  const value: ChessGameContextType = {
    state,
    dispatch,
    makeMove,
    resetGame,
    undoMove,
    loadFen,
    setSelectedSquare,
  };

  // Show loading state during SSR/hydration
  if (!mounted) {
    return <div>Loading chess game...</div>;
  }

  return (
    <ChessGameContext.Provider value={value}>
      {children}
    </ChessGameContext.Provider>
  );
}

export function useChessGame() {
  const context = useContext(ChessGameContext);
  if (context === undefined) {
    throw new Error("useChessGame must be used within a ChessGameProvider");
  }
  return context;
}