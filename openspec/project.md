# Project Context

## Purpose
The n8n-nodes-tiktokshop package ships a production-ready n8n node that bridges the TikTok Shop OpenAPI v2 with n8n workflows. It focuses on enabling automation teams to orchestrate TikTok Shop operations without rebuilding authentication, request signing, or proxy handling.

### Primary Goals
- Manage multi-tenant credentials (app key, app secret, access token, refresh token) per workflow execution.
- Refresh access tokens proactively and persist refreshed values back to n8n credentials.
- Sign every request using TikTok's HMAC-SHA256 algorithm and consistent canonicalization.
- Provide optional proxy routing for HTTP and SOCKS5 endpoints on a per-account basis.
- Maintain stateless execution so workflows can scale horizontally inside self-hosted or cloud n8n clusters.

## Tech Stack
- TypeScript (strict mode, targeting ES2021).
- Node.js 18 LTS (matches n8n >= 1.10 runtime requirements).
- n8n node SDK (`n8n-workflow`, `n8n-core`) for node scaffolding and typed helpers.
- Axios for HTTP transport, extended with interceptors for signing, retries, and telemetry.
- `socks-proxy-agent` and `https-proxy-agent` for per-request proxy configuration.
- Node.js `crypto` module for HMAC-SHA256 signature generation.
- Jest or Vitest for unit tests with ts-jest or ts-node integration.
- Nock (or MSW) for HTTP mocking in integration tests.
- ESLint and Prettier for linting and formatting.

## Project Conventions

### Code Style
- Strict TypeScript configuration with `strict`, `noImplicitAny`, and `exactOptionalPropertyTypes`.
- 2-space indentation, single quotes, and semicolons enforced by Prettier.
- Interfaces prefixed with `I` only when interoperating with n8n types; otherwise prefer descriptive names.
- Prefer union literal types over `enum` unless a value set is shared with external APIs.
- Use guard clauses to avoid deeply nested conditionals and keep early exits visible.

### Directory Layout
- `nodes/` holds n8n node descriptors, parameter definitions, and execution handlers.
- `services/` encapsulates domain logic such as `TokenService` (token lifecycle) and `TikTokService` (signed API client).
- `credentials/` contains n8n credential type definitions for TikTok Shop authentication.
- `utils/` exposes shared helpers (signing utilities, proxy agent factory, time normalization).
- `test/` mirrors the runtime structure for unit and integration coverage.
- `scripts/` (optional) provides release, build, and validation automation.

### Architecture Patterns
- Service-oriented approach: the n8n node orchestrates high-level flow while services encapsulate business logic.
- `TokenService` manages token exchange, refresh scheduling, and credential updates.
- `TikTokService` builds canonical requests, applies signatures, and resolves proxy agents.
- Services accept dependencies (Axios instance, logger, clock service) via constructor injection to ease testing.
- Execution remains stateless; all credentials, proxy settings, and operation inputs arrive via node parameters.

### Error Handling and Logging
- Axios interceptors wrap outbound requests with retry logic (default 3 attempts with exponential backoff).
- Translate TikTok error payloads into n8n `NodeOperationError` with actionable guidance.
- Use n8n's logger utilities for structured logs; avoid `console.log`.
- Attach correlation identifiers (request ID and timestamp) to errors for observability.

### Configuration
- Environment variables prefixed with `TIKTOKSHOP_` control defaults such as timeout and retry counts.
- Proxy settings can be defined per credential record or overridden per node execution.
- Time synchronization relies on host clock accuracy; document the need for NTP on production hosts.

## Testing Strategy
- Unit tests cover token refresh flow, signature generation, proxy agent selection, and error parsing.
- Component tests exercise node execution paths within the n8n testing harness.
- Integration tests target the TikTok Shop sandbox when credentials are available, otherwise rely on mocked servers.
- Snapshot tests are discouraged; prefer explicit assertions for stability.
- CI executes `npm run lint`, `npm run typecheck`, and `npm test` on every pull request.

## Release and Git Workflow
- Branching: `main` (release), `develop` (integration), `feature/*` and `fix/*` for ongoing work.
- Conventional Commits enforced via commitlint and Husky pre-commit hooks.
- Pull requests require at least one reviewer approval and a passing CI pipeline.
- Semantic versioning for npm releases; package published under an `@n8n-extended/tiktokshop` scope (placeholder).
- GitHub Actions pipeline runs lint, test, type check, and bundles the node before publishing.

## Domain Context
- TikTok Shop OpenAPI signature: `sign = HMAC_SHA256(app_secret, app_secret + pathname + sorted(params) + body + app_secret)`.
- Exclude `sign` and `access_token` from the canonical string before hashing.
- Access tokens expire quickly; refresh with `refresh_token` ahead of expiry and persist back to n8n.
- Every request requires a `timestamp` within +/-30 seconds of TikTok's clock to be accepted.
- Respect TikTok rate limit (1000 requests per hour per app key) and back off when errors indicate throttling.

## Operational Considerations
- Handle proxy failures gracefully by surfacing actionable errors or falling back to direct requests when allowed.
- Introduce circuit breakers after consecutive signing or refresh failures to avoid infinite retry loops.
- Ensure compatibility with official n8n Docker images (Alpine base) by avoiding native bindings.
- Provide descriptive node documentation and parameter hints so users can map TikTok operations quickly.

## External Dependencies and References
- TikTok Shop OpenAPI v2 docs: https://developers.tiktok-shops.com/doc
- n8n community node guidelines: https://docs.n8n.io/integrations/creating-nodes/
- Axios, socks-proxy-agent, https-proxy-agent npm packages.
- Jest, Vitest, and Nock (or MSW) for automated testing.
