// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { createAddress, getAddressById } = require("../services/apiUser");

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
  const { session } = data;
  const { access_token, expires_in, expires_at, refresh_token } = session;
  const { id, email: useEmail } = session.user;
  const { avatar, fullName, phone } = session.user.user_metadata;
  res.json({
    id,
    useEmail,
    avatar,
    fullName,
    phone,
    expires_in,
    expires_at,
    refresh_token,
    access_token,
  });
});
router.post("/signup", async (req, res) => {
  const { email, password, fullName, avatar, phone } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar,
        phone,
      },
    },
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.post("/add-address", async (req, res) => {
  const { userId, city, street, lat, lon } = req.body;
  try {
    const response = await createAddress({ userId, city, street, lat, lon });

    return res.send("The Address Has Added");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/address/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const address = await getAddressById(userId);
    return res.json({ address });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
