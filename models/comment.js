const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likesCount: { type: Number, default: 0 }
});

module.exports = mongoose.model("Comment", CommentSchema);
