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
      if (error) {
        return res.status(500).json({ error: error.message });
      }
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

async function getBrandByCategoryId(categoryid) {
  let { data: product_category } = await supabase
    .from("product_category")
    .select("productid")
    .eq("categoryid", categoryid);
  const products = await Promise.all(
    product_category.map(async (pro) => {
      const { data: product, error } = await supabase
        .from("product")
        .select("brandId")
        .eq("productid", pro.productid)
        .single();
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      let { data: brands } = await supabase
        .from("brands")
        .select("Name,imageUrl")
        .eq("id", product.brandId);
      return brands;
    })
  );
  return products;
}

async function getBannerByCategoryId(categoryid) {
  let { data: banner_category, error } = await supabase
    .from("banner_category")
    .select("id,productId,imageUrl")
    .eq("categoryId", categoryid);
  return banner_category;
}

module.exports = {
  getProductsCategories,
  getBrandByCategoryId,
  getBannerByCategoryId,
};
