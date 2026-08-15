import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { Manufacturer, MappingProfile, money, useManufacturers } from '@/hooks/useCommissions';

type AnalyzeResult = {
  sheets: string[];
  analyzedSheet: string;
  mapping: MappingProfile;
  headers: string[];
  columnCount: number;
  rowsParsed: number;
  invoiceCount: number;
  parsedTotal: number;
  reportedTotal: number | null;
  sample: Array<{ invoiceNumber: string; customerName: string | null; commissionAmount: number; commissionPaid: boolean }>;
};

const FIELDS: Array<{ key: string; label: string }> = [
  { key: 'lineType', label: 'Type' },
  { key: 'salesmanNumber', label: 'Salesman #' },
  { key: 'salesman', label: 'Salesman' },
  { key: 'manufacturerOffice', label: 'Manufacturer Office' },
  { key: 'customerNumber', label: 'Customer #' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'invoiceDate', label: 'Date' },
  { key: 'invoiceNumber', label: 'Invoice' },
  { key: 'projectReference', label: 'Project #' },
  { key: 'projectName', label: 'Project Name' },
  { key: 'productCode', label: 'Product #' },
  { key: 'productName', label: 'Product Name' },
  { key: 'quantity', label: 'Qty' },
  { key: 'unitPrice', label: 'Unit Price' },
  { key: 'salesAmount', label: 'Sales Amount' },
  { key: 'commissionRate', label: 'Commission Rate' },
  { key: 'commissionAmount', label: 'Commission Amount' },
];


