import openRouterClient from '../config/llm.js';

/**
 * Generate embeddings using OpenRouter
 * Note: Not all models support embeddings, so we'll use a simple approach
 */
export const generateEmbedding = async(text) => {
    try {
        // For free models on OpenRouter, we'll use a simple text-based approach
        // In production, you'd use a proper embedding model like text-embedding-ada-002

        // Simple fallback: use the text itself for similarity (not ideal but works)
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