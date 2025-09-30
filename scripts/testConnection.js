import pool from '../src/config/database.js';

const testConnection = async() => {
    try {
        console.log('Testing database connection...');
        const result = await pool.query('SELECT NOW(), current_database()');
        console.log(' Connected to database:', result.rows[0].current_database);
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
};

testConnection();