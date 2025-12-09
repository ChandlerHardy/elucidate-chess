'use client';

import { useState, useEffect } from 'react';
import { useChessGame } from '@/features/chess/hooks/useChessGame';
import { useEngineAnalysis } from '@/features/chess/hooks/useEngineAnalysis';
import { Chessboard } from 'react-chessboard';
import { AnalysisPanelTailwind } from '@/features/chess/components/AnalysisPanelTailwind';
import type { Square } from 'chess.js';

export default function ChessPage() {
    const [mounted, setMounted] = useState(false);
    const { fen, makeMove, undo, reset } = useChessGame();

    // Ensure component only renders on client to avoid hydration errors
    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: analysis, loading, error } = useEngineAnalysis({
        fen,
        depth: 20,
        multipv: 3,
        skip: !mounted, // Skip query during SSR
    });

    if (!mounted) {
        // Return a loading skeleton that matches the client render
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            Elucidate Chess
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Loading...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const handleMove = (sourceSquare: Square, targetSquare: Square): boolean => {
        return makeMove(sourceSquare, targetSquare);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Elucidate Chess
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Interactive chess board with AI-powered Stockfish analysis
                    </p>
                    <div className="mt-4">
                        <a
                            href="/chess/import"
                            className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Import PGN Games →
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chess Board Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex justify-center mb-4">
                                <div className="max-w-[600px] w-full">
                                    <Chessboard
                                        position={fen}
                                        onPieceDrop={handleMove}
                                        boardWidth={600}
                                        customBoardStyle={{
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => undo()}
                                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Undo Move
                                </button>
                                <button
                                    onClick={() => reset()}
                                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Reset Game
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Panel Column */}
                    <div className="lg:col-span-1">
                        <AnalysisPanelTailwind
                            analysis={analysis}
                            loading={loading}
                            error={error?.message}
                            showMetadata={true}
                        />
                    </div>
                </div>

                {/* Position Info */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Current Position (FEN)
                    </h3>
                    <code className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {fen}
                    </code>
                </div>
            </div>
        </div>
    );
}
