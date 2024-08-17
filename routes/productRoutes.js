// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { calculateDiscountedPrice } = require("../utils/handelPrice");
const { convertStringToArray } = require("../utils/utils");
const {
  getBestDeals,
  getProductDeatils,
  getReview,
} = require("../services/apiProducts");

// Get all products
router.get("/all", async (req, res) => {
  const { data, error } = await supabase
    .from("product")
    .select("productid, name, discount, price");

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
router.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  const product = await getProductDeatils(id);
  res.json(product);
});
router.get("/product/image/:id", async (req, res) => {
  const { id } = req.params;
  const { data: product_image, error } = await supabase
    .from("product_image")
    .select("imageurl")
    .eq("productid", id)
    .eq("isprimary", true);
  res.json(product_image);
});

router.get("/reviews/:productId", async (req, res) => {
  const { productId } = req.params;
  const review = await getReview(productId);
  const ratingAverage = review.reduce((acc, cur) => acc + cur.rating, 0);
  res.json({ review, ratingAverage });
});

router.get("/bestdeals", async (req, res) => {
  const products = await getBestDeals();
  res.json(products);
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

router.get("/search", async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query parameter is missing" });
  }

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Query the products table with pagination
  const { data, error, count } = await supabase
    .from("product")
    .select("*", { count: "exact" }) // Get total count for pagination
    .ilike("name", `%${q}%`)
    .range(offset, offset + limit - 1); // Perform pagination

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({
    data, // The paginated data
    totalCount: count, // Total number of matching records
    currentPage: page, // Current page number
    totalPages: Math.ceil(count / limit), // Total pages based on the limit
  });
});

module.exports = router;
