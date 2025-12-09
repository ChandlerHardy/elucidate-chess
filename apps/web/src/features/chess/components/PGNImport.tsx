'use client';

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const IMPORT_PGN_MUTATION = gql`
  mutation ImportPGN($pgnText: String!, $userId: Int!, $source: String) {
    importPgn(pgnText: $pgnText, userId: $userId, source: $source) {
      success
      gamesParsed
      gamesImported
      errors
      games {
        id
        whitePlayer
        blackPlayer
        result
        event
        ecoCode
        moveCount
        datePlayed
      }
    }
  }
`;

interface PGNImportProps {
  userId: number;
  onImportSuccess?: (games: any[]) => void;
  onImportError?: (errors: string[]) => void;
}

export const PGNImport: React.FC<PGNImportProps> = ({
  userId,
  onImportSuccess,
  onImportError,
}) => {
  const [pgnText, setPgnText] = useState('');
  const [importPGN, { loading, data, error }] = useMutation(IMPORT_PGN_MUTATION);

  const handleImport = async () => {
    if (!pgnText.trim()) {
      return;
    }

    try {
      const result = await importPGN({
        variables: {
          pgnText,
          userId,
          source: 'manual',
        },
      });

      if (result.data?.importPgn) {
        const { success, games, errors } = result.data.importPgn;

        if (success && games.length > 0) {
          onImportSuccess?.(games);
          setPgnText(''); // Clear input on success
        } else if (errors && errors.length > 0) {
          onImportError?.(errors);
        }
      }
    } catch (err) {
      console.error('Import error:', err);
      onImportError?.([err instanceof Error ? err.message : 'Import failed']);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPgnText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Import PGN Games
      </h2>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload PGN File
        </label>
        <input
          type="file"
          accept=".pgn"
          onChange={handleFileUpload}
          disabled={loading}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            dark:file:bg-gray-700 dark:file:text-gray-300
            dark:hover:file:bg-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or Paste PGN Text
        </label>
        <textarea
          value={pgnText}
          onChange={(e) => setPgnText(e.target.value)}
          disabled={loading}
          placeholder="Paste your PGN text here..."
          rows={12}
          className="w-full px-3 py-2 text-gray-700 dark:text-gray-300
            bg-white dark:bg-gray-700
            border border-gray-300 dark:border-gray-600
            rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            font-mono text-sm"
        />
      </div>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={loading || !pgnText.trim()}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700
          text-white font-semibold rounded-md
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200"
      >
        {loading ? 'Importing...' : 'Import Games'}
      </button>

      {/* Results */}
      {data?.importPgn && (
        <div className="mt-6">
          {data.importPgn.success ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                Import Successful!
              </h3>
              <p className="text-green-700 dark:text-green-400">
                {data.importPgn.gamesImported} game(s) imported successfully
                {data.importPgn.gamesParsed !== data.importPgn.gamesImported &&
                  ` (${data.importPgn.gamesParsed} parsed)`}
              </p>

              {data.importPgn.games.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    Imported Games:
                  </h4>
                  <ul className="space-y-2">
                    {data.importPgn.games.map((game: any) => (
                      <li
                        key={game.id}
                        className="text-sm text-green-700 dark:text-green-400 p-2
                          bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700"
                      >
                        <span className="font-semibold">
                          {game.whitePlayer} vs {game.blackPlayer}
                        </span>
                        {' '}
                        {game.result && <span>({game.result})</span>}
                        {' '}
                        {game.event && <span className="text-xs">- {game.event}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                Import Failed
              </h3>
              {data.importPgn.errors.length > 0 && (
                <ul className="list-disc list-inside text-red-700 dark:text-red-400 space-y-1">
                  {data.importPgn.errors.map((err: string, idx: number) => (
                    <li key={idx} className="text-sm">{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* GraphQL Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Error
          </h3>
          <p className="text-red-700 dark:text-red-400 text-sm">{error.message}</p>
        </div>
      )}
    </div>
  );
};

export default PGNImport;
