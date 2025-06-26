console.log('TRUCK ROUTES LOADED');
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

const {
  addTruck,
  getMyTrucks,
  deleteTruck,
  getTrucksWithEcheances
} = require('../controllers/truckController');


router.post('/', verifyToken, addTruck);
router.get('/', verifyToken, getMyTrucks);
router.delete('/:id', verifyToken, deleteTruck);
router.get('/echeances', verifyToken, getTrucksWithEcheances);

module.exports = router;
