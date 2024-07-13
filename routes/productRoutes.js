// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { calculateDiscountedPrice } = require("../utils/handelPrice");

// Get all products
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("product").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  async function getImage(product) {
    const { data: product_image, error } = await supabase
      .from("product_image")
      .select("imageurl")
      .eq("productID", product.productid);
    if (error) {
      return [];
    }
    return product_image;
  }

  const productsWithDiscount = await Promise.all(
    data.map(async (product) => {
      const discountedPrice = calculateDiscountedPrice(
        Number(product.price),
        Number(product.discount)
      );
      const { data: product_image, error } = await supabase
        .from("product_image")
        .select("imageurl")
        .eq("productid", product.productid)
        .eq("isprimary", true);

      return {
        ...product,
        discountedPrice,
        product_image,
      };
    })
  );

  res.json(productsWithDiscount);
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("Product")
    .select("*")
    .eq("ProductID", id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Create a new product
router.post("/", async (req, res) => {
  const { name, description, price, sku } = req.body;

  const { data, error } = await supabase
    .from("Product")
    .insert([{ name, description, price, sku }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// Update a product by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, sku } = req.body;

  const { data, error } = await supabase
    .from("Product")
    .update({ name, description, price, sku })
    .eq("ProductID", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Delete a product by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("Product")
    .delete()
    .eq("ProductID", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

module.exports = router;
