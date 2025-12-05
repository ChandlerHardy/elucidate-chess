/**
 * useChessGame Hook
 *
 * Manages chess game state using chess.js library.
 * Provides methods for making moves, undoing, resetting, and accessing game state.
 */

import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { ChessMove } from '~types/chess';

export interface UseChessGameReturn {
    /** Chess.js instance */
    game: Chess;
    /** Current position as FEN string */
    fen: string;
    /** Current position as PGN string */
    pgn: string;
    /** Move history */
    history: ChessMove[];
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
    }, [updateCounter]);

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
                forceUpdate();
                return true;
            } catch {
                return false;
            }
        },
        [game, forceUpdate]
    );

    return {
        game,
        fen,
        pgn,
        history,
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
    };
};
