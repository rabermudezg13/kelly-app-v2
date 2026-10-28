# Drug Screening handwritten name recognition

Scanner (recruiter Onboarding Tracker) reads the first photo after camera/gallery
selection, or after switching to Drug Screening. Existing PDF creation stays in
the browser, with original photos as pages. OCR is a naming suggestion, not a
medical interpretation or identification decision. The name remains editable and
requires the user's review checkbox before downloading Name Drug Screening.pdf.
Education/RFPI retain their existing names and manual flows.

## Data path
- Browser Tesseract locates printed Kelly Candidate Name, adjacent Candidate ID
  and Reason for Test boundaries within the top half of the image. If boundaries
  are missing it does not guess/upload a region: manual entry remains available.
- Only the resulting JPEG name strip crosses the iframe/parent message bridge.
  Parent verifies same origin and exact iframe source, limits size, and uses the
  existing authenticated Axios client. No tokens are passed to the iframe.
- POST /api/document-ocr/drug-screen-name accepts at most 256 KiB, JPEG/PNG strips
  80–1800px wide, 16–320px high, aspect ratio 2–30. It rejects whole-page images,
  PDFs, unknown content types and inactive/unauthorized accounts.
- Request body is bounded in memory (10-second read deadline). Single inference
  per API process; busy returns 429. Short-lived Python worker receives bytes via
  stdin, returns JSON through a pipe and exits. 60-second process timeout kills
  and reaps it. No UploadFile, temporary image files, document DB/storage writes
  or image/name logging. Response Cache-Control no-store. No third-party image API.
- Original photos/PDF stay in browser. Closing/reloading releases that state.
  Browser downloads are intentionally saved to the user's computer. Clearing
  photos invalidates the OCR generation, preview, review and prior download URL.
  Editing the name prevents a late OCR response from replacing the correction.

## Model / operation
Python PyTorch CPU + Hugging Face Transformers, pinned in requirements.txt.
Microsoft TrOCR base handwritten, MIT model license:
https://huggingface.co/microsoft/trocr-base-handwritten
Revision eaacaf452b06415df8f10bb6fad3a4c11e609406, safetensors only.
A startup background thread prepares STATIC model assets for PostgreSQL services
at /app/.cache/drug-name-model (override DRUG_OCR_MODEL_DIR). Harness SQLite does
not download anything. Static model cache is not candidate/document storage.
Inference is local_files_only/offline, max 48 output tokens, 3 beams, 2 CPU threads;
process exit releases model/image memory after each request. Initial deployment
needs network/disk for weights. Until ready or on failure, API returns 503 and
Scanner permits manual entry/retry. No effect on backend /health availability.

This uses free OCR software/model, not a paid recognition API. Existing hosting
CPU/RAM/disk usage may affect the hosting bill. Production resource review before
implementation: 24 GB memory limit, ~0.19 GB baseline, existing single replica.
No service size/plan changes or new paid services requested.

## Validation / limits
Tests cover authentication, crop bounds/types/size, busy/preparing/timeout and
lock release, output-name validation, local label bounds and filename safety.
Model quality trial: provided scan rendered/read locally, with automatic crop
matching the reviewed name result; no candidate content committed or logged.
Synthetic browser form verifies the full local bridge → Python → name-field path.
Native live mobile camera/Windows require device testing; browser camera picker
and gallery share the same handler. Tilt, glare, missing fields and illegible
handwriting may need a retake or manual entry. No inferred completion/medical
results, no account/candidate updates, no NHO query changes.

Deployment refs and final checks belong in memory.md and CHANGELOG.md.

## Field detection repair — 2026-10-28
The browser explicitly reads the form header with page-layout AUTO (3), then
SPARSE_TEXT (11) if needed, combining only word geometry from the same pixels.
The default worker layout could miss an adjacent printed label and suppress all
recognition. Neither layout alone must find every boundary, but the combined
result still requires the name label, right-hand field and next-row label. No
fixed/guessed crop or whole-page upload is introduced. At most two local passes,
within the existing deadline; a cancelled generation skips the retry/response.
