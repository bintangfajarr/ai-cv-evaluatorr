import chromaClient from '../config/chromadb.js';
import { DefaultEmbeddingFunction } from 'chromadb';

const JOB_COLLECTION_NAME = 'job_descriptions';
const RUBRIC_COLLECTION_NAME = 'scoring_rubrics';

// Create default embedding function
const embeddingFunction = new DefaultEmbeddingFunction();

/**
 * Initialize ChromaDB collections
 */
export const initializeCollections = async() => {
    try {
        console.log('Initializing ChromaDB collections...');

        // Test connection first
        await chromaClient.heartbeat();
        console.log('✓ ChromaDB connection verified');

        // Delete existing collections to start fresh
        try {
            await chromaClient.deleteCollection({ name: JOB_COLLECTION_NAME });
            console.log('  Deleted old job collection');
        } catch (e) {
            // Collection doesn't exist, that's fine
        }

        try {
            await chromaClient.deleteCollection({ name: RUBRIC_COLLECTION_NAME });
            console.log('  Deleted old rubric collection');
        } catch (e) {
            // Collection doesn't exist, that's fine
        }

        // Create new collections with embedding function
        const jobCollection = await chromaClient.createCollection({
            name: JOB_COLLECTION_NAME,
            embeddingFunction: embeddingFunction,
        });
        console.log('✓ Job descriptions collection created');

        const rubricCollection = await chromaClient.createCollection({
            name: RUBRIC_COLLECTION_NAME,
            embeddingFunction: embeddingFunction,
        });
        console.log('✓ Scoring rubrics collection created');

        return { jobCollection, rubricCollection };
    } catch (error) {
        console.error('Error initializing collections:', error.message);
        throw error;
    }
};

/**
 * Store job description in vector DB
 */
export const storeJobDescription = async(id, title, content) => {
    try {
        const collection = await chromaClient.getCollection({
            name: JOB_COLLECTION_NAME,
            embeddingFunction: embeddingFunction,
        });

        await collection.add({
            ids: [id],
            documents: [content],
            metadatas: [{ title, type: 'job_description' }],
        });

        console.log(`✓ Stored job description: ${title}`);
    } catch (error) {
        console.error('Error storing job description:', error.message);
        throw error;
    }
};

/**
 * Store scoring rubric in vector DB
 */
export const storeScoringRubric = async(id, category, parameter, description, scoringGuide) => {
    try {
        const collection = await chromaClient.getCollection({
            name: RUBRIC_COLLECTION_NAME,
            embeddingFunction: embeddingFunction,
        });

        const document = `${parameter}: ${description}\nScoring: ${scoringGuide}`;

        await collection.add({
            ids: [id],
            documents: [document],
            metadatas: [{ category, parameter, type: 'scoring_rubric' }],
        });

        console.log(`✓ Stored rubric: ${category} - ${parameter}`);
    } catch (error) {
        console.error('Error storing rubric:', error.message);
        throw error;
    }
};

/**
 * Query job description context
 */
export const queryJobContext = async(query, topK = 3) => {
    try {
        const collection = await chromaClient.getCollection({
            name: JOB_COLLECTION_NAME,
            embeddingFunction: embeddingFunction,
        });

        const results = await collection.query({
            queryTexts: [query],
            nResults: topK,
        });

        if (results.documents && results.documents[0]) {
            return results.documents[0].join('\n\n');
        }

        return '';
    } catch (error) {
        console.error('Error querying job context:', error.message);
        return '';
    }
};

/**
 * Query scoring rubric context
 */
export const queryScoringRubric = async(query, topK = 5) => {
    try {
        const collection = await chromaClient.getCollection({
            name: RUBRIC_COLLECTION_NAME,
            embeddingFunction: embeddingFunction,
        });

        const results = await collection.query({
            queryTexts: [query],
            nResults: topK,
        });

        if (results.documents && results.documents[0]) {
            return results.documents[0].join('\n\n');
        }

        return '';
    } catch (error) {
        console.error('Error querying rubric:', error.message);
        return '';
    }
};