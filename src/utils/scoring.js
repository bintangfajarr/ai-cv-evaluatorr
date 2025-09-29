/**
 * Calculate weighted average score
 */
export const calculateWeightedScore = (scores, weights) => {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, score] of Object.entries(scores)) {
        const weight = weights[key] || 0;
        totalScore += score * weight;
        totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
};

/**
 * CV scoring weights (must sum to 1.0)
 */
export const CV_WEIGHTS = {
    technical_skills: 0.40,
    experience_level: 0.25,
    achievements: 0.20,
    cultural_fit: 0.15,
};

/**
 * Project scoring weights (must sum to 1.0)
 */
export const PROJECT_WEIGHTS = {
    correctness: 0.30,
    code_quality: 0.25,
    resilience: 0.20,
    documentation: 0.15,
    creativity: 0.10,
};

/**
 * Validate score is between 1-5
 */
export const validateScore = (score) => {
    if (score < 1) return 1;
    if (score > 5) return 5;
    return Math.round(score * 10) / 10; // Round to 1 decimal
};

/**
 * Validate all scores in an object
 */
export const validateScores = (scores) => {
    const validated = {};
    for (const [key, value] of Object.entries(scores)) {
        validated[key] = validateScore(value);
    }
    return validated;
};

/**
 * Convert 1-5 score to 0-1 match rate
 */
export const scoreToMatchRate = (weightedScore) => {
    // 1-5 scale → 0-1 scale
    // 1 → 0.0, 3 → 0.5, 5 → 1.0
    return Math.max(0, Math.min(1, (weightedScore - 1) / 4));
};

/**
 * Convert 1-5 score to 0-10 project score
 */
export const scoreToProjectScore = (weightedScore) => {
    // 1-5 scale → 0-10 scale
    // 1 → 2, 3 → 5, 5 → 10
    return Math.max(0, Math.min(10, (weightedScore - 1) * 2.5));
};