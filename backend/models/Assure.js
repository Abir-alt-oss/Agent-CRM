const mongoose = require("mongoose");

const assureSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    telephone: { type: String, trim: true, default: "" },
    adresse: { type: String, trim: true, default: "" },
    dateNaissance: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

assureSchema.index({ agentId: 1, nom: 1 });

module.exports = mongoose.model("Assure", assureSchema);
