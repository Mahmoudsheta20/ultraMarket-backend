const supabase = require("../supabaseClient");
const { calculateDiscountedPrice } = require("../utils/handelPrice");

async function getProductsCategories(categoryid) {
  let { data: product_category } = await supabase
    .from("product_category")
    .select("productid")
    .eq("categoryid", categoryid);
  const products = await Promise.all(
    product_category.map(async (pro) => {
      const { data: product, error } = await supabase
        .from("product")
        .select("productid, name , price, discount")
        .eq("productid", pro.productid)
        .single();

      const discountedPrice = calculateDiscountedPrice(
        Number(product.price),
        Number(product.discount)
      );
      const { data: product_image } = await supabase
        .from("product_image")
        .select("imageurl")
        .eq("productid", product.productid)
        .eq("isprimary", true)
        .single();

      return { ...product, discountedPrice, imageUrl: product_image.imageurl };
    })
  );
  return products;
}

module.exports = { getProductsCategories };
