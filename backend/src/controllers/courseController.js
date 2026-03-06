const db = require('../config/db');

exports.getAllCourses = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.*, u.first_name AS prof_first, u.last_name AS prof_last 
       FROM courses c 
       LEFT JOIN users u ON c.professor_id = u.id`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching courses' });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { name, code, description, credits, schedule_time, room, capacity } = req.body;
        // Assume req.user is an ADMIN or PROFESSOR creating their own course
        const professor_id = req.user.role === 'PROFESSOR' ? req.user.id : req.body.professor_id;

        const result = await db.query(
            `INSERT INTO courses 
        (name, code, description, professor_id, credits, schedule_time, room, capacity) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
            [name, code, description, professor_id, credits, schedule_time, room, capacity]
        );

        res.status(201).json({ message: 'Course created successfully', course: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating course' });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, credits, schedule_time, room, capacity } = req.body;

        const result = await db.query(
            `UPDATE courses 
             SET name=$1, code=$2, description=$3, credits=$4, schedule_time=$5, room=$6, capacity=$7 
             WHERE id=$8 RETURNING *`,
            [name, code, description, credits, schedule_time, room, capacity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Course updated successfully', course: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating course' });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure cascading deletes or delete enrollments first if not setup
        await db.query("BEGIN");
        await db.query("DELETE FROM enrollments WHERE course_id = $1", [id]);
        const result = await db.query("DELETE FROM courses WHERE id = $1 RETURNING id", [id]);
        await db.query("COMMIT");

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        await db.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ error: 'Server error deleting course' });
    }
};

exports.getCourseStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT u.id, u.student_id, u.first_name, u.last_name, u.email, u.major, u.year_of_study, e.status as enrollment_status 
             FROM enrollments e 
             JOIN users u ON e.student_id = u.id 
             WHERE e.course_id = $1 
             ORDER BY e.status, u.last_name`,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching course students' });
    }
};
