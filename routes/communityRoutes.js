const express = require("express");
const router = express.Router();
const CommunityTask = require("../models/communityTasks");
const CommunityProgress = require("../models/communityProgress");

router.get("/daily", async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      let communityProgress = await CommunityProgress.findOne({ date: today }).populate("taskId");
  
      if (!communityProgress) {
        const allTasks = await CommunityTask.find();
        if (allTasks.length === 0) return res.status(500).json({ error: "No community tasks available" });
  
        const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
        communityProgress = await CommunityProgress.create({
          date: today,
          taskId: randomTask._id,
          participants: [],
        });
  
        communityProgress = await communityProgress.populate("taskId");
      }
  
      res.json(communityProgress.taskId);
    } catch (error) {
      console.error("❌ Error fetching daily task:", error); // Debugging error in console
      res.status(500).json({ error: error.message }); // Send actual error message
    }
  });
  
// 🟢 POST: Mark community task as completed by a user
router.post("/complete", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "User ID is required" });
  
      const today = new Date().toISOString().split("T")[0];
      let communityProgress = await CommunityProgress.findOne({ date: today });
  
      if (!communityProgress) return res.status(400).json({ error: "No community task found for today" });
  
      if (!communityProgress.participants.includes(userId)) {
        communityProgress.participants.push(userId);
        await communityProgress.save();
      }
  
      res.json({ message: "Community task completed!", totalParticipants: communityProgress.participants.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete community task" });
    }
  });
// 🟢 GET milestone progress
router.get("/milestone", async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
  
      const communityProgress = await CommunityProgress.findOne({ date: today }).populate("taskId");
      if (!communityProgress) return res.status(400).json({ error: "No community task found for today" });
  
      const { participants, taskId } = communityProgress;
      const { milestoneThreshold, milestoneType } = taskId;
  
      // Calculate milestone impact
      const milestonesReached = Math.floor(participants.length / milestoneThreshold);
      const nextMilestone = milestoneThreshold * (milestonesReached + 1);
      const remaining = nextMilestone - participants.length;
  
      // Generate dynamic milestone message
      let message = `🚀 So far, we’ve contributed ${milestonesReached} ${milestoneType.replace("_", " ")}!`;
      if (remaining > 0) message += ` Only ${remaining} more to reach the next milestone!`;
  
      res.json({ message, totalParticipants: participants.length, milestonesReached });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch milestone progress" });
    }
  });
    
module.exports = router;
