## ADDED Requirements
### Requirement: FinancesService inherits BaseService
FinancesService MUST extend BaseService so finance endpoints reuse canonical signing, proxy routing, and header handling.

#### Scenario: Constructor forwards base options
- **GIVEN** FinancesService is instantiated with `appKey`, `appSecret`, optional `accessToken`, optional `proxy`, and optional overrides for `httpClient`, `timeoutMs`, or `clock`
- **WHEN** the constructor executes
- **THEN** it calls `super` with the same option values so BaseService configures the HTTP client, signing secrets, and defaults.

### Requirement: FinancesService retrieves statements
FinancesService MUST expose a `getStatements` helper that issues `GET /finance/202309/statements` with pagination and sorting controls.

#### Scenario: getStatements issues signed GET request
- **GIVEN** getStatements receives `shop_cipher`, optional `page_size`, optional `page_token`, optional `sort_order`, and optional override for `sort_field`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/finance/202309/statements`
- **AND** it appends `shop_cipher`, `page_token`, and `page_size` (defaulting to 20 when omitted) to the query string
- **AND** it enforces `page_size` within the inclusive range 1-100, throwing an error otherwise
- **AND** it appends `sort_field`, defaulting to `statement_time` when not provided
- **AND** it appends `sort_order` when provided, validating the value is either `ASC` or `DESC`
- **AND** the request includes `content-type: application/json` and `x-tts-access-token` when an access token exists
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

### Requirement: FinancesService retrieves payments
FinancesService MUST expose a `getPayments` helper that issues `GET /finance/202309/payments` with pagination and sorting support.

#### Scenario: getPayments issues signed GET request
- **GIVEN** getPayments receives `shop_cipher`, optional `page_size`, optional `page_token`, optional `sort_field`, and optional `sort_order`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/finance/202309/payments`
- **AND** it appends `shop_cipher`, `page_token`, `page_size`, `sort_field`, and `sort_order` to the query when provided
- **AND** it enforces `page_size` within the inclusive range 1-100, defaulting to 20 when omitted
- **AND** it validates any `sort_order` input is either `ASC` or `DESC`
- **AND** the request includes `content-type: application/json` and `x-tts-access-token` when an access token exists
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

### Requirement: FinancesService retrieves withdrawals
FinancesService MUST expose a `getWithdrawals` helper that issues `GET /finance/202309/withdrawals` and filters by TikTok withdrawal types.

#### Scenario: getWithdrawals issues signed GET request
- **GIVEN** getWithdrawals receives `shop_cipher`, optional `page_size`, optional `page_token`, and optional `types` array
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/finance/202309/withdrawals`
- **AND** it appends `shop_cipher`, `page_token`, and `page_size` (defaulting to 20 when omitted) to the query string
- **AND** it enforces `page_size` within the inclusive range 1-100, throwing an error otherwise
- **AND** it validates every `types` entry is one of `WITHDRAW`, `SETTLE`, `TRANSFER`, or `REVERSE` before serializing them to the query
- **AND** the request includes `content-type: application/json` and `x-tts-access-token` when an access token exists
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

### Requirement: FinancesService retrieves statement transactions by order
FinancesService MUST expose a `getStatementTransactionsByOrder` helper that issues `GET /finance/202501/orders/{order_id}/statement_transactions`.

#### Scenario: getStatementTransactionsByOrder issues signed GET request
- **GIVEN** getStatementTransactionsByOrder receives non-empty `order_id` and optional `shop_cipher`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/finance/202501/orders/{order_id}/statement_transactions`
- **AND** it substitutes the provided `order_id` into the path after validating it is non-empty
- **AND** it appends `shop_cipher` to the query string when provided
- **AND** the request includes `content-type: application/json` and `x-tts-access-token` when an access token exists
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

### Requirement: FinancesService retrieves statement transactions by statement
FinancesService MUST expose a `getStatementTransactionsByStatement` helper that issues `GET /finance/202501/statements/{statement_id}/statement_transactions` with optional sorting.

#### Scenario: getStatementTransactionsByStatement issues signed GET request
- **GIVEN** getStatementTransactionsByStatement receives non-empty `statement_id`, optional `shop_cipher`, optional `page_size`, optional `page_token`, optional `sort_order`, and optional override for `sort_field`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/finance/202501/statements/{statement_id}/statement_transactions`
- **AND** it substitutes the provided `statement_id` into the path after validating it is non-empty
- **AND** it appends `shop_cipher`, `page_token`, and `page_size` (defaulting to 20 when omitted) to the query string
- **AND** it enforces `page_size` within the inclusive range 1-100, throwing an error otherwise
- **AND** it appends `sort_field`, defaulting to `order_create_time` when not provided
- **AND** it appends `sort_order` when provided, validating the value is either `ASC` or `DESC`
- **AND** the request includes `content-type: application/json` and `x-tts-access-token` when an access token exists
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.

### Requirement: FinancesService retrieves unsettled transactions
FinancesService MUST expose a `getUnsettledTransactions` helper that issues `GET /finance/202507/orders/unsettled` with pagination and sorting controls.

#### Scenario: getUnsettledTransactions issues signed GET request
- **GIVEN** getUnsettledTransactions receives `shop_cipher`, optional `page_size`, optional `page_token`, optional `sort_order`, and optional override for `sort_field`
- **WHEN** it executes
- **THEN** it delegates to `BaseService.request` with `method=GET` and `path=/finance/202507/orders/unsettled`
- **AND** it appends `shop_cipher`, `page_token`, and `page_size` (defaulting to 20 when omitted) to the query string
- **AND** it enforces `page_size` within the inclusive range 1-100, throwing an error otherwise
- **AND** it appends `sort_field`, defaulting to `order_create_time` when not provided
- **AND** it appends `sort_order` when provided, validating the value is either `ASC` or `DESC`
- **AND** the request includes `content-type: application/json` and `x-tts-access-token` when an access token exists
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed by BaseService
- **AND** it returns the parsed JSON response body.
