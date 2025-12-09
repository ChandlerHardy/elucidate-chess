'use client';

import { useState, useEffect } from 'react';
import { GameList } from '@/features/chess/components/GameList';
import Link from 'next/link';

export default function LibraryPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // Ensure component only renders on client to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGameSelect = (gameId: number) => {
    setSelectedGameId(gameId);
    // TODO: Navigate to game viewer or load game on board
    console.log('Selected game:', gameId);
  };

  if (!mounted) {
    // Return a loading skeleton that matches the client render
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Game Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Game Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Browse and analyze your imported chess games
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/chess"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              ← Back to Board
            </Link>
            <Link
              href="/chess/import"
              className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Import More Games
            </Link>
          </div>
        </div>

        {/* Game Library */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <GameList
            userId={1} // Using test user ID
            onGameSelect={handleGameSelect}
          />
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Game Library Features
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-400">
            <li>View all your imported games in one place</li>
            <li>See player names, ratings, and game results</li>
            <li>Browse by event, opening, or ECO code</li>
            <li>Click on any game to analyze it (coming soon)</li>
          </ul>

          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Tip:</strong> Import your games from Chess.com, Lichess, or any PGN file
              to build your personal game database!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
