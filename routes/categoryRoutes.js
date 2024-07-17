// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { calculateDiscountedPrice } = require("../utils/handelPrice");
const { convertStringToArray } = require("../utils/utils");

// Get all products
router.get("/", async (req, res) => {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    res.status(500).json({ error: session.session });
    return null;
  }

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
      console.log(children);
      return {
        parant: { name: cateogry.name, banner_image: banner_image?.imageurl },
        children: children,
      };
    })
  );

  res.json(categories);
});

module.exports = router;
