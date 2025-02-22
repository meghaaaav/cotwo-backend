const mongoose = require("mongoose");

const communityProgressSchema = new mongoose.Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD"
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityTask", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who completed the goal
});

const CommunityProgress = mongoose.model("CommunityProgress", communityProgressSchema);
module.exports = CommunityProgress;
