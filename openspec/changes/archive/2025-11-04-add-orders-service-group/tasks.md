## 1. OrdersService
- [x] Create OrdersService extending BaseService with constructor parity and shared options typing.
- [x] Implement getOrderList helper invoking `POST /order/202309/orders/search` with pagination controls and arbitrary JSON payload.
- [x] Implement getPriceDetail helper invoking `GET /order/202407/orders/{order_id}/price_detail` and validating the required `order_id`.
- [x] Implement addExternalOrderReferences helper invoking `POST /order/202406/orders/external_orders` enforcing the 100 reference limit and payload structure.
- [x] Implement getExternalOrderReferences helper invoking `GET /order/202406/orders/{order_id}/external_orders` requiring `order_id` and optional `platform` alias.
- [x] Implement searchOrderByExternalReference helper invoking `POST /order/202406/orders/external_order_search` requiring `platform` and `external_order_id` query inputs.
- [x] Implement getOrderDetail helper invoking `GET /order/202507/orders` enforcing up to 50 TikTok order IDs via the `ids` query param.

## 2. TikTok Shop Node
- [x] Add Orders group metadata and six operations to node properties with localized labels, descriptions, and parameter schemas.
- [x] Wire node execution to instantiate OrdersService and delegate to the appropriate helper while mapping inputs to headers, query params, path segments, and bodies.
- [x] Ensure node validation catches missing required values (e.g., `orderId`, `ids`, `platform`, `externalOrderId`, payload length limits) before invoking OrdersService.

## 3. Quality
- [x] Update README and node documentation to include the Orders group operations and platform alias guidance.
- [x] Run lint and typecheck to confirm the new code satisfies existing CI gates. *(Lint still fails due to pre-existing community node violations in `nodes/GithubIssues/GithubIssues.node.ts`; typecheck passes.)*
- [x] Document manual validation steps or test coverage for the Orders workflows once access to the TikTok sandbox is available. *(Plan: exercise each Orders operation against the TikTok sandbox workflow once credentials are provisioned; capture request/response samples for price detail, external references, and detail batches.)*
