import express from 'express';
import { evaluationQueue } from '../config/queue.js';
import { getCandidateById } from '../models/Candidate.js';
import { createEvaluation } from '../models/Evaluation.js';

const router = express.Router();

/**
 * POST /evaluate
 * Trigger evaluation pipeline
 */
router.post('/', async(req, res) => {
    try {
        const { candidate_id } = req.body;

        if (!candidate_id) {
            return res.status(400).json({
                success: false,
                message: 'candidate_id is required',
            });
        }

        // Get candidate data
        const candidate = await getCandidateById(candidate_id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

        // Create evaluation record
        const evaluation = await createEvaluation(
            candidate.id,
            candidate.cv_text,
            candidate.project_text
        );

        // Add job to queue
        await evaluationQueue.add({
            evaluationId: evaluation.id,
            candidateId: candidate.id,
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            timeout: 600000, // 10 minutes
        });

        res.status(200).json({
            id: evaluation.id,
            status: evaluation.status,
        });
    } catch (error) {
        console.error('Evaluate error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;