import openRouterClient from '../config/llm.js';


export const generateEmbedding = async(text) => {
    try {
        return text.toLowerCase().split(/\s+/).slice(0, 100); // First 100 words
    } catch (error) {
        console.error('Error generating embedding:', error.message);
        throw error;
    }
};

/**
 * Calculate simple cosine similarity between two texts
 */
export const calculateSimilarity = (text1, text2) => {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size; // Jaccard similarity
};