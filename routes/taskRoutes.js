const express = require("express");
const router = express.Router();
const Task = require("../models/tasks");
const UserTask = require("../models/userTasks");

// 🟢 GET today's random task for a user
router.get("/daily", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Check if user already has a task for today
    let userTask = await UserTask.findOne({ userId, date: today }).populate("taskId");

    if (!userTask) {
      // Get list of all tasks
      const allTasks = await Task.find();
      if (allTasks.length === 0) return res.status(500).json({ error: "No tasks available" });

      // Find tasks the user has already received
      const assignedTasks = await UserTask.find({ userId }).select("taskId");
      const assignedTaskIds = assignedTasks.map((t) => t.taskId.toString());

      // Filter unassigned tasks
      let availableTasks = allTasks.filter((task) => !assignedTaskIds.includes(task._id.toString()));

      // If all tasks have been used, reset (optional)
      if (availableTasks.length === 0) availableTasks = allTasks;

      // Select a random task from available ones
      const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];

      // Assign task to user
      userTask = await UserTask.create({ userId, taskId: randomTask._id, date: today });
      userTask = await userTask.populate("taskId");
    }

    res.json(userTask.taskId);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch daily task" });
  }
});
router.post("/complete", async (req, res) => {
    try {
      const { userId, taskId } = req.body;
      if (!userId || !taskId) return res.status(400).json({ error: "User ID and Task ID are required" });
  
      const userTask = await UserTask.findOne({ userId, taskId });
  
      if (!userTask) return res.status(400).json({ error: "Task not found for this user" });
  
      if (userTask.completed) return res.status(400).json({ error: "Task already completed" });
  
      userTask.completed = true;
      await userTask.save();
  
      res.json({ message: "Task marked as complete!", taskId });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark task as complete" });
    }
  });
  
module.exports = router;
