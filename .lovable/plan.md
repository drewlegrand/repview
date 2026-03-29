

## Plan: Auto-Create Orders from Awarded Opportunities & Order Stage Kanban

### Summary
When an opportunity is marked **Awarded** with forecast status **Closed Won**, an Order record is automatically created. The Order Stages columns are removed from the Opportunities Kanban. Instead, the Orders page gets its own Kanban view with Order Stage columns.

### Changes

**1. Add "Forecast Status" field to Opportunity**
- `src/data/demo-data.ts`: Add `ForecastStatus` type (`'Open' | 'Closed Won' | 'Closed Lost'`) and `forecastStatus` field to the `Opportunity` interface. Default existing Awarded opps to `'Closed Won'`, others to `'Open'`.

**2. Remove `orderStage` from Opportunity model**
- `src/data/demo-data.ts`: Remove `OrderStage` type and `orderStage` field from `Opportunity`.
- Add `orderStage` field to the existing `Order` interface using the new `OrderStage` type (`'Pending' | 'Booked' | 'Shipped'`), and an `opportunityId` field linking back to the source opportunity.
- Update demo orders to include `orderStage` and `opportunityId`.

**3. Move order management into the app store**
- `src/stores/app-store.ts`: Add `orders` state (initialized from demo data), `addOrder`, `updateOrder`, and `moveOrderStage` actions. Add auto-order-creation logic: when `updateOpportunity` sets `stage = 'Awarded'` and `forecastStatus = 'Closed Won'`, auto-generate an Order record with `orderStage: 'Pending'`.

**4. Simplify Opportunities Kanban — remove Order Stage columns**
- `src/pages/OpportunitiesPage.tsx`: Remove the Order Stage columns, the `showOrderStages` toggle button, and all drag-to-order-stage logic. The Kanban shows only the 5 opportunity stages (+ custom).

**5. Add Forecast Status to Opportunity Edit Dialog**
- `src/components/OpportunityEditDialog.tsx`: Remove the Order Stage selector. Add a **Forecast Status** dropdown. Show it always (or conditionally). When saving with stage=Awarded + forecastStatus=Closed Won, trigger auto order creation via the store.

**6. Add Kanban view to Orders page**
- `src/pages/OrdersPage.tsx`: Add a List/Board toggle (same pattern as Opportunities). Board view shows 3 columns: Pending, Booked, Shipped. Use `@hello-pangea/dnd` for drag-and-drop between order stages. Pull orders from the app store instead of static demo data.

**7. Clean up references**
- Remove `getOrderStageVariant` usage from Opportunities-related files.
- Update `OpportunityDetailPage` to remove order stage references, add forecast status display.
- Update `NewOpportunityDialog` if it has order stage references.

### Technical Details
- The `Order` interface gains `orderStage: OrderStage` and `opportunityId?: string`.
- Auto-generated orders derive their `accountName`, `manufacturerLine`, `total`, and `project` from the source opportunity.
- The order number is auto-generated (e.g., `ORD-2026-XXXX`).
- Existing static demo orders keep their current `status` field (for detailed tracking) while also getting the new `orderStage` for Kanban placement.

