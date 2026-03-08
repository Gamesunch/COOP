const express = require('express');
const router = express.Router({ mergeParams: true });
const announcementController = require('../controllers/announcementController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Base route is /api/courses/:courseId/announcements (or similar if mounted there)
// But let's build standard routes

// Global/Student routes
router.get('/university', authenticateToken, announcementController.getUniversityNews);
router.post('/university', authenticateToken, requireRole(['ADMIN']), announcementController.createUniversityNews);
router.get('/student', authenticateToken, requireRole(['STUDENT']), announcementController.getStudentAnnouncements);

router.get('/professor', authenticateToken, requireRole(['PROFESSOR']), announcementController.getProfessorAnnouncements);
router.get('/course/:courseId', authenticateToken, announcementController.getCourseAnnouncements);
router.post('/course/:courseId', authenticateToken, requireRole(['PROFESSOR']), announcementController.createAnnouncement);

module.exports = router;
