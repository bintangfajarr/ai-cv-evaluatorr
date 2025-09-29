import express from 'express';
import { getEvaluationById } from '../models/Evaluation.js';

const router = express.Router();

/**
 * GET /result/:id
 * Get evaluation result
 */
router.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const evaluation = await getEvaluationById(id);

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                message: 'Evaluation not found',
            });
        }

        // Return based on status
        if (evaluation.status === 'queued' || evaluation.status === 'processing') {
            return res.status(200).json({
                id: evaluation.id,
                status: evaluation.status,
            });
        }

        if (evaluation.status === 'failed') {
            return res.status(200).json({
                id: evaluation.id,
                status: evaluation.status,
                error: evaluation.error_message,
            });
        }

        // Status: completed
        res.status(200).json({
            id: evaluation.id,
            status: evaluation.status,
            result: {
                cv_match_rate: parseFloat(evaluation.cv_match_rate),
                cv_feedback: evaluation.cv_feedback,
                cv_scores: evaluation.cv_scores,
                project_score: parseFloat(evaluation.project_score),
                project_feedback: evaluation.project_feedback,
                project_scores: evaluation.project_scores,
                overall_summary: evaluation.overall_summary,
            },
        });
    } catch (error) {
        console.error('Result error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;