// server.js
const express = require("express");
const productRoutes = require("./routes/productRoutes");

const app = express();
const port = 3000;

app.use(express.json());

// Use the product routes
app.use("/products", productRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
