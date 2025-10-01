import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.js';
import evaluateRoutes from './routes/evaluate.js';
import resultRoutes from './routes/result.js';
import authRoutes from './routes/auth.js';
import { authenticate } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'AI CV Evaluator API',
        version: '1.0.0',
        endpoints: {
            upload: 'POST /upload',
            evaluate: 'POST /evaluate',
            result: 'GET /result/:id',
        },
    });
});

// Public routes
app.use('/auth', authRoutes);

// Protected routes (require authentication)
app.use('/upload', authenticate, uploadRoutes);
app.use('/evaluate', authenticate, evaluateRoutes);
app.use('/result', authenticate, resultRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: err.message,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}`);
});