import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config();

const chromaClient = new ChromaClient({
    path: `http://${process.env.CHROMA_HOST}:${process.env.CHROMA_PORT}`,
});

// Test connection
try {
    await chromaClient.heartbeat();
    console.log('✓ Connected to ChromaDB');
} catch (error) {
    console.error('ChromaDB connection failed:', error.message);
}

export default chromaClient;