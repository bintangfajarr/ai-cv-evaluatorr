import pool from '../config/database.js';

export const createCandidate = async(fullName, email, cvText, cvFilename, projectText, projectFilename) => {
    const query = `
    INSERT INTO candidates (full_name, email, cv_text, cv_filename, project_text, project_filename)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

    const values = [fullName, email, cvText, cvFilename, projectText, projectFilename];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getCandidateById = async(id) => {
    const query = 'SELECT * FROM candidates WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};