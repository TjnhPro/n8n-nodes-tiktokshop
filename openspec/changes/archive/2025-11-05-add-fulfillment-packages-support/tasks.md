## 1. Fulfillments Service
- [x] 1.1 Create `FulfillmentsService` extending `BaseService` with helpers for createPackages, shipPackage, and getPackageShippingDocument.
- [x] 1.2 Ensure each helper assembles headers, query params, and body arguments per endpoint contract.

## 2. TikTok Shop Node Updates
- [x] 2.1 Add a `Fulfillments` resource group exposing operations for create packages, ship package, and get shipping documents.
- [x] 2.2 Delegate each new operation to `FulfillmentsService`, reusing credential and proxy handling patterns.
- [x] 2.3 Validate required inputs (package ID, document type, body payloads) before dispatching service calls.

## 3. Documentation & Tests
- [x] 3.1 Document the new operations in node descriptions, including supported document types.
- [x] 3.2 Add or update unit tests covering service helpers and node execute flows for the new operations.
