const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.js"); // Multer setup
const Post = require("../models/Post.js"); // Post schema
const User = require("../models/User.js"); // User schema
const requireToken = require("../middleware/requireToken"); // JWT Middleware
const mongoose = require("mongoose");

// ====================== USER DETAILS ======================

// Get user details
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find user and exclude password field
    const user = await User.findById(userId).select("username");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find posts by this user
    const posts = await Post.find({ author: userId });

    res.status(200).json({ username: user.username, posts });
  } catch (error) {
    console.error("❌ Error fetching user details and posts:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
// ====================== POSTS MANAGEMENT ======================

// Create a new post with media upload
router.post("/create", upload.array("media", 5), async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ message: "Title, content, and author are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(author)) {
      return res.status(400).json({ message: "Invalid author ID" });
    }

    const mediaFiles = req.files.map(file => file.path);

    const newPost = new Post({
      title,
      content,
      author: new mongoose.Types.ObjectId(author),
      media: mediaFiles,
      likes: 0,
      commentCount: 0
    });

    await newPost.save();
    res.status(201).json({ message: "✅ Post created", post: newPost });

  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username email");
    res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Edit a post
router.put("/:postId", requireToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this post" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.updatedAt = Date.now();
    await post.save();

    res.status(200).json({ message: "✅ Post updated", post });
  } catch (error) {
    console.error("❌ Error editing post:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Delete a post
router.delete("/:postId", requireToken, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "✅ Post deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
const Comment = require("../models/comment.js");

// Add a comment to a post
router.post("/:postId/comment", requireToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Extract from JWT

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const newComment = new Comment({
      post: postId,
      author: userId,
      content
    });

    await newComment.save();

    // Update the post's comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    res.status(201).json({ message: "✅ Comment added", comment: newComment });

  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
// Get all comments for a post
router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const comments = await Comment.find({ post: postId }).populate("author", "username");

    res.status(200).json(comments);
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
// Like a comment
router.post("/comments/:commentId/like", requireToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ message: "✅ Comment liked", comment: updatedComment });

  } catch (error) {
    console.error("❌ Error liking comment:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
// Like a post
router.post("/:postId/like", requireToken, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "✅ Post liked", post: updatedPost });

  } catch (error) {
    console.error("❌ Error liking post:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
// Unlike a post
router.post("/:postId/unlike", requireToken, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Ensure likes count does not go below 0
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes > 0) {
      post.likes -= 1;
      await post.save();
    }

    res.status(200).json({ message: "✅ Post unliked", post });

  } catch (error) {
    console.error("❌ Error unliking post:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


module.exports = router;
