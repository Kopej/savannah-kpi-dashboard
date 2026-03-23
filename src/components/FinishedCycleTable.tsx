import { useState } from 'react';
import type { CycleData, ComputedKPIs } from '@/lib/types';
import { formatPercent, formatNumber } from '@/lib/calculations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search } from 'lucide-react';

interface Props {
  cyclesWithKPIs: (CycleData & { kpis: ComputedKPIs })[];
}

export function FinishedCycleTable({ cyclesWithKPIs }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('cycleNumber');
  const [sortAsc, setSortAsc] = useState(true);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = cyclesWithKPIs
    .filter(c => `Cycle ${c.cycleNumber}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = (a as any)[sortKey] ?? (a.kpis as any)[sortKey] ?? 0;
      const bv = (b as any)[sortKey] ?? (b.kpis as any)[sortKey] ?? 0;
      return sortAsc ? av - bv : bv - av;
    });

  const SortHeader = ({ label, field }: { label: string; field: string }) => (
    <TableHead className="text-xs cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </span>
    </TableHead>
  );

  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cycles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-8 max-w-xs text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="Cycle" field="cycleNumber" />
              <SortHeader label="Days" field="cycleDurationDays" />
              <SortHeader label="DFLs" field="dflsBrushed" />
              <SortHeader label="Hatch %" field="hatchRate" />
              <SortHeader label="Survival %" field="totalMortality" />
              <SortHeader label="Wet Cocoons (kg)" field="totalHarvestedWetCocoonWeight" />
              <SortHeader label="Worm Wt (g)" field="finalLarvaeWeight" />
              <SortHeader label="Shell %" field="avgShellRatio" />
              <SortHeader label="FCR" field="overallFeedConversion" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">Cycle {c.cycleNumber}</TableCell>
                <TableCell className="text-right">{c.cycleDurationDays && c.cycleDurationDays > 0 ? c.cycleDurationDays : '—'}</TableCell>
                <TableCell className="text-right">{formatNumber(c.kpis.dflsBrushed)}</TableCell>
                <TableCell className="text-right">{formatPercent(c.kpis.hatchRate)}</TableCell>
                <TableCell className="text-right">{formatPercent(1 - c.kpis.totalMortality)}</TableCell>
                <TableCell className="text-right">{formatNumber(c.totalHarvestedWetCocoonWeight, 2)}</TableCell>
                <TableCell className="text-right">{c.finalLarvaeWeight > 0 ? c.finalLarvaeWeight.toFixed(2) : '—'}</TableCell>
                <TableCell className="text-right">{formatPercent(c.avgShellRatio)}</TableCell>
                <TableCell className="text-right">{c.kpis.overallFeedConversion > 0 ? c.kpis.overallFeedConversion.toFixed(1) : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
