const jwt = require("jsonwebtoken");
const Agent = require("../models/Agent");

// Protéger les routes — vérifier le token JWT
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Non autorisé. Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const agent = await Agent.findById(decoded.id);
    if (!agent) {
      return res.status(401).json({ message: "Agent introuvable." });
    }

    // Vérifier si le compte est actif
    if (!agent.actif) {
      return res
        .status(403)
        .json({ message: "Compte désactivé. Contactez l'administrateur." });
    }

    req.agent = agent;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

// Vérifier si l'agent est admin
const adminOnly = (req, res, next) => {
  if (req.agent.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé à l'admin." });
  }
  next();
};

module.exports = { protect, adminOnly };
