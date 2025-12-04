/**
 * Chess API Service
 *
 * API client for chess-related operations including:
 * - Game management
 * - PGN import/export
 * - Position analysis
 */

import { apiClient } from '@/lib/apiClient';
import type {
    ChessGame,
    GameMetadata,
    PGNImportResult,
    AnalysisResult,
} from '../types';

/**
 * Chess API service class
 */
class ChessApiService {
    /**
     * Get list of games with optional filters
     */
    async getGames(params?: {
        page?: number;
        limit?: number;
        player?: string;
        opening?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{ games: ChessGame[]; total: number }> {
        const response = await apiClient.get('/chess/games', { params });
        return response.data;
    }

    /**
     * Get a single game by ID
     */
    async getGame(id: number): Promise<ChessGame> {
        const response = await apiClient.get(`/chess/games/${id}`);
        return response.data;
    }

    /**
     * Save a game
     */
    async saveGame(game: Partial<ChessGame>): Promise<ChessGame> {
        const response = await apiClient.post('/chess/games', game);
        return response.data;
    }

    /**
     * Delete a game
     */
    async deleteGame(id: number): Promise<void> {
        await apiClient.delete(`/chess/games/${id}`);
    }

    /**
     * Import games from PGN
     */
    async importPGN(pgnText: string): Promise<PGNImportResult> {
        const response = await apiClient.post('/chess/import-pgn', {
            pgn: pgnText,
        });
        return response.data;
    }

    /**
     * Import games from PGN file
     */
    async importPGNFile(file: File): Promise<PGNImportResult> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/chess/import-pgn-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    /**
     * Export game to PGN
     */
    async exportToPGN(gameId: number): Promise<string> {
        const response = await apiClient.get(`/chess/games/${gameId}/pgn`);
        return response.data.pgn;
    }

    /**
     * Search games by position (FEN)
     */
    async searchByPosition(fen: string): Promise<ChessGame[]> {
        const response = await apiClient.post('/chess/search-position', { fen });
        return response.data.games;
    }
}

export const chessApi = new ChessApiService();
