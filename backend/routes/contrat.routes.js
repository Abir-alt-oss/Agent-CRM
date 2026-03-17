const express = require("express");
const router = express.Router();
const {
  getContrats,
  getContratById,
  createContrat,
  updateContrat,
  deleteContrat,
  uploadDocument,
  deleteDocument,
} = require("../controllers/contrat.controller");
const { protect } = require("../middleware/auth.middleware");
const { upload } = require("../config/cloudinary");

router.use(protect);

router.get("/assure/:assureId", getContrats);
router.get("/detail/:id", getContratById);
router.post("/", createContrat);
router.put("/:id", updateContrat);
router.delete("/:id", deleteContrat);
router.post("/:id/documents", upload.single("document"), uploadDocument);
router.delete("/:id/documents/:docId", deleteDocument);

module.exports = router;
