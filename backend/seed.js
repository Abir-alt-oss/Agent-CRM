require("dotenv").config();
const mongoose = require("mongoose");
const Agent = require("./models/Agent");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await Agent.findOneAndUpdate(
    { role: "admin" },
    {
      email: "ouelhaziabir.92@gmail.com",
      actif: true,
    },
    { new: true },
  );

  if (admin) {
    console.log("✅ Admin mis à jour :", admin.email);
  } else {
    console.log("❌ Admin introuvable");
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed();
