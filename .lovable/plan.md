## What went wrong

The upload itself worked — the file reached storage fine. The failure is in the AI layout-detection step of the `commission-ingest` function. Confirmed from the function logs:

- The model returned a **flat** object: `{headerRow: 237, dataStartRow: 1, dataEndRow: 236, grain: "invoice", invoiceNumber: 1, invoiceDate: 0, customerName: 2, ...}`
- The code requires a **nested** shape: `{..., periodLabel, columns: {invoiceNumber, ...}}`
- Validation rejected it (`periodLabel` required, `columns` required) and the function returned 500: "No object generated: response did not match schema."

Notably, the model's *answer was correct* for Berridge (header at row 237, data rows 1–236, invoice grain) — only the response shape was wrong.

## The fix

**1. Use a flat schema for the AI call** (`supabase/functions/commission-ingest/index.ts`)

Ask the model for a single-level object — `headerRow`, `dataStartRow`, `dataEndRow`, `grain`, `periodLabel`, and each column index as a top-level key. Flat schemas are far more reliable across models than nested ones. Make every optional field `.nullable().optional()` with defaults, so a missing key never fails the whole call. Convert the flat result into the internal nested `Mapping` shape after validation, so `parse.ts` and the frontend stay unchanged.

**2. Add a fallback so detection can't hard-fail**

- Retry once with a stricter, example-shaped prompt if the first call fails.
- If that also fails, fall back to a deterministic heuristic (scan for the row whose cells look most like column labels — "invoice", "date", "customer", "commission" — and bound the data rows around it) and return the mapping flagged as `lowConfidence`.
- Since the Upload tab already lets you correct the mapping before committing, a heuristic guess is still usable rather than a dead end.

**3. Return real errors to the UI**

Catch detection failures and return a clear message ("Couldn't auto-detect the layout — review the column mapping below") with the heuristic mapping attached, instead of a bare 500.

**4. Sanity-clamp the mapping**

Clamp `headerRow`/`dataStartRow`/`dataEndRow` to the grid bounds and swap them if the model reports the header below the data (Berridge's bottom-header layout), so downstream parsing is safe regardless of what comes back.

## Verify

Re-run analyze on the Berridge file end-to-end from the Commissions page and confirm: mapping detected, ~236 rows parsed, parsed total shown against the report's stated total, then commit. Then re-check the Soprema multi-sheet file to make sure the flat schema didn't regress line-grain detection.

## Technical notes

- No database or frontend changes required; the fix is contained in the edge function's `detectMapping` and its schema.
- Model stays `google/gemini-3.6-flash`; the issue is schema shape, not model capability.
