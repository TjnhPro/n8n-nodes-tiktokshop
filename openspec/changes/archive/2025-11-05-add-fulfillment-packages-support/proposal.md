## Why
Merchants need to manage TikTok Shop package fulfillment actions—creating packages, shipping them, and downloading shipping documents—directly from the n8n TikTok Shop node. The current node exposes logistics and product flows but lacks fulfillments coverage.

## What Changes
- Introduce a Fulfillments group to the TikTok Shop node with operations for creating packages, shipping a package, and retrieving shipping documents.
- Add a FulfillmentsService that inherits BaseService and wraps the `/fulfillment/202309/packages` endpoints required by the new node operations.
- Wire new operations so they accept credential inputs, proxy options, and per-endpoint parameters consistent with existing service patterns.

## Impact
- Expands node surface area, enabling workflows to create and ship packages without custom HTTP nodes.
- Establishes a reusable FulfillmentsService for future fulfillment-related endpoints.
- Requires validation updates to guard required parameters for the new operations.