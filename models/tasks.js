const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  description: { type: String, required: true },
});

module.exports = mongoose.model("Task", TaskSchema);
    