/**
 * useEngineAnalysis Hook
 *
 * Fetches chess position analysis using Stockfish engine via GraphQL.
 * Uses Apollo Client's useQuery hook.
 */

import { useQuery } from '@apollo/client';
import { ANALYZE_POSITION_QUERY, engineApi } from '../api/engineApi';
import type { AnalysisResult } from '../types';

export interface UseEngineAnalysisOptions {
    /** Position to analyze in FEN notation */
    fen: string;
    /** Analysis depth (default: 20) */
    depth?: number;
    /** Number of best moves to return (default: 3) */
    multipv?: number;
    /** Enable/disable analysis (default: true) */
    skip?: boolean;
}

export interface UseEngineAnalysisReturn {
    /** Analysis result (undefined while loading) */
    data?: AnalysisResult;
    /** Is data loading? */
    loading: boolean;
    /** Error if query failed */
    error?: Error;
    /** Refetch analysis */
    refetch: () => void;
}

/**
 * Hook for fetching chess position analysis
 *
 * @example
 * ```tsx
 * function AnalysisDisplay({ fen }: { fen: string }) {
 *   const { data, loading, error } = useEngineAnalysis({
 *     fen,
 *     depth: 20,
 *     multipv: 3
 *   });
 *
 *   if (loading) return <div>Analyzing...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!data) return null;
 *
 *   return (
 *     <div>
 *       <h3>Best Moves</h3>
 *       {data.bestMoves.map((move, i) => (
 *         <div key={i}>
 *           {i + 1}. {move.san} (Score: {move.score.value})
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useEngineAnalysis = ({
    fen,
    depth = 20,
    multipv = 3,
    skip = false,
}: UseEngineAnalysisOptions): UseEngineAnalysisReturn => {
    const { data, loading, error, refetch } = useQuery(ANALYZE_POSITION_QUERY, {
        variables: { fen, depth, multipv },
        skip,
        // Cache analysis results for 5 minutes
        fetchPolicy: 'cache-first',
    });

    return {
        data: data ? engineApi.parseResponse(data) : undefined,
        loading,
        error: error as Error | undefined,
        refetch,
    };
};

/**
 * Hook for quick engine evaluation (depth: 10, multipv: 1)
 *
 * Faster analysis for quick position evaluations
 */
export const useQuickEval = (fen: string, skip = false) => {
    return useEngineAnalysis({
        fen,
        depth: 10,
        multipv: 1,
        skip,
    });
};

/**
 * Hook for deep engine analysis (depth: 25, multipv: 5)
 *
 * Thorough analysis for critical positions
 */
export const useDeepAnalysis = (fen: string, skip = false) => {
    return useEngineAnalysis({
        fen,
        depth: 25,
        multipv: 5,
        skip,
    });
};
