'use client';

import { useState } from 'react';
import { PGNImport } from '@/features/chess/components/PGNImport';
import Link from 'next/link';

export default function PGNImportPage() {
  const [importedGames, setImportedGames] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleImportSuccess = (games: any[]) => {
    setImportedGames(games);
    setErrors([]);
  };

  const handleImportError = (errs: string[]) => {
    setErrors(errs);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            PGN Import
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Import chess games from PGN files or text
          </p>
          <Link
            href="/chess"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            ← Back to Chess Board
          </Link>
        </div>

        {/* PGN Import Component */}
        <PGNImport
          userId={1} // Using test user ID
          onImportSuccess={handleImportSuccess}
          onImportError={handleImportError}
        />

        {/* Additional Info */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
              How to use PGN Import
            </h3>
            <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-400">
              <li>Upload a .pgn file or paste PGN text directly</li>
              <li>Supports multiple games in a single file</li>
              <li>Automatically extracts player names, ratings, openings, and more</li>
              <li>View imported games in your library</li>
            </ul>

            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Example PGN:
              </h4>
              <pre className="bg-white dark:bg-gray-800 p-4 rounded border border-blue-200 dark:border-blue-700 text-sm overflow-x-auto">
                {`[Event "Example Game"]
[Site "Online"]
[Date "2025.12.04"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
