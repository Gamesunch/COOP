const express = require('express');
const router = express.Router();
const { getMyGrades } = require('../controllers/gradeController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/mine', authenticateToken, requireRole(['STUDENT']), getMyGrades);

module.exports = router;
