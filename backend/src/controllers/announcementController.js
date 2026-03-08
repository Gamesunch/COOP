const db = require('../config/db');

exports.getProfessorAnnouncements = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT a.*, c.name as course_name, c.code as course_code
             FROM announcements a 
             JOIN course_professors cp ON a.course_id = cp.course_id
             JOIN courses c ON a.course_id = c.id
             WHERE cp.professor_id = $1 
             ORDER BY a.created_at DESC
             LIMIT 10`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching professor announcements' });
    }
};

exports.getCourseAnnouncements = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await db.query(
            `SELECT a.*, u.first_name AS prof_first, u.last_name AS prof_last 
             FROM announcements a 
             LEFT JOIN users u ON a.professor_id = u.id 
             WHERE a.course_id = $1 
             ORDER BY a.created_at DESC`,
            [courseId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching announcements' });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, content } = req.body;

        // Ensure professor teaches this course
        const checkCourse = await db.query(`SELECT id FROM courses WHERE id = $1`, [courseId]);
        if (checkCourse.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const checkProf = await db.query(`SELECT professor_id FROM course_professors WHERE course_id = $1 AND professor_id = $2`, [courseId, req.user.id]);
        if (checkProf.rows.length === 0) {
            return res.status(403).json({ error: 'You do not teach this course' });
        }

        const result = await db.query(
            `INSERT INTO announcements (course_id, professor_id, title, content) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [courseId, req.user.id, title, content]
        );
        res.status(201).json({ message: 'Announcement created successfully', announcement: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating announcement' });
    }
};

exports.createUniversityNews = async (req, res) => {
    try {
        const { title, content } = req.body;

        const result = await db.query(
            `INSERT INTO announcements (course_id, professor_id, title, content) 
             VALUES (NULL, $1, $2, $3) RETURNING *`,
            [req.user.id, title, content]
        );
        res.status(201).json({ message: 'University news created successfully', announcement: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating university news' });
    }
};

exports.getUniversityNews = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT a.*, u.first_name AS author_first, u.last_name AS author_last 
             FROM announcements a 
             LEFT JOIN users u ON a.professor_id = u.id 
             WHERE a.course_id IS NULL 
             ORDER BY a.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching university news' });
    }
};

exports.getStudentAnnouncements = async (req, res) => {
    try {
        // Fetch both global news and announcements for enrolled courses
        const result = await db.query(
            `SELECT a.*, 
                    c.name as course_name, 
                    c.code as course_code,
                    u.first_name AS author_first, 
                    u.last_name AS author_last 
             FROM announcements a 
             LEFT JOIN courses c ON a.course_id = c.id
             LEFT JOIN users u ON a.professor_id = u.id 
             WHERE a.course_id IS NULL 
                OR a.course_id IN (
                    SELECT course_id FROM enrollments 
                    WHERE student_id = $1 AND status = 'ENROLLED'
                )
             ORDER BY a.created_at DESC
             LIMIT 15`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching student announcements' });
    }
};
