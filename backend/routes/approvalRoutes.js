const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const managerMiddleware = require("../middleware/managerMiddleware");

const {
  getPendingApprovals,
  approveExpense,
  rejectExpense
} = require("../controllers/approvalController");

router.get(
  "/pending",
  authMiddleware,
  managerMiddleware,
  getPendingApprovals
);

router.post(
  "/:id/approve",
  authMiddleware,
  managerMiddleware,
  approveExpense
);

router.post(
  "/:id/reject",
  authMiddleware,
  managerMiddleware,
  rejectExpense
);

module.exports = router;