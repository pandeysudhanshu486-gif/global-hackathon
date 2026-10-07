# Mission: E-Commerce Order API Bug Fix & Regression Suite

## Context
You are a junior backend engineer on an e-commerce platform team. Recently, customer support alerted the engineering team that several customer invoices have inaccurate item subtotal and discount totals due to floating point calculation errors and improper coupon handling.

Your team lead has assigned you this ticket to diagnose the root cause in the order calculation service, apply a robust fix, write regression tests, and submit a clear technical explanation.

---

## Objectives
1. **Investigate Codebase**: Inspect `src/calculations.js` and `src/server.js` to trace where calculation inaccuracies occur.
2. **Fix Order Math**: Ensure monetary calculations are mathematically accurate, rounded properly to 2 decimal places, and coupon percentages are validated correctly.
3. **Add Regression Tests**: Enhance `tests/order.test.js` to cover edge cases such as zero-quantity items, multiple decimal discount rates, and empty carts.
4. **Explain Approach**: Write a concise technical summary explaining why the bug happened and how your fix prevents future regressions.

---

## Acceptance Criteria
- [ ] `calculateSubtotal` correctly computes line-item pricing without floating-point precision leaks.
- [ ] `applyDiscount` safely applies percentage coupons (0% to 100%) and rejects negative or invalid discounts.
- [ ] `calculateOrderTotal` handles taxes, discounts, and item pricing deterministically.
- [ ] All test cases in `tests/order.test.js` pass.
- [ ] Technical explanation is provided upon submission.
