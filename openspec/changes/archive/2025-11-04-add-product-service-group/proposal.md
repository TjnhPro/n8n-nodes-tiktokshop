## Why
Product catalog operations are currently missing from the TikTok Shop node, forcing users to leave n8n for core workflows like listing products and inspecting product metadata. Introducing a dedicated ProductService that reuses the shared BaseService guarantees consistent signing, proxy handling, and error normalization for catalog endpoints while enabling the node to expose a first-party Product group.

## What Changes
- Add a ProductService that extends BaseService so catalog operations reuse the canonical request pipeline.
- Implement helpers on ProductService for listing products and fetching product details from TikTok Shop OpenAPI v2.
- Extend the TikTok Shop node with a new Product group that surfaces the ProductService helpers as operations, including parameter wiring and validation.

## Impact
- n8n workflows gain first-class support for Product catalog queries without rebuilding TikTok-specific signing logic.
- BaseService remains the single source of truth for signing, proxy, and error handling, minimizing duplicate logic across services.
- Node UI grows to include a Product group with two operations; documentation and screenshots must be refreshed accordingly.

