const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const {
  createCart,
  addItemToCart,
  getItemsCart,
  updateProductInCart,
  deleteProductInCart,
  checkProductsInCart,
  deleteCart,
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
router.delete("/:userid", async (req, res) => {
  const { userid } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    await getItemsCart(userid);
    await deleteCart(userid);
    res.status(200).json({
      status: 200,
      message: cart,
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});
router.post("/item/:userid/incart", async (req, res) => {
  const { userid } = req.params;
  const { productid } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const cart = await getItemsCart(userid);
    const inCart = await checkProductsInCart(productid, cart?.cartid);
    if (inCart) res.json({ inCart: true });
    res.json({ inCart: false });
  } catch (error) {
    res.status(400);
  }
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
  if (cart) {
    try {
      const data = await addItemToCart(req.body, cart, userid);
      res.status(201).json({
        status: 201,
        message: data,
      });
    } catch (error) {
      res.status(403).json({
        status: 403,
        message: error.message,
      });
    }
  }
});
// Endpoint to create an order from a cart

router.put("/item/:userid", async (req, res) => {
  // Check for authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userid } = req.params;
  try {
    const cart = await createCart(userid);
    const data = await updateProductInCart(req.body, cart, userid);
    res.status(201).json({
      status: 201,
      message: data,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
});

router.delete("/item/:userid", async (req, res) => {
  // Check for authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userid } = req.params;
  try {
    const cart = await createCart(userid);
    const data = await deleteProductInCart(req.body, cart, userid);
    res.status(200).json({ status: 200, message: data });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});
router.post("/:cartid/checkout", async (req, res) => {
  const { userid } = req.body;
  const { cartid } = req.params;
  console.log(cartid);
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  let {
    data: { totalamount },
    error,
  } = await supabase
    .from("cart")
    .select("totalamount")
    .eq("cartid", cartid)
    .eq("status", "Pending")
    .single();
  let { error: error_update } = await supabase
    .from("cart")
    .update({ status: "Done" })
    .eq("cartid", cartid);

  if (error_update) {
    return res.status(500).json({ error: error.message });
  }
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      userid,
      totalamount,
      cartid,
      status: "Pending",
    });

  if (orderError) {
    return res.status(500).json({ error: orderError.message });
  }

  res.json({ message: "Order created successfully", order });
});
module.exports = router;
