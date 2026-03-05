require('dotenv').config();
const db = require('./src/config/db');

async function setupPreEnrollmentDB() {
    try {
        // 1. Create system_settings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR(255) PRIMARY KEY,
                value VARCHAR(255) NOT NULL
            );
        `);
        console.log('system_settings table created or exists.');

        // Initialize Phase
        await db.query(`
            INSERT INTO system_settings (key, value)
            VALUES ('enrollment_phase', 'ENROLLMENT')
            ON CONFLICT (key) DO NOTHING;
        `);
        console.log('enrollment_phase initialized.');

        // 2. Discover ENUM name for enrollments.status
        const enumTypeRes = await db.query(`
            SELECT t.typname
            FROM pg_type t
            JOIN pg_attribute a ON a.atttypid = t.oid
            JOIN pg_class c ON c.oid = a.attrelid
            WHERE c.relname = 'enrollments' AND a.attname = 'status';
        `);

        let enumName = 'enrollment_status';
        if (enumTypeRes.rows.length > 0) {
            enumName = enumTypeRes.rows[0].typname;
        }

        console.log(`Enum name is: ${enumName}`);

        // 3. Add new values to enum (PostgreSQL doesn't support IF NOT EXISTS for ADD VALUE perfectly without DO block)
        const newValues = ['PRE_ENROLLED', 'WAITLISTED'];
        for (const val of newValues) {
            try {
                // Must be run outside a transaction block
                await db.query(`ALTER TYPE ${enumName} ADD VALUE '${val}';`);
                console.log(`Added ${val} to ${enumName}`);
            } catch (err) {
                if (err.code === '42710') { // 42710 = duplicate_object
                    console.log(`${val} already exists in ${enumName}`);
                } else {
                    console.error(`Error adding ${val}:`, err.message);
                }
            }
        }

        console.log('Database setup complete for Pre-enrollment.');
        process.exit(0);
    } catch (e) {
        console.error('Fatal Database Error:', e);
        process.exit(1);
    }
}
setupPreEnrollmentDB();
