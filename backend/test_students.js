require('dotenv').config();
const db = require('./src/config/db');

async function test() {
    try {
        const result = await db.query(
            `SELECT * FROM enrollments LIMIT 1`
        );
        console.log("Enrollment sample: ", result.rows);
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}
test();
