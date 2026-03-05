require('dotenv').config();
const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function run() {
    try {
        const hp = await bcrypt.hash('password123', 10);
        // Fix: Use uuid_generate_v4() or just simple string if not using extension, but let's use standard method
        // Gen random uuid via node crypto
        const crypto = require('crypto');
        const uuid = crypto.randomUUID();

        await db.query(
            "INSERT INTO users (id, first_name, last_name, email, password_hash, role) VALUES ($1, 'Admin', 'User', 'admin@test.com', $2, 'ADMIN') ON CONFLICT (email) DO NOTHING",
            [uuid, hp]
        );
        console.log('Admin seeded.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
