const mongoose = require("mongoose");

const userTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  assignedDate: { type: String, required: true }, // "YYYY-MM-DD"
  completed: { type: Boolean, default: false }, // ✅ New field for tracking completion
});

const UserTask = mongoose.model("UserTask", userTaskSchema);
module.exports = UserTask;
