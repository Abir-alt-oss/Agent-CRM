const Rappel = require("../models/Rappel");
const Prospect = require("../models/Prospect");
const nodemailer = require("nodemailer");

// Créer le transporteur email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// GET /api/rappels — Rappels non lus de l'agent
const getRappels = async (req, res) => {
  try {
    const rappels = await Rappel.find({
      agentId: req.agent._id,
      lu: false,
    })
      .populate("prospectId", "nom prenom telephone dateRdv")
      .sort({ createdAt: -1 });
    res.json(rappels);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/rappels/:id/lu — Marquer un rappel comme lu
const marquerLu = async (req, res) => {
  try {
    const rappel = await Rappel.findOneAndUpdate(
      { _id: req.params.id, agentId: req.agent._id },
      { lu: true },
      { new: true },
    );
    if (!rappel)
      return res.status(404).json({ message: "Rappel introuvable." });
    res.json(rappel);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/rappels/lu-tout — Marquer tous les rappels comme lus
const marquerTousLus = async (req, res) => {
  try {
    await Rappel.updateMany(
      { agentId: req.agent._id, lu: false },
      { lu: true },
    );
    res.json({ message: "Tous les rappels marqués comme lus." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// CRON JOB — Appelé chaque jour à 09:00
const sendRappelsJob = async () => {
  try {
    // Trouver les RDV de demain
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    const debut = new Date(demain.setHours(0, 0, 0, 0));
    const fin = new Date(demain.setHours(23, 59, 59, 999));

    const prospects = await Prospect.find({
      dateRdv: { $gte: debut, $lte: fin },
      rappelEnvoye: false,
    }).populate("agentId", "nom prenom email");

    console.log(`[CRON] ${prospects.length} RDV trouvé(s) pour demain.`);

    const transporter = createTransporter();

    for (const prospect of prospects) {
      // 1 — Créer la notification dans MongoDB
      await Rappel.create({
        agentId: prospect.agentId._id,
        prospectId: prospect._id,
        type: "rdv",
        message: `RDV demain avec ${prospect.prenom} ${prospect.nom}`,
        dateEnvoi: new Date(),
        envoye: true,
      });

      // 2 — Envoyer email à l'agent
      await transporter.sendMail({
        from: `"Agent CRM" <${process.env.EMAIL_USER}>`,
        to: prospect.agentId.email,
        subject: `🔔 Rappel RDV demain — ${prospect.prenom} ${prospect.nom}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;padding:20px">
            <h2 style="color:#f97316">🛡️ Agent CRM — Rappel RDV</h2>
            <p>Bonjour <strong>${prospect.agentId.prenom}</strong>,</p>
            <p>Vous avez un rendez-vous <strong>demain</strong> avec :</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              <tr style="background:#f1f5f9">
                <td style="padding:10px;font-weight:600">Nom</td>
                <td style="padding:10px">${prospect.prenom} ${prospect.nom}</td>
              </tr>
              <tr>
                <td style="padding:10px;font-weight:600">Téléphone</td>
                <td style="padding:10px">${prospect.telephone}</td>
              </tr>
              <tr style="background:#f1f5f9">
                <td style="padding:10px;font-weight:600">Date RDV</td>
                <td style="padding:10px">
                  ${new Date(prospect.dateRdv).toLocaleDateString("fr-FR")}
                </td>
              </tr>
              <tr>
                <td style="padding:10px;font-weight:600">Observation</td>
                <td style="padding:10px">${prospect.observation || "—"}</td>
              </tr>
            </table>
            <p style="margin-top:20px;color:#64748b;font-size:13px">
              Connectez-vous sur 
              <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a>
            </p>
          </div>
        `,
      });

      // 3 — Marquer rappelEnvoye = true
      await Prospect.findByIdAndUpdate(prospect._id, { rappelEnvoye: true });

      console.log(
        `[CRON] ✅ Rappel envoyé pour ${prospect.nom} ${prospect.prenom}`,
      );
    }
  } catch (err) {
    console.error("[CRON] ❌ Erreur:", err.message);
  }
};

module.exports = { getRappels, marquerLu, marquerTousLus, sendRappelsJob };
