## 1. Implementation
- [ ] 1.1 Scaffold `SellerService` by extending `BaseService` and expose helpers for `/seller/202309/shops` and `/seller/202309/permissions`.
- [ ] 1.2 Extend `TikTokShop.node.ts` with a `Seller` group, parameter schema, and execution branches that invoke the helpers.
- [ ] 1.3 Update README and node documentation strings to describe the Seller group operations and usage notes.

## 2. Validation
- [ ] 2.1 Run `npm run lint` and `npm run typecheck` to cover the new flows.
- [ ] 2.2 Execute example workflows (or manual API checks) confirming active shop and permission responses return expected fields.
