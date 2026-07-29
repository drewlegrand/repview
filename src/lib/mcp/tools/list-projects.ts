import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { projects } from "../../../data/demo-data";

export default defineTool({
  name: "list_projects",
  title: "List projects",
  description: "List construction projects tracked in the CRM, with optional status, state, or name filters.",
  inputSchema: {
    search: z.string().optional().describe("Case-insensitive match on project name, address, or architect."),
    status: z.enum(["Pre-Design", "Design", "Bidding", "Complete"]).optional(),
    state: z.string().optional().describe("Two-letter state code."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ search, status, state, limit }) => {
    const q = search?.toLowerCase();
    const rows = projects
      .filter((p) => (q ? `${p.name} ${p.address} ${p.architect}`.toLowerCase().includes(q) : true))
      .filter((p) => (status ? p.status === status : true))
      .filter((p) => (state ? p.state.toLowerCase() === state.toLowerCase() : true))
      .slice(0, limit ?? 25);

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, projects: rows },
    };
  },
});