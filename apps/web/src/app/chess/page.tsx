'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';
import { useChessGame } from '@/features/chess/hooks/useChessGame';
import { useEngineAnalysis } from '@/features/chess/hooks/useEngineAnalysis';
import { Chessboard } from 'react-chessboard';
import { AnalysisPanelTailwind } from '@/features/chess/components/AnalysisPanelTailwind';
import { MoveList } from '@/features/chess/components/MoveList';
import type { Square } from 'chess.js';

const GET_GAME_QUERY = gql`
    query GetGame($gameId: Int!) {
        game(gameId: $gameId) {
            id
            pgn
            whitePlayer
            blackPlayer
            whiteElo
            blackElo
            result
            event
            openingName
        }
    }
`;

function ChessPageContent() {
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const [mounted, setMounted] = useState(false);
    const [gameLoaded, setGameLoaded] = useState(false);

    const {
        fen,
        history,
        currentMoveIndex,
        canGoBack,
        canGoForward,
        makeMove,
        undo,
        reset,
        loadPgn,
        goToMove,
        nextMove,
        previousMove,
        goToStart,
        goToEnd,
    } = useChessGame();

    // Fetch game if gameId is provided
    const { data: gameData, loading: gameLoading } = useQuery(GET_GAME_QUERY, {
        variables: { gameId: parseInt(gameId || '0') },
        skip: !gameId || !mounted,
    });

    // Load game PGN when data arrives
    useEffect(() => {
        if (gameData?.game?.pgn && !gameLoaded) {
            console.log('[Chess] Loading game:', gameId, 'PGN length:', gameData.game.pgn.length);
            loadPgn(gameData.game.pgn);
            setGameLoaded(true);
        }
    }, [gameData, gameLoaded, loadPgn, gameId]);

    
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
                    {gameData?.game ? (
                        <div className="text-gray-700 dark:text-gray-300 mt-3">
                            <p className="text-xl font-semibold">
                                {gameData.game.whitePlayer} vs {gameData.game.blackPlayer}
                            </p>
                            {gameData.game.event && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {gameData.game.event}
                                </p>
                            )}
                            {gameData.game.openingName && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    ♟️ {gameData.game.openingName}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                            Interactive chess board with AI-powered Stockfish analysis
                        </p>
                    )}
                    <div className="mt-4 flex gap-3 justify-center">
                        <a
                            href="/chess/library"
                            className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            📚 Game Library
                        </a>
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
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex justify-center mb-4">
                                <div className="max-w-[600px] w-full">
                                    <Chessboard
                                        position={fen}
                                        onPieceDrop={handleMove}
                                        boardWidth={600}
                                        customBoardStyle={{
                                            borderRadius: '8px',
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Navigation Controls */}
                            {gameId && history.length > 0 && (
                                <div className="flex justify-center gap-2 mb-4">
                                    <button
                                        onClick={goToStart}
                                        disabled={!canGoBack}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                                        title="Go to start"
                                    >
                                        ⏮️
                                    </button>
                                    <button
                                        onClick={previousMove}
                                        disabled={!canGoBack}
                                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                                        title="Previous move"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={nextMove}
                                        disabled={!canGoForward}
                                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                                        title="Next move"
                                    >
                                        Next →
                                    </button>
                                    <button
                                        onClick={goToEnd}
                                        disabled={!canGoForward}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                                        title="Go to end"
                                    >
                                        ⏭️
                                    </button>
                                </div>
                            )}

                            {/* Basic Controls */}
                            {!gameId && (
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
                            )}
                        </div>

                        {/* Move List - always show when a game is loaded */}
                        {gameData?.game && (
                            <MoveList
                                moves={history}
                                currentMoveIndex={currentMoveIndex}
                                onMoveClick={goToMove}
                            />
                        )}
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

export default function ChessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            Loading...
                        </h1>
                    </div>
                </div>
            </div>
        }>
            <ChessPageContent />
        </Suspense>
    );
}
