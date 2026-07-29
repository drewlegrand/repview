import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { accounts } from "../../../data/demo-data";

export default defineTool({
  name: "list_accounts",
  title: "List accounts",
  description:
    "List CRM accounts (architects, contractors, owners, distributors) with optional filtering by name, type, or territory.",
  inputSchema: {
    search: z.string().optional().describe("Case-insensitive match on account name or city."),
    type: z.string().optional().describe("Account type, e.g. Architect, General Contractor, Distributor."),
    territory: z.string().optional().describe("Sales territory name."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ search, type, territory, limit }) => {
    const q = search?.toLowerCase();
    const rows = accounts
      .filter((a) => (q ? `${a.name} ${a.city}`.toLowerCase().includes(q) : true))
      .filter((a) => (type ? a.type.toLowerCase() === type.toLowerCase() : true))
      .filter((a) => (territory ? a.territory.toLowerCase() === territory.toLowerCase() : true))
      .slice(0, limit ?? 25);

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, accounts: rows },
    };
  },
});