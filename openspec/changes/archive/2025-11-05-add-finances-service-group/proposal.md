## Why
Finance and settlement visibility is missing from the TikTok Shop node, forcing operators to chain HTTP Request nodes to review statements, reconcile payouts, and monitor unsettled orders. This breaks the built-in credential, signing, and proxy flow while increasing workflow complexity.

## What Changes
- Introduce a FinancesService that extends BaseService and centralizes TikTok Shop finance endpoints for statements, payments, withdrawals, and transaction lookups.
- Expose a Finances group on the TikTok Shop node with six read operations that surface those finance helpers with pagination, sorting, and filtering controls.
- Enforce TikTok constraints such as page size limits, supported withdrawal types, and required sort fields so invalid requests are rejected before execution.

## Impact
- n8n users can reconcile settlements, audit payouts, and monitor unsettled transactions without leaving the TikTok Shop node.
- Shared signing, proxy selection, and access token propagation continue to flow through BaseService for finance calls.
- Documentation, release notes, and workflow examples must highlight the new Finances group and its statement, payment, withdrawal, and transaction inspection capabilities.
