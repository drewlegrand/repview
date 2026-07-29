import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { tasks } from "../../../data/demo-data";

export default defineTool({
  name: "list_tasks",
  title: "List tasks",
  description: "List follow-up tasks with optional filters for status, priority, or owner.",
  inputSchema: {
    status: z.enum(["Open", "In Progress", "Complete"]).optional(),
    priority: z.enum(["High", "Medium", "Low"]).optional(),
    owner: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ status, priority, owner, limit }) => {
    const rows = tasks
      .filter((t) => (status ? t.status === status : true))
      .filter((t) => (priority ? t.priority === priority : true))
      .filter((t) => (owner ? t.owner.toLowerCase().includes(owner.toLowerCase()) : true))
      .slice(0, limit ?? 25);

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, tasks: rows },
    };
  },
});