// server.js
const express = require("express");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const checkoutRouter = require("./routes/checkoutRouter");
const ordersRouters = require("./routes/ordersRouters");

const app = express();
const port = 4000;
var cors = require("cors");
const supabase = require("./supabaseClient");
app.use(cors());

app.use(express.json());

// Use the product routes
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/statistics", statisticsRoutes);
app.use("/checkout", checkoutRouter);
app.use("/orders", ordersRouters);

app.post("/callback", async (req, res) => {
  const { payment_result, customer_details } = req.body;
  if (payment_result?.response_status) {
    const { data, error } = await supabase
      .from("test")
      .insert([{ name: customer_details.name }])
      .select();
    res.json(data);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
