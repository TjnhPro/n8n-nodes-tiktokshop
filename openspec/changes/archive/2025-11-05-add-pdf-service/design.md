## Overview
PdfService offers a single `resizeFromUrl` entry point that downloads a remote PDF, validates the content, and renders a resized PDF using `pdf-lib`. The service keeps HTTP logic isolated so it can be reused by any n8n node that needs PDF normalization (logistics shipping labels, fulfillment invoices, etc.).

## Data Flow
1. Validate input (HTTPS URL, either `targetPageSize` or `scale`, positive dimensions/scale).
2. Download the document via an injectable Axios client with `Accept: application/pdf`.
3. Reject responses that are non-2xx, have a non-PDF content type, or fail the `%PDF` signature check.
4. Load the source PDF into `pdf-lib`, embed each page, and render into a freshly created document:
   - When `targetPageSize` is provided, convert millimeters to points, compute a proportional scale factor, and center the scaled page on the target dimensions.
   - When `scale` is provided, multiply the original page size by the scale factor and render at that size.
5. Return the resized PDF as a buffer alongside metadata (`pageCount`, final page size in mm and points, requested `dpi`, original byte size, failure stage when applicable).

## Key Decisions
- **Library**: `pdf-lib` was selected because it is pure TypeScript/JavaScript, works in Node 18 without native bindings, and provides primitives to embed and scale pages.
- **HTTPS Enforcement**: Only HTTPS URLs are allowed to avoid new proxy/security obligations. Callers that need custom routing can wrap the service and supply a pre-signed HTTPS link.
- **Error Model**: Failures surface `PdfServiceError` with a `stage` discriminator (`validate`, `download`, `resize`, `output`) so downstream callers can map to the spec’s error payload expectations.

## Consumption Notes
- Logistics and Fulfillment nodes can inject their existing Axios client (with auth/proxy settings) when they integrate PdfService, ensuring consistent outbound behavior.
- Metadata includes final page size and page count so nodes can log or branch workflows without re-opening the PDF.
- Tests cover target-dimension resizing, percentage scaling, non-PDF rejection, network failure propagation, and HTTPS enforcement (smoke criteria for acceptance).
