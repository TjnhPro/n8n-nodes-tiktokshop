## ADDED Requirements
### Requirement: ProductService inherits BaseService
ProductService MUST extend BaseService so catalog requests reuse the canonical signing, proxy routing, and error normalization implementation.

#### Scenario: Constructor forwards base options
- **GIVEN** ProductService is instantiated with `appKey`, `appSecret`, optional `accessToken`, optional `proxy`, and optional overrides for `httpClient`, `timeoutMs`, or `clock`
- **WHEN** the constructor executes
- **THEN** it calls `super` with the same option values so BaseService configures the HTTP client, signing secrets, and defaults.

### Requirement: ProductService searches products
ProductService MUST expose a `searchProducts` helper that queries the TikTok Shop product catalog using `/product/202502/products/search`.

#### Scenario: searchProducts requires shop_cipher
- **GIVEN** searchProducts executes without a non-empty `shop_cipher`
- **WHEN** it runs
- **THEN** it throws a descriptive error before making any HTTP request.

#### Scenario: searchProducts posts signed search request
- **GIVEN** searchProducts receives a non-empty `shop_cipher`, optional JSON body payload, and optional pagination values `{ pageSize?: number; pageToken?: string }`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `path=/product/202502/products/search` and `method=POST`
- **AND** it appends `shop_cipher`, `page_size`, and `page_token` to the query string when provided
- **AND** it serializes the payload as the JSON body (or `{}` when omitted)
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

### Requirement: ProductService creates products
ProductService MUST expose a `createProduct` helper that submits product data via `/product/202309/products`.

#### Scenario: createProduct requires shop_cipher and body
- **GIVEN** createProduct executes without a non-empty `shop_cipher` or without a non-empty body object
- **WHEN** it runs
- **THEN** it throws a descriptive error before making any HTTP request.

#### Scenario: createProduct posts signed request
- **GIVEN** createProduct receives `shop_cipher='abc123'` and a JSON body describing the product
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `path=/product/202309/products` and `method=POST`
- **AND** it appends `shop_cipher` to the query string
- **AND** it serializes the provided body as JSON
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

### Requirement: ProductService uploads product images
ProductService MUST expose an `uploadProductImage` helper that uploads product imagery via `/product/202309/images/upload`.

#### Scenario: uploadProductImage requires file and use_case
- **GIVEN** uploadProductImage executes without binary image data or without a non-empty `use_case`
- **WHEN** it runs
- **THEN** it throws a descriptive error before making any HTTP request.

#### Scenario: uploadProductImage posts multipart request
- **GIVEN** uploadProductImage receives an image buffer, filename, and `use_case='MAIN_IMAGE'`
- **WHEN** it executes
- **THEN** it builds a multipart/form-data payload containing the file and use case
- **AND** it delegates to `BaseService.request` with `path=/product/202309/images/upload` and `method=POST`
- **AND** the resulting headers include `content-type: multipart/form-data` and `x-tts-access-token` when an access token is available
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

### Requirement: ProductService deletes products
ProductService MUST expose a `deleteProducts` helper that deletes multiple products via `/product/202309/products`.

#### Scenario: deleteProducts requires shop_cipher and product IDs
- **GIVEN** deleteProducts executes without a non-empty `shop_cipher` or with an empty `product_ids` array
- **WHEN** it runs
- **THEN** it throws a descriptive error before making any HTTP request.

#### Scenario: deleteProducts enforces product ID limit
- **GIVEN** deleteProducts receives more than 20 product IDs
- **WHEN** it runs
- **THEN** it throws a descriptive error explaining the maximum allowed IDs.

#### Scenario: deleteProducts posts signed delete request
- **GIVEN** deleteProducts receives `shop_cipher='abc123'` and `product_ids=['p1', 'p2']`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `path=/product/202309/products` and `method=DELETE`
- **AND** it appends `shop_cipher` to the query string
- **AND** it serializes the product IDs as the JSON request body
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.
### Requirement: ProductService fetches product details
ProductService MUST expose a `getProductDetail` helper that requests metadata for a specific product via `/product/202309/products/{product_id}`.

#### Scenario: getProductDetail requires product_id
- **GIVEN** getProductDetail receives an input without a non-empty `product_id`
- **WHEN** it executes
- **THEN** it throws a descriptive error before making any HTTP request.

#### Scenario: getProductDetail issues signed GET request
- **GIVEN** getProductDetail receives `{ product_id: '123', shop_cipher?: string }`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `path=/product/202309/products/123` and `method=GET`
- **AND** it passes `shop_cipher` as a query parameter when provided
- **AND** the resulting request includes headers `content-type: application/json` and `x-tts-access-token` when an access token is available
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.
