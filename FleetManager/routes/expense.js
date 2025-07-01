const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { addExpense, getExpenses } = require("../controllers/expenseController");
const reportController = require('../controllers/reportController');

router.post("/", verifyToken, addExpense);
router.get("/", verifyToken, getExpenses);
router.get('/report/pdf', reportController.generatePDF);

module.exports = router;
