## ADDED Requirements
### Requirement: TikTok Shop node exposes Orders group
TikTok Shop node MUST present an `Orders` group in the operation selector with six order management operations backed by OrdersService helpers.

#### Scenario: Orders group lists order operations
- **WHEN** a workflow configures the TikTok Shop node
- **THEN** the group selector includes `Orders`
- **AND** selecting `Orders` reveals operations `getOrderList`, `getPriceDetail`, `addExternalOrderReferences`, `getExternalOrderReferences`, `searchOrderByExternalReference`, and `getOrderDetail` with descriptive labels and help text explaining required parameters and limits.

### Requirement: Orders group delegates to OrdersService
TikTok Shop node MUST instantiate OrdersService with credential inputs and invoke the corresponding helper for each Orders operation.

#### Scenario: Node lists orders
- **GIVEN** the node executes with group `Orders`, operation `getOrderList`, non-empty `appKey`, `appSecret`, `shopCipher`, optional pagination inputs, optional JSON payload, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs OrdersService with the provided credentials and proxy
- **AND** it calls `getOrderList` passing the shop cipher, pagination values, and JSON payload
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node fetches order price detail
- **GIVEN** the node executes with operation `getPriceDetail` and non-empty `orderId`
- **WHEN** the node runs
- **THEN** it constructs OrdersService
- **AND** it calls `getPriceDetail({ order_id: orderId, shop_cipher })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node batches external order references
- **GIVEN** the node executes with operation `addExternalOrderReferences` and provides `shopCipher`, optional `platform`, and an array of external order reference objects
- **WHEN** the node runs
- **THEN** it constructs OrdersService
- **AND** it calls `addExternalOrderReferences({ shop_cipher: shopCipher, platform, references })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node retrieves external order references
- **GIVEN** the node executes with operation `getExternalOrderReferences` and provides `orderId`, optional `platform`, and optional `shopCipher`
- **WHEN** the node runs
- **THEN** it constructs OrdersService
- **AND** it calls `getExternalOrderReferences({ order_id: orderId, platform, shop_cipher })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node searches by external reference
- **GIVEN** the node executes with operation `searchOrderByExternalReference` and provides `platform`, `externalOrderId`, optional `shopCipher`, optional JSON payload, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs OrdersService
- **AND** it calls `searchOrderByExternalReference({ platform, external_order_id: externalOrderId, shop_cipher, body })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node fetches order detail list
- **GIVEN** the node executes with operation `getOrderDetail` and provides up to 50 TikTok order IDs, optional `shopCipher`, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs OrdersService
- **AND** it calls `getOrderDetail({ ids, shop_cipher })`
- **AND** it forwards the JSON result to the node output.

### Requirement: Orders group validates required inputs
TikTok Shop node MUST block execution of Orders operations when required parameters are missing or exceed TikTok limits.

#### Scenario: Missing credentials abort Orders operations
- **WHEN** the node executes any Orders operation without a non-empty `appKey` or `appSecret`
- **THEN** it throws a validation error before instantiating OrdersService.

#### Scenario: Missing orderId aborts detail lookups
- **WHEN** the node executes `getPriceDetail` or `getExternalOrderReferences` without a non-empty `orderId`
- **THEN** it throws a validation error before calling OrdersService.

#### Scenario: Missing references aborts external reference batch
- **WHEN** the node executes `addExternalOrderReferences` without at least one reference object
- **THEN** it throws a validation error explaining the requirement.

#### Scenario: Missing or invalid external search inputs abort execution
- **WHEN** the node executes `searchOrderByExternalReference` without a non-empty `platform` or without a non-empty `externalOrderId`
- **THEN** it throws a validation error before calling OrdersService.

#### Scenario: Missing shopCipher aborts order list retrieval
- **WHEN** the node executes `getOrderList` without a non-empty `shopCipher`
- **THEN** it throws a validation error before calling OrdersService.

#### Scenario: Order detail enforces ID limits
- **WHEN** the node executes `getOrderDetail` with zero order IDs or more than 50 order IDs
- **THEN** it throws a validation error explaining the TikTok limits before calling OrdersService.

#### Scenario: External reference batch enforces limit
- **WHEN** the node executes `addExternalOrderReferences` with more than 100 reference objects
- **THEN** it throws a validation error explaining TikTok's maximum batch size before calling OrdersService.

#### Scenario: Platform alias guidance is surfaced
- **WHEN** the node displays configuration for `platform` inputs on `getExternalOrderReferences` or `searchOrderByExternalReference`
- **THEN** it presents helper text listing supported values (`SHOPIFY`, `WOOCOMMERCE`, `BIGCOMMERCE`, `MAGENTO`, `SALESFORCE_COMMERCE_CLOUD`, `CHANNEL_ADVISOR`, `AMAZON`, `ORDER_MANAGEMENT_SYSTEM`, `WAREHOUSE_MANAGEMENT_SYSTEM`, `ERP_SYSTEM`).
