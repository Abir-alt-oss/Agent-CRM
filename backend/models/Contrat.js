const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, enum: ["pdf", "image", "autre"], default: "pdf" },
  url: { type: String, required: true },
  taille: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
});

const contratSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    assureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assure",
      required: true,
    },
    numContrat: { type: String, required: true, unique: true, trim: true },
    typeContrat: { type: String, required: true, trim: true },
    dateDebut: { type: Date, default: null },
    dateEcheance: { type: Date, default: null },
    montantPrime: { type: Number, default: 0 },
    modalitePaiement: {
      type: String,
      enum: ["mensuelle", "trimestrielle", "semestrielle", "annuelle"],
      default: "mensuelle",
    },
    statutContrat: {
      type: String,
      enum: ["actif", "suspendu", "resilie"],
      default: "actif",
    },
    statutPaiement: {
      type: String,
      enum: ["paye", "impaye", "en_attente"],
      default: "en_attente",
    },
    informations: { type: String, default: "" },
    documents: [documentSchema],
  },
  { timestamps: true },
);

contratSchema.index({ assureId: 1 });

module.exports = mongoose.model("Contrat", contratSchema);
