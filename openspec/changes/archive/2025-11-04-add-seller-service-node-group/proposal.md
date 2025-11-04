## Why
- Workflows cannot access seller-facing API endpoints because the node only ships token operations.
- Seller integrations would duplicate BaseService logic to sign and dispatch TikTok OpenAPI requests.

## What Changes
- Introduce a `SellerService` that extends `BaseService` and wraps seller active shop and permission lookups.
- Add a new `Seller` group to the TikTok Shop node with operations that call `SellerService`.
- Share proxy, credential, and error handling between the new service and existing infrastructure.

## Impact
- Expands the public node surface area; requires manual verification for seller shop list and permission flows.
- No breaking changes: existing token group behaviour remains unchanged.
- Documentation and UI strings must describe the new Seller group operations and usage notes.
