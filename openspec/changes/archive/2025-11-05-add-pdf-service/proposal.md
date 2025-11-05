## Why
- Product team needs an internal PdfService so n8n workflows can download remote PDF assets and resize them without wiring custom scripts.
- TikTok Shop automation scenarios require standardized PDF resizing (invoices, shipping labels) before they are pushed to downstream systems.

## What Changes
- Define a new `pdf-service` capability describing how the service ingests a downloadable PDF URL, fetches the document, and produces a resized PDF payload.
- Capture resizing rules covering page dimensions, DPI normalization, and error handling when the source file is unreachable or not a PDF.
- Document integration expectations so future node work can delegate PDF processing to the service.

## Impact
- Introduces a new service capability that other nodes (logistics, fulfillment) can depend on for PDF normalization.
- Requires planning around dependency selection for PDF manipulation (e.g., `pdf-lib`, `sharp` derivatives) to meet performance and binary compatibility constraints.
- No existing specs need modification; this proposal only adds a new capability specification.
