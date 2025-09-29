import pool from '../src/config/database.js';

const createTables = async() => {
    try {
        console.log('Creating database tables...');

        // Table: candidates
        await pool.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255),
        email VARCHAR(255),
        cv_text TEXT,
        cv_filename VARCHAR(255),
        project_text TEXT,
        project_filename VARCHAR(255),
        uploaded_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✓ Table "candidates" created');

        // Table: evaluations
        await pool.query(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id INTEGER REFERENCES candidates(id),
        status VARCHAR(50) DEFAULT 'queued',
        
        cv_text TEXT,
        project_text TEXT,
        
        cv_match_rate DECIMAL(4,2),
        cv_feedback TEXT,
        project_score DECIMAL(4,2),
        project_feedback TEXT,
        overall_summary TEXT,
        
        cv_scores JSONB,
        project_scores JSONB,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        error_message TEXT
      );
    `);
        console.log('✓ Table "evaluations" created');

        // Table: job_descriptions
        await pool.query(`
      CREATE TABLE IF NOT EXISTS job_descriptions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        content TEXT,
        embedding_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✓ Table "job_descriptions" created');

        // Table: scoring_rubrics
        await pool.query(`
      CREATE TABLE IF NOT EXISTS scoring_rubrics (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100),
        parameter VARCHAR(255),
        weight DECIMAL(3,2),
        description TEXT,
        scoring_guide TEXT,
        embedding_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✓ Table "scoring_rubrics" created');

        console.log('\n✅ All tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        process.exit(1);
    }
};

createTables();