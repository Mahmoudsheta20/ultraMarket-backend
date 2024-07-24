const supabase = require("../supabaseClient");
const { calculateDiscountedPrice } = require("../utils/handelPrice");
const { convertStringToArray } = require("../utils/utils");

const getBestDeals = async () => {
  const { data, error } = await supabase
    .from("product")
    .select("productid, name, discount, price")
    .order("discount", { ascending: false }) // Sort by discount in descending order
    .limit(10); // Limit to top 10 best deals

  const products = getImageForProduct(data);
  return products;
};

const getImageForProduct = async (products) => {
  const productsWithDiscount = await Promise.all(
    products.map(async (product) => {
      const discountedPrice = calculateDiscountedPrice(
        Number(product.price),
        Number(product.discount)
      );
      const { data: product_image, error } = await supabase
        .from("product_image")
        .select("imageurl")
        .eq("productid", product.productid)
        .eq("isprimary", true);
      return {
        ...product,
        discountedPrice,
        product_image,
      };
    })
  );
  return productsWithDiscount;
};

const getProductDeatils = async (id) => {
  const { data: product, error } = await supabase
    .from("product")
    .select("*")
    .eq("productid", id)
    .single();

  const discountedPrice = calculateDiscountedPrice(
    Number(product?.price),
    Number(product?.discount)
  );
  const { data: product_image, error: product_image_error } = await supabase
    .from("product_image")
    .select("imageurl")
    .eq("productid", product.productid);

  let { data: product_specification } = await supabase
    .from("product_specification")
    .select("specificationid, value")
    .eq("productid", product.productid);
  const specifications = await Promise.all(
    product_specification.map(async (specification) => {
      let { data: specifications, error } = await supabase
        .from("specification")
        .select("name")
        .eq("specificationid", specification.specificationid)
        .single();
      return { name: specifications.name, value: specification.value };
    })
  );

  const highlights = convertStringToArray(product.highlights);

  return {
    ...product,
    discountedPrice,
    product_image,
    highlights,
    specifications,
  };
};

const getReview = async (productid) => {
  let { data: product_review, error } = await supabase
    .from("product_review")
    .select("reviewid,author,rating,content")
    .eq("productid", productid);

  return product_review;
};

module.exports = { getBestDeals, getProductDeatils, getReview };
