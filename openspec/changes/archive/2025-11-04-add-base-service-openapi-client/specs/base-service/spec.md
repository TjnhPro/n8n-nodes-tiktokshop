## ADDED Requirements
### Requirement: Base OpenAPI Host
BaseService MUST send all TikTok Shop OpenAPI requests to `https://open-api.tiktokglobalshop.com`.

#### Scenario: Base URL applied to requests
- **WHEN** BaseService issues a request to any TikTok Shop path
- **THEN** the HTTP client uses `https://open-api.tiktokglobalshop.com` as the base URL
- **AND** the original request path is appended to that base URL without altering the path segments.

### Requirement: Query Signing Parameters
BaseService MUST append the TikTok signing parameters (`app_key`, `timestamp`, `sign`) to every outbound request.

#### Scenario: Signed request includes canonical parameters
- **GIVEN** BaseService receives `appKey`, `appSecret`, optional query params, and an optional JSON body for the `/orders/search` path
- **WHEN** it prepares the outbound request
- **THEN** the query string includes `app_key={appKey}`
- **AND** it includes `timestamp` equal to the Unix epoch seconds at dispatch time
- **AND** it computes `sign` as a lowercase hex HMAC-SHA256 digest using `appSecret` as the key and the canonical string `appSecret + '/orders/search' + canonicalQuery + canonicalBody + appSecret`
- **AND** `canonicalQuery` concatenates each query parameter name and value in ascending name order, excluding `sign` and `access_token`
- **AND** `canonicalBody` is the raw JSON payload when the request has a body, otherwise an empty string
- **AND** the computed `sign` value is appended to the query string.

### Requirement: Access Token Header
BaseService MUST propagate the TikTok Shop access token via the `x-tts-access-token` header when available.

#### Scenario: Access token header applied
- **GIVEN** BaseService receives `accessToken='abc123'`
- **WHEN** it prepares the HTTP request
- **THEN** the outbound headers include `x-tts-access-token: abc123`.

#### Scenario: Header omitted when token missing
- **GIVEN** BaseService does not receive an access token
- **WHEN** it prepares the HTTP request
- **THEN** the outbound headers do not include `x-tts-access-token`.

### Requirement: Proxy Selection
BaseService MUST reuse the proxy routing rules defined for TokenService so outbound OpenAPI calls honor proxy configuration.

#### Scenario: Direct connection when proxy empty
- **WHEN** the proxy value is empty or whitespace
- **THEN** BaseService sends requests without configuring an HTTP agent.

#### Scenario: HTTP proxy detected
- **GIVEN** the proxy value starts with `http`
- **WHEN** BaseService sends requests
- **THEN** it routes them through an HTTP proxy agent for that value.

#### Scenario: SOCKS5 proxy detected
- **GIVEN** the proxy value starts with `socks5`
- **WHEN** BaseService sends requests
- **THEN** it routes them through a SOCKS5 proxy agent for that value.

### Requirement: Legacy Request Parameters
BaseService MUST expose a `requestLegacy` helper that ensures TikTok legacy endpoints receive the required query fields.

#### Scenario: Legacy request adds required parameters
- **GIVEN** `requestLegacy` receives `shopId='123'`, optional query `{ status: 'pending' }`, and an access token
- **WHEN** it dispatches the HTTP request
- **THEN** the query includes `shop_id=123`
- **AND** it includes `version=202212` unless a different version is explicitly provided
- **AND** it appends `access_token` using the provided or default access token value
- **AND** it forwards the call to `BaseService.request` with the enriched query.

#### Scenario: Legacy request rejects missing shopId
- **WHEN** `requestLegacy` is called without a non-empty `shopId`
- **THEN** it throws an error before issuing any HTTP request.
