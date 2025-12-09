/**
 * useChessGame Hook
 *
 * Manages chess game state using chess.js library.
 * Provides methods for making moves, undoing, resetting, and accessing game state.
 */

import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { ChessMove } from '@/features/chess/types';

export interface UseChessGameReturn {
    /** Chess.js instance */
    game: Chess;
    /** Current position as FEN string */
    fen: string;
    /** Current position as PGN string */
    pgn: string;
    /** Move history */
    history: ChessMove[];
    /** Current move index (-1 = start position, 0+ = move number) */
    currentMoveIndex: number;
    /** Can navigate backward */
    canGoBack: boolean;
    /** Can navigate forward */
    canGoForward: boolean;
    /** Is the game over? */
    isGameOver: boolean;
    /** Is the current player in check? */
    isCheck: boolean;
    /** Is the current player in checkmate? */
    isCheckmate: boolean;
    /** Is the game a stalemate? */
    isStalemate: boolean;
    /** Is the game drawn? */
    isDraw: boolean;
    /** Current turn ('w' or 'b') */
    turn: 'w' | 'b';
    /** Make a move */
    makeMove: (from: Square, to: Square, promotion?: string) => boolean;
    /** Undo last move */
    undo: () => ChessMove | null;
    /** Reset game to starting position */
    reset: () => void;
    /** Load a position from FEN */
    loadFen: (fen: string) => boolean;
    /** Load a game from PGN */
    loadPgn: (pgn: string) => boolean;
    /** Go to specific move in history */
    goToMove: (index: number) => void;
    /** Go to next move */
    nextMove: () => void;
    /** Go to previous move */
    previousMove: () => void;
    /** Go to start of game */
    goToStart: () => void;
    /** Go to end of game */
    goToEnd: () => void;
}

export interface UseChessGameOptions {
    /** Initial FEN position */
    initialFen?: string;
    /** Initial PGN */
    initialPgn?: string;
}

/**
 * Hook for managing chess game state
 *
 * @example
 * ```tsx
 * const { game, fen, makeMove, undo, reset } = useChessGame();
 *
 * // Make a move
 * makeMove('e2', 'e4');
 *
 * // Undo
 * undo();
 *
 * // Reset game
 * reset();
 * ```
 */
