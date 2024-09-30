const supabase = require("../supabaseClient");

async function createOrder(cartid, userid) {
  let {
    data: { totalamount },
    error,
  } = await supabase
    .from("cart")
    .select("totalamount")
    .eq("cartid", cartid)
    .eq("status", "Pending")
    .single();
  console.log(totalamount);
  if (error) {
    throw new Error(error.message);
  }
  let { error: error_update } = await supabase
    .from("cart")
    .update({ status: "Done" })
    .eq("cartid", cartid);

  if (error_update) {
    throw new Error(error_update.message);
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      userid,
      totalamount,
      cartid,
      isPaid: "true",
      status: "Pending",
    });

  if (orderError) {
    console.log(orderError);
    throw new Error(orderError.message);
  }

  return { message: "Order created successfully", order };
}

module.exports = { createOrder };
