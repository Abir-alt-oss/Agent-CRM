const express = require("express");
const router = express.Router();
const {
  getAssures,
  getAssureById,
  createAssure,
  updateAssure,
  deleteAssure,
} = require("../controllers/assure.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", getAssures);
router.get("/:id", getAssureById);
router.post("/", createAssure);
router.put("/:id", updateAssure);
router.delete("/:id", deleteAssure);

module.exports = router;
