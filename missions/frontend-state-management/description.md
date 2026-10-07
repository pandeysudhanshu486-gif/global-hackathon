# Mission: Interactive Cart State Management & Validation

## Context
You are a junior frontend engineer building an e-commerce checkout flow. The team needs an immutable state reducer that manages item quantities, coupon applications, and edge case input validations (such as max items per order, invalid discount codes, and zero quantity removals).

---

## Objectives
1. Implement a state reducer for shopping cart actions (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `APPLY_COUPON`).
2. Ensure state updates are strictly immutable.
3. Validate business constraints (reject negative quantities, cap max items at 99, compute accurate subtotal and discounts).
4. Provide passing unit test coverage.
