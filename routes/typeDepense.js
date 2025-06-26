const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const typeDepenseController = require('../controllers/typeDepenseController');

router.post('/', verifyToken, typeDepenseController.addTypeDepense);
router.get('/', verifyToken, typeDepenseController.getTypeDepenses);
router.delete('/:id', verifyToken, typeDepenseController.deleteTypeDepense);

module.exports = router; 