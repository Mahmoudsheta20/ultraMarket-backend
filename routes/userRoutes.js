// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Get all products
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
