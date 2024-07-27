const supabase = require("../supabaseClient");
const { calculateDiscountedPrice } = require("../utils/handelPrice");

async function createCart(userid) {
  // check if user have open cart
  let { data: cart, error } = await supabase
    .from("cart")
    .select("cartid")
    .eq("userid", userid)
    .eq("status", "Pending")
    .single();

  if (cart) return cart.cartid;
  const { data: newCart, error: error_cart } = await supabase
    .from("cart")
    .insert({ userid, status: "Pending" })
    .select()
    .single();

  if (newCart) return newCart.cartid;
  return null;
}

async function addItemToCart(body, cartid) {
  const { productid, quantity, userid } = body;
  const isInCart = await checkProductsInCart(productid, cartid);

  if (!isInCart) {
    try {
      const { data, error } = await supabase
        .from("cart_item")
        .insert([{ cartid, productid, quantity }])
        .select();
      return data;
    } catch (error) {
      if (error) return error.message;
    }
  }
}

async function getItemsCart(userid) {
  let { data: cart, error } = await supabase
    .from("cart")
    .select("cartid")
    .eq("userid", userid)
    .eq("status", "Pending")
    .single();
  if (cart?.cartid) {
    const { data: cartItems, error: cartItemsError } = await supabase
      .from("cart_item")
      .select(
        `cartid,quantity
        ,
        products:productid (productid ,name, price, discount)
      `
      )
      .eq("cartid", cart.cartid);

    if (cartItems.length > 0) {
      const mutationProduct = await Promise.all(
        cartItems.map(async (items) => {
          const { data: product_image, error } = await supabase
            .from("product_image")
            .select("imageurl")
            .eq("productid", items.products.productid)
            .eq("isprimary", true)
            .single();
          return {
            ...items,

            imageurl: product_image.imageurl,
          };
        })
      );
      return mutationProduct;
    }
  }
}

const getProductDeatils = async (id) => {
  const { data: product, error } = await supabase
    .from("product")
    .select("*")
    .eq("productid", id);

  const discountedPrice = calculateDiscountedPrice(
    Number(product?.price),
    Number(product?.discount)
  );
  const { data: product_image, error: product_image_error } = await supabase
    .from("product_image")
    .select("imageurl")
    .eq("productid", id)
    .eq("isprimary", true);

  return {
    ...product,
    discountedPrice,
    product_image,
  };
};

async function checkProductsInCart(productid, cartid) {
  let { data: cart_item, error } = await supabase
    .from("cart_item")
    .select("cartitemid")
    .eq("cartid", cartid)
    .eq("productid", productid)
    .single();
  return cart_item;
}
module.exports = { createCart, addItemToCart, getItemsCart };
