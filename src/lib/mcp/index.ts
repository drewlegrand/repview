import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfileTool from "./tools/get-my-profile";
import listAccountsTool from "./tools/list-accounts";
import listContactsTool from "./tools/list-contacts";
import listOpportunitiesTool from "./tools/list-opportunities";
import listOrdersTool from "./tools/list-orders";
import listProjectsTool from "./tools/list-projects";
import listQuotesTool from "./tools/list-quotes";
import listTasksTool from "./tools/list-tasks";
import pipelineSummaryTool from "./tools/pipeline-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "repview-mcp",
  title: "Repview CRM",
  version: "0.1.0",
  instructions:
    "Tools for Repview, a building-envelope manufacturers' rep CRM. Use `pipeline_summary` for headline metrics, `list_opportunities` / `list_quotes` / `list_orders` for deal and fulfillment data, `list_accounts` / `list_contacts` / `list_projects` for relationship data, and `list_tasks` for follow-ups. `get_my_profile` returns the signed-in user's profile.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    pipelineSummaryTool,
    listAccountsTool,
    listContactsTool,
    listOpportunitiesTool,
    listQuotesTool,
    listOrdersTool,
    listProjectsTool,
    listTasksTool,
    getMyProfileTool,
  ],
});