## ADDED Requirements
### Requirement: TikTok Shop node exposes Fulfillments group
TikTok Shop node MUST present a `Fulfillments` group in the UI with operations for package creation, shipping, and document retrieval.

#### Scenario: Fulfillments group lists package operations
- **WHEN** a workflow configures the TikTok Shop node
- **THEN** the resource selector includes `Fulfillments`
- **AND** selecting `Fulfillments` reveals operations `createPackages`, `shipPackage`, and `getPackageShippingDocument` with descriptive labels and help text explaining required inputs and document type options.

### Requirement: Fulfillments group delegates to FulfillmentsService
TikTok Shop Fulfillments operations MUST instantiate FulfillmentsService and call the matching helper with node inputs.

#### Scenario: Node creates packages via service
- **GIVEN** the node executes with group `Fulfillments` and operation `createPackages`
- **AND** provides credentials, optional proxy, non-empty `shopCipher`, required JSON body, and optional `accessToken`
- **WHEN** the node runs
- **THEN** it constructs FulfillmentsService with the provided credentials and proxy
- **AND** it calls `createPackages({ shopCipher, body })`
- **AND** it forwards the JSON response to the node output.

#### Scenario: Node ships package via service
- **GIVEN** the node executes with group `Fulfillments` and operation `shipPackage`
- **AND** provides credentials, optional proxy, non-empty `packageId`, non-empty `shopCipher`, required JSON body, and optional `accessToken`
- **WHEN** the node runs
- **THEN** it constructs FulfillmentsService
- **AND** it calls `shipPackage({ packageId, shopCipher, body })`
- **AND** it forwards the JSON response to the node output.

#### Scenario: Node gets shipping documents via service
- **GIVEN** the node executes with group `Fulfillments` and operation `getPackageShippingDocument`
- **AND** provides credentials, optional proxy, non-empty `packageId`, non-empty `shopCipher`, optional `documentType`, and optional `accessToken`
- **WHEN** the node runs
- **THEN** it constructs FulfillmentsService
- **AND** it calls `getPackageShippingDocument({ packageId, shopCipher, documentType })`
- **AND** it forwards the response stream or JSON to the node output consistent with service behavior.

### Requirement: Fulfillments group validates required inputs
TikTok Shop Fulfillments operations MUST block execution when required parameters are missing or blank.

#### Scenario: Missing packageId aborts ship request
- **WHEN** the node executes `shipPackage` without a non-empty `packageId`
- **THEN** it throws a validation error before calling FulfillmentsService.

#### Scenario: Missing shopCipher aborts fulfillments operations
- **WHEN** the node executes a Fulfillments operation without a non-empty `shopCipher`
- **THEN** it throws a validation error before calling FulfillmentsService.

#### Scenario: Missing body aborts create and ship requests
- **WHEN** the node executes `createPackages` or `shipPackage` without a non-empty JSON body
- **THEN** it throws a validation error before calling FulfillmentsService.

#### Scenario: Invalid document type rejected
- **WHEN** the node executes `getPackageShippingDocument` with a `documentType` outside TikTok-supported values `SHIPPING_LABEL`, `PACKING_SLIP`, `SHIPPING_LABEL_AND_PACKING_SLIP`, `SHIPPING_LABEL_PICTURE`, `HAZMAT_LABEL`, or `INVOICE_LABEL`
- **THEN** it throws a validation error before calling FulfillmentsService.