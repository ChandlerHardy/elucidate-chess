/**
 * AnalysisPanel Component
 *
 * Displays chess engine analysis with best moves and evaluations
 */

import React from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { AnalysisResult, BestMove, EngineScore } from '~types/chess';

export interface AnalysisPanelProps {
    /** Analysis result from engine */
    analysis: AnalysisResult;
    /** Show depth and other metadata? */
    showMetadata?: boolean;
}

const styles: Record<string, SxProps<Theme>> = {
    container: {
        p: 2,
        height: '100%',
    },
    header: {
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moveList: {
        width: '100%',
    },
    moveItem: {
        '&:hover': {
            bgcolor: 'action.hover',
        },
    },
    scoreChip: (score: number) => ({
        bgcolor: score > 0 ? 'success.main' : score < 0 ? 'error.main' : 'grey.500',
        color: 'white',
        fontWeight: 'bold',
        minWidth: '80px',
    }),
    mateChip: {
        bgcolor: 'warning.main',
        color: 'white',
        fontWeight: 'bold',
        minWidth: '80px',
    },
};

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
 * Analysis panel component
 *
 * @example
 * ```tsx
 * const { data: analysis } = useEngineAnalysis({ fen });
 *
 * <AnalysisPanel analysis={analysis} showMetadata={true} />
 * ```
 */
export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
    analysis,
    showMetadata = true,
}) => {
    return (
        <Paper sx={styles.container} elevation={2}>
            <Box sx={styles.header}>
                <Typography variant="h6" component="h2">
                    Engine Analysis
                </Typography>
                {showMetadata && (
                    <Chip label={`Depth ${analysis.depth}`} size="small" color="primary" />
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {analysis.bestMoves.length === 0 ? (
                <Typography color="text.secondary">No moves available</Typography>
            ) : (
                <List sx={styles.moveList}>
                    {analysis.bestMoves.map((move: BestMove, index: number) => (
                        <React.Fragment key={`${move.san}-${index}`}>
                            <ListItem sx={styles.moveItem}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ minWidth: '40px', color: 'text.secondary' }}
                                    >
                                        {index + 1}.
                                    </Typography>

                                    <Box sx={{ flex: 1, mx: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {move.san}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {getScoreDescription(move.score)}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={formatScore(move.score)}
                                        size="medium"
                                        sx={
                                            move.score.type === 'mate'
                                                ? styles.mateChip
                                                : styles.scoreChip(move.score.value)
                                        }
                                    />
                                </Box>
                            </ListItem>
                            {index < analysis.bestMoves.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            )}

            {analysis.aiExplanation && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            AI Explanation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {analysis.aiExplanation}
                        </Typography>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default AnalysisPanel;
