const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const Agent = require("../models/Agent");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: "Agent CRM <onboarding@resend.dev>",
    to: [process.env.ADMIN_EMAIL],
    subject: `[Pour: ${to}] ${subject}`,
    html,
  });
  if (error) throw new Error(error.message);
  return data;
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis." });
    const agent = await Agent.findOne({ email }).select("+password");
    if (!agent || !(await agent.comparePassword(password)))
      return res.status(401).json({ message: "Identifiants incorrects." });
    const token = generateToken(agent._id);
    res.json({ token, agent });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.agent);
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  console.log("forgotPassword appelé avec :", req.body);
  try {
    const { email } = req.body;
    const agent = await Agent.findOne({ email });
    if (!agent)
      return res.status(404).json({ message: "Aucun compte avec cet email." });

    const token = crypto.randomBytes(32).toString("hex");
    agent.resetToken = token;
    agent.resetTokenExpiry = Date.now() + 3600000;
    await agent.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log("Envoi email à :", agent.email);

    try {
      await sendEmail({
        to: agent.email,
        subject: "Réinitialisation de votre mot de passe — Agent CRM",
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="UTF-8" /></head>
          <body style="margin:0;padding:0;background:#0d0f14;font-family:Arial,sans-serif;">
            <div style="background:linear-gradient(135deg,#f97316,#3b82f6);padding:40px 20px;text-align:center;">
              <div style="font-size:48px;">🛡️</div>
              <h1 style="color:white;margin:10px 0 4px;font-size:28px;">Agent CRM</h1>
              <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">Plateforme de gestion assurance</p>
            </div>
            <div style="background:#151820;padding:40px 32px;">
              <h2 style="color:#f97316;font-size:20px;margin-bottom:8px;">Réinitialisation de mot de passe 🔑</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:28px;">
                Bonjour <b style="color:#e2e8f0;">${agent.prenom} ${agent.nom}</b>,<br/>
                Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe.
              </p>
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${resetUrl}" style="background:linear-gradient(135deg,#f97316,#fb923c);color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                  🔑 Réinitialiser mon mot de passe
                </a>
              </div>
              <div style="background:#92400e20;border:1px solid #92400e;border-radius:8px;padding:14px 18px;">
                <p style="color:#fbbf24;font-size:13px;margin:0;">⏰ Ce lien expire dans 1 heure.</p>
              </div>
            </div>
            <div style="background:#0d0f14;padding:24px 32px;text-align:center;border-top:1px solid #1e2230;">
              <p style="color:#475569;font-size:12px;margin:0;">Envoyé automatiquement par <b style="color:#f97316;">Agent CRM</b>.</p>
            </div>
          </body></html>
        `,
      });
      console.log("✅ Email envoyé !");
    } catch (emailErr) {
      console.error("❌ ERREUR EMAIL:", emailErr.message);
    }

    res.json({ message: "Email de réinitialisation envoyé." });
  } catch (err) {
    console.error("ERREUR forgotPassword:", err.message);
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const agent = await Agent.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!agent)
      return res.status(400).json({ message: "Token invalide ou expiré." });
    agent.password = password;
    agent.resetToken = null;
    agent.resetTokenExpiry = null;
    await agent.save();
    res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/auth/create-agent
const createAgent = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;
    const exists = await Agent.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Cet email est déjà utilisé." });

    const agent = await Agent.create({
      nom,
      prenom,
      email,
      password,
      role: "agent",
    });

    try {
      await sendEmail({
        to: agent.email,
        subject: "Bienvenue sur Agent CRM",
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="UTF-8" /></head>
          <body style="margin:0;padding:0;background:#0d0f14;font-family:Arial,sans-serif;">
            <div style="background:linear-gradient(135deg,#f97316,#3b82f6);padding:40px 20px;text-align:center;">
              <div style="font-size:48px;">🛡️</div>
              <h1 style="color:white;margin:10px 0 4px;font-size:28px;">Agent CRM</h1>
              <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">Plateforme de gestion assurance</p>
            </div>
            <div style="background:#151820;padding:40px 32px;">
              <h2 style="color:#f97316;font-size:20px;margin-bottom:8px;">Bienvenue ${agent.prenom} ${agent.nom} 👋</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:28px;">Votre compte a été créé sur la plateforme Agent CRM.</p>
              <div style="background:#1e2230;border-radius:10px;padding:24px;margin-bottom:28px;border-left:4px solid #f97316;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="color:#64748b;font-size:12px;padding:8px 0;text-transform:uppercase;">Email</td>
                    <td style="color:#e2e8f0;font-size:14px;font-weight:600;padding:8px 0;">${email}</td>
                  </tr>
                  <tr>
                    <td style="color:#64748b;font-size:12px;padding:8px 0;text-transform:uppercase;border-top:1px solid #2a3045;">Mot de passe</td>
                    <td style="color:#f97316;font-size:14px;font-weight:700;padding:8px 0;border-top:1px solid #2a3045;font-family:monospace;">${password}</td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${process.env.CLIENT_URL}" style="background:linear-gradient(135deg,#f97316,#fb923c);color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                  🚀 Se connecter maintenant
                </a>
              </div>
              <div style="background:#92400e20;border:1px solid #92400e;border-radius:8px;padding:14px 18px;">
                <p style="color:#fbbf24;font-size:13px;margin:0;">⚠️ Changez votre mot de passe après la première connexion.</p>
              </div>
            </div>
            <div style="background:#0d0f14;padding:24px 32px;text-align:center;border-top:1px solid #1e2230;">
              <p style="color:#475569;font-size:12px;margin:0;">Envoyé automatiquement par <b style="color:#f97316;">Agent CRM</b>.</p>
            </div>
          </body></html>
        `,
      });
    } catch (emailErr) {
      console.warn("Email non envoyé :", emailErr.message);
    }

    res.status(201).json({ message: "Agent créé avec succès.", agent });
  } catch (err) {
    res.status(500).json({ message: "Erreur création.", error: err.message });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { ancienPassword, nouveauPassword } = req.body;
    if (!ancienPassword || !nouveauPassword)
      return res.status(400).json({ message: "Tous les champs sont requis." });
    const agent = await Agent.findById(req.agent._id).select("+password");
    const isMatch = await agent.comparePassword(ancienPassword);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Ancien mot de passe incorrect." });
    agent.password = nouveauPassword;
    await agent.save();
    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/auth/agents
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ role: "agent" }).sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/auth/agents/:id
const updateAgent = async (req, res) => {
  try {
    const { nom, prenom, email } = req.body;
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { nom, prenom, email },
      { new: true, runValidators: true },
    );
    if (!agent) return res.status(404).json({ message: "Agent introuvable." });

    try {
      await sendEmail({
        to: agent.email,
        subject: "Vos informations ont été mises à jour — Agent CRM",
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="UTF-8" /></head>
          <body style="margin:0;padding:0;background:#0d0f14;font-family:Arial,sans-serif;">
            <div style="background:linear-gradient(135deg,#f97316,#3b82f6);padding:40px 20px;text-align:center;">
              <div style="font-size:48px;">🛡️</div>
              <h1 style="color:white;margin:10px 0 4px;font-size:28px;">Agent CRM</h1>
            </div>
            <div style="background:#151820;padding:40px 32px;">
              <h2 style="color:#f97316;font-size:20px;margin-bottom:8px;">Informations mises à jour ✅</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:28px;">
                Bonjour <b style="color:#e2e8f0;">${agent.prenom} ${agent.nom}</b>,<br/>
                Votre compte a été mis à jour par l'administrateur.
              </p>
              <div style="background:#1e2230;border-radius:10px;padding:24px;margin-bottom:28px;border-left:4px solid #f97316;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="color:#64748b;font-size:12px;padding:8px 0;text-transform:uppercase;">Email</td>
                    <td style="color:#f97316;font-size:14px;font-weight:700;padding:8px 0;">${agent.email}</td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;">
                <a href="${process.env.CLIENT_URL}" style="background:linear-gradient(135deg,#f97316,#fb923c);color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                  🚀 Se connecter
                </a>
              </div>
            </div>
            <div style="background:#0d0f14;padding:24px 32px;text-align:center;border-top:1px solid #1e2230;">
              <p style="color:#475569;font-size:12px;margin:0;">Envoyé automatiquement par <b style="color:#f97316;">Agent CRM</b>.</p>
            </div>
          </body></html>
        `,
      });
    } catch (emailErr) {
      console.warn("Email non envoyé :", emailErr.message);
    }

    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// DELETE /api/auth/agents/:id
const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent introuvable." });
    res.json({ message: "Agent supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/auth/agents/:id/toggle
const toggleAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent introuvable." });
    agent.actif = !agent.actif;
    await agent.save();
    res.json({
      message: `Agent ${agent.actif ? "activé" : "désactivé"}.`,
      agent,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  createAgent,
  changePassword,
  getAllAgents,
  updateAgent,
  deleteAgent,
  toggleAgent,
};
