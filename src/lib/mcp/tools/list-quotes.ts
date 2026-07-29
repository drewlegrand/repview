import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { quotes } from "../../../data/demo-data";

export default defineTool({
  name: "list_quotes",
  title: "List quotes",
  description: "List quotes with optional filters for status, account, or manufacturer line.",
  inputSchema: {
    status: z.string().optional().describe("Draft, Internal Review, Submitted, Revised, Accepted, Rejected, Expired."),
    account_name: z.string().optional(),
    manufacturer_line: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ status, account_name, manufacturer_line, limit }) => {
    const rows = quotes
      .filter((q) => (status ? q.status.toLowerCase() === status.toLowerCase() : true))
      .filter((q) =>
        account_name ? q.accountName.toLowerCase().includes(account_name.toLowerCase()) : true,
      )
      .filter((q) =>
        manufacturer_line
          ? q.manufacturerLine.toLowerCase().includes(manufacturer_line.toLowerCase())
          : true,
      )
      .slice(0, limit ?? 25);

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, quotes: rows },
    };
  },
});