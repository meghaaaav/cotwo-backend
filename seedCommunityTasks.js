const mongoose = require("mongoose");
const dotenv = require("dotenv");
const CommunityTask = require("./models/communityTasks");

dotenv.config();
const mongoURI = process.env.MONGO_URI ||"mongodb+srv://meghxmohan:achuachu@cluster0.o0fdz.mongodb.net/test?retryWrites=true&w=majority&tls=true";

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    await CommunityTask.deleteMany(); // Clear old tasks

    const tasks = [
      { description: "Avoid plastic bags for a day", milestoneType: "plastic_waste_reduced", milestoneThreshold: 50 },
      { description: "Walk or cycle instead of driving", milestoneType: "fossil_fuel_reduced", milestoneThreshold: 100 },
      { description: "Plant a tree", milestoneType: "trees_saved", milestoneThreshold: 20 },
    ];

    await CommunityTask.insertMany(tasks);
    console.log("🌱 Community tasks seeded!");
    mongoose.connection.close();
  })
  .catch((err) => console.log("❌ Error seeding data:", err));
