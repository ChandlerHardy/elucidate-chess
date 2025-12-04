/**
 * Chess Feature TypeScript Types
 *
 * Type definitions for chess functionality
 */

import type { Square } from 'chess.js';

/**
 * Chess piece type
 */
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

/**
 * Chess piece color
 */
export type PieceColor = 'w' | 'b';

/**
 * Chess piece
 */
export interface ChessPiece {
    type: PieceType;
    color: PieceColor;
}

/**
 * Chess move
 */
export interface ChessMove {
    from: Square;
    to: Square;
    promotion?: PieceType;
    san: string;
    lan: string;
    before: string; // FEN before move
    after: string; // FEN after move
}

/**
 * Game result
 */
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';

/**
 * Engine evaluation score
 */
export interface EngineScore {
    type: 'cp' | 'mate';
    value: number; // Centipawns or moves to mate
}

/**
 * Best move from engine analysis
 */
export interface BestMove {
    move: string; // UCI format (e.g., 'e2e4')
    san: string; // SAN format (e.g., 'e4')
    score: EngineScore;
    depth: number;
    pv: string[]; // Principal variation (sequence of moves)
    multipv: number; // MultiPV index (1 = best, 2 = second best, etc.)
    nps: number; // Nodes per second
}

/**
 * Analysis result from engine
 */
export interface AnalysisResult {
    fen: string;
    bestMoves: BestMove[];
    depth: number;
    aiExplanation?: string; // Gemini-generated explanation
}

/**
 * Chess game metadata
 */
export interface GameMetadata {
    id?: number;
    white: string;
    black: string;
    whiteElo?: number;
    blackElo?: number;
    result: GameResult;
    event?: string;
    site?: string;
    date?: string;
    round?: string;
    eco?: string; // Opening code
    timeControl?: string;
}

/**
 * Full chess game
 */
export interface ChessGame extends GameMetadata {
    moves: ChessMove[];
    pgn: string;
    fenStart?: string;
}

/**
 * PGN import result
 */
export interface PGNImportResult {
    success: boolean;
    gamesCount: number;
    games: ChessGame[];
    errors?: string[];
}

/**
 * Chess concept (tactical/strategic pattern)
 */
export interface ChessConcept {
    id: string;
    name: string;
    type: 'tactical' | 'strategic';
    description: string;
    examples?: string[]; // FEN positions
}

/**
 * Detected concept in a position
 */
export interface DetectedConcept {
    concept: ChessConcept;
    confidence: number; // 0-1
    explanation: string;
}
