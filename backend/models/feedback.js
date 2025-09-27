const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  userId: String,
  userName: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  text: String,
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});

const feedbackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["Feature", "Bug", "UI"], required: true },
  status: { type: String, enum: ["Open", "Planned", "In Progress", "Done"], default: "Open" },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }], 
  comments: [commentSchema],
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
