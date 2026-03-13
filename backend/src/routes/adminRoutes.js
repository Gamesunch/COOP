const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Phase management (students can read the phase, admins/professors can set it)
router.get('/phase', authenticateToken, adminController.getPhase);
router.post('/phase', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), adminController.setPhase);

// Demand analysis
router.get('/demand', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), adminController.getDemand);

// Update course capacity
router.put('/courses/:id/capacity', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), adminController.updateCapacity);

// Student management
router.get('/students', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), adminController.getStudents);
router.put('/students/:id/year', authenticateToken, requireRole(['ADMIN', 'PROFESSOR']), adminController.updateStudentYear);

module.exports = router;
