import { useMemo, useState } from 'react';
import { Filter, ChevronRight, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export type ColumnFilterState = {
  /** Free-form "contains" text. */
  text: string;
  /** Selected values; null means "all values". */
  selected: string[] | null;
};

export const EMPTY_FILTER: ColumnFilterState = { text: '', selected: null };

export function isFilterActive(state: ColumnFilterState | undefined) {
  if (!state) return false;
  return Boolean(state.text.trim()) || state.selected !== null;
}

function FilterTrigger({ active }: { active: boolean }) {
  return (
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-label="Filter column"
        className={cn(
          'rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground',
          active && 'bg-primary/10 text-primary',
        )}
      >
        <Filter className="h-3 w-3" />
      </button>
    </PopoverTrigger>
  );
}

/** Excel-style value picker: free text box plus a checkbox list of distinct values. */
export function ValueFilter({
  label,
  options,
  state,
  onChange,
}: {
  label: string;
  options: string[];
  state: ColumnFilterState;
  onChange: (next: ColumnFilterState) => void;
}) {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const selectedSet = useMemo(
    () => (state.selected ? new Set(state.selected) : null),
    [state.selected],
  );
  const isChecked = (value: string) => !selectedSet || selectedSet.has(value);

  const toggle = (value: string) => {
    const current = selectedSet ? new Set(selectedSet) : new Set(options);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    onChange({ ...state, selected: current.size === options.length ? null : Array.from(current) });
  };

  const allVisibleChecked = visible.length > 0 && visible.every(isChecked);

  return (
    <Popover>
      <FilterTrigger active={isFilterActive(state)} />
      <PopoverContent align="start" className="w-64 space-y-2 p-3">
        <p className="text-xs font-medium">{label}</p>
        <Input
          value={state.text}
          onChange={(e) => onChange({ ...state, text: e.target.value })}
          placeholder="Contains text…"
          className="h-8 text-xs"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search values…"
          className="h-8 text-xs"
        />
        <div className="max-h-56 space-y-1 overflow-y-auto rounded border p-2">
          <label className="flex items-center gap-2 text-xs font-medium">
            <Checkbox
              checked={allVisibleChecked}
              onCheckedChange={() => {
                if (allVisibleChecked) {
                  const current = new Set(selectedSet ?? options);
                  visible.forEach((v) => current.delete(v));
                  onChange({ ...state, selected: Array.from(current) });
                } else {
                  const current = new Set(selectedSet ?? []);
                  visible.forEach((v) => current.add(v));
                  onChange({
                    ...state,
                    selected: current.size === options.length ? null : Array.from(current),
                  });
                }
              }}
            />
            (Select all)
          </label>
          {visible.map((option) => (
            <label key={option} className="flex items-center gap-2 text-xs">
              <Checkbox checked={isChecked(option)} onCheckedChange={() => toggle(option)} />
              <span className="truncate">{option}</span>
            </label>
          ))}
          {!visible.length && <p className="text-xs text-muted-foreground">No values</p>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => onChange({ text: '', selected: null })}
        >
          Clear filter
        </Button>
      </PopoverContent>
    </Popover>
  );
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type DateNode = { year: string; months: Array<{ month: string; days: string[] }> };

/** Builds a year > month > day tree from `YYYY-MM-DD` keys (plus a "(blank)" bucket). */
function buildTree(keys: string[]) {
  const years = new Map<string, Map<string, Set<string>>>();
  const blanks: string[] = [];
  for (const key of keys) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      if (!blanks.includes(key)) blanks.push(key);
      continue;
    }
    const [y, m] = key.split('-');
    if (!years.has(y)) years.set(y, new Map());
    const months = years.get(y)!;
    if (!months.has(m)) months.set(m, new Set());
    months.get(m)!.add(key);
  }
  const tree: DateNode[] = Array.from(years.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      year,
      months: Array.from(months.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, days]) => ({ month, days: Array.from(days).sort() })),
    }));
  return { tree, blanks };
}

/** Excel-style date filter: free text plus a year > month > day checkbox tree. */
export function DateFilter({
  label,
  dayKeys,
  state,
  onChange,
}: {
  label: string;
  dayKeys: string[];
  state: ColumnFilterState;
  onChange: (next: ColumnFilterState) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { tree, blanks } = useMemo(() => buildTree(dayKeys), [dayKeys]);
  const allKeys = useMemo(() => dayKeys, [dayKeys]);

  const selectedSet = useMemo(
    () => (state.selected ? new Set(state.selected) : null),
    [state.selected],
  );
  const isChecked = (key: string) => !selectedSet || selectedSet.has(key);

  const setKeys = (keys: string[], checked: boolean) => {
    const current = new Set(selectedSet ?? allKeys);
    keys.forEach((k) => (checked ? current.add(k) : current.delete(k)));
    onChange({
      ...state,
      selected: current.size === allKeys.length ? null : Array.from(current),
    });
  };

  const toggleGroup = (keys: string[]) => setKeys(keys, !keys.every(isChecked));
  const toggleExpanded = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <Popover>
      <FilterTrigger active={isFilterActive(state)} />
      <PopoverContent align="start" className="w-72 space-y-2 p-3">
        <p className="text-xs font-medium">{label}</p>
        <Input
          value={state.text}
          onChange={(e) => onChange({ ...state, text: e.target.value })}
          placeholder="Contains text…"
          className="h-8 text-xs"
        />
        <div className="max-h-64 space-y-1 overflow-y-auto rounded border p-2">
          <label className="flex items-center gap-2 text-xs font-medium">
            <Checkbox
              checked={allKeys.every(isChecked)}
              onCheckedChange={() => toggleGroup(allKeys)}
            />
            (Select all)
          </label>
          {tree.map((node) => {
            const yearKeys = node.months.flatMap((m) => m.days);
            const yearOpen = expanded[node.year];
            return (
              <div key={node.year}>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(node.year)}
                    aria-label={`Toggle ${node.year}`}
                    className="text-muted-foreground"
                  >
                    {yearOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={yearKeys.every(isChecked)}
                      onCheckedChange={() => toggleGroup(yearKeys)}
                    />
                    {node.year}
                  </label>
                </div>
                {yearOpen &&
                  node.months.map((m) => {
                    const monthId = `${node.year}-${m.month}`;
                    const monthOpen = expanded[monthId];
                    return (
                      <div key={monthId} className="ml-5">
                        <div className="flex items-center gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(monthId)}
                            aria-label={`Toggle ${monthId}`}
                            className="text-muted-foreground"
                          >
                            {monthOpen ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={m.days.every(isChecked)}
                              onCheckedChange={() => toggleGroup(m.days)}
                            />
                            {MONTHS[Number(m.month) - 1] ?? m.month}
                          </label>
                        </div>
                        {monthOpen &&
                          m.days.map((day) => (
                            <label key={day} className="ml-9 flex items-center gap-2 text-xs">
                              <Checkbox
                                checked={isChecked(day)}
                                onCheckedChange={() => setKeys([day], !isChecked(day))}
                              />
                              {Number(day.slice(8, 10))}
                            </label>
                          ))}
                      </div>
                    );
                  })}
              </div>
            );
          })}
          {blanks.map((b) => (
            <label key={b} className="flex items-center gap-2 text-xs">
              <Checkbox checked={isChecked(b)} onCheckedChange={() => setKeys([b], !isChecked(b))} />
              (blank)
            </label>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => onChange({ text: '', selected: null })}
        >
          Clear filter
        </Button>
      </PopoverContent>
    </Popover>
  );
}
