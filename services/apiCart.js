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

async function addItemToCart(body, cartid, userid) {
  const { productid, quantity } = body;
  const isInCart = await checkProductsInCart(productid, cartid);

  if (!isInCart) {
    try {
      const { data, error } = await supabase
        .from("cart_item")
        .insert([{ cartid, productid, quantity }])
        .select();
      await reduceTotalamount(userid);
      if (update) return data;
    } catch (error) {
      if (error) return error.message;
    } finally {
    }
  }
}

async function getItemsCart(userid) {
  let { data: cart, error } = await supabase
    .from("cart")
    .select("cartid,totalamount")
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
            ...items.products,
            imageurl: product_image.imageurl,
            quantity: items.quantity,
          };
        })
      );

      const totalamountWithOutDiscount = cartItems.reduce(
        (acc, cur) => acc + Number(cur.products.price) * Number(cur.quantity),
        0
      );
      const discount = totalamountWithOutDiscount - Number(cart.totalamount);
      return {
        ...cart,
        discount,
        totalamountWithOutDiscount,
        products: mutationProduct,
      };
    }
  }
}

const getProductDeatils = async (id) => {
  const { data: product, error } = await supabase
    .from("product")
    .select("price,discount")
    .eq("productid", id)
    .single();
  console.log(product);
  const discountedPrice = calculateDiscountedPrice(
    Number(product?.price),
    Number(product?.discount)
  );

  return { discountedPrice, ...product };
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

async function updateTotalPrice(cartid, totalamount) {
  let { data: cart, error: errorCart } = await supabase
    .from("cart")
    .select("totalamount")
    .eq("cartid", cartid)
    .single();

  let total = cart?.totalamount
    ? totalamount + Number(cart?.totalamount)
    : totalamount;
  const { data, error } = await supabase
    .from("cart")
    .update({ totalamount: total })
    .eq("cartid", cartid)
    .select();
  return data;
}

async function updateProductInCart(body, cartid, userid) {
  const { productid, quantity } = body;
  const { data, error } = await supabase
    .from("cart_item")
    .update({ quantity })
    .eq("cartid", cartid)
    .eq("productid", productid)
    .select();
  return await reduceTotalamount(userid);
}
async function deleteProductInCart(body, cartid) {
  const { productid } = body;
  const { error } = await supabase
    .from("cart_item")
    .delete()
    .eq("cartid", cartid)
    .eq("productid", productid);
  return error;
}

async function reduceTotalamount(userid) {
  const cartItems = await getItemsCart(userid);
  const total = cartItems.products.map((product) => {
    const totalamountWithDiscount =
      calculateDiscountedPrice(product?.price, product?.discount) *
      product?.quantity;
    const totalamount = product?.price * product?.quantity;
    return { totalamountWithDiscount, totalamount };
  });
  const totalamountWithDiscount = total.reduce(
    (acc, cur) => acc + cur.totalamountWithDiscount,
    0
  );
  const { data: cart, error: error_cart } = await supabase
    .from("cart")
    .update({ totalamount: totalamountWithDiscount })
    .eq("cartid", cartItems.cartid);

  return cart;
}

module.exports = {
  createCart,
  addItemToCart,
  getItemsCart,
  updateProductInCart,
  deleteProductInCart,
};
