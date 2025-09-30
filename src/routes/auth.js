import express from 'express';
import jwt from 'jsonwebtoken';
import {
    createUser,
    findUserByUsername,
    findUserByEmail,
    comparePassword,
    getAllUsers,
    updateUser,
    deleteUser,
} from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId },
        process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * POST /auth/register
 * Register new user
 */
router.post('/register', async(req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists',
            });
        }

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
            });
        }

        const user = await createUser(username, email, password);
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required',
            });
        }

        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * GET /auth/me
 * Get current user
 */
router.get('/me', authenticate, async(req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
        },
    });
});

/**
 * GET /auth/users
 * Get all users (Admin only)
 */
router.get('/users', authenticate, authorize(['admin']), async(req, res) => {
    try {
        const users = await getAllUsers();
        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Get users error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * PUT /auth/users/:id
 * Update user (Admin only)
 */
router.put('/users/:id', authenticate, authorize(['admin']), async(req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await updateUser(id, updates);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Update user error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * DELETE /auth/users/:id
 * Delete user (Admin only)
 */
router.delete('/users/:id', authenticate, authorize(['admin']), async(req, res) => {
    try {
        const { id } = req.params;

        const user = await deleteUser(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;