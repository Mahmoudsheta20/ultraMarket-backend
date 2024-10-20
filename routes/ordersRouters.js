const express = require("express");
const { getOrderById } = require("../services/apiOrders");
const router = express.Router();

router.get("/:orderId", async (req, res) => {
  const order = await getOrderById(41);
  res.send(order);
});

module.exports = router;
