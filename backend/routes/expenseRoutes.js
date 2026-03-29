const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const employeeMiddleware = require("../middleware/employeeMiddleware");

const {
  createExpense,
  getMyExpenses
} = require("../controllers/expenseController");

router.post(
  "/",
  authMiddleware,
  employeeMiddleware,
  createExpense
);

router.get(
  "/my",
  authMiddleware,
  employeeMiddleware,
  getMyExpenses
);

module.exports = router;