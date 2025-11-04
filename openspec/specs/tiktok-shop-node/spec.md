# tiktok-shop-node Specification

## Purpose
TBD - created by archiving change add-product-service-group. Update Purpose after archive.
## Requirements
### Requirement: TikTok Shop node exposes Product group
TikTok Shop node MUST present a `Product` group in the UI with operations backed by ProductService helpers.

#### Scenario: Product group offers catalog operations
- **WHEN** a workflow configures the TikTok Shop node
- **THEN** the group selector includes `Product`
- **AND** selecting `Product` reveals operations `searchProducts`, `createProduct`, `uploadProductImage`, and `getProductDetail` with descriptive labels and help text.

### Requirement: Product group delegates to ProductService
TikTok Shop node MUST instantiate ProductService with credential inputs and delegate execution to the appropriate helper.

#### Scenario: Node searches products
- **GIVEN** the node executes with group `Product` and operation `searchProducts`
- **AND** provides `appKey`, `appSecret`, non-empty `shopCipher`, optional `accessToken`, optional `proxy`, optional pagination values, and optional JSON payload
- **WHEN** the node runs
- **THEN** it constructs ProductService with the provided credentials
- **AND** it calls `searchProducts` passing the shop cipher, pagination values, and JSON payload
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node creates product
- **GIVEN** the node executes with group `Product` and operation `createProduct`
- **AND** provides `appKey`, `appSecret`, non-empty `shopCipher`, required JSON body, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs ProductService with the provided credentials
- **AND** it calls `createProduct({ shopCipher, body })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node uploads product image
- **GIVEN** the node executes with group `Product` and operation `uploadProductImage`
- **AND** provides `appKey`, `appSecret`, binary image data, required `useCase`, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs ProductService with the provided credentials
- **AND** it calls `uploadProductImage({ fileBuffer, fileName, useCase })`
- **AND** it forwards the JSON result, including TikTok image metadata, to the node output.

#### Scenario: Node deletes products
- **GIVEN** the node executes with group `Product` and operation `deleteProducts`
- **AND** provides `appKey`, `appSecret`, non-empty `shopCipher`, array of product IDs, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs ProductService
- **AND** it calls `deleteProducts({ shopCipher, productIds })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node fetches product detail
- **GIVEN** the node executes with group `Product` and operation `getProductDetail`
- **AND** provides `productId`, `appKey`, `appSecret`, optional `shopCipher`, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs ProductService
- **AND** it calls `getProductDetail({ product_id: productId, shop_cipher: shopCipher })`
- **AND** it forwards the JSON result to the node output.

### Requirement: Product group validates required inputs
TikTok Shop node MUST block execution of Product operations when required parameters are missing or blank.

#### Scenario: Missing credentials abort execution
- **WHEN** the node executes a Product operation without a non-empty `appKey` or `appSecret`
- **THEN** it throws a validation error before instantiating ProductService.

#### Scenario: Missing product_id aborts detail request
- **WHEN** the node executes `getProductDetail` without a non-empty `productId`
- **THEN** it throws a validation error before calling ProductService.

#### Scenario: Missing shopCipher aborts product search
- **WHEN** the node executes `searchProducts` without a non-empty `shopCipher`
- **THEN** it throws a validation error before calling ProductService.

#### Scenario: Missing inputs abort product creation
- **WHEN** the node executes `createProduct` without a non-empty `shopCipher` or without a non-empty product body
- **THEN** it throws a validation error before calling ProductService.

#### Scenario: Missing image data aborts upload
- **WHEN** the node executes `uploadProductImage` without binary data or without a non-empty `useCase`
- **THEN** it throws a validation error before calling ProductService.

#### Scenario: Missing shopCipher or product IDs abort deletion
- **WHEN** the node executes `deleteProducts` without a non-empty `shopCipher` or without any product IDs
- **THEN** it throws a validation error before calling ProductService.

### Requirement: TikTok Shop node exposes Logistics group
TikTok Shop node MUST present a `Logistics` group in the UI with operations that map to logistics flows.

#### Scenario: Logistics group offers warehouse and shipping operations
- **WHEN** a workflow configures the TikTok Shop node
- **THEN** the group selector includes `Logistics`
- **AND** selecting `Logistics` reveals operations `listWarehouses`, `listGlobalWarehouses`, `listWarehouseDeliveryOptions`, and `listShippingProviders` with descriptive labels and help text.

### Requirement: Logistics group delegates to LogisticsService
TikTok Shop node MUST instantiate LogisticsService with credential inputs and delegate execution to the appropriate helper.

#### Scenario: Logistics operation fetches warehouse data
- **GIVEN** the node executes with group `Logistics`, operation `listWarehouses`, non-empty `appKey`, `appSecret`, `shopCipher`, optional `warehouseQuery`, and optional `accessToken`
- **WHEN** the node runs
- **THEN** it constructs LogisticsService with the provided credentials and proxy
- **AND** it calls `listWarehouses({ shopCipher, query: warehouseQuery })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Logistics operation fetches global warehouse data
- **GIVEN** the node executes with group `Logistics`, operation `listGlobalWarehouses`, and non-empty `appKey` and `appSecret`
- **WHEN** the node runs
- **THEN** it constructs LogisticsService
- **AND** it calls `listGlobalWarehouses()`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Logistics operation fetches delivery options
- **GIVEN** the node executes with group `Logistics`, operation `listWarehouseDeliveryOptions`, non-empty `warehouseId`, non-empty `shopCipher`, and credentials
- **WHEN** the node runs
- **THEN** it constructs LogisticsService
- **AND** it calls `listWarehouseDeliveryOptions({ warehouseId, shopCipher })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Logistics operation fetches shipping providers
- **GIVEN** the node executes with group `Logistics`, operation `listShippingProviders`, non-empty `deliveryOptionId`, non-empty `shopCipher`, and credentials
- **WHEN** the node runs
- **THEN** it constructs LogisticsService
- **AND** it calls `listShippingProviders({ deliveryOptionId, shopCipher })`
- **AND** it forwards the JSON result to the node output.

### Requirement: Logistics group validates required inputs
TikTok Shop node MUST block execution of Logistics operations when required parameters are missing or blank.

#### Scenario: Missing shopCipher aborts warehouse listing
- **WHEN** the node executes `listWarehouses` without a non-empty `shopCipher`
- **THEN** it throws a validation error before calling LogisticsService.

#### Scenario: Missing shopCipher aborts delivery lookups
- **WHEN** the node executes `listWarehouseDeliveryOptions` or `listShippingProviders` without a non-empty `shopCipher`
- **THEN** it throws a validation error before calling LogisticsService.

#### Scenario: Missing warehouse or delivery ids abort delivery operations
- **WHEN** the node executes `listWarehouseDeliveryOptions` without a non-empty `warehouseId`
- **OR** it executes `listShippingProviders` without a non-empty `deliveryOptionId`
- **THEN** it throws a validation error before calling LogisticsService.

