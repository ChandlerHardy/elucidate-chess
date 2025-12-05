/**
 * AnalysisPanel Component (Tailwind Version)
 *
 * Displays chess engine analysis with best moves and evaluations
 */

'use client';

import React from 'react';
import type { AnalysisResult, BestMove, EngineScore } from '../types';

export interface AnalysisPanelProps {
    /** Analysis result from engine */
    analysis?: AnalysisResult;
    /** Is analysis loading? */
    loading?: boolean;
    /** Error message */
    error?: string;
    /** Show depth and other metadata? */
    showMetadata?: boolean;
}

/**
 * Format engine score for display
 */
const formatScore = (score: EngineScore): string => {
    if (score.type === 'mate') {
        return `M${score.value}`;
    }
    // Convert centipawns to pawns with sign
    const pawns = score.value / 100;
    return pawns > 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
};

/**
 * Get score description
 */
const getScoreDescription = (score: EngineScore): string => {
    if (score.type === 'mate') {
        return `Mate in ${Math.abs(score.value)} moves`;
    }

    const pawns = Math.abs(score.value) / 100;
    if (pawns < 0.5) return 'Equal position';
    if (pawns < 1.5) return 'Slight advantage';
    if (pawns < 3) return 'Clear advantage';
    return 'Winning position';
};

/**
 * Get score chip color
 */
const getScoreColor = (score: EngineScore): string => {
    if (score.type === 'mate') {
        return 'bg-amber-500 text-white';
    }
    if (score.value > 0) return 'bg-green-500 text-white';
    if (score.value < 0) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
};

/**
 * Analysis panel component
 */
export const AnalysisPanelTailwind: React.FC<AnalysisPanelProps> = ({
    analysis,
    loading = false,
    error,
    showMetadata = true,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Engine Analysis
                </h2>
                {showMetadata && analysis && (
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                        Depth {analysis.depth}
                    </span>
                )}
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
                    Error: {error}
                </div>
            )}

            {!loading && !error && analysis && analysis.bestMoves.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No moves available</p>
            )}

            {!loading && !error && analysis && analysis.bestMoves.length > 0 && (
                <div className="space-y-3">
                    {analysis.bestMoves.map((move: BestMove, index: number) => (
                        <div
                            key={`${move.san}-${index}`}
                            className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="text-xl font-semibold text-gray-400 dark:text-gray-500 min-w-[40px]">
                                {index + 1}.
                            </div>

                            <div className="flex-1 mx-4">
                                <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                    {move.san}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {getScoreDescription(move.score)}
                                </div>
                            </div>

                            <span
                                className={`px-4 py-2 rounded-lg font-bold min-w-[90px] text-center ${getScoreColor(move.score)}`}
                            >
                                {formatScore(move.score)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {analysis?.aiExplanation && (
                <>
                    <div className="border-b border-gray-200 dark:border-gray-700 my-4"></div>
                    <div>
                        <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            AI Explanation
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {analysis.aiExplanation}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalysisPanelTailwind;
