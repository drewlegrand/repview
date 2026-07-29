// Deterministic spreadsheet parsing. The AI only decides the column mapping —
// every number below is computed from the file itself.

export type ColumnMap = {
  invoiceNumber: number;
  invoiceDate?: number | null;
  customerName?: number | null;
  customerNumber?: number | null;
  orderReference?: number | null;
  projectReference?: number | null;
  projectName?: number | null;
  salesAmount?: number | null;
  commissionBase?: number | null;
  commissionRate?: number | null;
  commissionAmount?: number | null;
  productCode?: number | null;
  productName?: number | null;
  quantity?: number | null;
  unitPrice?: number | null;
  lineType?: number | null;
};

export type Mapping = {
  headerRow: number;
  dataStartRow: number;
  dataEndRow: number;
  grain: "invoice" | "line";
  periodLabel?: string | null;
  columns: ColumnMap;
};

export type ParsedLine = {
  lineType: string | null;
  productCode: string | null;
  productName: string | null;
  quantity: number | null;
  unitPrice: number | null;
  salesAmount: number | null;
  commissionRate: number | null;
  commissionAmount: number | null;
};

export type ParsedInvoice = {
  invoiceNumber: string;
  invoiceNumberNorm: string;
  documentType: "invoice" | "credit_memo";
  invoiceDate: string | null;
  customerName: string | null;
  customerNumber: string | null;
  orderReference: string | null;
  projectReference: string | null;
  projectName: string | null;
  salesAmount: number;
  commissionBase: number;
  commissionRate: number | null;
  commissionAmount: number;
  commissionPaid: boolean;
  discrepancyNote: string | null;
  lines: ParsedLine[];
};

export function normalizeInvoiceNumber(value: string): string {
  const cleaned = String(value).trim().toUpperCase().replace(/\s+/g, "");
  // strip leading zeros on the trailing numeric segment (2232710 vs 02232710)
  return cleaned.replace(/(^|[^0-9])0+(\d)/g, "$1$2");
}

export function toText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value).trim();
  return s.length ? s : null;
}

export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let s = String(value).trim();
  if (!s) return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  const pct = s.includes("%");
  s = s.replace(/[$,%\s]/g, "");
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const out = pct ? n / 100 : n;
  return negative ? -out : out;
}

const EXCEL_EPOCH = Date.UTC(1899, 11, 30);

export function toDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number" && value > 20000 && value < 80000) {
    return new Date(EXCEL_EPOCH + value * 86400000).toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  const mdy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    const year = y.length === 2 ? 2000 + Number(y) : Number(y);
    const dt = new Date(Date.UTC(year, Number(m) - 1, Number(d)));
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
  }
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function cell(row: unknown[], index: number | null | undefined): unknown {
  if (index === null || index === undefined || index < 0) return null;
  return row[index] ?? null;
}

function isDocumentNumber(value: unknown): boolean {
  const s = toText(value);
  if (!s) return false;
  if (/^(total|subtotal|grand total|posting date|invoice|document no\.?)$/i.test(s)) return false;
  return /[0-9]/.test(s);
}

