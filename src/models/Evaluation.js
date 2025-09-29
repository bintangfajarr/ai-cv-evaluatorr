import pool from '../config/database.js';

export const createEvaluation = async(candidateId, cvText, projectText) => {
    const query = `
    INSERT INTO evaluations (candidate_id, cv_text, project_text, status)
    VALUES ($1, $2, $3, 'queued')
    RETURNING *
  `;

    const values = [candidateId, cvText, projectText];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getEvaluationById = async(id) => {
    const query = 'SELECT * FROM evaluations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const updateEvaluationStatus = async(id, status, errorMessage = null) => {
    const query = `
    UPDATE evaluations 
    SET status = $1, error_message = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

    const values = [status, errorMessage, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updateEvaluationResults = async(id, results) => {
    const query = `
    UPDATE evaluations 
    SET 
      status = 'completed',
      cv_match_rate = $1,
      cv_feedback = $2,
      cv_scores = $3,
      project_score = $4,
      project_feedback = $5,
      project_scores = $6,
      overall_summary = $7,
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = $8
    RETURNING *
  `;

    const values = [
        results.cv_match_rate,
        results.cv_feedback,
        JSON.stringify(results.cv_scores),
        results.project_score,
        results.project_feedback,
        JSON.stringify(results.project_scores),
        results.overall_summary,
        id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};