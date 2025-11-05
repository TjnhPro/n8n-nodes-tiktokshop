## ADDED Requirements
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
