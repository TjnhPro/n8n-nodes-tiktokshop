# n8n-nodes-tiktokshop

Production-ready TikTok Shop nodes for [n8n](https://n8n.io), focused on automating seller operations, catalog, finance, order, and fulfillment workflows without rebuilding authentication, signing, or proxy logic.

## Features
- Multi-tenant credential storage (app key, app secret, access token, refresh token) per workflow execution.
- Automatic token refresh with refreshed values persisted back to the linked n8n credentials.
- Canonical request builder with TikTok Shop HMAC-SHA256 signatures applied to every outbound call.
- Seller API helpers for retrieving active shop listings and permission metadata with the same signing pipeline.
- Product catalog helpers for listing items and retrieving product detail pages without rebuilding TikTok-specific signing.
- Orders helpers for listing orders, pulling price breakdowns, attaching external OMS references, and fetching batched order details.
- Finances helpers for retrieving settlement statements, payments, withdrawals, transaction history, and unsettled orders with pagination and sorting controls.
- Logistics helpers for enumerating warehouses, delivery options, and shipping providers without implementing raw HTTP calls.
- Optional HTTP and SOCKS5 proxy routing, configurable per credential or per node execution.
- Stateless execution compatible with horizontally scaled n8n self-hosted or cloud clusters.

## Requirements
- Node.js 18 LTS or newer (matches n8n 1.10 runtime expectations).
- n8n deployment with Community Nodes enabled.
- TikTok Shop OpenAPI v2 application credentials and sandbox or production access.
- Optional: outbound proxy endpoints if requests must traverse corporate networks.

## Installation
1. Install the package in your n8n instance:
   ```bash
   npm install n8n-nodes-tiktokshop
   ```
2. Restart n8n so the new nodes are registered.
3. Enable the package under **Settings > Community Nodes** if prompted.

## Credential Setup
1. Open **Credentials > New Credential > TikTok Shop (Custom)**.
2. Provide the following values:
   - `App Key`
   - `App Secret`
   - `Access Token`
   - `Refresh Token`
   - Optional proxy host, port, protocol, username, and password.
3. Save the credential. The node will refresh tokens automatically before expiry and write the updated values back to this record.

### Environment Defaults
You can override runtime defaults by defining environment variables:
- `TIKTOKSHOP_TIMEOUT` (milliseconds)
- `TIKTOKSHOP_RETRY_COUNT`
- `TIKTOKSHOP_LOG_LEVEL`
These values are read during node initialization and applied across executions.

## Usage
1. Drag the **TikTok Shop** node into your workflow.
2. Select the credential created above.
3. Choose the group (`Token`, `Seller`, `Product`, `Orders`, `Finances`, `Logistics`, or `Fulfillments`) and select an operation (e.g. `Access Token`, `Get Order List`, `Get Statements`, `List Warehouses`).
4. Configure operation-specific parameters. Seller, Product, Orders, Finances, Logistics, and Fulfillments operations require an access token, while token operations rely on refresh or auth codes as inputs. Orders workflows require a `Shop Cipher` for order searches and external reference batches, enforce up to 100 reference objects per request, include `Order Page Size`/`Order Page Token` pagination inputs, and surface platform aliases (`SHOPIFY`, `WOOCOMMERCE`, `BIGCOMMERCE`, `MAGENTO`, `SALESFORCE_COMMERCE_CLOUD`, `CHANNEL_ADVISOR`, `AMAZON`, `ORDER_MANAGEMENT_SYSTEM`, `WAREHOUSE_MANAGEMENT_SYSTEM`, `ERP_SYSTEM`) for OMS integrations; price detail and external reference lookups also need an `Order ID`, and `Get Order Detail` accepts up to 50 TikTok order IDs. Finances workflows require a `Shop Cipher`, enforce `Finance Page Size` bounds of 1-100 (default 20), accept optional `Finance Page Token`, `Finance Sort Field`, and `Finance Sort Order` inputs, provide specialized helpers for transaction lookups by order or statement, and surface descriptive withdrawal type filters (`WITHDRAW`, `SETTLE`, `TRANSFER`, `REVERSE`). Product search, creation, and deletion require a `Shop Cipher`; search supports optional pagination plus a JSON `Payload`, creation requires a product JSON payload, deletion accepts up to 20 product IDs, and `Upload Product Image` expects binary input (`Binary Property`) plus a `Use Case`. Product detail operations also need a `Product ID`, with optional `Shop Cipher` for scoped lookups. Logistics operations require a `Shop Cipher` (except global listings) and, when applicable, a `Warehouse ID` or `Delivery Option ID` to drill into delivery options and shipping providers, while fulfillment helpers require order-specific payloads and identifiers.
5. Execute the workflow. The node signs each request, refreshes tokens when needed, and returns normalized JSON payloads ready for downstream nodes.

## Development
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/TjnhPro/n8n-nodes-tiktokshop.git
   cd n8n-nodes-tiktokshop
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
   This command builds the node in watch mode and launches n8n with hot reload.
3. Lint and type-check code before committing:
   ```bash
   npm run lint
   npm run typecheck
   ```
4. Run the test suite:
   ```bash
   npm run test
   ```
5. Produce a production build:
   ```bash
   npm run build
   ```

## Releasing
1. Update the changelog and bump the version in `package.json`.
2. Run the release pipeline:
   ```bash
   npm run release
   ```
3. Publish to npm:
   ```bash
   npm publish
   ```
4. Tag the release in GitHub and distribute updated documentation.

## Troubleshooting
- **403 rate limit**: TikTok enforces 1,000 requests per hour per app key. Reduce workflow frequency or rotate credentials.
- **Signature mismatch**: Ensure local time is synchronized (NTP) and verify that `app secret` matches the credential in the TikTok console.
- **Token refresh failures**: Confirm the stored refresh token is active and not revoked. Regenerate credentials in TikTok Shop if necessary.
- **Proxy issues**: Verify proxy host, port, and authentication. The node falls back to direct requests only when the credential allows it.

## Contributing
Issues and pull requests are welcome. Please run `npm run lint` and `npm run typecheck` before submitting contributions.

## License
MIT (c) TjnhPro

