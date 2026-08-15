import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ChevronsUpDown, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { saveFile } from '@/lib/download';
import {
  ColumnFilterState,
  DateFilter,
  EMPTY_FILTER,
  ValueFilter,
  isFilterActive,
} from './ColumnFilter';
import {
  money,
  pct,
  useCommissionInvoicesWithLines,
  useManufacturers,
} from '@/hooks/useCommissions';

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

function dayKeyOf(value: string | null | undefined) {
  if (!value) return '(blank)';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '(blank)';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

type ColumnKey =
  | 'date'
  | 'manufacturer'
  | 'office'
  | 'customerNumber'
  | 'customerName'
  | 'invoice'
  | 'projectRef'
  | 'projectName'
  | 'productCode'
  | 'productName'
  | 'qty'
  | 'unitPrice'
  | 'salesAmount'
  | 'commissionRate'
  | 'commissionAmount';

type ColumnType = 'date' | 'text' | 'number';

const COLUMNS: Array<{ key: ColumnKey; label: string; type: ColumnType }> = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'manufacturer', label: 'Manufacturer', type: 'text' },
  { key: 'office', label: 'Manufacturer Office', type: 'text' },
  { key: 'customerNumber', label: 'Customer #', type: 'text' },
  { key: 'customerName', label: 'Customer Name', type: 'text' },
  { key: 'invoice', label: 'Invoice', type: 'text' },
  { key: 'projectRef', label: 'Project #', type: 'text' },
  { key: 'projectName', label: 'Project Name', type: 'text' },
  { key: 'productCode', label: 'Product #', type: 'text' },
  { key: 'productName', label: 'Product Name', type: 'text' },
  { key: 'qty', label: 'Qty', type: 'number' },
  { key: 'unitPrice', label: 'Unit Price', type: 'number' },
  { key: 'salesAmount', label: 'Sales Amount', type: 'number' },
  { key: 'commissionRate', label: 'Commission Rate', type: 'number' },
  { key: 'commissionAmount', label: 'Commission Amount', type: 'number' },
];

type Row = {
  id: string;
  manufacturerId: string | null;
  dayKey: string;
  values: Record<ColumnKey, string | number | null>;
  display: Record<ColumnKey, string>;
};

