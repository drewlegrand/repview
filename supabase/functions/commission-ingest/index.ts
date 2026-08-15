import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";
import { z } from "npm:zod@3";
import { generateText, NoObjectGeneratedError, Output } from "npm:ai";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";
import {
  findReportedTotal,
  Mapping,
  normalizeInvoiceNumber,
  parseGrid,
  ParsedInvoice,
  toNumber,
} from "./parse.ts";

const COLUMN_KEYS = [
  "lineType",
  "salesmanNumber",
  "salesman",
  "manufacturerName",
  "manufacturerOffice",
  "customerNumber",
  "customerName",
  "invoiceDate",
  "invoiceNumber",
  "projectReference",
  "projectName",
  "productCode",
  "productName",
  "quantity",
  "unitPrice",
  "salesAmount",
  "commissionRate",
  "commissionAmount",
  // optional extras
  "orderReference",
  "commissionBase",
] as const;

const num = z.number().nullable().optional();

// Flat schema: far more reliable across models than a nested one.
const FlatMappingSchema = z.object({
  headerRow: num,
  dataStartRow: num,
  dataEndRow: num,
  grain: z.string().nullable().optional(),
  periodLabel: z.string().nullable().optional(),
  ...(Object.fromEntries(COLUMN_KEYS.map((k) => [k, num])) as Record<string, typeof num>),
});

const ColumnsSchema = z.object(
  Object.fromEntries(COLUMN_KEYS.map((k) => [k, num])) as Record<string, typeof num>,
);

