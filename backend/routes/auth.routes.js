const express = require("express");
const router = express.Router();
const {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  createAgent,
  changePassword,
  getAllAgents,
  updateAgent,
  deleteAgent,
  toggleAgent,
} = require("../controllers/auth.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/create-agent", protect, adminOnly, createAgent);
router.put("/change-password", protect, changePassword);
router.get("/agents", protect, adminOnly, getAllAgents);
router.put("/agents/:id/toggle", protect, adminOnly, toggleAgent);
router.put("/agents/:id", protect, adminOnly, updateAgent);
router.delete("/agents/:id", protect, adminOnly, deleteAgent);

module.exports = router;
