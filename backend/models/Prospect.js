const mongoose = require("mongoose");

const prospectSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    telephone: { type: String, required: true, trim: true },
    adresse: { type: String, trim: true, default: "" },
    informations: { type: String, default: "" },
    observation: { type: String, default: "" },
    dateRdv: { type: Date, default: null },
    rappelEnvoye: { type: Boolean, default: false },
    archive: { type: Boolean, default: false },
    statut: {
      type: String,
      enum: [
        "nouveau",
        "contacte",
        "rdv_planifie",
        "rdv_reporte",
        "non_interesse",
        "converti",
      ],
      default: "nouveau",
    },
  },
  { timestamps: true },
);

prospectSchema.index({ agentId: 1, nom: 1 });
prospectSchema.index({ agentId: 1, dateRdv: 1 });
prospectSchema.index({ agentId: 1, archive: 1 });

module.exports = mongoose.model("Prospect", prospectSchema);
