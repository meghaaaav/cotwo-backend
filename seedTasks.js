const mongoose = require("mongoose");
const Task = require("./models/tasks");

require("dotenv").config(); // Load environment variables

const connectionString = process.env.MONGO_URI || "mongodb+srv://meghxmohan:achuachu@cluster0.o0fdz.mongodb.net/test?retryWrites=true&w=majority&tls=true";

mongoose.connect(connectionString)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const tasks = [
  { description: "Turn off lights when not in use" },
  { description: "Use a reusable water bottle instead of plastic" },
  { description: "Take a 5-minute shower instead of 10" },
  { description: "Unplug electronics when not in use" },
  { description: "Use public transport instead of a personal vehicle" },
  { description: "Eat a plant-based meal today" },
  { description: "Carry a cloth bag for shopping" },
  { description: "Switch to LED bulbs" },
  { description: "Recycle paper and plastic waste" },
  { description: "Reduce screen brightness to save energy" },
];

async function seedTasks() {
  try {
    const existingTasks = await Task.countDocuments();
    if (existingTasks > 0) {
      console.log("⚠️ Tasks already exist. Skipping insertion.");
      return;
    }

    await Task.insertMany(tasks);
    console.log("✅ Tasks inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting tasks:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedTasks();
