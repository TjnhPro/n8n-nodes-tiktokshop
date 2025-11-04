## 1. Token Service Updates
- [x] 1.1 Set the auth host to `https://auth.tiktok-shops.com` for all token requests.
- [x] 1.2 Implement the authorized code exchange call to `/api/v2/token/get` using `app_key`, `app_secret`, `auth_code`, and `grant_type=authorized_code`.
- [x] 1.3 Implement the refresh token call to `/api/v2/token/refresh` using `app_key`, `app_secret`, `refresh_token`, and `grant_type=refresh_token`.

## 2. Proxy Handling
- [x] 2.1 Add a proxy input that routes empty values directly, `http*` values through an HTTP proxy, and `socks5*` values through a SOCKS5 proxy agent.
- [x] 2.2 Cover proxy selection logic with unit tests.

## 3. Validation
- [x] 3.1 Update or add tests covering both token flows and ensure `openspec validate update-token-service-auth-endpoints --strict` passes.

## 4. TikTok Shop Node
- [x] 4.1 Implement the TikTok Shop node with `accessToken` and `refreshToken` under the `Token` group using direct parameters for `app_key`, `app_secret`, `auth_code` or `refresh_token`, and `proxy`.
- [x] 4.2 Remove credential dependencies from the node and ensure proxy handling is retained.
- [x] 4.3 Cover the node execution paths with unit tests verifying TokenService usage with direct parameters.
