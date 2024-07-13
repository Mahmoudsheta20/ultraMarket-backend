// utils.js
function calculateDiscountedPrice(price, discountPercentage) {
  return price - (discountPercentage / 100) * price;
}

module.exports = { calculateDiscountedPrice };
