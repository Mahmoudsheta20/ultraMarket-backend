const supabase = require("../supabaseClient");

async function createAddress(address) {
  try {
    const { data, error } = await supabase
      .from("address")
      .insert([address])
      .select();
    if (error) {
      throw new Error(error);
    }
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
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    throw new Error(err);
  }
}
async function getAddressById(userId) {
  try {
    const { data, error } = await supabase
      .from("address")
      .select("*")
      .eq("userId", userId)
      .select();
    if (error) {
      throw new Error(error);
    }
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
