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
async function updateAddress(address, addressId) {
  try {
    const { data, error } = await supabase
      .from("address")
      .update([address])
      .eq("id", addressId)
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
async function deleteAdressById(id) {
  try {
    const { error } = await supabase.from("address").delete().eq("id", id);
    if (error) {
      throw new Error(err.message);
    }
  } catch (err) {
    throw new Error(err.message);
  }
}
module.exports = {
  createAddress,
  getAddressById,
  deleteAdressById,
  updateAddress,
};
