# orders-service Specification

## Purpose
TBD - created by archiving change add-orders-service-group. Update Purpose after archive.
## Requirements
### Requirement: OrdersService inherits BaseService
OrdersService MUST extend BaseService so all order endpoints reuse the canonical signing, proxy routing, and header behavior.

#### Scenario: Constructor forwards base options
- **GIVEN** OrdersService is instantiated with `appKey`, `appSecret`, optional `accessToken`, optional `proxy`, and overrides for `httpClient`, `timeoutMs`, or `clock`
- **WHEN** the constructor executes
- **THEN** it calls `super` with the same option values so BaseService configures the HTTP client, signing secrets, and defaults.

### Requirement: OrdersService lists orders
OrdersService MUST expose a `getOrderList` helper that posts to `/order/202309/orders/search` with pagination and JSON payload support.

#### Scenario: getOrderList posts signed search request
- **GIVEN** getOrderList receives a non-empty `shop_cipher`, optional `page_size`, optional `page_token`, and an optional JSON body object
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=POST` and `path=/order/202309/orders/search`
- **AND** it appends `shop_cipher`, `page_size`, and `page_token` to the query string when provided
- **AND** it serializes the payload as the JSON body (defaulting to `{}` when omitted)
- **AND** the request includes `content-type: application/json` and `x-tts-access-token` when an access token exists
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

#### Scenario: getOrderList requires shop_cipher
- **WHEN** getOrderList is invoked without a non-empty `shop_cipher`
- **THEN** it throws a descriptive error before issuing any HTTP request.

### Requirement: OrdersService fetches price detail
OrdersService MUST expose a `getPriceDetail` helper that retrieves order pricing via `GET /order/202407/orders/{order_id}/price_detail`.

#### Scenario: getPriceDetail issues signed GET request
- **GIVEN** getPriceDetail receives `order_id='123'` and optional `shop_cipher`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/order/202407/orders/123/price_detail`
- **AND** it passes `shop_cipher` as a query parameter when provided
- **AND** the resulting request includes `content-type: application/json` and `x-tts-access-token` when an access token is available
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

#### Scenario: getPriceDetail requires order_id
- **WHEN** getPriceDetail executes without a non-empty `order_id`
- **THEN** it throws a descriptive error before making any HTTP request.

### Requirement: OrdersService adds external order references
OrdersService MUST expose an `addExternalOrderReferences` helper that posts to `/order/202406/orders/external_orders` and enforces TikTok's batch limit.

#### Scenario: addExternalOrderReferences posts signed batch request
- **GIVEN** addExternalOrderReferences receives `shop_cipher`, optional `platform`, and a JSON array payload of external reference objects
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=POST` and `path=/order/202406/orders/external_orders`
- **AND** it appends `shop_cipher` (and `platform` when provided) to the query string
- **AND** it serializes the array as the JSON request body with `content-type: application/json`
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

#### Scenario: addExternalOrderReferences enforces payload limit
- **WHEN** addExternalOrderReferences receives more than 100 external reference objects
- **THEN** it throws a descriptive error explaining the maximum batch size before issuing any HTTP request.

#### Scenario: addExternalOrderReferences rejects empty payloads
- **WHEN** addExternalOrderReferences receives an empty array or a non-array payload
- **THEN** it throws a descriptive error indicating that at least one external reference is required.

### Requirement: OrdersService retrieves external order references
OrdersService MUST expose a `getExternalOrderReferences` helper that fetches references via `GET /order/202406/orders/{order_id}/external_orders`.

#### Scenario: getExternalOrderReferences issues signed GET request
- **GIVEN** getExternalOrderReferences receives `order_id='123'`, optional `shop_cipher`, and optional `platform`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/order/202406/orders/123/external_orders`
- **AND** it appends `shop_cipher` and `platform` to the query string when provided
- **AND** the resulting request includes `content-type: application/json` and `x-tts-access-token` when an access token is available
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

#### Scenario: getExternalOrderReferences requires order_id
- **WHEN** getExternalOrderReferences executes without a non-empty `order_id`
- **THEN** it throws a descriptive error before making any HTTP request.

### Requirement: OrdersService searches orders by external reference
OrdersService MUST expose a `searchOrderByExternalReference` helper that posts to `/order/202406/orders/external_order_search` with required query params.

#### Scenario: searchOrderByExternalReference posts signed search request
- **GIVEN** searchOrderByExternalReference receives non-empty `platform`, non-empty `external_order_id`, optional `shop_cipher`, and optional JSON body filters
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=POST` and `path=/order/202406/orders/external_order_search`
- **AND** it appends `platform`, `external_order_id`, `shop_cipher`, and any pagination inputs to the query string as required by TikTok
- **AND** it serializes the payload as the JSON body (defaulting to `{}` when omitted)
- **AND** the request includes `content-type: application/json` and `x-tts-access-token` when an access token exists
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

#### Scenario: searchOrderByExternalReference requires platform and external_order_id
- **WHEN** searchOrderByExternalReference executes without a non-empty `platform` or `external_order_id`
- **THEN** it throws a descriptive error before making any HTTP request.

### Requirement: OrdersService fetches order details
OrdersService MUST expose a `getOrderDetail` helper that issues `GET /order/202507/orders` with the `ids` query parameter.

#### Scenario: getOrderDetail issues signed GET request
- **GIVEN** getOrderDetail receives a non-empty array of TikTok order IDs (<= 50) and optional `shop_cipher`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/order/202507/orders`
- **AND** it appends `ids` as a comma-separated list or repeated query entries per TikTok API specification along with `shop_cipher` when provided
- **AND** the resulting request includes `content-type: application/json` and `x-tts-access-token` when an access token is available
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

#### Scenario: getOrderDetail enforces order ID limit
- **WHEN** getOrderDetail receives more than 50 order IDs
- **THEN** it throws a descriptive error explaining the TikTok maximum before issuing any HTTP request.

#### Scenario: getOrderDetail rejects empty order ID list
- **WHEN** getOrderDetail executes without any order IDs
- **THEN** it throws a descriptive error before making any HTTP request.

