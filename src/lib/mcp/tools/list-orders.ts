import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { orders } from "../../../data/demo-data";

export default defineTool({
  name: "list_orders",
  title: "List orders",
  description:
    "List manufacturer orders with optional filters for status, fulfillment stage, account, or manufacturer line. Useful for checking what has shipped.",
  inputSchema: {
    status: z.enum(["Pending", "Booked", "Shipped"]).optional(),
    order_stage: z.string().optional().describe("Entered, Acknowledged, In Production, Shipped, Complete, Hold, Cancelled."),
    account_name: z.string().optional(),
    manufacturer_line: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ status, order_stage, account_name, manufacturer_line, limit }) => {
    const rows = orders
      .filter((o) => (status ? o.status === status : true))
      .filter((o) => (order_stage ? o.orderStage.toLowerCase() === order_stage.toLowerCase() : true))
      .filter((o) =>
        account_name ? o.accountName.toLowerCase().includes(account_name.toLowerCase()) : true,
      )
      .filter((o) =>
        manufacturer_line
          ? o.manufacturerLine.toLowerCase().includes(manufacturer_line.toLowerCase())
          : true,
      )
      .slice(0, limit ?? 25);

    const totalValue = rows.reduce((sum, o) => sum + o.total, 0);

    return {
      content: [{ type: "text", text: JSON.stringify({ totalValue, rows }, null, 2) }],
      structuredContent: { count: rows.length, totalValue, orders: rows },
    };
  },
});