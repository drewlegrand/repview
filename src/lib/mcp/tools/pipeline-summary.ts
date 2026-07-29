import { defineTool } from "@lovable.dev/mcp-js";
import {
  dashboardStats,
  forecastByRep,
  pipelineByStage,
  revenueByLine,
} from "../../../data/demo-data";

export default defineTool({
  name: "pipeline_summary",
  title: "Pipeline summary",
  description:
    "Return headline CRM metrics: pipeline value by stage, revenue by manufacturer line, forecast by rep, and dashboard totals.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const summary = { dashboardStats, pipelineByStage, revenueByLine, forecastByRep };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});