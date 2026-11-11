# Scanner OCR removed — 2026-11-11

The owner requested removal because of memory use and insufficient reliability.
The former Drug Screening handwriting reader is no longer a feature.

- Scanner uses manual candidate names and preserves Name Drug Screening.pdf.
- Camera/gallery, multiple photos, local PDF generation/download/print and Education/RFPI remain.
- No OCR script/worker starts in Scanner; no name crop or document is sent to the backend.
- The parent iframe no longer relays OCR messages or calls an OCR API.
- The Python OCR endpoint, weight download/preparation, model process and startup/shutdown hooks are removed.
- Torch, Transformers and SentencePiece are removed from backend requirements. Pillow stays for existing PDF/QR image support.
- Redeploying the backend replaces the previous container, ending its worker and removing its ephemeral model cache. No candidate documents or database records are deleted.
- Smart Capture is a separate, browser-local tool and is unchanged. Text Talents is unchanged.

Earlier implementation details and measured trials remain in CHANGELOG.md and memory.md as historical records, not current operating instructions.

Validation: manual filename/PDF behavior, backend health with OCR route404 and no heavy-reader imports, full harness, synthetic browser download and production rollout checks. Refer to the current memory/changelog entry for actual results.
