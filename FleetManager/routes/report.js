const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

router.get('/pdf', verifyToken, reportController.generatePDF);

module.exports = router; 