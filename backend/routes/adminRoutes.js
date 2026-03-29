const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { createUser, getUsers } = require("../controllers/adminController");

router.post(
  "/users",
  authMiddleware,
  adminMiddleware,
  createUser
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getUsers
);

module.exports = router;