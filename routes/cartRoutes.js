const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const {
  createCart,
  addItemToCart,
  getItemsCart,
  updateProductInCart,
  deleteProductInCart,
} = require("../services/apiCart");
const { jwtDecode } = require("jwt-decode");
router.get("/:userid", async (req, res) => {
  const { userid } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const cart = await getItemsCart(userid);
  if (!cart) res.status(400).json({ message: "this user does not have cart" });
  res.json(cart);
});
// Endpoint to add an item to a cart
router.post("/item/:userid", async (req, res) => {
  // Check for authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userid } = req.params;
  const cart = await createCart(userid);
  const data = await addItemToCart(req.body, cart, userid);
  res.status(201).json(data);
});
// Endpoint to create an order from a cart
router.post("/cart/:cart_id/checkout", async (req, res) => {
  const { user_id } = req.body;
  const { cart_id } = req.params;

  const { data: cartItems, error: cartItemsError } = await supabase
    .from("cart_item")
    .select("*")
    .eq("cart_id", cart_id);

  if (cartItemsError) {
    return res.status(500).json({ error: cartItemsError.message });
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id,
      total,
      status: "Pending",
    })
    .single();

  if (orderError) {
    return res.status(500).json({ error: orderError.message });
  }

  const orderItemsData = cartItems.map((item) => ({
    order_id: order.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    discount: 0, // Add any discount logic if needed
  }));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItemsData);

  if (orderItemsError) {
    return res.status(500).json({ error: orderItemsError.message });
  }

  await supabase.from("cart_item").delete().eq("cart_id", cart_id);

  res.json({ message: "Order created successfully", order });
});

router.put("/item/:userid", async (req, res) => {
  // Check for authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userid } = req.params;
  const cart = await createCart(userid);
  const data = await updateProductInCart(req.body, cart, userid);
  res.status(201).json(data);
});
router.delete("/item/:userid", async (req, res) => {
  // Check for authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userid } = req.params;
  const cart = await createCart(userid);
  const data = await deleteProductInCart(req.body, cart);
  res.status(201).json(data);
});

module.exports = router;