export function ImportedDataTab() {
  const { data: invoices = [], isLoading } = useCommissionInvoicesWithLines();
  const { data: manufacturers = [] } = useManufacturers();
  const [search, setSearch] = useState('');
  const [manufacturerId, setManufacturerId] = useState('all');
  const [columnFilters, setColumnFilters] = useState<Partial<Record<ColumnKey, ColumnFilterState>>>(
    {},
  );
  const [sort, setSort] = useState<{ key: ColumnKey; dir: 'asc' | 'desc' } | null>({
    key: 'date',
    dir: 'desc',
  });

  const allRows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const push = (inv: (typeof invoices)[number], line: (typeof invoices)[number]['commission_invoice_lines'][number] | null, idx: number) => {
      const values: Record<ColumnKey, string | number | null> = {
        date: inv.invoice_date ? new Date(inv.invoice_date).getTime() || null : null,
        manufacturer: inv.manufacturer_name ?? null,
        office: inv.manufacturer_office ?? null,
        customerNumber: inv.customer_number ?? null,
        customerName: inv.customer_name ?? null,
        invoice: inv.invoice_number ?? null,
        projectRef: inv.project_reference ?? null,
        projectName: inv.project_name ?? null,
        productCode: line?.product_code ?? null,
        productName: line?.product_name ?? null,
        qty: line?.quantity ?? null,
        unitPrice: line?.unit_price ?? null,
        salesAmount: line ? line.sales_amount ?? null : inv.sales_amount,
        commissionRate: line ? line.commission_rate ?? null : inv.commission_rate,
        commissionAmount: line ? line.commission_amount ?? null : inv.commission_amount,
      };
      const display: Record<ColumnKey, string> = {
        date: formatDate(inv.invoice_date),
        manufacturer: inv.manufacturer_name ?? '—',
        office: inv.manufacturer_office ?? '—',
        customerNumber: inv.customer_number ?? '—',
        customerName: inv.customer_name ?? '—',
        invoice: inv.invoice_number ?? '—',
        projectRef: inv.project_reference ?? '—',
        projectName: inv.project_name ?? '—',
        productCode: line?.product_code ?? '—',
        productName: line?.product_name ?? '—',
        qty: line?.quantity != null ? String(line.quantity) : '—',
        unitPrice: line ? money(line.unit_price) : '—',
        salesAmount: line ? money(line.sales_amount) : money(inv.sales_amount),
        commissionRate: line ? pct(line.commission_rate) : pct(inv.commission_rate),
        commissionAmount: line ? money(line.commission_amount) : money(inv.commission_amount),
      };
      out.push({
        id: `${inv.id}-${idx}`,
        manufacturerId: inv.manufacturer_id ?? null,
        dayKey: dayKeyOf(inv.invoice_date),
        values,
        display,
      });
    };
    invoices.forEach((inv) => {
      const lines = inv.commission_invoice_lines;
      if (lines && lines.length) lines.forEach((line, i) => push(inv, line, i));
      else push(inv, null, 0);
    });
    return out;
  }, [invoices]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => isFilterActive(v));
    const filtered = allRows.filter((row) => {
      if (manufacturerId !== 'all' && row.manufacturerId !== manufacturerId) return false;
      if (term) {
        const haystack = Object.values(row.display).join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      for (const [key, state] of activeFilters) {
        const col = key as ColumnKey;
        const cell = row.display[col] ?? '';
        const text = state!.text.trim().toLowerCase();
        if (text && !cell.toLowerCase().includes(text)) return false;
        if (state!.selected) {
          const value = col === 'date' ? row.dayKey : cell;
          if (!state!.selected.includes(value)) return false;
        }
      }
      return true;
    });

    if (!sort) return filtered;
    const col = COLUMNS.find((c) => c.key === sort.key);
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a.values[sort.key];
      const bv = b.values[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (col?.type === 'text') {
        return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' }) * factor;
      }
      return (Number(av) - Number(bv)) * factor;
    });
  }, [allRows, search, manufacturerId, columnFilters, sort]);

  const toggleSort = (key: ColumnKey) => {
    setSort((prev) =>
      prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );
  };

  const optionsByColumn = useMemo(() => {
    const map = {} as Record<ColumnKey, string[]>;
    for (const col of COLUMNS) {
      const seen = new Set<string>();
      for (const row of allRows) seen.add(col.key === 'date' ? row.dayKey : row.display[col.key]);
      const list = Array.from(seen);
      map[col.key] =
        col.type === 'number'
          ? list.sort((a, b) =>
              a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
            )
          : list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    }
    return map;
  }, [allRows]);

  const filterFor = (key: ColumnKey) => columnFilters[key] ?? EMPTY_FILTER;
  const setFilter = (key: ColumnKey, next: ColumnFilterState) =>
    setColumnFilters((prev) => ({ ...prev, [key]: next }));

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.sales += Number(r.values.salesAmount ?? 0);
        acc.commission += Number(r.values.commissionAmount ?? 0);
        return acc;
      },
      { sales: 0, commission: 0 },
    );
  }, [rows]);

  const buildSheet = () => {
    const header = COLUMNS.map((c) => c.label);
    const body = rows.map((row) =>
      COLUMNS.map((col) => {
        const raw = row.values[col.key];
        if (col.key === 'date') return raw == null ? '' : new Date(Number(raw));
        if (col.type === 'number') return raw == null ? null : Number(raw);
        return raw == null ? '' : String(raw);
      }),
    );
    const sheet = XLSX.utils.aoa_to_sheet([header, ...body], { cellDates: true });
    sheet['!cols'] = COLUMNS.map((col) => ({
      wch: Math.max(
        col.label.length + 2,
        ...rows.slice(0, 500).map((r) => String(r.display[col.key] ?? '').length + 2),
      ),
    }));
    const fmt: Partial<Record<ColumnKey, string>> = {
      date: 'mm/dd/yyyy',
      unitPrice: '$#,##0.00;($#,##0.00);-',
      salesAmount: '$#,##0.00;($#,##0.00);-',
      commissionAmount: '$#,##0.00;($#,##0.00);-',
      commissionRate: '0.00%',
      qty: '#,##0;(#,##0);-',
    };
    rows.forEach((_, r) => {
      COLUMNS.forEach((col, c) => {
        const z = fmt[col.key];
        if (!z) return;
        const cell = sheet[XLSX.utils.encode_cell({ r: r + 1, c })];
        if (cell && cell.v !== '' && cell.v !== null) cell.z = z;
      });
    });
    COLUMNS.forEach((_, c) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: 0, c })];
      if (cell) cell.s = { font: { bold: true } };
    });
    sheet['!autofilter'] = {
      ref: XLSX.utils.encode_range(
        { r: 0, c: 0 },
        { r: rows.length, c: COLUMNS.length - 1 },
      ),
    };
    sheet['!freeze'] = 'A2';
    return sheet;
  };

  const stamp = () => new Date().toISOString().slice(0, 10);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const sheet = buildSheet();
    XLSX.utils.book_append_sheet(wb, sheet, 'Imported data');
    XLSX.writeFile(wb, `commission-imported-data-${stamp()}.xlsx`);
  };

  const exportCsv = () => {
    const header = COLUMNS.map((c) => c.label);
    const body = rows.map((row) =>
      COLUMNS.map((col) => {
        const raw = row.values[col.key];
        if (col.key === 'date') return row.dayKey === '(blank)' ? '' : row.dayKey;
        if (col.type === 'number') return raw == null ? '' : Number(raw);
        return raw == null ? '' : String(raw);
      }),
    );
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet([header, ...body]));
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-imported-data-${stamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imported data</CardTitle>
          <CardDescription>
            Every invoice and line item that has been saved from your manufacturer reports. Line-level
            reports are shown one row per line; invoice-level reports show one row per invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search invoice, customer, project, salesman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-80"
            />
            <select
              value={manufacturerId}
              onChange={(e) => setManufacturerId(e.target.value)}
              aria-label="Filter by manufacturer"
              className={cn(
                'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'sm:w-56',
              )}
            >
              <option value="all">All manufacturers</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {Object.values(columnFilters).some((v) => isFilterActive(v)) && (
              <Button variant="ghost" onClick={() => setColumnFilters({})}>
                Clear column filters
              </Button>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
                <Download className="mr-1.5 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={exportExcel} disabled={!rows.length}>
                <Download className="mr-1.5 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="table-auto whitespace-nowrap text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  {COLUMNS.map((col) => {
                    const active = sort?.key === col.key;
                    const Icon = !active ? ChevronsUpDown : sort!.dir === 'asc' ? ArrowUp : ArrowDown;
                    return (
                      <th
                        key={col.key}
                        className={cn(
                          'p-2 whitespace-nowrap',
                          col.type === 'number' ? 'text-right' : 'text-left',
                        )}
                        aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground',
                            active && 'text-foreground',
                            col.type === 'number' && 'flex-row-reverse',
                          )}
                        >
                          <span>{col.label}</span>
                          <Icon className="h-3 w-3 shrink-0" />
                        </button>
                        {col.key === 'date' ? (
                          <DateFilter
                            label={col.label}
                            dayKeys={optionsByColumn.date}
                            state={filterFor('date')}
                            onChange={(next) => setFilter('date', next)}
                          />
                        ) : (
                          <ValueFilter
                            label={col.label}
                            options={optionsByColumn[col.key]}
                            state={filterFor(col.key)}
                            onChange={(next) => setFilter(col.key, next)}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={15} className="p-6 text-center text-muted-foreground">
                      Loading imported data…
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  rows.map((row) => (
                    <tr key={row.id} className="border-t">
                      {COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'p-2 whitespace-nowrap',
                            col.type === 'number' && 'text-right',
                            col.key === 'invoice' && 'font-mono',
                          )}
                        >
                          {row.display[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                {!isLoading && !rows.length && (
                  <tr>
                    <td colSpan={15} className="p-6 text-center text-muted-foreground">
                      No matching rows. Adjust your filters, or upload a report on the Import report tab.
                    </td>
                  </tr>
                )}
              </tbody>
              {!isLoading && rows.length > 0 && (
                <tfoot className="bg-muted/50 text-xs font-medium">
                  <tr>
                    <td colSpan={12} className="p-2 text-right whitespace-nowrap">
                      {rows.length} row{rows.length === 1 ? '' : 's'}
                    </td>
                    <td className="p-2 text-right whitespace-nowrap">{money(totals.sales)}</td>
                    <td className="p-2 text-right whitespace-nowrap" />
                    <td className="p-2 text-right whitespace-nowrap">{money(totals.commission)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
