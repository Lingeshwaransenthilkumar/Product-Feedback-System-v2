const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