const MappingSchema = z.object({
  headerRow: z.number(),
  dataStartRow: z.number(),
  dataEndRow: z.number(),
  grain: z.enum(["invoice", "line"]),
  periodLabel: z.string().nullable().optional(),
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

function clampMapping(m: Mapping, grid: unknown[][]): Mapping {
  const last = Math.max(0, grid.length - 1);
  const clamp = (n: number) => Math.min(Math.max(0, Math.round(n || 0)), last);
  let start = clamp(m.dataStartRow);
  let end = clamp(m.dataEndRow);
  if (end < start) [start, end] = [end, start];
  return { ...m, headerRow: clamp(m.headerRow), dataStartRow: start, dataEndRow: end };
}

const HEADER_HINTS = [
  "invoice",
  "date",
  "customer",
  "commission",
  "amount",
  "sales",
  "rate",
  "order",
  "project",
  "qty",
  "quantity",
  "product",
  "item",
  "description",
];

function scoreHeaderRow(row: unknown[]): number {
  let score = 0;
  for (const cell of row) {
    if (typeof cell !== "string") continue;
    const v = cell.toLowerCase().trim();
    if (!v || v.length > 40) continue;
    if (HEADER_HINTS.some((h) => v.includes(h))) score++;
  }
  return score;
}

function findColumn(header: unknown[], patterns: string[]): number | null {
  for (let i = 0; i < header.length; i++) {
    const cell = header[i];
    if (typeof cell !== "string") continue;
    const v = cell.toLowerCase().replace(/[^a-z0-9]/g, " ");
    if (patterns.some((p) => v.includes(p))) return i;
  }
  return null;
}

function findColumnRe(header: unknown[], re: RegExp): number | null {
  for (let i = 0; i < header.length; i++) {
    const cell = header[i];
    if (typeof cell !== "string") continue;
    if (re.test(cell.trim())) return i;
  }
  return null;
}

/**
 * Scored header match. `include` patterns add points, `exclude` patterns
 * disqualify a column outright. This prevents "Commission Rate" from winning
 * the commission-amount slot just because it appears first.
 */
function findColumnScored(
  header: unknown[],
  include: string[],
  exclude: string[] = [],
): number | null {
  let bestIdx: number | null = null;
  let bestScore = 0;
  for (let i = 0; i < header.length; i++) {
    const cellValue = header[i];
    if (typeof cellValue !== "string") continue;
    const v = cellValue.toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim();
    if (!v) continue;
    if (exclude.some((p) => v.includes(p))) continue;
    let score = 0;
    include.forEach((p, rank) => {
      if (v.includes(p)) score = Math.max(score, include.length - rank);
    });
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/** Salesman # vs. Salesman name live in adjacent, similarly-named columns. */
function salesmanColumns(header: unknown[]): { number: number | null; name: number | null } {
  const num =
    findColumnRe(header, /^salesman\s*#$/i) ??
    findColumn(header, ["salesman no", "salesman num", "salesman id", "rep no", "rep num", "rep id"]);
  const name =
    findColumnRe(header, /^(salesman\s*2|salesman(\s*name)?|salesperson|rep\s*name)$/i) ??
    findColumn(header, ["salesman2", "salesman name", "rep name", "salesperson"]);
  return { number: num, name: name === num ? null : name };
}

/** Deterministic fallback used when the model can't produce a usable mapping. */
function heuristicMapping(grid: unknown[][]): Mapping {
  let headerRow = 0;
  let best = -1;
  grid.forEach((row, i) => {
    const s = scoreHeaderRow(row ?? []);
    if (s > best) {
      best = s;
      headerRow = i;
    }
  });
  const header = grid[headerRow] ?? [];
  const bottomHeader = headerRow > grid.length / 2;
  const columns = {
    invoiceNumber: findColumn(header, ["invoice", "document", "doc no", "inv no"]) ?? 0,
    invoiceDate: findColumn(header, ["date"]),
    customerName: findColumn(header, ["customer", "client", "account name", "sold to"]),
    customerNumber: findColumn(header, ["customer no", "cust no", "account no"]),
    orderReference: findColumn(header, ["order"]),
    projectReference: findColumn(header, ["job", "project no"]),
    projectName: findColumn(header, ["project"]),
    salesAmount: findColumnScored(
      header,
      ["sales amount", "net amount", "total amount", "extended", "sales", "amount"],
      ["commission", "commision", "rate", "%", "percent", "unit", "price", "qty"],
    ),
    commissionBase: findColumnScored(header, ["comm base", "commissionable", "basis", "base"], ["rate", "%"]),
    commissionRate: findColumnScored(
      header,
      ["commission rate", "rate", "percent", "pct", "%"],
      ["amount", "amt", "earned"],
    ),
    commissionAmount: findColumnScored(
      header,
      ["commission amount", "commission earned", "comm amt", "commission", "earned"],
      ["rate", "%", "percent", "base", "commissionable"],
    ),
    productCode: findColumn(header, ["item", "sku", "product code", "part"]),
    productName: findColumn(header, ["description", "product"]),
    quantity: findColumn(header, ["qty", "quantity"]),
    unitPrice: findColumn(header, ["unit price", "price"]),
    lineType: findColumn(header, ["type"]),
    salesmanNumber: salesmanColumns(header).number,
    salesman: salesmanColumns(header).name,
    manufacturerName: findColumn(header, ["manufacturer", "mfr", "mfg", "vendor", "supplier"]),
    manufacturerOffice: findColumn(header, ["manufacturer office", "mfr office", "office", "branch", "plant"]),
  };
  return clampMapping(
    {
      headerRow,
      dataStartRow: bottomHeader ? 0 : headerRow + 1,
      dataEndRow: bottomHeader ? Math.max(0, headerRow - 1) : grid.length - 1,
      grain: "invoice",
      periodLabel: null,
      columns,
    } as Mapping,
    grid,
  );
}

function toMapping(flat: Record<string, unknown>, grid: unknown[][]): Mapping {
  const pick = (k: string) => {
    const v = flat[k];
    return typeof v === "number" ? Math.round(v) : null;
  };
  const columns = Object.fromEntries(COLUMN_KEYS.map((k) => [k, pick(k)])) as Mapping["columns"];
  if (columns.invoiceNumber === null || columns.invoiceNumber === undefined) {
    throw new Error("no invoice number column detected");
  }
  const n = (v: unknown, fallback: number) => (typeof v === "number" ? v : fallback);
  return repairMapping(clampMapping(
    {
      headerRow: n(flat.headerRow, 0),
      dataStartRow: n(flat.dataStartRow, 0),
      dataEndRow: n(flat.dataEndRow, grid.length - 1),
      grain: flat.grain === "line" ? "line" : "invoice",
      periodLabel: typeof flat.periodLabel === "string" ? flat.periodLabel : null,
      columns,
    },
    grid,
  ), grid);
}

/**
 * Deterministic repair of an AI-produced mapping. Models routinely drop the
 * money columns (or point commissionAmount at the base/rate column), which used
 * to silently import every invoice at 0.00. Money columns are re-derived from
 * the header labels and then sanity-checked against the actual numbers.
 */
export function repairMapping(m: Mapping, grid: unknown[][]): Mapping {
  const header = (grid[m.headerRow] ?? []) as unknown[];
  const columns = { ...m.columns };

  const byLabel = {
    salesAmount: findColumnScored(
      header,
      ["sales amount", "net amount", "invoice total", "extended", "sales", "amount", "net"],
      ["commission", "commision", "comm ", "rate", "%", "percent", "unit", "per unit", "price", "qty"],
    ),
    commissionBase: findColumnScored(
      header,
      ["commission base", "commissionable", "comm base", "basis", "base"],
      ["rate", "%", "percent"],
    ),
    commissionRate: findColumnScored(
      header,
      ["commission rate", "comm rate", "rate", "percent", "pct", "%"],
      ["amount", "amt", "earned", "total"],
    ),
    commissionAmount: findColumnScored(
      header,
      [
        "commission amount",
        "commision amount",
        "comm amount",
        "comm amt",
        "commission earned",
        "commission due",
        "commission",
        "commision",
        "earned",
      ],
      ["rate", "%", "percent", "pct", "base", "commissionable"],
    ),
  };

  // Prefer the most specific label match for each money column, and never let
  // two money roles share a single column.
  const taken = new Set<number>();
  const claim = (key: keyof typeof byLabel, preferLabel: boolean) => {
    const current = columns[key];
    const label = byLabel[key];
    const chosen =
      preferLabel && label !== null && label !== undefined
        ? label
        : current !== null && current !== undefined && !taken.has(current)
          ? current
          : label;
    if (chosen === null || chosen === undefined || taken.has(chosen)) {
      columns[key] = current !== null && current !== undefined && !taken.has(current) ? current : null;
    } else {
      columns[key] = chosen;
    }
    const final = columns[key];
    if (final !== null && final !== undefined) taken.add(final);
  };

  // commissionAmount first: it is the number everything downstream depends on.
  claim("commissionAmount", byLabel.commissionAmount !== null);
  claim("commissionRate", byLabel.commissionRate !== null);
  claim("commissionBase", byLabel.commissionBase !== null);
  claim("salesAmount", byLabel.salesAmount !== null);

  // Text columns the model often skips: fill in from header labels when absent.
  const sm = salesmanColumns(header);
  const fill = (key: keyof Mapping["columns"], found: number | null) => {
    const current = columns[key];
    if ((current === null || current === undefined) && found !== null) columns[key] = found;
  };
  fill("lineType", findColumnRe(header, /^type$/i) ?? findColumn(header, ["line type", "doc type", "type"]));
  fill("salesmanNumber", sm.number);
  fill("salesman", sm.name);
  fill("manufacturerName", findColumn(header, ["manufacturer", "mfr", "mfg", "vendor", "supplier"]));
  fill("manufacturerOffice", findColumn(header, ["manufacturer office", "mfr office", "office", "branch", "plant"]));

  // Numeric sanity check: the commission column's total must be close to
  // base x rate. If it is missing OR way off (e.g. it points at the rate
  // column), find the numeric column whose total matches.
  {
    const width = Math.max(...grid.map((r) => r?.length ?? 0), 0);
    const rows = grid.slice(m.dataStartRow, m.dataEndRow + 1);
    const sumOf = (ci: number) =>
      rows.reduce((s, r) => s + (toNumber(r?.[ci]) ?? 0), 0);
    const baseCol = (columns.commissionBase ?? columns.salesAmount) as number | null | undefined;
    const expected = rows.reduce((s, r) => {
      const base = toNumber(r?.[baseCol as number]) ?? 0;
      const rate = toNumber(r?.[columns.commissionRate as number]) ?? 0;
      return s + base * rate;
    }, 0);
    const currentCol = columns.commissionAmount;
    const currentSum =
      currentCol === null || currentCol === undefined ? null : sumOf(currentCol);
    const tolerance = Math.max(1, Math.abs(expected) * 0.05);
    const needsFix =
      currentSum === null || Math.abs(currentSum - expected) > tolerance;
    if (Math.abs(expected) > 0.01 && needsFix) {
      let bestCol: number | null = null;
      let bestDelta = Infinity;
      for (let ci = 0; ci < width; ci++) {
        if (ci === baseCol || ci === columns.commissionRate) continue;
        const delta = Math.abs(sumOf(ci) - expected);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestCol = ci;
        }
      }
      if (bestCol !== null && bestDelta <= Math.max(1, Math.abs(expected) * 0.02)) {
        columns.commissionAmount = bestCol;
      }
    }
  }

  if (
    columns.manufacturerName !== null && columns.manufacturerName !== undefined &&
    columns.manufacturerName === columns.manufacturerOffice
  ) {
    columns.manufacturerOffice = null;
  }

  return { ...m, columns };
}

async function callDetect(
  sheetName: string,
  grid: unknown[][],
  apiKey: string,
  strict: boolean,
): Promise<Mapping> {
  const gateway = createLovableAiGatewayProvider(apiKey);
  const prompt = [
    `Sheet name: "${sheetName}". Total rows: ${grid.length} (0-indexed).`,
    "This is a manufacturer's sales-commission report for a sales rep agency.",
    "Identify the layout. Column indexes are 0-based positions shown as [n] below.",
    "The header row may be at the TOP or at the BOTTOM of the sheet; totals rows may sit below it.",
    "Set dataStartRow to the first row containing a real invoice/document record and dataEndRow to the last one (exclude title, header and totals rows).",
    'Set grain to "line" when a single invoice number repeats across multiple product rows, otherwise "invoice".',
    "Use null for any field the sheet does not have. commissionBase is a separate commissionable-amount column when present (distinct from total sales amount).",
    "Answer with a SINGLE FLAT object. Every column field is a top-level key holding a 0-based column index or null.",
    strict
      ? 'Respond exactly in this shape (no nesting): {"headerRow":0,"dataStartRow":1,"dataEndRow":50,"grain":"invoice","periodLabel":null,"lineType":null,"salesmanNumber":null,"salesman":null,"manufacturerName":null,"manufacturerOffice":null,"customerNumber":null,"customerName":2,"invoiceDate":1,"invoiceNumber":0,"projectReference":null,"projectName":null,"productCode":null,"productName":null,"quantity":null,"unitPrice":null,"salesAmount":5,"commissionRate":6,"commissionAmount":7,"orderReference":null,"commissionBase":null}'
      : "",
    "",
    preview(grid),
  ].filter(Boolean).join("\n");

  try {
    const { output } = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      output: Output.object({ schema: FlatMappingSchema }),
      prompt,
    });
    return toMapping(output as Record<string, unknown>, grid);
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      const cleaned = error.text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = FlatMappingSchema.safeParse(JSON.parse(cleaned));
      if (parsed.success) return toMapping(parsed.data as Record<string, unknown>, grid);
    }
    throw error;
  }
}

async function detectMapping(
  sheetName: string,
  grid: unknown[][],
  apiKey: string,
): Promise<{ mapping: Mapping; lowConfidence: boolean; warning?: string }> {
  try {
    return { mapping: await callDetect(sheetName, grid, apiKey, false), lowConfidence: false };
  } catch (e1) {
    console.error("layout detection attempt 1 failed:", e1 instanceof Error ? e1.message : e1);
    try {
      return { mapping: await callDetect(sheetName, grid, apiKey, true), lowConfidence: false };
    } catch (e2) {
      console.error("layout detection attempt 2 failed:", e2 instanceof Error ? e2.message : e2);
      return {
        mapping: heuristicMapping(grid),
        lowConfidence: true,
        warning: "Couldn't auto-detect the layout — review the column mapping below before importing.",
      };
    }
  }
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
      const { mapping, lowConfidence, warning } = await detectMapping(target, grid, apiKey);
      const { invoices, rowsParsed, parsedTotal } = parseGrid(grid, {
        ...mapping,
        dataEndRow: Math.min(mapping.dataEndRow, grid.length - 1),
      });
      return json({
        sheets: allSheets,
        analyzedSheet: target,
        mapping,
        lowConfidence,
        warning,
        headers: (grid[mapping.headerRow] ?? []).map((v) =>
          v === null || v === undefined ? "" : String(v instanceof Date ? v.toISOString().slice(0, 10) : v),
        ),
        columnCount: Math.max(...grid.slice(0, 60).map((r) => r?.length ?? 0), 0),
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

    // The manufacturer picked at import time is authoritative for the
    // "Manufacturer" column, regardless of what the file says.
    const { data: manufacturerRow } = await supabase
      .from("manufacturers")
      .select("name")
      .eq("id", body.manufacturerId)
      .maybeSingle();
    const manufacturerName: string | null = manufacturerRow?.name ?? null;

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

      const summary = await reconcile(
        supabase,
        userId,
        body.manufacturerId,
        report.id,
        invoices,
        mapping,
        manufacturerName,
      );

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
  manufacturerName: string | null,
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
      line_type: inv.lineType,
      salesman_number: inv.salesmanNumber,
      salesman: inv.salesman,
      manufacturer_name: manufacturerName ?? inv.manufacturerName,
      manufacturer_office: inv.manufacturerOffice,
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
          salesman_number: l.salesmanNumber,
          salesman: l.salesman,
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