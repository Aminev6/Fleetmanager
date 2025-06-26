const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { addExpense, getExpenses } = require("../controllers/expenseController");

router.post("/", verifyToken, addExpense);
router.get("/", verifyToken, getExpenses);

module.exports = router;
