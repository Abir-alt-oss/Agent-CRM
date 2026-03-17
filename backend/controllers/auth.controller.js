const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Agent = require("../models/Agent");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

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
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Agent CRM" <${process.env.EMAIL_USER}>`,
      to: agent.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <h2>Agent CRM — Réinitialisation</h2>
        <p>Bonjour ${agent.prenom},</p>
        <a href="${resetUrl}" style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expire dans 1 heure.</p>
      `,
    });

    res.json({ message: "Email de réinitialisation envoyé." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur envoi email.", error: err.message });
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
  console.log("createAgent appelé avec :", req.body);
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

    // Envoi email en arrière-plan — ne bloque pas la création
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: `"Agent CRM" <${process.env.EMAIL_USER}>`,
        to: agent.email,
        subject: "Bienvenue sur Agent CRM",
        html: `
          <h2>Bienvenue sur Agent CRM !</h2>
          <p>Bonjour ${agent.prenom},</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Mot de passe :</strong> ${password}</p>
          <p>Connectez-vous sur : <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
          <p>Pensez à changer votre mot de passe après la première connexion.</p>
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
