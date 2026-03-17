const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const prospectRoutes = require("./routes/prospect.routes");
const assureRoutes = require("./routes/assure.routes");
const contratRoutes = require("./routes/contrat.routes");
const rappelRoutes = require("./routes/rappel.routes");
const { sendRappelsJob } = require("./controllers/rappel.controller");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/prospects", prospectRoutes);
app.use("/api/assures", assureRoutes);
app.use("/api/contrats", contratRoutes);
app.use("/api/rappels", rappelRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Agent CRM API is running !" });
});

// CRON JOB — Chaque jour à 09:00
cron.schedule("0 9 * * *", () => {
  console.log("[CRON] Vérification des RDV J-1...");
  sendRappelsJob();
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Serveur démarré sur le port ${process.env.PORT}`),
    );
  })
  .catch((err) => console.error("❌ Erreur MongoDB:", err));
