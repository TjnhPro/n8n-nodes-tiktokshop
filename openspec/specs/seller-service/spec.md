# seller-service Specification

## Purpose
TBD - created by archiving change add-seller-service-node-group. Update Purpose after archive.
## Requirements
### Requirement: Seller Service inherits BaseService
SellerService MUST extend BaseService so seller APIs reuse canonical request signing, proxy resolution, and error handling.

#### Scenario: SellerService reuses BaseService request flow
- **GIVEN** SellerService is constructed with `appKey`, `appSecret`, optional `accessToken`, and optional `proxy`
- **WHEN** it calls seller endpoints without overriding the base URL
- **THEN** each call delegates to `BaseService.request`
- **AND** the query string includes `app_key`, `timestamp`, and `sign` computed with the BaseService canonical algorithm
- **AND** the `x-tts-access-token` header is present when an access token is available
- **AND** the request honors the resolved proxy configuration.

### Requirement: SellerService fetches active shops
SellerService MUST expose a helper that retrieves active shops by calling `/seller/202309/shops`.

#### Scenario: SellerService fetches active shops with canonical signing
- **GIVEN** SellerService is constructed with `appKey`, `appSecret`, optional `accessToken`, and optional `proxy`
- **WHEN** `getActiveShops` issues a request to `/seller/202309/shops`
- **THEN** it delegates the call to `BaseService.request` using method `GET`
- **AND** it sets `Content-Type: application/json`
- **AND** the query string includes `app_key`, `timestamp`, and `sign`
- **AND** `sign` is computed with the BaseService canonical algorithm
- **AND** the `x-tts-access-token` header is present when an access token is provided or defaults from construction
- **AND** the resolved proxy configuration is passed to the HTTP client.

### Requirement: SellerService fetches seller permissions
SellerService MUST expose a helper that retrieves seller permissions by calling `/seller/202309/permissions`.

#### Scenario: SellerService fetches permissions with canonical signing
- **GIVEN** SellerService is constructed with `appKey`, `appSecret`, optional `accessToken`, and optional `proxy`
- **WHEN** `getSellerPermissions` issues a request to `/seller/202309/permissions`
- **THEN** it delegates the call to `BaseService.request` using method `GET`
- **AND** it sets `Content-Type: application/json`
- **AND** the query string includes `app_key`, `timestamp`, and `sign`
- **AND** `sign` is computed with the BaseService canonical algorithm
- **AND** the `x-tts-access-token` header is present when an access token is provided or defaults from construction
- **AND** the resolved proxy configuration is passed to the HTTP client.

### Requirement: TikTok Shop node exposes Seller group
TikTok Shop node MUST expose a `Seller` group that surfaces seller active shop and permission retrieval via SellerService.

#### Scenario: Node fetches active shops
- **GIVEN** a workflow executes the TikTok Shop node under the `Seller` group with the `getActiveShops` operation
- **AND** provides `app_key`, `app_secret`, optional `access_token`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it instantiates SellerService with the provided credentials
- **AND** it calls `getActiveShops`
- **AND** it returns the raw JSON payload, including any active shop list, to the workflow output.

#### Scenario: Node fetches seller permissions
- **GIVEN** a workflow executes the TikTok Shop node under the `Seller` group with the `getSellerPermissions` operation
- **AND** provides `app_key`, `app_secret`, optional `access_token`, and optional `proxy`
- **WHEN** the node runs
- **THEN** it instantiates SellerService with the provided credentials
- **AND** it calls `getSellerPermissions`
- **AND** it returns the raw JSON payload, including permission details, to the workflow output.

#### Scenario: Node validates required seller inputs
- **WHEN** the node executes the `Seller` group without a non-empty `app_key` or `app_secret`
- **THEN** it throws a validation error before issuing any SellerService request.

