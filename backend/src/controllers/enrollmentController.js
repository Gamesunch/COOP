const db = require('../config/db');

exports.enrollCourse = async (req, res) => {
    try {
        const student_id = req.user.id;
        const { course_id } = req.body;

        // Fetch current phase
        const phaseRes = await db.query("SELECT value FROM system_settings WHERE key = 'enrollment_phase'");
        const phase = phaseRes.rows.length > 0 ? phaseRes.rows[0].value : 'ENROLLMENT';

        if (phase === 'CLOSED') {
            return res.status(403).json({ error: 'Enrollment is currently closed.' });
        }

        // 1. Check if course exists
        const courseRes = await db.query('SELECT * FROM courses WHERE id = $1', [course_id]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
        const courseToEnroll = courseRes.rows[0];

        // Ensure capacity is respected only during active ENROLLMENT
        if (phase === 'ENROLLMENT') {
            const enrolledCountRes = await db.query("SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND status = 'ENROLLED'", [course_id]);
            const currentEnrolled = parseInt(enrolledCountRes.rows[0].count);
            if (currentEnrolled >= courseToEnroll.capacity) {
                return res.status(400).json({ error: 'Course is at full capacity' });
            }
        }

        // 2. NEW: Prerequisite Check
        const prereqsRes = await db.query(
            `SELECT p.prerequisite_id, c.name, c.code 
             FROM course_prerequisites p
             JOIN courses c ON p.prerequisite_id = c.id
             WHERE p.course_id = $1`,
            [course_id]
        );

        if (prereqsRes.rows.length > 0) {
            const prereqIds = prereqsRes.rows.map(r => r.prerequisite_id);
            const passedPrereqsRes = await db.query(
                `SELECT course_id FROM enrollments 
                 WHERE student_id = $1 
                 AND course_id = ANY($2::uuid[]) 
                 AND status = 'ENROLLED' 
                 AND grade IS NOT NULL 
                 AND grade NOT IN ('F', 'W')`,
                [student_id, prereqIds]
            );

            if (passedPrereqsRes.rows.length < prereqIds.length) {
                const passedIds = passedPrereqsRes.rows.map(r => r.course_id);
                const missingPrereqs = prereqsRes.rows.filter(r => !passedIds.includes(r.prerequisite_id));
                return res.status(403).json({
                    error: `Missing prerequisites: ${missingPrereqs.map(p => `${p.code} ${p.name}`).join(', ')}`,
                    missingPrereqs
                });
            }
        }

        // 3. Simplistic Time conflict check
        const currentCourses = await db.query(
            `SELECT c.schedule_time 
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1`,
            [student_id]
        );
        const hasConflict = currentCourses.rows.some(
            c => c.schedule_time === courseToEnroll.schedule_time
        );

        if (hasConflict) {
            return res.status(409).json({ error: 'Time conflict with an existing enrolled course' });
        }

        // 3. Enroll or Pre-Enroll
        const statusToInsert = phase === 'PRE_ENROLLMENT' ? 'PRE_ENROLLED' : 'ENROLLED';
        const result = await db.query(
            'INSERT INTO enrollments (student_id, course_id, status) VALUES ($1, $2, $3) RETURNING *',
            [student_id, course_id, statusToInsert]
        );

        res.status(201).json({
            message: phase === 'PRE_ENROLLMENT' ? 'Successfully pre-enrolled' : 'Successfully enrolled',
            enrollment: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation Postgres code
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }
        console.error(error);
        res.status(500).json({ error: 'Server error during enrollment' });
    }
};

exports.getMyEnrollments = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.id as enrollment_id, e.status, e.grade, c.*, 
                COALESCE(
                    json_agg(
                        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name)
                    ) FILTER (WHERE u.id IS NOT NULL), 
                '[]') as professors
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN course_professors cp ON c.id = cp.course_id
            LEFT JOIN users u ON cp.professor_id = u.id
            WHERE e.student_id = $1
            GROUP BY e.id, c.id
        `, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching enrollments' });
    }
};

exports.dropCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const student_id = req.user.id;

        await db.query('BEGIN');

        // 1. Get the enrollment details before deleting
        const enrollmentRes = await db.query(
            'SELECT course_id, status FROM enrollments WHERE id = $1 AND student_id = $2',
            [id, student_id]
        );

        if (enrollmentRes.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Enrollment not found or not authorized' });
        }

        const { course_id, status } = enrollmentRes.rows[0];

        // 2. Delete the enrollment
        await db.query('DELETE FROM enrollments WHERE id = $1', [id]);

        // 3. If the dropped course was 'ENROLLED', promote the next waitlisted student
        if (status === 'ENROLLED') {
            const nextWaitlisted = await db.query(
                "SELECT id FROM enrollments WHERE course_id = $1 AND status = 'WAITLISTED' ORDER BY enrolled_at ASC LIMIT 1",
                [course_id]
            );

            if (nextWaitlisted.rows.length > 0) {
                await db.query(
                    "UPDATE enrollments SET status = 'ENROLLED' WHERE id = $1",
                    [nextWaitlisted.rows[0].id]
                );
            }
        }

        await db.query('COMMIT');
        res.json({ message: 'Course dropped successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Server error dropping course' });
    }
};
