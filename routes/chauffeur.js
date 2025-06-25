const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const chauffeurController = require('../controllers/chauffeurController');

router.post('/', verifyToken, chauffeurController.addChauffeur);
router.get('/', verifyToken, chauffeurController.getChauffeurs);
router.delete('/:id', verifyToken, chauffeurController.deleteChauffeur);

module.exports = router; 