const Contrat = require("../models/Contrat");
const { cloudinary } = require("../config/cloudinary");

// GET /api/contrats/:assureId — Tous les contrats d'un assuré
const getContrats = async (req, res) => {
  try {
    const contrats = await Contrat.find({
      assureId: req.params.assureId,
      agentId: req.agent._id,
    });
    res.json(contrats);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/contrats/detail/:id — Détail d'un contrat
const getContratById = async (req, res) => {
  try {
    const contrat = await Contrat.findOne({
      _id: req.params.id,
      agentId: req.agent._id,
    });
    if (!contrat)
      return res.status(404).json({ message: "Contrat introuvable." });
    res.json(contrat);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/contrats — Créer un contrat
const createContrat = async (req, res) => {
  try {
    const {
      assureId,
      numContrat,
      typeContrat,
      dateDebut,
      dateEcheance,
      montantPrime,
      modalitePaiement,
      statutContrat,
      statutPaiement,
      informations,
    } = req.body;

    // Vérifier si le numéro de contrat existe déjà
    const exists = await Contrat.findOne({ numContrat });
    if (exists)
      return res
        .status(400)
        .json({ message: "Ce numéro de contrat existe déjà." });

    const contrat = await Contrat.create({
      agentId: req.agent._id,
      assureId,
      numContrat,
      typeContrat,
      dateDebut,
      dateEcheance,
      montantPrime,
      modalitePaiement,
      statutContrat,
      statutPaiement,
      informations,
    });

    res.status(201).json(contrat);
  } catch (err) {
    res.status(500).json({ message: "Erreur création.", error: err.message });
  }
};

// PUT /api/contrats/:id — Modifier un contrat
const updateContrat = async (req, res) => {
  try {
    const contrat = await Contrat.findOneAndUpdate(
      { _id: req.params.id, agentId: req.agent._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!contrat)
      return res.status(404).json({ message: "Contrat introuvable." });
    res.json(contrat);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur modification.", error: err.message });
  }
};

// DELETE /api/contrats/:id — Supprimer un contrat
const deleteContrat = async (req, res) => {
  try {
    const contrat = await Contrat.findOneAndDelete({
      _id: req.params.id,
      agentId: req.agent._id,
    });
    if (!contrat)
      return res.status(404).json({ message: "Contrat introuvable." });

    // Supprimer tous les documents sur Cloudinary
    for (const doc of contrat.documents) {
      await cloudinary.uploader.destroy(doc.url);
    }

    res.json({ message: "Contrat supprimé." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur suppression.", error: err.message });
  }
};

// POST /api/contrats/:id/documents — Upload un document
const uploadDocument = async (req, res) => {
  try {
    const contrat = await Contrat.findOne({
      _id: req.params.id,
      agentId: req.agent._id,
    });
    if (!contrat)
      return res.status(404).json({ message: "Contrat introuvable." });

    // req.file est fourni par multer + cloudinary
    const newDoc = {
      nom: req.file.originalname,
      type: req.file.mimetype.includes("pdf") ? "pdf" : "image",
      url: req.file.path,
      taille: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
    };

    contrat.documents.push(newDoc);
    await contrat.save();

    res.status(201).json({
      message: "Document uploadé avec succès.",
      document: newDoc,
      contrat,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur upload.", error: err.message });
  }
};

// DELETE /api/contrats/:id/documents/:docId — Supprimer un document
const deleteDocument = async (req, res) => {
  try {
    const contrat = await Contrat.findOne({
      _id: req.params.id,
      agentId: req.agent._id,
    });
    if (!contrat)
      return res.status(404).json({ message: "Contrat introuvable." });

    // Trouver le document
    const doc = contrat.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: "Document introuvable." });

    // Supprimer de Cloudinary
    const publicId = doc.url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    // Supprimer du tableau documents
    contrat.documents.pull(req.params.docId);
    await contrat.save();

    res.json({ message: "Document supprimé." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur suppression.", error: err.message });
  }
};

module.exports = {
  getContrats,
  getContratById,
  createContrat,
  updateContrat,
  deleteContrat,
  uploadDocument,
  deleteDocument,
};
