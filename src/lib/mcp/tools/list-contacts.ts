import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { contacts } from "../../../data/demo-data";

export default defineTool({
  name: "list_contacts",
  title: "List contacts",
  description: "List CRM contacts, optionally filtered by name, account name, or influence level.",
  inputSchema: {
    search: z.string().optional().describe("Case-insensitive match on contact name, title, or email."),
    account_name: z.string().optional().describe("Filter to contacts at this account."),
    influence_level: z.enum(["High", "Medium", "Low"]).optional(),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ search, account_name, influence_level, limit }) => {
    const q = search?.toLowerCase();
    const acct = account_name?.toLowerCase();
    const rows = contacts
      .filter((c) => (q ? `${c.name} ${c.title} ${c.email}`.toLowerCase().includes(q) : true))
      .filter((c) => (acct ? c.accountName.toLowerCase().includes(acct) : true))
      .filter((c) => (influence_level ? c.influenceLevel === influence_level : true))
      .slice(0, limit ?? 25);

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, contacts: rows },
    };
  },
});