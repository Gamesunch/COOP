const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, courseController.getAllCourses);
router.post('/', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), courseController.createCourse);
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), courseController.updateCourse);
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), courseController.deleteCourse);
router.get('/:id/students', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), courseController.getCourseStudents);

module.exports = router;
