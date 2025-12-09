'use client';

import React from 'react';
import type { ChessMove } from '@/features/chess/types';

interface MoveListProps {
    /** Array of moves in the game */
    moves: ChessMove[];
    /** Current move index (-1 = start position) */
    currentMoveIndex: number;
    /** Callback when a move is clicked */
    onMoveClick?: (index: number) => void;
    /** Custom className */
    className?: string;
}

/**
 * MoveList Component
 *
 * Displays chess moves in standard algebraic notation (SAN) format.
 * Shows moves in two columns (White | Black) with move numbers.
 * Highlights the currently selected move.
 */
export const MoveList: React.FC<MoveListProps> = ({
    moves,
    currentMoveIndex,
    onMoveClick,
    className = '',
}) => {
    // Group moves into pairs (white + black)
    const movePairs: Array<{ white?: ChessMove; black?: ChessMove; moveNumber: number }> = [];
    for (let i = 0; i < moves.length; i += 2) {
        movePairs.push({
            white: moves[i],
            black: moves[i + 1],
            moveNumber: Math.floor(i / 2) + 1,
        });
    }

    const getMoveClassName = (index: number) => {
        const isSelected = index === currentMoveIndex;
        const baseClasses =
            'px-3 py-1.5 rounded cursor-pointer transition-colors font-mono text-sm';

        if (isSelected) {
            return `${baseClasses} bg-blue-600 text-white font-semibold`;
        }

        return `${baseClasses} hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200`;
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Move List
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {moves.length} moves • Click any move to jump to that position
                </p>
            </div>

            {/* Move List */}
            <div className="p-4 max-h-96 overflow-y-auto">
                {movePairs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No moves yet. Start playing!
                    </div>
                ) : (
                    <div className="space-y-1">
                        {movePairs.map((pair, pairIndex) => (
                            <div
                                key={pairIndex}
                                className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center"
                            >
                                {/* Move Number */}
                                <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm w-10">
                                    {pair.moveNumber}.
                                </span>

                                {/* White's Move */}
                                <button
                                    onClick={() => onMoveClick?.(pairIndex * 2)}
                                    className={getMoveClassName(pairIndex * 2)}
                                    type="button"
                                >
                                    {pair.white?.san || ''}
                                </button>

                                {/* Black's Move */}
                                {pair.black ? (
                                    <button
                                        onClick={() => onMoveClick?.(pairIndex * 2 + 1)}
                                        className={getMoveClassName(pairIndex * 2 + 1)}
                                        type="button"
                                    >
                                        {pair.black.san}
                                    </button>
                                ) : (
                                    <div />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - Start Position Button */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => onMoveClick?.(-1)}
                    className={`w-full ${getMoveClassName(-1)}`}
                    type="button"
                >
                    ⏮️ Start Position
                </button>
            </div>
        </div>
    );
};

export default MoveList;
