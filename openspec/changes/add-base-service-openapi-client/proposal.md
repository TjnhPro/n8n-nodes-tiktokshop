## Why
- TikTok Shop OpenAPI integrations require every request to target the global commerce host and include the canonical signing parameters (`app_key`, `timestamp`, `sign`).
- The project currently lacks a shared BaseService that encapsulates request signing, base URL management, and proxy handling for non-auth endpoints.
- Downstream node implementations need a consistent way to attach the `x-tts-access-token` header and reuse the proxy routing rules already defined for token exchanges.

## What Changes
- Introduce a BaseService that instantiates an HTTP client pointed at `https://open-api.tiktokglobalshop.com`.
- Ensure BaseService appends `app_key`, a Unix epoch `timestamp`, and a canonical HMAC-SHA256 `sign` query parameter derived from the request path, sorted parameters, and body.
- Add automatic `x-tts-access-token` header propagation when an access token is supplied, while reusing the HTTP/SOCKS5 proxy selection logic from TokenService.

## Impact
- Establishes a single entry point for TikTok Shop OpenAPI operations, reducing duplicated signing logic across future nodes.
- Keeps outbound requests compliant with TikTok's security model, preventing signature or token validation errors.
- Proxy support parity minimizes surprises for operators who already configure proxies for token flows.
