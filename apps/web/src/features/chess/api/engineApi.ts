/**
 * Engine Analysis API Service
 *
 * API client for chess engine analysis operations
 */

import { apiClient } from '@/lib/apiClient';
import type { AnalysisResult, BestMove } from '../types';

/**
 * Engine API service class
 */
class EngineApiService {
    /**
     * Analyze a chess position
     */
    async analyzePosition(params: {
        fen: string;
        depth?: number;
        multipv?: number;
        includeAI?: boolean;
    }): Promise<AnalysisResult> {
        const {
            fen,
            depth = 20,
            multipv = 1,
            includeAI = false,
        } = params;

        const response = await apiClient.post('/chess/analyze', {
            fen,
            depth,
            multipv,
            includeAI,
        });

        return response.data;
    }

    /**
     * Get AI explanation for a position
     */
    async explainPosition(fen: string, bestMoves?: BestMove[]): Promise<string> {
        const response = await apiClient.post('/chess/explain-position', {
            fen,
            bestMoves,
        });

        return response.data.explanation;
    }

    /**
     * Get quick evaluation (low depth for fast response)
     */
    async quickEval(fen: string): Promise<AnalysisResult> {
        return this.analyzePosition({
            fen,
            depth: 10,
            multipv: 1,
            includeAI: false,
        });
    }

    /**
     * Get deep analysis (high depth, multiple lines)
     */
    async deepAnalysis(fen: string): Promise<AnalysisResult> {
        return this.analyzePosition({
            fen,
            depth: 25,
            multipv: 3,
            includeAI: true,
        });
    }
}

export const engineApi = new EngineApiService();
