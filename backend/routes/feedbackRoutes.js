// routes/feedbackRoutes.js
const express = require("express");
const Feedback = require("../models/Feedback");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");

// GET all feedbacks
router.get("/", async (req, res) => {
  const feedbacks = await Feedback.find();
  res.json(feedbacks);
});

// GET single feedback
router.get("/:id", async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) return res.status(404).json({ message: "Not found" });
  res.json(feedback);
});

// POST new feedback
router.post("/", async (req, res) => {
  const { title, description, category } = req.body;
  const feedback = new Feedback({ title, description, category });
  await feedback.save();
  res.status(201).json({ message: "Feedback submitted", feedback });
});


// PATCH /api/feedbacks/:id/upvote
router.patch("/:id/upvote", async (req, res) => {
  try {
    const { userId } = req.body; // send from frontend
    if (!userId) return res.status(400).json({ message: "UserId required" });

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    if (feedback.upvotedBy.includes(userId)) {
      // Already liked → unlike
      feedback.upvotes -= 1;
      feedback.upvotedBy = feedback.upvotedBy.filter(u => u !== userId);
    } else {
      // Like
      feedback.upvotes += 1;
      feedback.upvotedBy.push(userId);
    }

    await feedback.save();
    res.json(feedback);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH status (Admin only - here we skip auth for now)
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json({ message: "Status updated", feedback });
});

// comments routes
// POST /api/feedbacks/:id/comment → Add a new comment
router.post("/:id/comment", async (req, res) => {
  try {
    const { userName, text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      userName, // ✅ use userName instead of user
      text,
      replies: [],
    };

    feedback.comments.push(newComment);
    await feedback.save();

    res.json(feedback);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/feedbacks/:id/comment/:commentId/reply → Add reply to a comment
router.post("/:id/comment/:commentId/reply", async (req, res) => {
  try {
    const { userName, text } = req.body;
    if (!text) return res.status(400).json({ message: "Reply text required" });

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    const comment = feedback.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const newReply = {
      _id: new mongoose.Types.ObjectId(),
      userName, // ✅ use userName instead of user
      text,
    };

    comment.replies.push(newReply);
    await feedback.save();

    res.json(feedback);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