export function UploadTab() {
  const qc = useQueryClient();
  const { data: manufacturers = [] } = useManufacturers();
  const fileInput = useRef<HTMLInputElement>(null);

  const [manufacturerId, setManufacturerId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [storagePath, setStoragePath] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [mapping, setMapping] = useState<MappingProfile | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [busy, setBusy] = useState<'' | 'analyzing' | 'committing'>('');
  const [commitResults, setCommitResults] = useState<Array<Record<string, unknown>> | null>(null);
  const [usedSavedProfile, setUsedSavedProfile] = useState(false);
  const [showAllMappings, setShowAllMappings] = useState(false);

  const manufacturer = manufacturers.find((m) => m.id === manufacturerId);

  const reset = () => {
    setAnalysis(null);
    setMapping(null);
    setSelectedSheets([]);
    setCommitResults(null);
    setUsedSavedProfile(false);
    setShowAllMappings(false);
  };

  const cancelImport = () => {
    reset();
    setFile(null);
    setStoragePath('');
    if (fileInput.current) fileInput.current.value = '';
  };

  async function handleFile(selected: File) {
    if (!manufacturerId) {
      toast.error('Pick a manufacturer first');
      return;
    }
    reset();
    setFile(selected);
    setBusy('analyzing');
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) throw new Error('Not signed in');
      const path = `${userId}/${Date.now()}-${selected.name.replace(/[^\w.\-]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('commission-reports').upload(path, selected);
      if (upErr) throw upErr;
      setStoragePath(path);

      const result = await invoke({
        action: 'analyze',
        manufacturerId,
        storagePath: path,
        fileName: selected.name,
      });
      const res = result as AnalyzeResult;
      setAnalysis(res);
      const saved = manufacturer?.mapping_profile as MappingProfile | null | undefined;
      const savedFits =
        !!saved &&
        Object.values(saved.columns ?? {}).some((c) => typeof c === 'number') &&
        Object.values(saved.columns ?? {}).every((c) => c === null || (typeof c === 'number' && c < res.columnCount));
      setUsedSavedProfile(!!savedFits);
      setMapping(savedFits ? (saved as MappingProfile) : res.mapping);
      setSelectedSheets(res.sheets);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read that file');
    } finally {
      setBusy('');
    }
  }

  async function commit() {
    if (!mapping || !file) return;
    setBusy('committing');
    try {
      const result = (await invoke({
        action: 'commit',
        manufacturerId,
        storagePath,
        fileName: file.name,
        sheetNames: selectedSheets,
        mapping,
      })) as { results: Array<Record<string, unknown>> };
      setCommitResults(result.results);
      await supabase.from('manufacturers').update({ mapping_profile: mapping }).eq('id', manufacturerId);
      qc.invalidateQueries({ queryKey: ['commission_invoices'] });
      qc.invalidateQueries({ queryKey: ['commission_reports'] });
      qc.invalidateQueries({ queryKey: ['commission_history'] });
      qc.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Report imported');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy('');
    }
  }

  const totalsTie =
    analysis?.reportedTotal === null || analysis === null
      ? null
      : Math.abs((analysis.reportedTotal ?? 0) - analysis.parsedTotal) < 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import a commission report</CardTitle>
          <CardDescription>
            Excel or CSV. The layout is detected automatically and remembered per manufacturer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm text-muted-foreground">Manufacturer</label>
              <Select value={manufacturerId} onValueChange={(v) => { setManufacturerId(v); reset(); }}>
                <SelectTrigger><SelectValue placeholder="Select manufacturer" /></SelectTrigger>
                <SelectContent>
                  {manufacturers.map((m: Manufacturer) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
            />
            <Button onClick={() => fileInput.current?.click()} disabled={!manufacturerId || busy !== ''}>
              {busy === 'analyzing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Choose file
            </Button>
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" /> {file.name}
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && mapping && (
        <Card>
          <CardHeader>
            <CardTitle>Detected layout</CardTitle>
            <CardDescription>
              Analyzed “{analysis.analyzedSheet}” — header on row {mapping.headerRow + 1},{' '}
              {mapping.grain === 'line' ? 'one row per product line' : 'one row per invoice'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Rows read" value={String(analysis.rowsParsed)} />
              <Stat label="Invoices" value={String(analysis.invoiceCount)} />
              <Stat label="Commission parsed" value={money(analysis.parsedTotal)} />
              <Stat label="Stated on report" value={analysis.reportedTotal === null ? '—' : money(analysis.reportedTotal)} />
            </div>

            {totalsTie !== null && (
              <div
                className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                  totalsTie ? 'border-primary/30 text-muted-foreground' : 'border-destructive/40 text-destructive'
                }`}
              >
                {totalsTie ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertTriangle className="mt-0.5 h-4 w-4" />}
                {totalsTie
                  ? 'Parsed commission ties to the total stated on the report.'
                  : `Parsed commission is ${money(
                      analysis.parsedTotal - (analysis.reportedTotal ?? 0),
                    )} off the total stated on the report — worth a look before importing.`}
              </div>
            )}

            {analysis.sheets.length > 1 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Sheets to import</div>
                <div className="flex flex-wrap gap-3">
                  {analysis.sheets.map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedSheets.includes(s)}
                        onCheckedChange={(c) =>
                          setSelectedSheets((prev) => (c ? [...prev, s] : prev.filter((x) => x !== s)))
                        }
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Column mapping</div>
                {(matchedFields.length > 0 || usedSavedProfile) && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAllMappings((v) => !v)}>
                    {showAllMappings ? 'Hide matched columns' : 'Edit mapping'}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>
                  {usedSavedProfile
                    ? `Using the saved ${manufacturer?.name ?? ''} layout — ${matchedFields.length} of ${FIELDS.length} columns mapped.`
                    : `${matchedFields.length} of ${FIELDS.length} columns matched automatically.`}
                </span>
                <span className="text-muted-foreground">
                  Manufacturer is set to <Badge variant="secondary">{manufacturer?.name ?? '—'}</Badge> automatically.
                </span>
              </div>

              {unmatchedFields.length > 0 && !showAllMappings && (
                <div className="text-xs text-muted-foreground">
                  {unmatchedFields.length} column{unmatchedFields.length === 1 ? '' : 's'} still need a match:
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                {(showAllMappings ? FIELDS : unmatchedFields).map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <span className="w-40 shrink-0 text-xs text-muted-foreground">{f.label}</span>
                    <Select
                      value={String(mapping.columns[f.key] ?? 'none')}
                      onValueChange={(v) =>
                        setMapping({
                          ...mapping,
                          columns: { ...mapping.columns, [f.key]: v === 'none' ? null : Number(v) },
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— not present —</SelectItem>
                        {Array.from({ length: analysis.columnCount }).map((_, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {analysis.headers[i]?.trim() ? analysis.headers[i] : `Column ${i + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={commit} disabled={busy !== '' || !selectedSheets.length}>
                {busy === 'committing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {selectedSheets.length > 1 ? `${selectedSheets.length} sheets` : 'report'}
              </Button>
              <Button variant="outline" onClick={cancelImport} disabled={busy !== ''}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {commitResults && (
        <Card>
          <CardHeader><CardTitle>Import summary</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left">Sheet</th><th className="p-2 text-right">New</th>
                    <th className="p-2 text-right">Changed</th><th className="p-2 text-right">Unchanged</th>
                    <th className="p-2 text-right">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {commitResults.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{String(r.sheetName)}</td>
                      <td className="p-2 text-right">{String(r.rows_new)}</td>
                      <td className="p-2 text-right">{String(r.rows_changed)}</td>
                      <td className="p-2 text-right text-muted-foreground">{String(r.rows_unchanged)}</td>
                      <td className="p-2 text-right">{money(Number(r.parsedTotal))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

async function invoke(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('commission-ingest', { body });
  if (error) {
    const details =
      typeof (error as { context?: { text?: () => Promise<string> } }).context?.text === 'function'
        ? await (error as { context: { text: () => Promise<string> } }).context.text()
        : error.message;
    throw new Error(details);
  }
  if ((data as { error?: unknown })?.error) throw new Error(JSON.stringify((data as { error: unknown }).error));
  return data;
}