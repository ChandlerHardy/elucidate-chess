'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_GAMES_QUERY = gql`
  query GetGames($userId: Int!, $limit: Int, $offset: Int) {
    games(userId: $userId, limit: $limit, offset: $offset) {
      id
      whitePlayer
      blackPlayer
      whiteElo
      blackElo
      result
      event
      site
      ecoCode
      openingName
      moveCount
      datePlayed
      createdAt
      source
    }
  }
`;

interface Game {
  id: number;
  whitePlayer: string;
  blackPlayer: string;
  whiteElo?: number;
  blackElo?: number;
  result: string;
  event?: string;
  site?: string;
  ecoCode?: string;
  openingName?: string;
  moveCount: number;
  datePlayed?: string;
  createdAt: string;
  source: string;
}

interface GameListProps {
  userId: number;
  onGameSelect?: (gameId: number) => void;
}

export const GameList: React.FC<GameListProps> = ({ userId, onGameSelect }) => {
  const { data, loading, error, refetch } = useQuery(GET_GAMES_QUERY, {
    variables: { userId, limit: 50, offset: 0 },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          Error Loading Games
        </h3>
        <p className="text-red-700 dark:text-red-400 text-sm">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const games: Game[] = data?.games || [];

  if (games.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Games Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Import some PGN games to get started!
        </p>
        <a
          href="/chess/import"
          className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Import Games
        </a>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getResultColor = (result: string) => {
    if (result === '1-0') return 'text-green-600 dark:text-green-400';
    if (result === '0-1') return 'text-red-600 dark:text-red-400';
    if (result === '1/2-1/2') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'lichess':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'chess.com':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'imported':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Games ({games.length})
        </h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Games List */}
      <div className="space-y-3">
        {games.map((game) => (
          <a
            key={game.id}
            href={`/chess?gameId=${game.id}`}
            onClick={() => onGameSelect?.(game.id)}
            className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                {/* Players */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {game.whitePlayer || 'Unknown'}
                    </span>
                    {game.whiteElo && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({game.whiteElo})
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">vs</div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {game.blackPlayer || 'Unknown'}
                    </span>
                    {game.blackElo && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({game.blackElo})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="text-right">
                <div className={`text-2xl font-bold ${getResultColor(game.result)}`}>
                  {game.result || '*'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {game.moveCount} moves
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 mt-3 text-sm">
              {game.event && (
                <span className="text-gray-700 dark:text-gray-300">
                  📅 {game.event}
                </span>
              )}
              {game.openingName && (
                <span className="text-gray-700 dark:text-gray-300">
                  ♟️ {game.openingName}
                </span>
              )}
              {game.ecoCode && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded text-xs font-medium">
                  {game.ecoCode}
                </span>
              )}
              <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadgeColor(game.source)}`}>
                {game.source}
              </span>
            </div>

            {/* Date */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {formatDate(game.datePlayed)} • Imported {formatDate(game.createdAt)}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default GameList;
