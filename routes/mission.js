const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const missionController = require('../controllers/missionController');

router.post('/start', verifyToken, missionController.startMission);
router.post('/end/:id', verifyToken, missionController.endMission);
router.get('/', verifyToken, missionController.getMissions);

module.exports = router;
