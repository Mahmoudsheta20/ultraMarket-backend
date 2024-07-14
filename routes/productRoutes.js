// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { calculateDiscountedPrice } = require("../utils/handelPrice");
const { convertStringToArray } = require("../utils/utils");

// Get all products
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("product")
    .select("productid, name, discount, price");
  if (error) {
    return res.status(500).json({ error: error.message });
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
  const { data: product, error } = await supabase
    .from("product")
    .select("*")
    .eq("productid", id)
    .single();

  const discountedPrice = calculateDiscountedPrice(
    Number(product.price),
    Number(product.discount)
  );
  const { data: product_image, error: product_image_error } = await supabase
    .from("product_image")
    .select("imageurl")
    .eq("productid", product.productid);

  let { data: product_specification } = await supabase
    .from("product_specification")
    .select("specificationid, value")
    .eq("productid", product.productid);
  const specifications = await Promise.all(
    product_specification.map(async (specification) => {
      let { data: specifications, error } = await supabase
        .from("specification")
        .select("name")
        .eq("specificationid", specification.specificationid)
        .single();
      return { name: specifications.name, value: specification.value };
    })
  );

  if (error || product_image_error) {
    return res.status(500).json({ error: error.message, product_image_error });
  }
  const highlights = convertStringToArray(product.highlights);
  res.json({
    ...product,
    discountedPrice,
    product_image,
    highlights,
    specifications,
  });
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
