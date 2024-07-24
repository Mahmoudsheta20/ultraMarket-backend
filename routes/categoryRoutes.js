// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { calculateDiscountedPrice } = require("../utils/handelPrice");
const { convertStringToArray } = require("../utils/utils");
const productRoutes = require("./productRoutes");
const {
  getProductsCategories,
  getBrandByCategoryId,
  getBannerByCategoryId,
} = require("../services/apiCategories");

// Get all products
router.get("/", async (req, res) => {
  const { data: parantCateogry, error } = await supabase
    .from("category")
    .select("*")
    .is("parentcategoryid", null);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const categories = await Promise.all(
    parantCateogry.map(async (cateogry) => {
      const { data: childrenCateogry, error } = await supabase
        .from("category")
        .select("*")
        .eq("parentcategoryid", cateogry.categoryid);
      const { data: banner_image } = await supabase
        .from("category_images")
        .select("imageurl")
        .eq("catogryId", cateogry.categoryid)
        .eq("isprimary", true)
        .single();
      const children = await Promise.all(
        childrenCateogry.map(async (cateogry) => {
          const { data: child_image } = await supabase
            .from("category_images")
            .select("imageurl")
            .eq("catogryId", cateogry.categoryid)
            .eq("isprimary", true)
            .single();
          console.log(child_image);

          return {
            ...cateogry,
            imageurl: child_image?.imageurl,
          };
        })
      );
      const products = await Promise.all(
        childrenCateogry.map(async (cateogry) => {
          const { data: child_image } = await supabase
            .from("category_images")
            .select("imageurl")
            .eq("catogryId", cateogry.categoryid)
            .eq("isprimary", true)
            .single();
          const products = await getProductsCategories(cateogry.categoryid);
          return products;
        })
      );

      return {
        parant: {
          name: cateogry.name,
          banner_image: banner_image?.imageurl ?? "",
        },
        children: children,
        products: products[0],
      };
    })
  );

  res.json({ categories });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const product = await getProductsCategories(id);
  const brands = await getBrandByCategoryId(id);
  console.log(brands);
  res.json(product);
});
router.get("/brands/:id", async (req, res) => {
  const { id } = req.params;
  const brands = await getBrandByCategoryId(id);
  res.json(brands);
});
router.get("/banner/:id", async (req, res) => {
  const { id } = req.params;
  const banner = await getBannerByCategoryId(id);
  res.json(banner);
});

module.exports = router;
