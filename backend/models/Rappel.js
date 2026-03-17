const mongoose = require("mongoose");

const rappelSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    prospectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prospect",
      required: true,
    },
    type: {
      type: String,
      enum: ["rdv", "relance", "message"],
      default: "rdv",
    },
    message: { type: String, default: "" },
    dateEnvoi: { type: Date, default: Date.now },
    envoye: { type: Boolean, default: false },
    lu: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Rappel", rappelSchema);
