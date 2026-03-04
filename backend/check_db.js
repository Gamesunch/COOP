require('dotenv').config();
const db = require('./src/config/db');

async function check() {
    try {
        const tables = await db.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
        console.log('Tables:', tables.rows.map(x => x.table_name).join(', '));

        // Check courses table structure
        const courseCols = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position`);
        console.log('\nCourses columns:');
        courseCols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

        // Check enrollments table structure
        const enrollCols = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'enrollments' ORDER BY ordinal_position`);
        console.log('\nEnrollments columns:');
        enrollCols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

        // Check for any existing courses
        const courses = await db.query('SELECT COUNT(*) as count FROM courses');
        console.log('\nExisting courses:', courses.rows[0].count);

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
check();
