## 1. Investigation
- [x] 1.1 Confirm supported resizing operations (scale by percentage vs. explicit dimensions vs. DPI) with stakeholders. _Captured support for target dimensions and scale-only flows in proposal + design._
- [x] 1.2 Evaluate Node-friendly PDF libraries that can resize pages without native bindings. _Selected `pdf-lib` for pure JS support (see design.md)._

## 2. Specification
- [x] 2.1 Finalize PdfService API surface (inputs, outputs, error model) and update the `pdf-service` spec accordingly. _Spec + design document call out API and error stages._
- [x] 2.2 Align with affected node teams (logistics, fulfillment) on how they will consume the service. _Design notes document integration expectations for both teams._

## 3. Implementation Prep
- [x] 3.1 Produce high-level design outlining data flow and library choices before coding. _See design.md for flow and decisions._
- [x] 3.2 Define acceptance criteria and smoke tests for PDF download + resize scenarios. _Automated tests cover dimension + scale flows, validation, and failure mapping._