export const useChessGame = (options: UseChessGameOptions = {}): UseChessGameReturn => {
    const [game] = useState<Chess>(() => {
        const chess = new Chess();
        if (options.initialFen) {
            chess.load(options.initialFen);
        } else if (options.initialPgn) {
            chess.loadPgn(options.initialPgn);
        }
        return chess;
    });

    const [updateCounter, setUpdateCounter] = useState(0);
    const [fullPgn, setFullPgn] = useState<string>(''); // Store complete game for navigation
    const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1); // -1 = start, 0+ = move number

    // Force re-render when game state changes
    const forceUpdate = useCallback(() => {
        setUpdateCounter((c) => c + 1);
    }, []);

    // Get current FEN
    const fen = useMemo(() => game.fen(), [updateCounter]);

    // Get current PGN
    const pgn = useMemo(() => game.pgn(), [updateCounter]);

    // Get move history with FEN positions
    const history = useMemo((): ChessMove[] => {
        // If we have a full PGN, get all moves from it
        if (fullPgn) {
            const tempGame = new Chess();
            tempGame.loadPgn(fullPgn);
            const moves = tempGame.history({ verbose: true });
            return moves.map((move) => ({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
                san: move.san,
                lan: move.lan,
                before: move.before,
                after: move.after,
            }));
        }

        // Otherwise, get moves from current game state
        const moves = game.history({ verbose: true });
        return moves.map((move) => ({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            san: move.san,
            lan: move.lan,
            before: move.before,
            after: move.after,
        }));
    }, [updateCounter, fullPgn]);

    // Game state
    const isGameOver = useMemo(() => game.isGameOver(), [updateCounter]);
    const isCheck = useMemo(() => game.inCheck(), [updateCounter]);
    const isCheckmate = useMemo(() => game.isCheckmate(), [updateCounter]);
    const isStalemate = useMemo(() => game.isStalemate(), [updateCounter]);
    const isDraw = useMemo(() => game.isDraw(), [updateCounter]);
    const turn = useMemo(() => game.turn(), [updateCounter]);

    // Make a move
    const makeMove = useCallback(
        (from: Square, to: Square, promotion?: string): boolean => {
            try {
                const move = game.move({
                    from,
                    to,
                    promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
                });
                if (move) {
                    forceUpdate();
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        },
        [game, forceUpdate]
    );

    // Undo last move
    const undo = useCallback((): ChessMove | null => {
        const move = game.undo();
        if (move) {
            forceUpdate();
            return {
                from: move.from,
                to: move.to,
                promotion: move.promotion,
                san: move.san,
                lan: move.lan,
                before: move.before,
                after: move.after,
            };
        }
        return null;
    }, [game, forceUpdate]);

    // Reset game
    const reset = useCallback(() => {
        game.reset();
        forceUpdate();
    }, [game, forceUpdate]);

    // Load FEN
    const loadFen = useCallback(
        (fen: string): boolean => {
            try {
                game.load(fen);
                forceUpdate();
                return true;
            } catch {
                return false;
            }
        },
        [game, forceUpdate]
    );

    // Load PGN
    const loadPgn = useCallback(
        (pgn: string): boolean => {
            try {
                game.loadPgn(pgn);
                setFullPgn(pgn);
                const moves = game.history();
                setCurrentMoveIndex(moves.length - 1); // Go to end of game
                forceUpdate();
                return true;
            } catch {
                return false;
            }
        },
        [game, forceUpdate]
    );

    // Navigation: Go to specific move
    const goToMove = useCallback(
        (index: number) => {
            // -1 means start position (no moves made)
            if (index === -1) {
                game.reset();
                setCurrentMoveIndex(-1);
                forceUpdate();
                return;
            }

            if (!fullPgn) return;

            // Reset to start
            game.reset();

            // Load full game
            game.loadPgn(fullPgn);
            const moves = game.history();

            // Undo moves to reach desired position
            const movesToUndo = moves.length - index - 1;
            for (let i = 0; i < movesToUndo; i++) {
                game.undo();
            }

            setCurrentMoveIndex(index);
            forceUpdate();
        },
        [game, fullPgn, forceUpdate]
    );

    // Navigation: Next move
    const nextMove = useCallback(() => {
        if (!fullPgn) return;

        const tempGame = new Chess();
        tempGame.loadPgn(fullPgn);
        const fullMoves = tempGame.history();

        if (currentMoveIndex < fullMoves.length - 1) {
            goToMove(currentMoveIndex + 1);
        }
    }, [currentMoveIndex, fullPgn, goToMove]);

    // Navigation: Previous move
    const previousMove = useCallback(() => {
        if (currentMoveIndex >= 0) {
            goToMove(currentMoveIndex - 1);
        }
    }, [currentMoveIndex, goToMove]);

    // Navigation: Go to start
    const goToStart = useCallback(() => {
        goToMove(-1);
    }, [goToMove]);

    // Navigation: Go to end
    const goToEnd = useCallback(() => {
        if (!fullPgn) return;

        const tempGame = new Chess();
        tempGame.loadPgn(fullPgn);
        const moves = tempGame.history();
        goToMove(moves.length - 1);
    }, [fullPgn, goToMove]);

    // Can navigate back/forward
    const canGoBack = currentMoveIndex >= 0;
    const canGoForward = useMemo(() => {
        if (!fullPgn) return false;
        const tempGame = new Chess();
        tempGame.loadPgn(fullPgn);
        const moves = tempGame.history();
        return currentMoveIndex < moves.length - 1;
    }, [currentMoveIndex, fullPgn]);

    return {
        game,
        fen,
        pgn,
        history,
        currentMoveIndex,
        canGoBack,
        canGoForward,
        isGameOver,
        isCheck,
        isCheckmate,
        isStalemate,
        isDraw,
        turn,
        makeMove,
        undo,
        reset,
        loadFen,
        loadPgn,
        goToMove,
        nextMove,
        previousMove,
        goToStart,
        goToEnd,
    };
};
