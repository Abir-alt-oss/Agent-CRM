const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Agent = require("./models/Agent");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Agent.deleteMany({ role: "admin" });
    await Agent.create({
      nom: "Ouelhazi",
      prenom: "Abir",
      email: "ouelhaziabir.92@gmail.com",
      password: "Aboura92",
      role: "admin",
    });
    console.log("✅ Admin créé !");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    process.exit(1);
  }
};

createAdmin();
