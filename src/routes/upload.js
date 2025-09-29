import express from 'express';
import multer from 'multer';
import path from 'path';
import { parseFile, cleanText } from '../services/fileParser.js';
import { createCandidate } from '../models/Candidate.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

/**
 * POST /upload
 * Upload CV and Project Report
 */
router.post('/', upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'project_report', maxCount: 1 }
]), async(req, res) => {
    try {
        const { full_name, email } = req.body;
        const cvFile = req.files['cv'] && req.files['cv'][0];
        const projectFile = req.files['project_report'] && req.files['project_report'][0];

        // Validation
        if (!full_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'full_name and email are required',
            });
        }

        if (!cvFile || !projectFile) {
            return res.status(400).json({
                success: false,
                message: 'Both cv and project_report files are required',
            });
        }

        // Parse files
        console.log('Parsing CV file...');
        const cvText = cleanText(await parseFile(cvFile.path));

        console.log('Parsing project report file...');
        const projectText = cleanText(await parseFile(projectFile.path));

        // Save to database
        const candidate = await createCandidate(
            full_name,
            email,
            cvText,
            cvFile.originalname,
            projectText,
            projectFile.originalname
        );

        res.status(200).json({
            success: true,
            candidate_id: candidate.id,
            message: 'Files uploaded successfully',
        });
    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;