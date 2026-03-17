const express = require("express");
const router = express.Router();
const {
  getRappels,
  marquerLu,
  marquerTousLus,
} = require("../controllers/rappel.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", getRappels);
router.put("/lu-tout", marquerTousLus);
router.put("/:id/lu", marquerLu);

module.exports = router;
