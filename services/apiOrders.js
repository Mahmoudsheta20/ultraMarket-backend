const supabase = require("../supabaseClient");

const getOrderById = async (orderId) => {
  try {
    let { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("orderid", orderId)
      .single();
    if (error) {
      throw new Error(error);
    }

    const products = await getProdutCart(order?.cartid);
    console.log(products);
    return {
      ...order,
      products: products?.products,
    };
  } catch (error) {}
};
async function getProdutCart(cartId) {
  let { data: cart, error } = await supabase
    .from("cart")
    .select("*")
    .eq("cartid", cartId)
    .eq("status", "Done")
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
module.exports = { getOrderById };
