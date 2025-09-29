import dotenv from 'dotenv';
dotenv.config();

// Import configurations first
import './config/database.js';
import './config/redis.js';
import './config/chromadb.js';

// Import worker
import './workers/evaluationWorker.js';

console.log('🔧 Worker process started');