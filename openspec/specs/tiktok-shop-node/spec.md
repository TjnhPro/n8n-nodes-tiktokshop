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

### Requirement: TikTok Shop node exposes Fulfillments group
TikTok Shop node MUST present a `Fulfillments` group in the UI with operations for package creation, shipping, document retrieval, and PDF resizing.
#### Scenario: Fulfillments group lists package operations
- **WHEN** a workflow configures the TikTok Shop node
- **THEN** the resource selector includes `Fulfillments`
- **AND** selecting `Fulfillments` reveals operations `createPackages`, `shipPackage`, `getPackageShippingDocument`, and `resizePdf` with descriptive labels explaining the inputs for each operation.

### Requirement: Fulfillments group delegates to FulfillmentsService
TikTok Shop Fulfillments operations MUST instantiate FulfillmentsService and call the matching helper with node inputs.

#### Scenario: Node creates packages via service
- **GIVEN** the node executes with group `Fulfillments` and operation `createPackages`
- **AND** provides credentials, optional proxy, non-empty `shopCipher`, required JSON body, and optional `accessToken`
- **WHEN** the node runs
- **THEN** it constructs FulfillmentsService with the provided credentials and proxy
- **AND** it calls `createPackages({ shopCipher, body })`
- **AND** it forwards the JSON response to the node output.

#### Scenario: Node ships package via service
- **GIVEN** the node executes with group `Fulfillments` and operation `shipPackage`
- **AND** provides credentials, optional proxy, non-empty `packageId`, non-empty `shopCipher`, required JSON body, and optional `accessToken`
- **WHEN** the node runs
- **THEN** it constructs FulfillmentsService
- **AND** it calls `shipPackage({ packageId, shopCipher, body })`
- **AND** it forwards the JSON response to the node output.

#### Scenario: Node gets shipping documents via service
- **GIVEN** the node executes with group `Fulfillments` and operation `getPackageShippingDocument`
- **AND** provides credentials, optional proxy, non-empty `packageId`, non-empty `shopCipher`, optional `documentType`, and optional `accessToken`
- **WHEN** the node runs
- **THEN** it constructs FulfillmentsService
- **AND** it calls `getPackageShippingDocument({ packageId, shopCipher, documentType })`
- **AND** it forwards the response stream or JSON to the node output consistent with service behavior.

### Requirement: Fulfillments group validates required inputs
TikTok Shop Fulfillments operations MUST block execution when required parameters are missing or blank.
#### Scenario: Missing source URL aborts PDF resize
- **WHEN** the node executes `resizePdf` without a non-empty `sourceUrl`
- **THEN** it throws a validation error before invoking PdfService.

### Requirement: TikTok Shop node exposes Finances group
TikTok Shop node MUST present a `Finances` group in the operation selector with six settlement and transaction inspection operations backed by FinancesService helpers.

#### Scenario: Finances group lists finance operations
- **WHEN** a workflow configures the TikTok Shop node
- **THEN** the group selector includes `Finances`
- **AND** selecting `Finances` reveals operations `getStatements`, `getPayments`, `getWithdrawals`, `getStatementTransactionsByOrder`, `getStatementTransactionsByStatement`, and `getUnsettledTransactions` with descriptive labels and help text covering pagination limits, sort options, and withdrawal type meanings.

### Requirement: Finances group delegates to FinancesService
TikTok Shop node MUST instantiate FinancesService with credential inputs and invoke the corresponding helper for each Finances operation.

