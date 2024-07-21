// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Get all products
router.post("/login", async (req, res) => {
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
router.post("/signup", async (req, res) => {
  const { email, password, fullName, avatar } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: "",
        phone: "123456789",
      },
    },
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
