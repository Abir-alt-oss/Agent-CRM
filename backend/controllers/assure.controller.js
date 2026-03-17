const Assure = require("../models/Assure");
const Contrat = require("../models/Contrat");

// GET /api/assures — Liste tous les assurés
const getAssures = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { agentId: req.agent._id };

    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } },
        { telephone: { $regex: search, $options: "i" } },
      ];
    }

    const assures = await Assure.find(filter).sort({ createdAt: -1 });
    res.json(assures);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/assures/:id — Détail d'un assuré + ses contrats
const getAssureById = async (req, res) => {
  try {
    const assure = await Assure.findOne({
      _id: req.params.id,
      agentId: req.agent._id,
    });
    if (!assure)
      return res.status(404).json({ message: "Assuré introuvable." });

    // Récupérer tous les contrats de cet assuré
    const contrats = await Contrat.find({ assureId: assure._id });

    res.json({ assure, contrats });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/assures — Créer un assuré
const createAssure = async (req, res) => {
  try {
    const { nom, prenom, telephone, adresse, dateNaissance, notes } = req.body;

    const assure = await Assure.create({
      agentId: req.agent._id,
      nom,
      prenom,
      telephone,
      adresse,
      dateNaissance,
      notes,
    });

    res.status(201).json(assure);
  } catch (err) {
    res.status(500).json({ message: "Erreur création.", error: err.message });
  }
};

// PUT /api/assures/:id — Modifier un assuré
const updateAssure = async (req, res) => {
  try {
    const assure = await Assure.findOneAndUpdate(
      { _id: req.params.id, agentId: req.agent._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!assure)
      return res.status(404).json({ message: "Assuré introuvable." });
    res.json(assure);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur modification.", error: err.message });
  }
};

// DELETE /api/assures/:id — Supprimer un assuré + ses contrats
const deleteAssure = async (req, res) => {
  try {
    const assure = await Assure.findOneAndDelete({
      _id: req.params.id,
      agentId: req.agent._id,
    });
    if (!assure)
      return res.status(404).json({ message: "Assuré introuvable." });

    // Supprimer tous ses contrats automatiquement
    await Contrat.deleteMany({ assureId: assure._id });

    res.json({ message: "Assuré et ses contrats supprimés." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur suppression.", error: err.message });
  }
};

module.exports = {
  getAssures,
  getAssureById,
  createAssure,
  updateAssure,
  deleteAssure,
};
