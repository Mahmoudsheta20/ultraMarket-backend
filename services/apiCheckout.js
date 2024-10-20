const supabase = require("../supabaseClient");

async function createOrder(cartid, addressId, userid) {
  try {
    let {
      data: { totalamount },
      error,
    } = await supabase
      .from("cart")
      .select("totalamount")
      .eq("cartid", cartid)
      .eq("status", "Pending")
      .single();
    if (error) {
      throw new Error({ message: "This Cart Is Ordered" });
    }

    const {
      data: { orderid },
      error: orderError,
    } = await supabase
      .from("orders")
      .insert({
        userid,
        totalamount,
        cartid,
        isPaid: "true",
        status: "0",
        shipping_address: addressId,
      })
      .select()
      .single();

    let { error: error_update } = await supabase
      .from("cart")
      .update({ status: "Done" })
      .eq("cartid", cartid);

    if (error || orderError || error_update) {
      throw new Error(error || orderError || error_update);
    }
    return orderid;
  } catch (err) {
    throw new Error(err);
  }

  // let { error: error_update } = await supabase
  //   .from("cart")
  //   .update({ status: "Done" })
  //   .eq("cartid", cartid);

  // if (error_update) {
  //   throw new Error(error_update.message);
  // }

  // const { data: order, error: orderError } = await supabase
  //   .from("orders")
  //   .insert({
  //     userid,
  //     totalamount,
  //     cartid,
  //     isPaid: "true",
  //     status: "Pending",
  //     shipping_address: addressId,
  //   });

  // if (orderError) {
  //   console.log(orderError);
  //   throw new Error(orderError.message);
  // }

  // return { message: "Order created successfully", order };
}

async function getProdutCart(cartId) {
  let { data: cart, error } = await supabase
    .from("cart")
    .select("*")
    .eq("cartid", cartId)
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
module.exports = { createOrder, getProdutCart };
