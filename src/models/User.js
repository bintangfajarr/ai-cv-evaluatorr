import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const createUser = async(username, email, password, role = 'user') => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
    INSERT INTO users (username, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, role, created_at
  `;

    const values = [username, email, hashedPassword, role];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findUserByUsername = async(username) => {
    const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
    const result = await pool.query(query, [username]);
    return result.rows[0];
};

export const findUserByEmail = async(email) => {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

export const findUserById = async(id) => {
    const query = 'SELECT id, username, email, role, is_active FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const comparePassword = async(plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export const getAllUsers = async() => {
    const query = 'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
};

export const updateUser = async(id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.email) {
        fields.push(`email = $${paramCount}`);
        values.push(updates.email);
        paramCount++;
    }

    if (updates.password) {
        const hashedPassword = await bcrypt.hash(updates.password, 10);
        fields.push(`password = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
    }

    if (updates.role) {
        fields.push(`role = $${paramCount}`);
        values.push(updates.role);
        paramCount++;
    }

    if (updates.is_active !== undefined) {
        fields.push(`is_active = $${paramCount}`);
        values.push(updates.is_active);
        paramCount++;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, username, email, role, is_active
  `;

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteUser = async(id) => {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};