const Prospect = require("../models/Prospect");

// GET /api/prospects — Prospects actifs
const getProspects = async (req, res) => {
  try {
    const { search, statut } = req.query;
    const filter = { agentId: req.agent._id, archive: false };

    if (statut) filter.statut = statut;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } },
        { telephone: { $regex: search, $options: "i" } },
      ];
    }

    const prospects = await Prospect.find(filter).sort({ createdAt: -1 });
    res.json(prospects);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/prospects/archives — Prospects archivés
const getArchives = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { agentId: req.agent._id, archive: true };

    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } },
        { telephone: { $regex: search, $options: "i" } },
      ];
    }

    const archives = await Prospect.find(filter).sort({ updatedAt: -1 });
    res.json(archives);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/prospects/:id
const getProspectById = async (req, res) => {
  try {
    const prospect = await Prospect.findOne({
      _id: req.params.id,
      agentId: req.agent._id,
    });
    if (!prospect)
      return res.status(404).json({ message: "Prospect introuvable." });
    res.json(prospect);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/prospects
const createProspect = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      telephone,
      adresse,
      informations,
      observation,
      dateRdv,
      statut,
    } = req.body;

    const prospect = await Prospect.create({
      agentId: req.agent._id,
      nom,
      prenom,
      telephone,
      adresse,
      informations,
      observation,
      dateRdv,
      statut,
    });
    res.status(201).json(prospect);
  } catch (err) {
    res.status(500).json({ message: "Erreur création.", error: err.message });
  }
};

// PUT /api/prospects/:id
const updateProspect = async (req, res) => {
  try {
    // Si RDV reporté → reset rappelEnvoye
    if (req.body.statut === "rdv_reporte" && req.body.dateRdv) {
      req.body.rappelEnvoye = false;
    }

    // Si non intéressé → archiver automatiquement
    if (req.body.statut === "non_interesse") {
      req.body.archive = true;
    }

    const prospect = await Prospect.findOneAndUpdate(
      { _id: req.params.id, agentId: req.agent._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!prospect)
      return res.status(404).json({ message: "Prospect introuvable." });
    res.json(prospect);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur modification.", error: err.message });
  }
};

// DELETE /api/prospects/:id — Suppression définitive
const deleteProspect = async (req, res) => {
  try {
    const prospect = await Prospect.findOneAndDelete({
      _id: req.params.id,
      agentId: req.agent._id,
    });
    if (!prospect)
      return res.status(404).json({ message: "Prospect introuvable." });
    res.json({ message: "Prospect supprimé définitivement." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur suppression.", error: err.message });
  }
};

module.exports = {
  getProspects,
  getArchives,
  getProspectById,
  createProspect,
  updateProspect,
  deleteProspect,
};
