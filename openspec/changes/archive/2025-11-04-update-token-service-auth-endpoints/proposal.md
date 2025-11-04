## Why
- TikTok Shop now requires token exchanges to be performed against `https://auth.tiktok-shops.com`, not the legacy commerce host.
- The existing TokenService does not align with the documented parameter sets for authorized code exchange or token refresh, leading to failed authentication flows.
- Customers need per-execution proxy routing that supports direct, HTTP, or SOCKS5 endpoints without manual overrides.

## What Changes
- Point TokenService exchanges to `https://auth.tiktok-shops.com/api/v2/token/get` when exchanging authorized codes and require the parameter set: `app_key`, `app_secret`, `auth_code`, `grant_type=authorized_code`.
- Add a dedicated refresh flow that calls `https://auth.tiktok-shops.com/api/v2/token/refresh` with `app_key`, `app_secret`, `refresh_token`, and `grant_type=refresh_token`.
- Introduce a proxy selector that treats blank values as direct connection, prefixes starting with `http` as HTTP proxy, and prefixes starting with `socks5` as SOCKS5 proxy.

## Impact
- Aligns TokenService with TikTok Shop OpenAPI v2 expectations, preventing authentication failures.
- Expands outbound connectivity controls to let operators respect corporate network policies.
- Minimal risk to other nodes because the TokenService encapsulates token lifecycle behavior.
