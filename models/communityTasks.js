const mongoose = require("mongoose");

const communityTaskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  milestoneType: { type: String, required: true }, 
  milestoneThreshold: { type: Number, required: true }, 
});

const CommunityTask = mongoose.model("CommunityTask", communityTaskSchema);
module.exports = CommunityTask;
