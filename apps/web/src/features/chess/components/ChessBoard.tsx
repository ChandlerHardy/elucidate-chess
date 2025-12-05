/**
 * ChessBoard Component
 *
 * Interactive chess board using react-chessboard.
 * Displays current position and allows moves to be made.
 */

import React, { useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Box, Paper } from '@mui/material';
import type { Square } from 'chess.js';
import type { SxProps, Theme } from '@mui/material';

export interface ChessBoardProps {
    /** Current position in FEN notation */
    position: string;
    /** Callback when a piece is moved */
    onMove?: (from: Square, to: Square) => boolean;
    /** Board orientation ('white' or 'black') */
    orientation?: 'white' | 'black';
    /** Board width in pixels (default: auto) */
    boardWidth?: number;
    /** Is the board interactive? */
    interactive?: boolean;
    /** Show board coordinates? */
    showCoordinates?: boolean;
}

const styles: Record<string, SxProps<Theme>> = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
    },
    boardWrapper: {
        maxWidth: '600px',
        width: '100%',
        aspectRatio: '1/1',
    },
};

/**
 * Interactive chess board component
 *
 * @example
 * ```tsx
 * const { fen, makeMove } = useChessGame();
 *
 * <ChessBoard
 *   position={fen}
 *   onMove={makeMove}
 *   orientation="white"
 *   interactive={true}
 * />
 * ```
 */
export const ChessBoard: React.FC<ChessBoardProps> = ({
    position,
    onMove,
    orientation = 'white',
    boardWidth,
    interactive = true,
    showCoordinates = true,
}) => {
    const handlePieceDrop = useCallback(
        (sourceSquare: Square, targetSquare: Square): boolean => {
            if (!interactive || !onMove) {
                return false;
            }

            return onMove(sourceSquare, targetSquare);
        },
        [interactive, onMove]
    );

    return (
        <Box sx={styles.container}>
            <Paper elevation={3} sx={styles.boardWrapper}>
                <Chessboard
                    position={position}
                    onPieceDrop={handlePieceDrop}
                    boardOrientation={orientation}
                    boardWidth={boardWidth}
                    arePiecesDraggable={interactive}
                    showBoardNotation={showCoordinates}
                    customBoardStyle={{
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                />
            </Paper>
        </Box>
    );
};

export default ChessBoard;
