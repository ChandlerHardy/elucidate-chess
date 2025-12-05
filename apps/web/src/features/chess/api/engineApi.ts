/**
 * Engine Analysis API Service
 *
 * GraphQL client for chess engine analysis operations using Apollo Client
 */

import { gql } from '@apollo/client';
import type { AnalysisResult } from '../types';

/**
 * GraphQL query for position analysis
 */
export const ANALYZE_POSITION_QUERY = gql`
    query AnalyzePosition($fen: String!, $depth: Int!, $multipv: Int!) {
        analyzePosition(fen: $fen, depth: $depth, multipv: $multipv) {
            fen
            depth
            bestMoves {
                move
                san
                score {
                    type
                    value
                }
                multipv
            }
        }
    }
`;

/**
 * Engine API service class
 */
class EngineApiService {
    /**
     * Analyze a chess position (use with Apollo Client)
     *
     * @example
     * ```tsx
     * const { data } = useQuery(ANALYZE_POSITION_QUERY, {
     *   variables: { fen, depth: 20, multipv: 3 }
     * });
     * ```
     */
    query = ANALYZE_POSITION_QUERY;

    /**
     * Parse GraphQL response to AnalysisResult type
     */
    parseResponse(data: any): AnalysisResult {
        return {
            fen: data.analyzePosition.fen,
            depth: data.analyzePosition.depth,
            bestMoves: data.analyzePosition.bestMoves,
        };
    }
}

export const engineApi = new EngineApiService();
