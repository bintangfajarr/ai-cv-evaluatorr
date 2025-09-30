import pool from '../src/config/database.js';
import bcrypt from 'bcryptjs';

const createUsersTable = async() => {
    try {
        console.log('Creating users table...\n');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✓ Table "users" created');

        // Generate hash untuk password "admin123"
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await pool.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@example.com', $1, 'admin')
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);
        console.log('✓ Default admin user created');
        console.log('  Username: admin');
        console.log('  Password: admin123');

        console.log('\n✅ Users table setup completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createUsersTable();