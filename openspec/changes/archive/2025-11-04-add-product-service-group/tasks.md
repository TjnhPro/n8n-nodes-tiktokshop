## 1. ProductService
- [x] Create ProductService extending BaseService with constructor parity and shared options typing.
- [x] Implement searchProducts helper calling `POST /product/202502/products/search` with canonical signing, optional pagination, and JSON payload.
- [x] Implement uploadProductImage helper calling `POST /product/202309/images/upload` with multipart file handling and `use_case` validation.
- [x] Implement deleteProducts helper calling `DELETE /product/202309/products` enforcing `shop_cipher` and product ID limits.
- [x] Implement createProduct helper calling `POST /product/202309/products` requiring `shop_cipher` query and JSON body.
- [x] Implement getProductDetail helper calling `GET /product/202309/products/{product_id}` passing the product ID as a path segment and optional `shop_cipher` query.

## 2. TikTok Shop Node
- [x] Add Product group metadata and operations to node properties with validation for required inputs.
- [x] Wire node execution to instantiate ProductService and call the appropriate helper.
- [x] Map ProductService errors into NodeOperationError responses while respecting continue-on-fail behavior.

## 3. Quality
- [x] Update README and node descriptions to document the new Product group.
- [x] Run lint and typecheck to ensure the additions satisfy existing CI gates. *(Lint currently reports pre-existing repository violations unrelated to this change; see `npm run lint` output from 2025-11-04. `npm run typecheck` passes.)*
- [x] Add unit or integration coverage for ProductService helpers if test harness becomes available; otherwise document manual testing plan. *(Plan: rely on `npm run typecheck` plus manual n8n workflow smoke test hitting list/detail endpoints once product APIs are accessible.)*
