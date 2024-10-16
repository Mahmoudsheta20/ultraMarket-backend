const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { createOrder, getProdutCart } = require("../services/apiCheckout");
const stripe = require("stripe")(
  "sk_test_51LpszqFsXNFAupQMcLBtJa9g2nayhasGIOfZYOE85s6o3XdB1EGeNLx4fEdwP0DhDVJ8JKMlCtS0WYH0Yf4Lre1Q00g0iBqCtN"
);
const YOUR_DOMAIN = "https://apiultramarket.vercel.app";

router.post("/create-checkout-session", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { cartId, userId } = req.body;

  try {
    const productsCard = await getProdutCart(cartId);
    console.log(productsCard);

    // First, create a product
    const products = productsCard?.products?.map((product) => {
      // Calculate the discounted price
      const discountedPrice = product.price * (1 - product.discount / 100);

      return {
        name: product.name,
        amount: Math.round(discountedPrice * 100), // Convert to cents
        currency: "EGP",
        quantity: product.quantity,
        images: [
          `https://ltfpjeeclvrtomahvqyd.supabase.co/storage/v1/object/public/${product.imageurl}`, // Adjust the base URL accordingly
        ],
      };
    });

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
      customer_email: "shetamahmoud463@gmail.com",

      mode: "payment",
      success_url: `${YOUR_DOMAIN}/checkout/session-status?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/checkout/cancel`,
      metadata: {
        cartId: productsCard?.cartid,
        userId: productsCard?.userid,
      },
    });
    res.redirect;

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while creating the checkout session");
  }
});

router.get("/session-status", async (req, res) => {
  // const token = req.headers.authorization?.split(" ")[1];
  // if (!token) {
  //   return res.status(401).json({ error: "Unauthorized" });
  // }
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  if (session.status === "complete") {
    // return res.json({
    //   success: true,
    //   message: "Payment successful!",
    // });

    const userAgent = req.headers["user-agent"] || "";

    if (/iPhone|iPad|Android/i.test(userAgent)) {
      // Mobile: Redirect to Flutter app using deep link
      const flutterDeepLink = `ultra_ecommerce://order?oderId=652546`;
      return res.redirect(flutterDeepLink);
    } else {
      // Web: Redirect to web order page
      const webOrderUrl = `https://yourdomain.com/order`;
      return res.redirect(webOrderUrl);
    }
  }
});

router.get("/cancel", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  if (/iPhone|iPad|Android/i.test(userAgent)) {
    // Mobile: Redirect to Flutter app using deep link
    const flutterDeepLink = `ultra_ecommerce://cancel`;
    return res.redirect(flutterDeepLink);
  } else {
    // Web: Redirect to web order page
    const webOrderUrl = `${YOUR_DOMAIN}/cancle`;
    return res.redirect(webOrderUrl);
  }
});
module.exports = router;
