## ADDED Requirements
### Requirement: PdfService downloads remote PDFs
PdfService MUST fetch a PDF document from a caller-provided HTTPS URL before performing any processing.

#### Scenario: Successful download
- **GIVEN** PdfService receives `sourceUrl='https://cdn.example.com/invoice.pdf'`
- **AND** the URL returns a `200 OK` response with `Content-Type: application/pdf`
- **WHEN** `resizeFromUrl` is invoked
- **THEN** the service streams the PDF into memory or a temporary file
- **AND** it verifies the content type and signature before continuing to resize.

#### Scenario: Invalid source rejected
- **WHEN** `resizeFromUrl` is invoked with an empty `sourceUrl` or a URL that does not return a PDF
- **THEN** PdfService aborts processing
- **AND** it returns an error explaining that the source document is unavailable or not a PDF.

### Requirement: PdfService resizes PDF pages
PdfService MUST resize every page of the downloaded PDF according to caller-supplied dimensions or scaling instructions.

#### Scenario: Resize to explicit dimensions
- **GIVEN** PdfService receives `targetPageSize={ width: 210, height: 297 }` (millimeters) and `dpi=300`
- **WHEN** `resizeFromUrl` completes
- **THEN** each page in the resulting PDF is rendered at 210mm x 297mm
- **AND** page content is proportionally scaled to fit within the target size without cropping.

#### Scenario: Resize by scale percentage
- **GIVEN** PdfService receives `scale=0.5` instead of explicit dimensions
- **WHEN** `resizeFromUrl` completes
- **THEN** each page is rendered at 50% of the original width and height
- **AND** the service preserves the aspect ratio.

### Requirement: PdfService returns resized output metadata
PdfService MUST return the resized PDF payload and essential metadata for downstream automation.

#### Scenario: Resized payload returned
- **WHEN** `resizeFromUrl` succeeds
- **THEN** it returns an object containing the binary buffer (or stream) of the resized PDF
- **AND** it includes metadata with the final page size, DPI, page count, and original file size.

#### Scenario: Failure surfaces diagnostic metadata
- **WHEN** `resizeFromUrl` fails during download or resizing
- **THEN** PdfService returns an error payload that includes the failure stage (`download`, `resize`, or `output`)
- **AND** it preserves the underlying error message for logging and user feedback.
