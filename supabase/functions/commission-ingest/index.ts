import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";
import { z } from "npm:zod@3";
import { generateText, Output } from "npm:ai";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";
import {
  findReportedTotal,
  Mapping,
  normalizeInvoiceNumber,
  parseGrid,
  ParsedInvoice,
} from "./parse.ts";

const ColumnsSchema = z.object({
  invoiceNumber: z.number(),
  invoiceDate: z.number().nullable(),
  customerName: z.number().nullable(),
  customerNumber: z.number().nullable(),
  orderReference: z.number().nullable(),
  projectReference: z.number().nullable(),
  projectName: z.number().nullable(),
  salesAmount: z.number().nullable(),
  commissionBase: z.number().nullable(),
  commissionRate: z.number().nullable(),
  commissionAmount: z.number().nullable(),
  productCode: z.number().nullable(),
  productName: z.number().nullable(),
  quantity: z.number().nullable(),
  unitPrice: z.number().nullable(),
  lineType: z.number().nullable(),
});

const MappingSchema = z.object({
  headerRow: z.number(),
  dataStartRow: z.number(),
  dataEndRow: z.number(),
  grain: z.enum(["invoice", "line"]),
  periodLabel: z.string().nullable(),
  columns: ColumnsSchema,
});

const BodySchema = z.object({
  action: z.enum(["analyze", "commit"]),
  manufacturerId: z.string().uuid(),
  storagePath: z.string().min(1),
  fileName: z.string().min(1),
  sheetNames: z.array(z.string()).optional(),
  mapping: MappingSchema.optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function gridOf(wb: XLSX.WorkBook, sheetName: string): unknown[][] {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, blankrows: true, defval: null }) as unknown[][];
}

function preview(grid: unknown[][], head = 14, tail = 4) {
  const fmt = (r: unknown[], i: number) =>
    `row ${i}: ` +
    r.slice(0, 20)
      .map((v, ci) => `[${ci}]${v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? "")}`)
      .join(" | ");
  const lines: string[] = [];
  grid.slice(0, head).forEach((r, i) => lines.push(fmt(r, i)));
  if (grid.length > head + tail) lines.push(`... ${grid.length - head - tail} more rows ...`);
  grid.slice(Math.max(head, grid.length - tail)).forEach((r, i) =>
    lines.push(fmt(r, Math.max(head, grid.length - tail) + i)),
  );
  return lines.join("\n");
}

