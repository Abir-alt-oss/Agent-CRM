const express = require("express");
const router = express.Router();
const {
  getProspects,
  getArchives,
  getProspectById,
  createProspect,
  updateProspect,
  deleteProspect,
} = require("../controllers/prospect.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", getProspects);
router.get("/archives", getArchives);
router.get("/:id", getProspectById);
router.post("/", createProspect);
router.put("/:id", updateProspect);
router.delete("/:id", deleteProspect);

module.exports = router;
