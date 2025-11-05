## MODIFIED Requirements
### Requirement: TikTok Shop node exposes Fulfillments group
TikTok Shop node MUST present a `Fulfillments` group in the UI with operations for package creation, shipping, document retrieval, and PDF resizing.
#### Scenario: Fulfillments group lists package operations
- **WHEN** a workflow configures the TikTok Shop node
- **THEN** the resource selector includes `Fulfillments`
- **AND** selecting `Fulfillments` reveals operations `createPackages`, `shipPackage`, `getPackageShippingDocument`, and `resizePdf` with descriptive labels explaining the inputs for each operation.

### Requirement: Fulfillments group validates required inputs
TikTok Shop Fulfillments operations MUST block execution when required parameters are missing or blank.
#### Scenario: Missing source URL aborts PDF resize
- **WHEN** the node executes `resizePdf` without a non-empty `sourceUrl`
- **THEN** it throws a validation error before invoking PdfService.

## ADDED Requirements
### Requirement: Fulfillments resize operation delegates to PdfService
- Pdf resize flows MUST call PdfService to download, resize, and return the PDF binary alongside metadata using a fixed 4x6 inch page at 300 DPI.

-#### Scenario: Node resizes PDF via PdfService
- **GIVEN** the node executes with group `Fulfillments` and operation `resizePdf`
- **AND** provides a `sourceUrl`
- **WHEN** the node runs
- **THEN** it constructs PdfService with proxy-aware HTTP settings
- **AND** it calls `resizeFromUrl` passing the source URL with a fixed 4x6 inch (101.6mm x 152.4mm) target page size at 300 DPI
- **AND** it returns the PdfService metadata (`pageCount`, final page size, original size, optional DPI) in the node output JSON.

#### Scenario: Resized PDF returned as binary data
- **WHEN** `resizePdf` succeeds
- **THEN** the node attaches the resized PDF to the binary property `data` using MIME type `application/pdf`
- **AND** the node output JSON references the `data` property and the resolved file name so downstream steps can consume the PDF.
