import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { opportunities } from "../../../data/demo-data";

export default defineTool({
  name: "list_opportunities",
  title: "List opportunities",
  description:
    "List pipeline opportunities with optional filters for stage, forecast status, manufacturer line, owner, and minimum value.",
  inputSchema: {
    stage: z.string().optional().describe("Pipeline stage, e.g. Prospect, Specification, Bid, Awarded."),
    forecast_status: z.enum(["Open", "Closed Won", "Closed Lost"]).optional(),
    manufacturer_line: z.string().optional().describe("Manufacturer line name."),
    owner: z.string().optional().describe("Opportunity owner / rep name."),
    min_value: z.number().optional().describe("Only return opportunities worth at least this amount."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ stage, forecast_status, manufacturer_line, owner, min_value, limit }) => {
    const rows = opportunities
      .filter((o) => (stage ? o.stage.toLowerCase() === stage.toLowerCase() : true))
      .filter((o) => (forecast_status ? o.forecastStatus === forecast_status : true))
      .filter((o) =>
        manufacturer_line
          ? o.manufacturerLine.toLowerCase().includes(manufacturer_line.toLowerCase())
          : true,
      )
      .filter((o) => (owner ? o.owner.toLowerCase().includes(owner.toLowerCase()) : true))
      .filter((o) => (typeof min_value === "number" ? o.value >= min_value : true))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit ?? 25);

    const totalValue = rows.reduce((sum, o) => sum + o.value, 0);

    return {
      content: [{ type: "text", text: JSON.stringify({ totalValue, rows }, null, 2) }],
      structuredContent: { count: rows.length, totalValue, opportunities: rows },
    };
  },
});