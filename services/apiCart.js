const supabase = require("../supabaseClient");

async function createCart(userid) {
  // check if user have open cart
  let { data: cart, error } = await supabase
    .from("cart")
    .select("cartid")
    .eq("userid", userid)
    .eq("status", "Pending")
    .single();
  console.log(cart);
  if (cart) return cart.cartid;
  const { newCart, error: error_cart } = await supabase
    .from("cart")
    .insert({ userid, status: "Pending" })
    .single();
  console.log(error_cart);
  console.log(newCart);
  return newCart;
}

async function addItemToCart(body) {
  const { productid, quantity, userid } = body;
  const cart_id = await createCart(userid);
  if (cart_id) {
    const { data, error } = await supabase
      .from("cart_item")
      .insert({ cartid: cart_id, productid, quantity })
      .single();
  }
}

module.exports = { createCart, addItemToCart };
