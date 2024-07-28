// utils.js
function calculateDiscountedPrice(price, discountPercentage) {
  if (!discountPercentage) return price;
  return price - (discountPercentage / 100) * price;
}

module.exports = { calculateDiscountedPrice };
