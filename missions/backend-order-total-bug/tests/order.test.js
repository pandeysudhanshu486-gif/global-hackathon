const assert = require('assert');
const { calculateSubtotal, applyDiscount, calculateOrderTotal } = require('../starter/src/calculations');

console.log('Running Order Service Evaluation Tests...');

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`);
  }
}

runTest('calculateSubtotal handles basic integer and fractional pricing', () => {
  const items = [
    { price: 19.99, quantity: 2 },
    { price: 5.5, quantity: 1 },
  ];
  const subtotal = calculateSubtotal(items);
  assert.strictEqual(Number(subtotal.toFixed(2)), 45.48);
});

runTest('applyDiscount applies 20% coupon accurately', () => {
  const result = applyDiscount(100, 20);
  assert.strictEqual(Number(result.toFixed(2)), 80.00);
});

runTest('calculateOrderTotal computes final total with discount and 10% tax', () => {
  const items = [{ price: 100, quantity: 1 }];
  // Subtotal = 100, Discount 10% = 90, Tax 10% on 90 = 9 -> Total 99.00
  const totalAmount = calculateOrderTotal(items, 10, 10);
  assert.strictEqual(Number(totalAmount.toFixed(2)), 99.00);
});

console.log(`\nTest Summary: ${passed}/${total} passed.`);
