const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();
const PORT = process.env.PORT || 10000;
const authRoutes = require("./routes/auth.routes");
const prospectRoutes = require("./routes/prospect.routes");
const assureRoutes = require("./routes/assure.routes");
const contratRoutes = require("./routes/contrat.routes");
const rappelRoutes = require("./routes/rappel.routes");
const { sendRappelsJob } = require("./controllers/rappel.controller");

const app = express();
const https = require("https");
setInterval(
  () => {
    https.get("https://agent-crm-1-9nqp.onrender.com/api/health", () => {
      console.log("🏓 Ping keep-alive");
    });
  },
  14 * 60 * 1000,
);
// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
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
    app.listen(PORT, () =>
      console.log(`🚀 Serveur démarré sur le port ${PORT}`),
    );
  })
  .catch((err) => {
    console.error("❌ Erreur MongoDB:", err);
    process.exit(1); // Force le redémarrage Render
  });
