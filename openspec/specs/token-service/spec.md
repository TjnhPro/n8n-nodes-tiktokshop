# token-service Specification

## Purpose
TBD - created by archiving change update-token-service-auth-endpoints. Update Purpose after archive.
## Requirements
### Requirement: Access Token Exchange
TokenService MUST request access and refresh tokens using the TikTok Shop auth service `accessToken` endpoint.

#### Scenario: Exchange authorized code for tokens
- **GIVEN** TokenService receives `app_key`, `app_secret`, and `auth_code`
- **WHEN** it calls the access token flow
- **THEN** it issues an HTTP GET to `https://auth.tiktok-shops.com/api/v2/token/get`
- **AND** the query string includes `app_key`, `app_secret`, `auth_code`, and `grant_type=authorized_code`
- **AND** it returns the raw response body from the auth service

### Requirement: Refresh Token Exchange
TokenService MUST refresh expiring access tokens through the TikTok Shop auth service `refreshToken` endpoint.

#### Scenario: Refresh access token
- **GIVEN** TokenService holds a `refresh_token`, `app_key`, and `app_secret`
- **WHEN** it calls the refresh token flow
- **THEN** it issues an HTTP GET to `https://auth.tiktok-shops.com/api/v2/token/refresh`
- **AND** the query string includes `app_key`, `app_secret`, `refresh_token`, and `grant_type=refresh_token`
- **AND** it returns the raw response body from the auth service

### Requirement: TikTok Shop Node Token Flows
TikTok Shop node MUST expose TokenService flows without relying on stored credentials.

#### Scenario: Workflow retrieves an access token
- **GIVEN** a workflow executes the TikTok Shop node under the `Token` group with the `accessToken` operation
- **WHEN** the node runs
- **THEN** it calls `TokenService.refreshToken` with node parameters for `app_key`, `app_secret`, `refresh_token`, optional `proxy`
- **AND** it emits the complete raw response body from TokenService in the node output

#### Scenario: Workflow refreshes an access token
- **GIVEN** a workflow executes the TikTok Shop node under the `Token` group with the `refreshToken` operation
- **WHEN** the node runs
- **THEN** it calls `TokenService.accessToken` with node parameters for `app_key`, `app_secret`, `auth_code`, optional `proxy`
- **AND** it emits the complete raw response body from TokenService in the node output

### Requirement: Proxy Selection
TokenService MUST honor the configured proxy value when connecting to the auth service.

#### Scenario: Empty proxy uses direct connection
- **WHEN** the proxy value is empty or whitespace
- **THEN** TokenService sends token requests without using any proxy

#### Scenario: HTTP proxy detected
- **GIVEN** the proxy value starts with `http`
- **WHEN** TokenService sends token requests
- **THEN** it routes them through an HTTP proxy agent based on that value

#### Scenario: SOCKS5 proxy detected
- **GIVEN** the proxy value starts with `socks5`
- **WHEN** TokenService sends token requests
- **THEN** it routes them through a SOCKS5 proxy agent based on that value

