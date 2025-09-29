import { evaluationQueue } from '../config/queue.js';
import { runEvaluationPipeline } from '../services/evaluationPipeline.js';
import { updateEvaluationStatus, updateEvaluationResults, getEvaluationById } from '../models/Evaluation.js';

/**
 * Process evaluation jobs
 */
evaluationQueue.process(async(job) => {
    const { evaluationId } = job.data;

    console.log(`\n📋 Processing evaluation: ${evaluationId}`);

    try {
        // Update status to processing
        await updateEvaluationStatus(evaluationId, 'processing');
        console.log('Status updated to: processing');

        // Get evaluation data
        const evaluation = await getEvaluationById(evaluationId);

        if (!evaluation) {
            throw new Error('Evaluation not found');
        }

        // Run the evaluation pipeline
        const results = await runEvaluationPipeline(
            evaluation.cv_text,
            evaluation.project_text
        );

        // Save results to database
        await updateEvaluationResults(evaluationId, results);
        console.log('✓ Results saved to database');

        return results;
    } catch (error) {
        console.error(`❌ Evaluation failed: ${error.message}`);

        // Update status to failed
        await updateEvaluationStatus(evaluationId, 'failed', error.message);

        throw error;
    }
});

// Event listeners
evaluationQueue.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

evaluationQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
});

evaluationQueue.on('stalled', (job) => {
    console.warn(`⚠️  Job ${job.id} stalled`);
});

console.log('✓ Evaluation worker started and listening for jobs...');