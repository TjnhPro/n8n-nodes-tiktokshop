## 1. BaseService Implementation
- [x] 1.1 Create a BaseService that configures an Axios client with the `https://open-api.tiktokglobalshop.com` base URL and default JSON headers.
- [x] 1.2 Append `app_key`, Unix epoch seconds `timestamp`, and a canonical HMAC-SHA256 `sign` query parameter to every outbound request using the provided credentials.
- [x] 1.3 Populate the `x-tts-access-token` header whenever an access token is supplied and omit it otherwise.

## 2. Proxy Handling
- [x] 2.1 Reuse or extract the existing proxy agent factory so BaseService routes requests through HTTP or SOCKS5 proxies when configured.
- [x] 2.2 Add unit tests covering direct, HTTP, and SOCKS5 proxy selections for BaseService.

## 3. Validation & Tooling
- [x] 3.1 Add unit tests that verify signature generation, timestamp inclusion, and header propagation for representative GET/POST requests.
- [x] 3.2 Run `openspec validate add-base-service-openapi-client --strict` and ensure the change passes.
