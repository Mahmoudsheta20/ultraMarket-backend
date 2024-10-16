const supabase = require("../supabaseClient");

async function createAddress(address) {
  try {
    const { data, error } = await supabase
      .from("address")
      .insert([address])
      .select();
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
}
async function getAddressById(userId) {
  try {
    const { data, error } = await supabase
      .from("address")
      .select("*")
      .eq("userId", userId)
      .select();
    console.log(data);
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
}
module.exports = { createAddress, getAddressById };
