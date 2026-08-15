# Standardize commission import columns

Replace the current internal field list with the 18 headers you supplied, in your order, so every manufacturer file maps into the same shape.

## New baseline fields (in order)
1. Type
2. Salesman #
3. Salesman
4. Manufacturer
5. Manufacturer Office
6. Customer #
7. Customer Name
8. Date
9. Invoice
10. Project #
11. Project Name
12. Product #
13. Product Name
14. Qty
15. Unit Price
16. Sales Amount
17. Commission Rate
18. Commission Amount

New vs. today: adds Salesman #, Salesman, Manufacturer, Manufacturer Office. Removes "Order reference" and "Commission base" from the baseline list — they stay available as two optional extras (shown in a collapsed "Optional extras" group) so Berridge's Order No. and taxable Commission Base still import instead of being lost.

## What changes
- Column mapping UI lists the 18 baseline fields in this exact order, with the two optional extras below them.
- Auto-detection (AI + keyword repair pass) learns synonyms for the new fields: "Rep Name"/"Salesman2" to Salesman, "Salesman No."/"Rep #" to Salesman #, "Mfr"/"Vendor" to Manufacturer, "Office"/"Branch" to Manufacturer Office, "Document No." to Invoice, "Amount" to Sales Amount, "Commisions" to Commission Amount.
- Database gains columns to store the new values, on both the invoice-level and line-level tables where relevant.
- Import summary/history keeps working unchanged; previously imported reports are untouched.

## Technical notes
- `FIELDS` in `src/components/commissions/UploadTab.tsx` and `COLUMN_KEYS` in `supabase/functions/commission-ingest/index.ts` are rewritten to the same ordered key set: `lineType, salesmanNumber, salesman, manufacturerName, manufacturerOffice, customerNumber, customerName, invoiceDate, invoiceNumber, projectReference, projectName, productCode, productName, quantity, unitPrice, salesAmount, commissionRate, commissionAmount` plus optional `orderReference, commissionBase`.
- Migration: add `salesman_number text`, `salesman text`, `manufacturer_name text`, `manufacturer_office text`, `line_type text` to `commission_invoices`; add `salesman_number text`, `salesman text` to `commission_invoice_lines`.
- `parse.ts` extracts and normalizes the new fields into the invoice/line row builders; `repairMapping` gets the new header keyword table.
- Redeploy `commission-ingest` after the migration so generated types and parser agree.
