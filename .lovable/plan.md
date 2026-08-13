# Commission Imports: simplify to data entry automation

Refocus the page on getting manufacturer report data into the database accurately, and drop the outstanding/payment-tracking layer.

## What changes

- Page renamed to **Commission Imports** (heading, sidebar nav label, subtitle rewritten to describe automated data entry).
- Tabs become: **Import report**, **Order tracking** (unchanged), **History & audit**.
- The **Outstanding** tab is removed entirely (owed / received / gaps views).
- The **mark received** action is removed — no manual paid/received toggling in the UI.
- Import stays as-is: upload file, AI infers layout, review, commit with dedupe + audit logging.
- History & audit stays: import tie-out results per report plus the change log.

## What is not touched

- Database schema and the `commission-ingest` edge function stay unchanged. Existing columns like `marked_received` simply go unused rather than being dropped, so no data loss and no migration.
- Order tracking tab and its importer behave exactly as today.

## Technical notes

- `src/pages/CommissionsPage.tsx`: remove the Outstanding tab/trigger, default tab becomes `upload`, update title/description.
- Delete `src/components/commissions/OutstandingTab.tsx`.
- `src/hooks/useCommissions.ts`: remove `useMarkReceived`; keep `useCommissionInvoices` (History uses invoice joins) and the rest.
- `src/components/AppLayout.tsx`: nav label -> "Commission Imports"; route path `/commissions` unchanged.
- Verify no remaining imports of `OutstandingTab` or `useMarkReceived` after removal.
