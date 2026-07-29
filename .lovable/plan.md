## Goal

Upload a manufacturer's monthly invoice/commission report (xlsx or csv), have AI normalize it into invoice-level records, dedupe against what's already stored, and show which invoices have shipped but not been paid a commission — matched to your order tracking by **invoice number**.

Starting with Berridge and Soprema; the ingestion is built so a third manufacturer only needs a new mapping profile, not new code.

## What the two files told us

| | Berridge | Soprema |
|---|---|---|
| Sheets | 1, single month | 4 monthly sheets + a blank template |
| Header | at the **bottom** (row 238), totals below it | row 5, title block above |
| Grain | one row per invoice/credit memo | one row per **product line**, many per invoice |
| Invoice ID | `DAL-INV-0047512`, `SA-CM-0029390` | `2232710` |
| Commission | single `%` column | per-line rate (1.5% / 5% / 7%) |
| Paid signal | Base = 0 and blank rate → not commissioned | every listed line is commissioned |
| Negatives | credit memos | reversal lines |

So the parser cannot assume a header row position, a single sheet, or one row per invoice. Soprema rows get rolled up to the invoice grain (sum of sales and commission across lines) with the product lines kept as detail.

## Plan

### 1. Data model

- `manufacturers` — Berridge, Soprema (+ the other six later); holds the saved column-mapping profile.
- `commission_reports` — one row per uploaded file/sheet: manufacturer, period, filename, totals, row counts, status.
- `commission_invoices` — the deduped invoice grain. Key: `(manufacturer_id, invoice_number)`. Fields: invoice date, customer name, order/project reference, sales amount, commission base, rate, commission amount, document type (invoice / credit memo), `commission_paid` (from the report), plus a manual `marked_received` flag and date you set in the app.
- `commission_invoice_lines` — Soprema-style product detail, linked to the invoice.
- `commission_invoice_history` — audit log: what changed, old → new, which report and when.
- `tracked_orders` — your order tracking, keyed by invoice number, with a shipped flag/date. Seeded by spreadsheet import, then editable in the app (see step 5).

All tables owned by the signed-in user with RLS.

### 2. Upload + AI extraction

An edge function receives the file, converts every sheet to a text grid, and sends a sample to the AI to identify: which sheet(s) hold data, where the header row is (top *or* bottom), which columns map to invoice number / date / customer / order-or-project ref / amount / base / rate / commission, and whether the grain is invoice or line item. You confirm the detected mapping once per manufacturer; it's saved and reused so subsequent months import without AI re-inference (with a re-check if the layout shifts).

Deterministic code then does the actual parsing — AI decides the mapping, not the numbers, so totals stay exact. Validation: parsed commission total is compared against the file's own total row (Berridge's $28,400.59) and flagged if it doesn't tie.

### 3. Dedupe, change detection, audit

For each parsed invoice, look up `(manufacturer, invoice_number)`:
- **New** → insert.
- **Changed** (amount, base, rate, commission, or paid status differs) → update and write a history row.
- **Unchanged** → skip.

So re-uploading Soprema's workbook with Jan–Apr in it after you already loaded Jan–Mar only brings in April plus any revisions. Credit memos and negative reversal lines are stored as their own records and netted against the invoice grain rather than treated as new orders.

### 4. Reconciliation

Match on invoice number, normalized (trim, case, strip leading zeros) to survive `2232710` vs `02232710`. Three buckets:
- **Owed** — shipped in your tracking and present in the report, but no commission paid (Berridge base = 0) or not yet marked received.
- **Paid** — commission on the report and marked received.
- **Unmatched** — an invoice on the report with no order in your tracking, or a shipped order that has never appeared on a report. Both need eyes, so both are listed.

### 5. Getting your order tracking in

Since it currently lives in the old browser-based database your associate keys into, step one is a **spreadsheet import**: export whatever that system gives you, upload it through the same ingestion pipeline (invoice number + shipped date are the only required columns), and it seeds `tracked_orders`. After that you can add and edit orders directly in the app so the manual double-entry goes away. If that system has an export or API later, we can automate the refresh.

### 6. UI — `/commissions`

- **Upload** — pick manufacturer, drop the file, see the detected mapping, preview new vs changed vs unchanged counts before committing.
- **Outstanding** — the money-owed view: filter by manufacturer, customer, period; totals at top; checkbox to mark commission received.
- **Invoices** — all stored invoices, searchable by invoice number.
- **History** — the audit log.

## Technical notes

- xlsx parsing via SheetJS in a Supabase edge function; AI mapping via Lovable AI Gateway (Gemini Flash) — no API key needed from you.
- File itself stored in a private storage bucket so any import can be re-run or audited.
- Amounts stored as numeric, never floats-in-strings; commission recomputed from base × rate and compared to the file's stated amount, discrepancies flagged rather than silently overwritten.
- MCP tools for outstanding commissions get added after the tables exist, so your AI assistants can query real commission data instead of the demo dataset.

## Not in this pass

The remaining six manufacturers' formats, automated pull from the legacy database, and commission forecasting.
