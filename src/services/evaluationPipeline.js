import { callLLMJSON, callLLM } from './llmService.js';
import { queryJobContext, queryScoringRubric } from './ragService.js';
import {
    extractCVInfoPrompt,
    evaluateCVMatchPrompt,
    extractProjectInfoPrompt,
    evaluateProjectPrompt,
    refineProjectEvaluationPrompt,
    generateSummaryPrompt,
} from '../utils/prompts.js';
import {
    calculateWeightedScore,
    CV_WEIGHTS,
    PROJECT_WEIGHTS,
    validateScores,
    scoreToMatchRate,
    scoreToProjectScore,
} from '../utils/scoring.js';

/**
 * Main evaluation pipeline
 */
export const runEvaluationPipeline = async(cvText, projectText) => {
    try {
        console.log('\n=== Starting Evaluation Pipeline ===\n');

        // Step 1: Extract CV information
        console.log('Step 1: Extracting CV information...');
        const extractedCV = await extractCVInfo(cvText);
        console.log('✓ CV info extracted');

        // Step 2: Retrieve job context from RAG
        console.log('\nStep 2: Retrieving job context...');
        const jobContext = await queryJobContext('backend engineer requirements AI LLM');
        console.log('✓ Job context retrieved');

        // Step 3: Evaluate CV match
        console.log('\nStep 3: Evaluating CV match...');
        const cvEvaluation = await evaluateCVMatch(extractedCV, jobContext);
        console.log('✓ CV evaluation completed');

        // Step 4: Calculate CV match rate
        const cvMatchRate = calculateCVMatchRate(cvEvaluation.scores);
        console.log(`✓ CV Match Rate: ${(cvMatchRate * 100).toFixed(0)}%`);

        // Step 5: Extract project information
        console.log('\nStep 5: Extracting project information...');
        const extractedProject = await extractProjectInfo(projectText);
        console.log('✓ Project info extracted');

        // Step 6: Retrieve scoring rubric from RAG
        console.log('\nStep 6: Retrieving scoring rubric...');
        const scoringRubric = await queryScoringRubric('project evaluation code quality resilience');
        console.log('✓ Scoring rubric retrieved');

        // Step 7: Evaluate project (first pass)
        console.log('\nStep 7: Evaluating project (first pass)...');
        const projectEvaluation = await evaluateProject(extractedProject, scoringRubric);
        console.log('✓ Project evaluation completed');

        // Step 8: Refine project evaluation (second pass)
        console.log('\nStep 8: Refining project evaluation...');
        const refinedProjectEvaluation = await refineProjectEvaluation(
            projectEvaluation.scores,
            projectEvaluation.feedback
        );
        console.log('✓ Project evaluation refined');

        // Step 9: Calculate project score
        const projectScore = calculateProjectScore(refinedProjectEvaluation.scores);
        console.log(`✓ Project Score: ${projectScore.toFixed(1)}/10`);

        // Step 10: Generate overall summary
        console.log('\nStep 10: Generating overall summary...');
        const overallSummary = await generateOverallSummary(
            cvEvaluation.scores,
            cvEvaluation.feedback,
            refinedProjectEvaluation.scores,
            refinedProjectEvaluation.feedback,
            cvMatchRate,
            projectScore
        );
        console.log('✓ Summary generated');

        console.log('\n=== Evaluation Pipeline Completed ===\n');

        // Return final result
        return {
            cv_match_rate: parseFloat(cvMatchRate.toFixed(2)),
            cv_feedback: cvEvaluation.feedback,
            cv_scores: cvEvaluation.scores,
            project_score: parseFloat(projectScore.toFixed(2)),
            project_feedback: refinedProjectEvaluation.feedback,
            project_scores: refinedProjectEvaluation.scores,
            overall_summary: overallSummary,
        };
    } catch (error) {
        console.error('Pipeline error:', error.message);
        throw error;
    }
};

/**
 * Step 1: Extract structured info from CV
 */
const extractCVInfo = async(cvText) => {
    const prompt = extractCVInfoPrompt(cvText);
    const response = await callLLMJSON(prompt);
    return response;
};

/**
 * Step 3: Evaluate CV against job requirements
 */
const evaluateCVMatch = async(extractedCV, jobContext) => {
    const prompt = evaluateCVMatchPrompt(extractedCV, jobContext);
    const response = await callLLMJSON(prompt);

    // Validate scores
    response.scores = validateScores(response.scores);

    return response;
};

/**
 * Step 4: Calculate CV match rate
 */
const calculateCVMatchRate = (cvScores) => {
    const weightedScore = calculateWeightedScore(cvScores, CV_WEIGHTS);
    return scoreToMatchRate(weightedScore);
};

/**
 * Step 5: Extract project information
 */
const extractProjectInfo = async(projectText) => {
    const prompt = extractProjectInfoPrompt(projectText);
    const response = await callLLMJSON(prompt);
    return response;
};

/**
 * Step 7: Evaluate project deliverable
 */
const evaluateProject = async(extractedProject, scoringRubric) => {
    const prompt = evaluateProjectPrompt(extractedProject, scoringRubric);
    const response = await callLLMJSON(prompt);

    // Validate scores
    response.scores = validateScores(response.scores);

    return response;
};

/**
 * Step 8: Refine project evaluation (second LLM call)
 */
const refineProjectEvaluation = async(initialScores, initialFeedback) => {
    const prompt = refineProjectEvaluationPrompt(initialScores, initialFeedback);
    const response = await callLLMJSON(prompt);

    // Validate refined scores
    response.scores = validateScores(response.scores);

    return response;
};

/**
 * Calculate project score (1-5 scale to 0-10 scale)
 */
const calculateProjectScore = (projectScores) => {
    const weightedScore = calculateWeightedScore(projectScores, PROJECT_WEIGHTS);
    return scoreToProjectScore(weightedScore);
};

/**
 * Step 10: Generate overall summary
 */
const generateOverallSummary = async(
    cvScores,
    cvFeedback,
    projectScores,
    projectFeedback,
    cvMatchRate,
    projectScore
) => {
    const prompt = generateSummaryPrompt(
        cvScores,
        cvFeedback,
        projectScores,
        projectFeedback,
        cvMatchRate,
        projectScore
    );
    const summary = await callLLM(prompt);
    return summary.trim();
};