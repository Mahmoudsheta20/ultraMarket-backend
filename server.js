// server.js
const express = require("express");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

const app = express();
const port = 3000;

app.use(express.json());

// Use the product routes
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/statistics", statisticsRoutes);

app.use("/test", (req, res) => {
  const accountSid = "ACfa1535405c9414b41892cfd974c8d6d2";
  const authToken = "dc1a7fa843ce6d7e3ed4c538f394b03d";
  const client = require("twilio")(accountSid, authToken);

  client.verify.v2
    .services("VAa6984c8ca9e66ade1d1496f862abc778")
    .verifications.create({ to: "+2001050076550", channel: "sms" })
    .then((verification) => console.log());
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
