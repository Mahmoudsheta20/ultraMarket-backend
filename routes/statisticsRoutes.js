const express = require("express");
const { getBestDeals } = require("../services/apiProducts");
const router = express.Router();

router.get("/bestdeals", async (req, res) => {
  const products = await getBestDeals();
  res.json(products);
});

module.exports = router;
