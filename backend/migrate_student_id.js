require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        console.log('Adding student_id column to users table...');
        await pool.query('ALTER TABLE users ADD COLUMN student_id VARCHAR(50) UNIQUE;');
        console.log('Successfully added student_id column.');

        console.log('Generating legacy student_ids...');
        const res = await pool.query("SELECT id FROM users WHERE role = 'STUDENT' AND student_id IS NULL");
        for (const user of res.rows) {
            const newId = `STU-${Math.floor(100000 + Math.random() * 900000)}`;
            await pool.query("UPDATE users SET student_id = $1 WHERE id = $2", [newId, user.id]);
        }
        console.log(`Updated ${res.rowCount} legacy students.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

run();
