## Why
TikTok Shop order management is unavailable inside the current node, forcing operators to script HTTP nodes for essential fulfillment workflows such as inspecting order prices, linking external OMS references, and fetching order lists. Providing a dedicated Orders group keeps automation inside the first-party node while reusing the shared signing and proxy logic.

## What Changes
- Introduce an OrdersService that extends BaseService and centralizes six TikTok Shop OpenAPI v2 order endpoints covering search, details, and external references.
- Expose a new Orders group within the TikTok Shop node that surfaces the OrdersService helpers with typed parameters and validation.
- Document platform aliases for external order references and enforce TikTok limits (50 IDs per detail query, 100 external references per batch).

## Impact
- n8n users can orchestrate order intake, pricing reconciliation, and OMS synchronization without leaving the TikTok Shop node.
- BaseService continues to deliver consistent request signing, header management, and proxy selection for the new order flows.
- Node documentation, screenshots, and release notes must be updated to reflect the Orders group and its six operations.
