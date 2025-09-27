const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign(
      { id: newUser._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
  token,
  role: "user",
  userId: newUser._id,
  name: newUser.name
  });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login (checks Admin first, then User)
router.post("/login",protect(),async (req, res) => {
  try {
    const { name, password } = req.body;

    // Check in Admin collection
    let user = await Admin.findOne({ name });
    let role = "admin";

    if (!user) {
      // If not found in Admin, check in User
      user = await User.findOne({ name });
      role = "user";
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role, userId: user._id, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
