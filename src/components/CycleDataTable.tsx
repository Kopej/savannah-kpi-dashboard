import { useState, useMemo } from 'react';
import type { CycleData, ComputedKPIs } from '@/lib/types';
import { formatPercent, formatNumber, formatKg } from '@/lib/calculations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Download, Search } from 'lucide-react';

interface Props {
  cyclesWithKPIs: (CycleData & { kpis: ComputedKPIs })[];
}

export function CycleDataTable({ cyclesWithKPIs }: Props) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'cycleNumber' | 'totalHarvestedWetCocoonWeight'>('cycleNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    let data = [...cyclesWithKPIs];
    if (search) {
      data = data.filter(c => `Cycle ${c.cycleNumber}`.toLowerCase().includes(search.toLowerCase()));
    }
    data.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDir === 'asc' ? diff : -diff;
    });
    return data;
  }, [cyclesWithKPIs, search, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const exportCSV = () => {
    const headers = ['Cycle', 'Hatch Date', 'Total Eggs', 'Hatched', 'Hatch Rate', 'Total Worms', 'Mortality', 'Cocoon Wt (kg)', 'Shell Ratio', 'Cocoon Wt (g)', 'Productivity (kg/acre)'];
    const rows = filtered.map(c => [
      c.cycleNumber, c.hatchDate, c.totalEggs || c.estimatedStartingEggCount, c.hatchedEggs,
      formatPercent(c.kpis.hatchRate), c.kpis.totalWormCount,
      formatPercent(c.kpis.totalMortality),
      c.totalHarvestedWetCocoonWeight, formatPercent(c.avgShellRatio),
      c.avgWeightPerWetCocoon, c.kpis.reelableWetCocoonsProductivity.toFixed(1),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kpi_cycles.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground font-display">Active Cycle Data Breakdown</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search cycles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 w-48 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('cycleNumber')}>
                Cycle <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead>Hatch Date</TableHead>
              <TableHead>Total Eggs</TableHead>
              <TableHead>Hatched</TableHead>
              <TableHead>Hatch Rate</TableHead>
              <TableHead>Total Worms</TableHead>
              <TableHead>Mortality</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('totalHarvestedWetCocoonWeight')}>
                Cocoon Wt <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead>Shell %</TableHead>
              <TableHead>Wt/Cocoon</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">Cycle {c.cycleNumber}</TableCell>
                <TableCell>{c.hatchDate}</TableCell>
                <TableCell>{formatNumber(c.totalEggs || c.estimatedStartingEggCount)}</TableCell>
                <TableCell>{formatNumber(c.hatchedEggs)}</TableCell>
                <TableCell>{formatPercent(c.kpis.hatchRate)}</TableCell>
                <TableCell>{formatNumber(c.kpis.totalWormCount)}</TableCell>
                <TableCell>{formatPercent(c.kpis.totalMortality)}</TableCell>
                <TableCell>{formatKg(c.totalHarvestedWetCocoonWeight)}</TableCell>
                <TableCell>{formatPercent(c.avgShellRatio)}</TableCell>
                <TableCell>{c.avgWeightPerWetCocoon}g</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
