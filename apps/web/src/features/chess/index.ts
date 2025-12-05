/**
 * Chess Feature Module
 *
 * Public API exports for chess functionality including:
 * - Chess board components
 * - Game analysis
 * - PGN import/export
 * - Engine integration
 * - AI-powered explanations
 */

// Components
export { ChessBoard } from './components/ChessBoard';
export { AnalysisPanel } from './components/AnalysisPanel';
export { AnalysisPanelTailwind } from './components/AnalysisPanelTailwind';
export type { ChessBoardProps } from './components/ChessBoard';
export type { AnalysisPanelProps } from './components/AnalysisPanel';

// Hooks
export { useChessGame } from './hooks/useChessGame';
export { useEngineAnalysis, useQuickEval, useDeepAnalysis } from './hooks/useEngineAnalysis';
export type {
    UseChessGameReturn,
    UseChessGameOptions,
} from './hooks/useChessGame';
export type {
    UseEngineAnalysisOptions,
    UseEngineAnalysisReturn,
} from './hooks/useEngineAnalysis';

// API
export { chessApi } from './api/chessApi';
export { engineApi, ANALYZE_POSITION_QUERY } from './api/engineApi';

// Types
export type * from './types';
