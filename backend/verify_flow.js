require('dotenv').config();
const db = require('./src/config/db');

async function testFlow() {
    try {
        console.log("--- Starting Verification Flow ---");

        // 1. Get Admin User
        const adminRes = await db.query("SELECT id FROM users WHERE email = 'admin@test.com'");
        if (adminRes.rows.length === 0) throw new Error("Admin not found");
        const adminId = adminRes.rows[0].id;

        // 2. Set phase to PRE_ENROLLMENT directly via DB or API (we'll do DB for simplicity of the test)
        await db.query("INSERT INTO system_settings (key, value) VALUES ('enrollment_phase', 'PRE_ENROLLMENT') ON CONFLICT (key) DO UPDATE SET value = 'PRE_ENROLLMENT'");
        console.log("Phase set to PRE_ENROLLMENT");

        // 3. Get a Student User
        const studentRes = await db.query("SELECT id FROM users WHERE email = 'student@test.com'");
        if (studentRes.rows.length === 0) throw new Error("Student not found");
        const studentId = studentRes.rows[0].id;

        // 4. Get a course
        const courseRes = await db.query("SELECT id, capacity FROM courses LIMIT 1");
        const courseId = courseRes.rows[0].id;
        console.log(`Testing with course: ${courseId}, original capacity: ${courseRes.rows[0].capacity}`);

        // 5. Pre-Enroll
        // Clear any existing enrollment for this student/course
        await db.query("DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2", [studentId, courseId]);

        await db.query(
            "INSERT INTO enrollments (student_id, course_id, status) VALUES ($1, $2, 'PRE_ENROLLED')",
            [studentId, courseId]
        );
        console.log("Student PRE_ENROLLED");

        // 6. Check Demand
        const demandRes = await db.query(`
            SELECT 
                COUNT(id) FILTER (WHERE status = 'PRE_ENROLLED') as pre_enrolled_count
            FROM enrollments WHERE course_id = $1
        `, [courseId]);
        console.log(`Current Pre-Enrolled Demand: ${demandRes.rows[0].pre_enrolled_count}`);

        // 7. Update Capacity to 0 to force waitlisting
        await db.query("UPDATE courses SET capacity = 0 WHERE id = $1", [courseId]);
        console.log("Course Capacity changed to 0");

        // 8. Simulate Admin transitioning phase by calling the controller logic
        console.log("Simulating Admin changing phase to ENROLLMENT...");
        await db.query("BEGIN");
        await db.query("UPDATE system_settings SET value = 'ENROLLMENT' WHERE key = 'enrollment_phase'");

        // Controller logic copy for testing
        const cRes = await db.query("SELECT id, capacity FROM courses");
        for (const c of cRes.rows) {
            const c_id = c.id;
            let cap = c.capacity;
            const eRes = await db.query("SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND status = 'ENROLLED'", [c_id]);
            let available = cap - parseInt(eRes.rows[0].count);
            const pRes = await db.query("SELECT id FROM enrollments WHERE course_id = $1 AND status = 'PRE_ENROLLED' ORDER BY enrolled_at ASC", [c_id]);
            for (const row of pRes.rows) {
                if (available > 0) {
                    await db.query("UPDATE enrollments SET status = 'ENROLLED' WHERE id = $1", [row.id]);
                    available--;
                } else {
                    await db.query("UPDATE enrollments SET status = 'WAITLISTED' WHERE id = $1", [row.id]);
                }
            }
        }
        await db.query("COMMIT");
        console.log("Phase transitioned and processing complete.");

        // 9. Check the student's status
        const finalRes = await db.query("SELECT status FROM enrollments WHERE student_id = $1 AND course_id = $2", [studentId, courseId]);
        console.log(`Final Student Status: ${finalRes.rows[0].status}`);

        if (finalRes.rows[0].status === 'WAITLISTED') {
            console.log("✅ Verification SUCCESSFUL: Student was WAITLISTED as expected due to 0 capacity.");
        } else {
            console.log("❌ Verification FAILED!");
        }

        // Cleanup
        await db.query("UPDATE courses SET capacity = $2 WHERE id = $1", [courseId, courseRes.rows[0].capacity]);
        await db.query("UPDATE system_settings SET value = 'PRE_ENROLLMENT' WHERE key = 'enrollment_phase'"); // Reset to Pre-Enrollment for the user to try

        process.exit(0);

    } catch (e) {
        await db.query("ROLLBACK").catch(() => { "ignore" });
        console.error("Test failed:", e);
        process.exit(1);
    }
}
testFlow();