/** Round to cents to avoid float drift in stored sums. */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function parseGrid(grid: unknown[][], mapping: Mapping) {
  const c = mapping.columns;
  const start = Math.max(0, mapping.dataStartRow);
  const end = Math.min(grid.length - 1, mapping.dataEndRow);

  const byInvoice = new Map<string, ParsedInvoice>();
  const order: string[] = [];
  let rowsParsed = 0;

  for (let r = start; r <= end; r++) {
    const row = grid[r];
    if (!row) continue;
    if (r === mapping.headerRow) continue;
    const rawInvoice = cell(row, c.invoiceNumber);
    if (!isDocumentNumber(rawInvoice)) continue;

    const invoiceNumber = toText(rawInvoice)!;
    const norm = normalizeInvoiceNumber(invoiceNumber);

    const sales = toNumber(cell(row, c.salesAmount)) ?? 0;
    const base = toNumber(cell(row, c.commissionBase));
    const rate = toNumber(cell(row, c.commissionRate));
    const commission = toNumber(cell(row, c.commissionAmount)) ?? 0;

    rowsParsed++;

    const line: ParsedLine = {
      lineType: toText(cell(row, c.lineType)),
      productCode: toText(cell(row, c.productCode)),
      productName: toText(cell(row, c.productName)),
      quantity: toNumber(cell(row, c.quantity)),
      unitPrice: toNumber(cell(row, c.unitPrice)),
      salesAmount: sales,
      commissionRate: rate,
      commissionAmount: commission,
    };

    const existing = byInvoice.get(norm);
    if (existing) {
      existing.salesAmount = round2(existing.salesAmount + sales);
      existing.commissionBase = round2(existing.commissionBase + (base ?? sales));
      existing.commissionAmount = round2(existing.commissionAmount + commission);
      existing.lines.push(line);
      // blended rate across lines
      existing.commissionRate = existing.commissionBase
        ? round4(existing.commissionAmount / existing.commissionBase)
        : existing.commissionRate;
      if (!existing.invoiceDate) existing.invoiceDate = toDate(cell(row, c.invoiceDate));
      continue;
    }

    const invoice: ParsedInvoice = {
      invoiceNumber,
      invoiceNumberNorm: norm,
      documentType: sales < 0 || /CM|CREDIT/i.test(invoiceNumber) ? "credit_memo" : "invoice",
      invoiceDate: toDate(cell(row, c.invoiceDate)),
      customerName: toText(cell(row, c.customerName)),
      customerNumber: toText(cell(row, c.customerNumber)),
      orderReference: extractReference(cell(row, c.orderReference)),
      projectReference: toText(cell(row, c.projectReference)),
      projectName: toText(cell(row, c.projectName)),
      salesAmount: round2(sales),
      commissionBase: round2(base ?? sales),
      commissionRate: rate,
      commissionAmount: round2(commission),
      commissionPaid: false,
      discrepancyNote: null,
      lines: mapping.grain === "line" ? [line] : [],
    };
    byInvoice.set(norm, invoice);
    order.push(norm);
  }

  const invoices = order.map((k) => byInvoice.get(k)!);
  for (const inv of invoices) {
    inv.commissionPaid = Math.abs(inv.commissionAmount) > 0.004;
    const blended = inv.lines.length > 1 && new Set(inv.lines.map((l) => l.commissionRate)).size > 1;
    if (!blended && inv.commissionRate !== null && Math.abs(inv.commissionBase) > 0.004) {
      const expected = round2(inv.commissionBase * inv.commissionRate);
      const tolerance = Math.max(0.05, 0.01 * Math.max(1, inv.lines.length));
      if (Math.abs(expected - inv.commissionAmount) > tolerance) {
        inv.discrepancyNote =
          `Reported commission ${inv.commissionAmount.toFixed(2)} differs from base x rate (${expected.toFixed(2)})`;
      }
    }
  }

  const parsedTotal = round2(invoices.reduce((s, i) => s + i.commissionAmount, 0));
  return { invoices, rowsParsed, parsedTotal };
}

function round4(n: number): number {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}

/** "Order DAL-0066574" -> "DAL-0066574" */
function extractReference(value: unknown): string | null {
  const s = toText(value);
  if (!s) return null;
  const m = s.match(/(?:order|po|job)\s*#?\s*([A-Za-z0-9-]+)/i);
  return m ? m[1] : s;
}

/**
 * Looks for a stated total below the data block so we can tie our parse to the
 * file's own number.
 */
export function findReportedTotal(grid: unknown[][], mapping: Mapping): number | null {
  const col = mapping.columns.commissionAmount;
  if (col === null || col === undefined) return null;
  // Walk up from the bottom across rows that are NOT invoice records (header,
  // totals, footer) and take the first numeric value in the commission column.
  for (let r = grid.length - 1; r >= 0; r--) {
    const row = grid[r];
    if (!row) continue;
    if (isDocumentNumber(row[mapping.columns.invoiceNumber])) return null;
    const n = toNumber(row[col]);
    if (n !== null && Math.abs(n) > 0) return round2(n);
  }
  return null;
}