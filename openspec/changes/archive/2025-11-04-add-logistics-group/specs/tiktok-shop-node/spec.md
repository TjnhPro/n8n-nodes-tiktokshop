## ADDED Requirements
### Requirement: TikTok Shop node exposes Logistics group
TikTok Shop node MUST present a `Logistics` group in the UI with operations that map to logistics flows.

#### Scenario: Logistics group offers warehouse and shipping operations
- **WHEN** a workflow configures the TikTok Shop node
- **THEN** the group selector includes `Logistics`
- **AND** selecting `Logistics` reveals operations `listWarehouses`, `listGlobalWarehouses`, `listWarehouseDeliveryOptions`, and `listShippingProviders` with descriptive labels and help text.

### Requirement: Logistics group delegates to LogisticsService
TikTok Shop node MUST instantiate LogisticsService with credential inputs and delegate execution to the appropriate helper.

#### Scenario: Logistics operation fetches warehouse data
- **GIVEN** the node executes with group `Logistics`, operation `listWarehouses`, non-empty `appKey`, `appSecret`, `shopCipher`, optional `warehouseQuery`, and optional `accessToken`
- **WHEN** the node runs
- **THEN** it constructs LogisticsService with the provided credentials and proxy
- **AND** it calls `listWarehouses({ shopCipher, query: warehouseQuery })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Logistics operation fetches global warehouse data
- **GIVEN** the node executes with group `Logistics`, operation `listGlobalWarehouses`, and non-empty `appKey` and `appSecret`
- **WHEN** the node runs
- **THEN** it constructs LogisticsService
- **AND** it calls `listGlobalWarehouses()`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Logistics operation fetches delivery options
- **GIVEN** the node executes with group `Logistics`, operation `listWarehouseDeliveryOptions`, non-empty `warehouseId`, non-empty `shopCipher`, and credentials
- **WHEN** the node runs
- **THEN** it constructs LogisticsService
- **AND** it calls `listWarehouseDeliveryOptions({ warehouseId, shopCipher })`
- **AND** it forwards the JSON result to the node output.

#### Scenario: Logistics operation fetches shipping providers
- **GIVEN** the node executes with group `Logistics`, operation `listShippingProviders`, non-empty `deliveryOptionId`, non-empty `shopCipher`, and credentials
- **WHEN** the node runs
- **THEN** it constructs LogisticsService
- **AND** it calls `listShippingProviders({ deliveryOptionId, shopCipher })`
- **AND** it forwards the JSON result to the node output.

### Requirement: Logistics group validates required inputs
TikTok Shop node MUST block execution of Logistics operations when required parameters are missing or blank.

#### Scenario: Missing shopCipher aborts warehouse listing
- **WHEN** the node executes `listWarehouses` without a non-empty `shopCipher`
- **THEN** it throws a validation error before calling LogisticsService.

#### Scenario: Missing shopCipher aborts delivery lookups
- **WHEN** the node executes `listWarehouseDeliveryOptions` or `listShippingProviders` without a non-empty `shopCipher`
- **THEN** it throws a validation error before calling LogisticsService.

#### Scenario: Missing warehouse or delivery ids abort delivery operations
- **WHEN** the node executes `listWarehouseDeliveryOptions` without a non-empty `warehouseId`
- **OR** it executes `listShippingProviders` without a non-empty `deliveryOptionId`
- **THEN** it throws a validation error before calling LogisticsService.
