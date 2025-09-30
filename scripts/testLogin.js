import bcrypt from 'bcryptjs';
import pool from '../src/config/database.js';

const testLogin = async() => {
    const username = 'admin';
    const password = 'admin123';

    try {
        // Get user from database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            console.log('❌ User not found in database');
            process.exit(1);
        }

        const user = result.rows[0];
        console.log('✓ User found:', user.username);
        console.log('  Email:', user.email);
        console.log('  Role:', user.role);
        console.log('  Password hash from DB:', user.password);

        // Test password comparison
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('\nPassword test:', password);
        console.log('Match result:', isMatch ? '✓ CORRECT' : '❌ WRONG');

        if (!isMatch) {
            console.log('\n🔧 Generating new hash for password:', password);
            const newHash = await bcrypt.hash(password, 10);
            console.log('New hash:', newHash);

            await pool.query('UPDATE users SET password = $1 WHERE username = $2', [newHash, username]);
            console.log('✓ Password updated in database');

            // Test again
            const testAgain = await bcrypt.compare(password, newHash);
            console.log('Test new password:', testAgain ? '✓ SUCCESS' : '❌ STILL FAILED');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

testLogin();