# Repview

Build a production-ready, modern web CRM for a manufacturer’s representative firm that sells building envelope materials such as roofing, waterproofing, skylights, insulation, cladding, and related systems. The primary users are outside sales reps, inside sales/support staff, sales managers, and admins. This is not a direct manufacturer ERP and not a direct distributor billing system; instead, it is a rep-agency CRM that manages opportunities, relationships, manufacturer lines, quoting workflows, order visibility, commissions context, activity tracking, reporting, forecasting, and bid pipeline while syncing selected data with multiple manufacturer CRMs and systems via API.

Product vision:
Create a CRM purpose-built for manufacturer reps in the construction/building products industry. It must support long sales cycles, multi-party influence (owner, architect, consultant, GC, roofer/installer, distributor, manufacturer), project/spec tracking, territory-based account ownership, manufacturer-line-specific pipeline management, historical sales and project intelligence, and strong analytics. The UI should feel like a polished modern SaaS product with a clean dashboard, left navigation, responsive layouts, advanced tables with saved views, and an AI command surface.

Core modules:
1) Authentication and roles
- Secure login and user management.
- Roles: Admin, Sales Manager, Outside Rep, Inside Sales, Read-Only Executive.
- Permission model with field-level and action-level permissions where possible.
- Territory-based access controls and manufacturer-line-specific permissions.
- Support team-level visibility with ability to restrict sensitive data such as margin assumptions, commission notes, private account notes, API sync credentials, and manufacturer-specific records.

2) Accounts and contacts
- Accounts: architects, consultants, building owners, general contractors, roofing contractors, waterproofing contractors, glazing/skylight contractors, distributors, manufacturers, specifiers, facilities owners, developers.
- Contacts linked to accounts with roles, influence level, discipline, email, phone, address, notes, preferred manufacturer lines, relationship stage, last activity, and communication history.
- Parent/child account structures and account hierarchies.
- Territory assignment and account owner assignment.
- Activity timeline for calls, meetings, emails, site visits, lunch-and-learns, submittal support, and follow-ups.

3) Manufacturer lines
- A dedicated module for manufacturer partners/lines represented by the agency.
- Each manufacturer line should have metadata: product categories, API integration status, sync rules, permissions, pricing source type, quote template rules, forecast inclusion rules, and contacts at the manufacturer.
- Opportunities, quotes, and orders must be attributable to one or more manufacturer lines.
- Ability to filter dashboards and reports by manufacturer line.

4) Opportunities and project pipeline
- Opportunity records for project-based and account-based selling.
- Fields: opportunity name, linked project, account/customer, stage, estimated close date, value, manufacturer line, product category, probability, forecast category, bid date, award date, territory, rep owner, support owner, source, competitors, spec status, installation contractor, distributor, project type, region, notes.
- Construction-oriented pipeline stages such as: Lead / Target, Specification Influence, Budget Pricing, Quoted, Bid Submitted, Negotiation, Awarded, Lost, Deferred, Closed / Installed.
- Ability for one project to contain multiple opportunities by manufacturer line or product category.
- Opportunity team collaboration and activity logging.
- Attachments/documents area for bid docs, drawings, product selections, submittals, and notes.
- Historical data availability: support at least three years of historical opportunities, activities, quotes, orders, and reporting snapshots, with import tools and archive visibility.
- Forecasting views by month/quarter/year and by manufacturer line, territory, rep, stage, and forecast category.

5) Projects / jobs
- Construction project/job object separate from opportunity when useful.
- Fields: project name, address, city/state, project type, status, estimated roof area/square footage if applicable, bid date, construction start, completion, owner, architect, consultant, GC, installer, distributor, specification notes, basis of design, competitors, linked opportunities, linked quotes, linked orders.
- Map/location support if possible.
- Searchable project database with historical records.

6) Quotes
- Quote builder inside CRM.
- Users can create quote headers and line items tied to a manufacturer line, opportunity, project, account, and optionally distributor.
- Quote statuses: Draft, Internal Review, Submitted, Revised, Accepted, Rejected, Expired.
- Track quote revisions/versioning.
- Fields for line items: SKU/product, description, quantity, unit, price, list price, target price, qualifiers, exclusions, lead time notes, freight notes, warranty notes.
- Ability to generate polished PDF quote output or printable quote view.
- Permission logic so pricing visibility and editable fields can vary by manufacturer line or user role.
- Ability to sync quote data to/from manufacturer CRM or pricing system by API where allowed.

7) Orders
- Order tracking module linked to opportunities/projects/quotes/accounts/manufacturer lines.
- Store order number, manufacturer order number, PO number, distributor, contractor, ship-to, bill-to if available, status, expected ship date, actual ship date, delivery status, invoice references if shared by manufacturer, warranty status, and notes.
- Because the rep may not own direct billing, design order visibility around external identifiers and sync data instead of full AR/AP ownership.
- Support statuses such as: Entered, Acknowledged, In Production, Shipped, Delivered, Complete, Hold, Cancelled.
- Sync updates from manufacturer systems through API connectors.
- Timeline and exception alerts for delayed or at-risk orders.

