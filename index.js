const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const cors=require("cors");
const { mongoURI } = require("./keys");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const communityRoutes = require("./routes/communityRoutes"); // ✅ Added community routes


const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

require("./models/User");
require("./models/tasks");
require("./models/userTasks");
require("./models/communityTasks"); 

app.use(authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/community", communityRoutes); 


const PORT = 3001;

const connectionString = process.env.MONGO_URI || mongoURI;
mongoose
  .connect(connectionString)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log("❌ MongoDB connection error:", err));

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected. Trying to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB connection error (event):", err);
});

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});
