## Why
- Customers need to orchestrate TikTok Shop logistics flows inside n8n without custom HTTP nodes.
- TikTok Shop node currently exposes only product operations, leaving warehouse and shipping setup unsupported.
- Implementing a dedicated LogisticsService unlocks reusable helpers for logistics endpoints and aligns with BaseService conventions.

## What Changes
- Introduce `LogisticsService` inheriting BaseService and covering warehouse and delivery option endpoints published in TikTok Shop OpenAPI 202309.
- Extend TikTok Shop node with a new `Logistics` group that delegates operations to the new service and surfaces the required inputs.
- Ensure each logistics operation attaches signing parameters, optional access token header, and required path/query arguments.

## Impact
- Expands node surface area; docs and UI strings must highlight new Logistics group and operations.
- Requires new helper implementation and tests covering request construction per endpoint.
- No breaking change for existing Product group users; validation rules keep current behaviour intact.
