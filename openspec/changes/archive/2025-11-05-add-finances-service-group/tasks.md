## 1. FinancesService
- [x] Create FinancesService extending BaseService with shared constructor options and exported helper typings.
- [x] Implement getStatements helper invoking `GET /finance/202309/statements` with pagination, sort field defaults, and query validation.
- [x] Implement getPayments helper invoking `GET /finance/202309/payments` with pagination and sort options.
- [x] Implement getWithdrawals helper invoking `GET /finance/202309/withdrawals`, enforcing the supported `types` enum and pagination constraints.
- [x] Implement getStatementTransactionsByOrder helper invoking `GET /finance/202501/orders/{order_id}/statement_transactions` and validating `order_id`.
- [x] Implement getStatementTransactionsByStatement helper invoking `GET /finance/202501/statements/{statement_id}/statement_transactions`, validating `statement_id`, and honoring optional sorting.
- [x] Implement getUnsettledTransactions helper invoking `GET /finance/202507/orders/unsettled` with pagination and sorting controls.

## 2. TikTok Shop Node
- [x] Add a Finances group to the node UI with six operations wired to parameter definitions for statements, payments, withdrawals, and transaction lookups.
- [x] Instantiate FinancesService during node execution and delegate requests based on the selected operation, mapping headers, query params, and path variables.
- [x] Validate required inputs (credentials, order/statement IDs, withdrawal types, pagination bounds) before invoking FinancesService.

## 3. Quality
- [x] Update README and node documentation to describe the Finances group operations, including pagination limits and withdrawal type meanings.
- [x] Run lint and typecheck, noting any unrelated failures in the summary.
- [x] Document manual or automated verification steps for statement, payment, withdrawal, and transaction retrieval workflows using the TikTok sandbox when available. *(Plan: Run statement, payment, withdrawal, order/statement transaction, and unsettled transaction calls against the TikTok sandbox once finance credentials are provisioned; capture request/response samples for release notes.)*