async function detectMapping(sheetName: string, grid: unknown[][], apiKey: string): Promise<Mapping> {
  const gateway = createLovableAiGatewayProvider(apiKey);
  const prompt = [
    `Sheet name: "${sheetName}". Total rows: ${grid.length} (0-indexed).`,
    "This is a manufacturer's sales-commission report for a sales rep agency.",
    "Identify the layout. Column indexes are 0-based positions shown as [n] below.",
    "The header row may be at the TOP or at the BOTTOM of the sheet; totals rows may sit below it.",
    "Set dataStartRow to the first row containing a real invoice/document record and dataEndRow to the last one (exclude title, header and totals rows).",
    'Set grain to "line" when a single invoice number repeats across multiple product rows, otherwise "invoice".',
    "Use null for any field the sheet does not have. commissionBase is a separate commissionable-amount column when present (distinct from total sales amount).",
    "",
    preview(grid),
  ].join("\n");

  const { output } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    output: Output.object({ schema: MappingSchema }),
    prompt,
  });
  return output as Mapping;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Not authenticated" }, 401);
    const userId = userData.user.id;

    const parsedBody = BodySchema.safeParse(await req.json());
    if (!parsedBody.success) {
      return json({ error: parsedBody.error.flatten().fieldErrors }, 400);
    }
    const body = parsedBody.data;

    const { data: file, error: dlErr } = await supabase.storage
      .from("commission-reports")
      .download(body.storagePath);
    if (dlErr || !file) return json({ error: `Could not read uploaded file: ${dlErr?.message}` }, 400);

    const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: "array", cellDates: true });
    const allSheets = wb.SheetNames.filter((n) => gridOf(wb, n).some((r) => r.some((c) => c !== null && c !== "")));

    if (body.action === "analyze") {
      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!apiKey) return json({ error: "AI is not configured" }, 500);
      const target = body.sheetNames?.[0] ?? allSheets[0];
      const grid = gridOf(wb, target);
      const mapping = await detectMapping(target, grid, apiKey);
      const { invoices, rowsParsed, parsedTotal } = parseGrid(grid, {
        ...mapping,
        dataEndRow: Math.min(mapping.dataEndRow, grid.length - 1),
      });
      return json({
        sheets: allSheets,
        analyzedSheet: target,
        mapping,
        rowsParsed,
        invoiceCount: invoices.length,
        parsedTotal,
        reportedTotal: findReportedTotal(grid, mapping),
        sample: invoices.slice(0, 8),
      });
    }

    // ---- commit ----
    if (!body.mapping) return json({ error: "mapping is required to commit" }, 400);
    const sheets = body.sheetNames?.length ? body.sheetNames : [allSheets[0]];
    const results: unknown[] = [];

    for (const sheetName of sheets) {
      const grid = gridOf(wb, sheetName);
      if (!grid.length) continue;
      const mapping: Mapping = {
        ...body.mapping,
        dataStartRow: Math.min(body.mapping.dataStartRow, Math.max(0, grid.length - 1)),
        dataEndRow: grid.length - 1,
      };
      const { invoices, rowsParsed, parsedTotal } = parseGrid(grid, mapping);
      const reportedTotal = findReportedTotal(grid, mapping);

      const { data: report, error: repErr } = await supabase
        .from("commission_reports")
        .insert({
          user_id: userId,
          manufacturer_id: body.manufacturerId,
          file_name: body.fileName,
          storage_path: body.storagePath,
          sheet_name: sheetName,
          period_label: mapping.periodLabel ?? sheetName,
          status: "processing",
          detected_mapping: mapping as unknown as Record<string, unknown>,
          grain: mapping.grain,
          rows_parsed: rowsParsed,
          reported_total_commission: reportedTotal,
          parsed_total_commission: parsedTotal,
          totals_match: reportedTotal === null ? null : Math.abs(reportedTotal - parsedTotal) < 1,
        })
        .select()
        .single();
      if (repErr) return json({ error: `Could not save report: ${repErr.message}` }, 500);

      const summary = await reconcile(supabase, userId, body.manufacturerId, report.id, invoices, mapping);

      await supabase
        .from("commission_reports")
        .update({ status: "complete", ...summary })
        .eq("id", report.id);

      results.push({
        sheetName,
        reportId: report.id,
        rowsParsed,
        parsedTotal,
        reportedTotal,
        invoiceCount: invoices.length,
        ...summary,
      });
    }

    return json({ results });
  } catch (e) {
    console.error("commission-ingest failed:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

const TRACKED_FIELDS: Array<[keyof ParsedInvoice, string]> = [
  ["salesAmount", "sales_amount"],
  ["commissionBase", "commission_base"],
  ["commissionRate", "commission_rate"],
  ["commissionAmount", "commission_amount"],
  ["commissionPaid", "commission_paid"],
  ["customerName", "customer_name"],
  ["invoiceDate", "invoice_date"],
];

function differs(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) > 0.004;
  if (a === null && b === null) return false;
  return String(a ?? "") !== String(b ?? "");
}

async function reconcile(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string,
  manufacturerId: string,
  reportId: string,
  invoices: ParsedInvoice[],
  mapping: Mapping,
) {
  let rowsNew = 0;
  let rowsChanged = 0;
  let rowsUnchanged = 0;

  const norms = invoices.map((i) => i.invoiceNumberNorm);
  const existing = new Map<string, Record<string, unknown>>();
  for (let i = 0; i < norms.length; i += 200) {
    const { data } = await supabase
      .from("commission_invoices")
      .select("*")
      .eq("user_id", userId)
      .eq("manufacturer_id", manufacturerId)
      .in("invoice_number_norm", norms.slice(i, i + 200));
    (data ?? []).forEach((row: Record<string, unknown>) =>
      existing.set(row.invoice_number_norm as string, row),
    );
  }

  const toInsert: Record<string, unknown>[] = [];
  const history: Record<string, unknown>[] = [];

  for (const inv of invoices) {
    const base = {
      user_id: userId,
      manufacturer_id: manufacturerId,
      invoice_number: inv.invoiceNumber,
      invoice_number_norm: inv.invoiceNumberNorm,
      document_type: inv.documentType,
      invoice_date: inv.invoiceDate,
      period_label: mapping.periodLabel,
      customer_name: inv.customerName,
      customer_number: inv.customerNumber,
      order_reference: inv.orderReference,
      project_reference: inv.projectReference,
      project_name: inv.projectName,
      sales_amount: inv.salesAmount,
      commission_base: inv.commissionBase,
      commission_rate: inv.commissionRate,
      commission_amount: inv.commissionAmount,
      commission_paid: inv.commissionPaid,
      discrepancy_note: inv.discrepancyNote,
      last_report_id: reportId,
    };

    const prior = existing.get(inv.invoiceNumberNorm);
    if (!prior) {
      rowsNew++;
      toInsert.push({ ...base, first_report_id: reportId });
      continue;
    }

    const changes = TRACKED_FIELDS.filter(([key, col]) => differs(inv[key], prior[col]));
    if (!changes.length) {
      rowsUnchanged++;
      continue;
    }
    rowsChanged++;
    await supabase.from("commission_invoices").update(base).eq("id", prior.id);
    for (const [key, col] of changes) {
      history.push({
        user_id: userId,
        invoice_id: prior.id,
        report_id: reportId,
        change_type: "updated",
        field_name: col,
        old_value: prior[col] === null ? null : String(prior[col]),
        new_value: inv[key] === null ? null : String(inv[key]),
        source: "import",
      });
    }
  }

  const insertedIds = new Map<string, string>();
  for (let i = 0; i < toInsert.length; i += 200) {
    const { data, error } = await supabase
      .from("commission_invoices")
      .insert(toInsert.slice(i, i + 200))
      .select("id, invoice_number_norm");
    if (error) throw new Error(`Could not save invoices: ${error.message}`);
    (data ?? []).forEach((r: { id: string; invoice_number_norm: string }) =>
      insertedIds.set(r.invoice_number_norm, r.id),
    );
  }

  for (const [norm, id] of insertedIds) {
    history.push({
      user_id: userId,
      invoice_id: id,
      report_id: reportId,
      change_type: "created",
      field_name: null,
      old_value: null,
      new_value: norm,
      source: "import",
    });
  }

  // product-level detail for line-grain reports
  if (mapping.grain === "line") {
    const idFor = new Map<string, string>(insertedIds);
    existing.forEach((row, norm) => idFor.set(norm, row.id as string));
    const lineRows: Record<string, unknown>[] = [];
    for (const inv of invoices) {
      const invoiceId = idFor.get(inv.invoiceNumberNorm);
      if (!invoiceId) continue;
      for (const l of inv.lines) {
        lineRows.push({
          user_id: userId,
          invoice_id: invoiceId,
          report_id: reportId,
          line_type: l.lineType,
          product_code: l.productCode,
          product_name: l.productName,
          quantity: l.quantity,
          unit_price: l.unitPrice,
          sales_amount: l.salesAmount,
          commission_rate: l.commissionRate,
          commission_amount: l.commissionAmount,
        });
      }
    }
    for (let i = 0; i < lineRows.length; i += 400) {
      await supabase.from("commission_invoice_lines").insert(lineRows.slice(i, i + 400));
    }
  }

  for (let i = 0; i < history.length; i += 400) {
    await supabase.from("commission_invoice_history").insert(history.slice(i, i + 400));
  }

  return { rows_new: rowsNew, rows_changed: rowsChanged, rows_unchanged: rowsUnchanged };
}

export { normalizeInvoiceNumber };