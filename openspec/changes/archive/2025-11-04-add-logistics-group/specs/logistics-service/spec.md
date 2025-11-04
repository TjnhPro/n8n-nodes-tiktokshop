## ADDED Requirements
### Requirement: LogisticsService extends BaseService logistics helpers
LogisticsService MUST inherit BaseService so logistics requests reuse signing, access token propagation, proxy handling, and base URL configuration.

#### Scenario: LogisticsService composes BaseService request
- **GIVEN** LogisticsService is constructed with `appKey`, `appSecret`, optional `accessToken`, and optional `proxy`
- **WHEN** any logistics helper issues a request
- **THEN** the outbound call reuses BaseService logic for base URL, signing parameters, and optional `x-tts-access-token` header.

### Requirement: LogisticsService lists warehouses
LogisticsService MUST offer a helper that retrieves the seller warehouse catalog from the TikTok Shop OpenAPI 202309 release.

#### Scenario: Request warehouses
- **GIVEN** the helper is called with a non-empty `shopCipher`, optional pagination query, and optional `accessToken`
- **WHEN** it performs a GET request to `/logistics/202309/warehouses`
- **THEN** the request includes `content-type: application/json` and `x-tts-access-token` when provided
- **AND** it appends `app_key`, `timestamp`, `sign`, and `shop_cipher` to the query string.

### Requirement: LogisticsService lists global warehouses
LogisticsService MUST retrieve global seller warehouse metadata for cross-border fulfillment.

#### Scenario: Request global warehouses
- **WHEN** the helper executes a GET to `/logistics/202309/global_warehouses`
- **THEN** it sends the request with `content-type: application/json` and optional `x-tts-access-token`
- **AND** the query string includes `app_key`, `timestamp`, and `sign` without `shop_cipher`.

### Requirement: LogisticsService lists warehouse delivery options
LogisticsService MUST retrieve delivery options for a specific warehouse.

#### Scenario: Request warehouse delivery options
- **GIVEN** the caller supplies `warehouseId` and non-empty `shopCipher`
- **WHEN** the helper issues a GET to `/logistics/202309/warehouses/{warehouse_id}/delivery_options`
- **THEN** the resolved path includes the warehouse ID value and omits curly braces
- **AND** the query string includes `app_key`, `timestamp`, `sign`, and `shop_cipher`
- **AND** it sets `content-type: application/json` and optional `x-tts-access-token`.

### Requirement: LogisticsService lists shipping providers
LogisticsService MUST retrieve shipping providers available for a delivery option.

#### Scenario: Request shipping providers
- **GIVEN** the caller supplies `deliveryOptionId` and non-empty `shopCipher`
- **WHEN** the helper issues a GET to `/logistics/202309/delivery_options/{delivery_option_id}/shipping_providers`
- **THEN** the path includes the delivery option ID value and omits curly braces
- **AND** the query string includes `app_key`, `timestamp`, `sign`, and `shop_cipher`
- **AND** it sets `content-type: application/json` and optional `x-tts-access-token`.
