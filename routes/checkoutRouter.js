const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { createOrder } = require("../services/apiCheckout");
const stripe = require("stripe")(
  "sk_test_51LpszqFsXNFAupQMcLBtJa9g2nayhasGIOfZYOE85s6o3XdB1EGeNLx4fEdwP0DhDVJ8JKMlCtS0WYH0Yf4Lre1Q00g0iBqCtN"
);
const YOUR_DOMAIN = "http://localhost:5173";

router.post("/create-checkout-session", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { cartId, userId } = req.body;
  try {
    // First, create a product
    const products = [
      {
        name: "Gold Plan",
        amount: 666600,
        currency: "usd",
        quantity: 1,
        images: [
          "https://ltfpjeeclvrtomahvqyd.supabase.co/storage/v1/object/public/product/image_4.png?t=2024-07-31T19%3A01%3A17.457Z",
        ],
      },
      {
        name: "Silver Plan",
        amount: 333300,
        currency: "usd",
        quantity: 2,
        images: [
          "https://ltfpjeeclvrtomahvqyd.supabase.co/storage/v1/object/public/product/image_4.png?t=2024-07-31T19%3A01%3A17.457Z",
        ],
      },
      // Add more products as needed
    ];

    // Create line items for each product
    const lineItems = await Promise.all(
      products.map(async (product) => {
        const stripeProduct = await stripe.products.create({
          name: product.name,
          images: product.images,
        });

        const price = await stripe.prices.create({
          unit_amount: product.amount,
          currency: product.currency,
          product: stripeProduct.id,
        });

        return {
          price: price.id,
          quantity: product.quantity,
        };
      })
    );

    // Create the checkout session with the created price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
      metadata: {
        cartId,
        userId,
      },
    });
    console.log(session);
    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while creating the checkout session");
  }
});

router.get("/session-status", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  if (session.status === "complete") {
    try {
      const order = await createOrder(
        session.metadata.cartId,
        session.metadata.userId
      );
      res.send({
        order,
      });
    } catch (err) {
      res.send(err);
    }
  }
});
module.exports = router;