8) Reporting and dashboards
- Very strong reporting and dashboard capability is essential.
- Build executive dashboards for pipeline, forecast, won/lost, quotes outstanding, orders by status, manufacturer-line performance, activity metrics, and territory performance.
- Build saved reports with filtering, grouping, charts, pivot-style views, export to CSV, and date range comparison.
- Examples: This year open opportunities, quotes by manufacturer line, order backlog by status, top accounts by activity, projects by bid date, won opportunities by rep, forecast by quarter, historical trend over 36 months.
- Each user can save personal dashboards and admins can publish team dashboards.

9) AI features
- Include an AI assistant / command bar available globally.
- Natural language commands such as:
  * “Create a new opportunity for customer XYZ for manufacturer line ABC.”
  * “Create a report of this year’s open opportunities.”
  * “Show me delayed orders for skylights in the Northeast.”
  * “Summarize activity for Account X in the last 90 days.”
  * “Draft a follow-up email after today’s meeting.”
- AI should map prompts to actions, forms, filters, reports, summaries, and workflows with user confirmation for high-impact actions.
- Agentic workflows: create records, update fields, generate task lists, summarize opportunities, suggest next actions, detect stale deals, surface forecast risks, and build report views from plain language.
- Add an activity summary assistant on account and opportunity pages.
- Add smart recommendations like next best action, stalled-opportunity alerts, and missing-field warnings.
- Keep UX safe: confirmation modals before destructive changes or external write-backs.

10) API integrations and sync center
- Integration hub for connecting to multiple manufacturer CRMs / ERPs / pricing systems through REST APIs.
- Each manufacturer connector should support configurable read/write permissions per object and per field where practical.
- Sync directions: inbound only, outbound only, bidirectional.
- Admin-facing sync rules UI with field mapping, conflict handling, last synced timestamp, sync logs, retry queue, and error visibility.
- Support mapping between local CRM objects and manufacturer external IDs.
- Example synced objects: accounts, contacts, opportunities, quotes, orders, products/SKUs, pricing, shipment statuses.
- Design API credential management securely.
- Include mock/demo connector settings UI and architecture that could later connect to real APIs.

11) Data import and historical records
- CSV import tools for accounts, contacts, opportunities, projects, quotes, orders, and activities.
- Initial onboarding flow to import at least 3 years of historical data.
- Deduplication logic and merge suggestions for accounts/contacts/projects.
- Audit trail for imports and major changes.

12) Tasks, activities, and collaboration
- Tasks/reminders linked to accounts, contacts, projects, and opportunities.
- Meeting logs, call notes, jobsite visit notes, and next steps.
- Team mentions/internal notes if feasible.
- Homepage agenda for upcoming tasks and stale follow-ups.

13) Forecasting and planning
- Weighted forecast and commit/best case/upside categories.
- Manager rollups by rep, territory, and manufacturer line.
- Monthly/quarterly forecast board.
- Historical forecast accuracy reporting if feasible.

14) UI/UX requirements
- Polished enterprise SaaS aesthetic.
- Responsive and fast.
- Left-hand navigation with modules for Dashboard, Accounts, Contacts, Projects, Opportunities, Quotes, Orders, Reports, Sync Center, AI Assistant, Admin.
- Powerful searchable tables with filters, saved views, bulk actions, and detail drawers.
- Rich dashboard cards and charts.
- Provide realistic demo/sample data for a building-envelope rep agency.
- Include a landing/home dashboard tailored for each role.

15) Technical / app requirements
- Build as a full-stack web app with database, authentication, and a usable demo environment.
- Use a sensible relational schema for the CRM entities and their relationships.
- Include audit fields, created/updated timestamps, owners, and external IDs.
- Seed meaningful sample manufacturers, accounts, contacts, projects, opportunities, quotes, orders, and reports.
- Include mock AI action handling and mock API sync behavior in the demo so workflows are visible even if external APIs are not really connected.
- Make the app easy to extend later.

Suggested data model entities:
Users, Roles, Territories, Accounts, Contacts, ManufacturerLines, Projects, Opportunities, OpportunityStages, Activities, Tasks, Quotes, QuoteLineItems, Orders, OrderEvents, Reports, DashboardConfigs, SyncConnectors, SyncMappings, SyncLogs, Products, Competitors, Attachments, Notes.

Important user flows:
- Create new account/contact/project/opportunity.
- Create opportunity from account or project.
- Create quote from opportunity with version history.
- Convert accepted quote into tracked order record.
- View account 360 with contacts, projects, opportunities, quotes, orders, and activities.
- Run saved reports and dashboards.
- Use AI command bar to create records, build report filters, and summarize data.
- Configure a manufacturer API connector and review sync logs.

Design preferences:
- Professional B2B CRM appearance.
- Use clear typography, cards, data grids, and chart-based dashboards.
- Prefer a modern neutral palette appropriate for construction/building products software.
- Emphasize usability for desktop users, but keep responsive behavior for tablets.

Please generate the complete web app with frontend, backend/data model, navigation, seeded demo data, and polished screens for all major modules above.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://repview.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d2c5d896-4e11-4a20-90d5-a41239e77118).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
