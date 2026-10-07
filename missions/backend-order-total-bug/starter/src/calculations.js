/**
 * Order Calculation Module
 * NOTE: Contains precision bugs and edge case gaps to fix!
 */

function calculateSubtotal(items) {
  if (!Array.isArray(items)) return 0;
  
  // BUG 1: Inaccurate floating point accumulator
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

function applyDiscount(amount, discountPercent) {
  // BUG 2: Missing validation for negative discounts and missing precision rounding
  const discount = amount * (discountPercent / 100);
  return amount - discount;
}

function calculateOrderTotal(items, discountPercent = 0, taxPercent = 0) {
  const subtotal = calculateSubtotal(items);
  const discounted = applyDiscount(subtotal, discountPercent);
  const tax = discounted * (taxPercent / 100);
  
  // Returns unrounded float
  return discounted + tax;
}

module.exports = {
  calculateSubtotal,
  applyDiscount,
  calculateOrderTotal,
};