#### Scenario: Node retrieves statements
- **GIVEN** the node executes with group `Finances`, operation `getStatements`, non-empty `appKey`, `appSecret`, non-empty `shopCipher`, optional pagination inputs, optional sort overrides, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs FinancesService with the provided credentials and proxy
- **AND** it calls `getStatements` passing the shop cipher, pagination values, and sort options (defaulting `page_size=20` and `sort_field='statement_time'` when absent)
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node retrieves payments
- **GIVEN** the node executes with operation `getPayments` and provides `shopCipher`, optional pagination, sort inputs, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs FinancesService
- **AND** it calls `getPayments({ shop_cipher: shopCipher, page_size, page_token, sort_field, sort_order })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node retrieves withdrawals with type filters
- **GIVEN** the node executes with operation `getWithdrawals` and provides `shopCipher`, optional pagination, optional array of withdrawal `types`, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs FinancesService
- **AND** it calls `getWithdrawals({ shop_cipher: shopCipher, page_size, page_token, types })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node inspects transactions by order
- **GIVEN** the node executes with operation `getStatementTransactionsByOrder` and provides non-empty `orderId`, optional `shopCipher`, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs FinancesService
- **AND** it calls `getStatementTransactionsByOrder({ order_id: orderId, shop_cipher: shopCipher })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node inspects transactions by statement
- **GIVEN** the node executes with operation `getStatementTransactionsByStatement` and provides non-empty `statementId`, optional pagination, optional sort overrides, optional `shopCipher`, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs FinancesService
- **AND** it calls `getStatementTransactionsByStatement({ statement_id: statementId, shop_cipher: shopCipher, page_size, page_token, sort_field, sort_order })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Node retrieves unsettled transactions
- **GIVEN** the node executes with operation `getUnsettledTransactions` and provides `shopCipher`, optional pagination inputs, optional sort overrides, optional `accessToken`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it constructs FinancesService
- **AND** it calls `getUnsettledTransactions({ shop_cipher: shopCipher, page_size, page_token, sort_field, sort_order })`
- **AND** it forwards the JSON result to the node output.

### Requirement: Finances group validates required inputs
TikTok Shop node MUST block execution of Finances operations when required parameters are missing or violate TikTok limits.

#### Scenario: Missing credentials abort Finances operations
- **WHEN** the node executes any Finances operation without a non-empty `appKey` or `appSecret`
- **THEN** it throws a validation error before instantiating FinancesService.

#### Scenario: Missing shopCipher aborts shop-level finance queries
- **WHEN** the node executes `getStatements`, `getPayments`, `getWithdrawals`, or `getUnsettledTransactions` without a non-empty `shopCipher`
- **THEN** it throws a validation error before calling FinancesService.

#### Scenario: Missing identifiers abort transaction lookups
- **WHEN** the node executes `getStatementTransactionsByOrder` without a non-empty `orderId` or executes `getStatementTransactionsByStatement` without a non-empty `statementId`
- **THEN** it throws a validation error before calling FinancesService.

#### Scenario: Page size enforces TikTok bounds
- **WHEN** the node executes any Finances operation that accepts `pageSize` and the provided value is less than 1 or greater than 100
- **THEN** it throws a validation error explaining the allowable range before calling FinancesService.

#### Scenario: Withdrawal types reject unsupported values
- **WHEN** the node executes `getWithdrawals` with a `types` entry outside `WITHDRAW`, `SETTLE`, `TRANSFER`, or `REVERSE`
- **THEN** it throws a validation error enumerating the supported values before calling FinancesService.

#### Scenario: Sort order validates allowable values
- **WHEN** the node executes a Finances operation with `sortOrder` outside `ASC` or `DESC`
- **THEN** it throws a validation error before calling FinancesService.

#### Scenario: Help text documents withdrawal types
- **WHEN** the node displays configuration for the `types` selector on `getWithdrawals`
- **THEN** it presents helper text summarizing each TikTok meaning (`WITHDRAW`, `SETTLE`, `TRANSFER`, `REVERSE`) so operators understand the filters.

### Requirement: Fulfillments resize operation delegates to PdfService
- Pdf resize flows MUST call PdfService to download, resize, and return the PDF binary alongside metadata using a fixed 4x6 inch page at 300 DPI.

-#### Scenario: Node resizes PDF via PdfService
- **GIVEN** the node executes with group `Fulfillments` and operation `resizePdf`
- **AND** provides a `sourceUrl`
- **WHEN** the node runs
- **THEN** it constructs PdfService with proxy-aware HTTP settings
- **AND** it calls `resizeFromUrl` passing the source URL with a fixed 4x6 inch (101.6mm x 152.4mm) target page size at 300 DPI
- **AND** it returns the PdfService metadata (`pageCount`, final page size, original size, optional DPI) in the node output JSON.

#### Scenario: Resized PDF returned as binary data
- **WHEN** `resizePdf` succeeds
- **THEN** the node attaches the resized PDF to the binary property `data` using MIME type `application/pdf`
- **AND** the node output JSON references the `data` property and the resolved file name so downstream steps can consume the PDF.

