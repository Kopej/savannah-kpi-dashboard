import { useState, useMemo } from 'react';
import type { CycleData, ComputedKPIs } from '@/lib/types';
import { formatPercent, formatNumber, formatKg } from '@/lib/calculations';
import { getTrafficLight, getTrafficLightDot } from '@/lib/kpiThresholds';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Download, Search } from 'lucide-react';

interface Props {
  cyclesWithKPIs: (CycleData & { kpis: ComputedKPIs })[];
}

function StatusDot({ thresholdKey, value }: { thresholdKey: string; value: number }) {
  const light = getTrafficLight(value, thresholdKey);
  return <span className={`inline-block h-2 w-2 rounded-full ml-1 ${getTrafficLightDot(light)}`} />;
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
    const headers = ['Cycle', 'Hatch Date', 'Eggs', 'Hatched', 'Hatch Rate', 'Worms', 'Survival', 'Worm Wt (g)', 'Cocoon Wt (kg)', 'Shell %', 'Wt/Cocoon (g)', 'Yield/DFL (g)'];
    const rows = filtered.map(c => {
      const dfl = Math.round(c.hatchedEggs / 500);
      const yieldPerDFL = dfl > 0 ? (c.totalHarvestedWetCocoonWeight / dfl * 1000).toFixed(0) : '0';
      return [
        c.cycleNumber, c.hatchDate, c.totalEggs || c.estimatedStartingEggCount, c.hatchedEggs,
        formatPercent(c.kpis.hatchRate), c.kpis.totalWormCount,
        formatPercent(1 - c.kpis.totalMortality), c.finalLarvaeWeight,
        c.totalHarvestedWetCocoonWeight, formatPercent(c.avgShellRatio),
        c.avgWeightPerWetCocoon, yieldPerDFL,
      ];
    });
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
        <h3 className="text-sm font-semibold text-foreground font-display">Cycle Performance Breakdown</h3>
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
              <TableHead>Eggs</TableHead>
              <TableHead>Hatch Rate</TableHead>
              <TableHead>Worms</TableHead>
              <TableHead>Survival</TableHead>
              <TableHead>Worm Wt</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('totalHarvestedWetCocoonWeight')}>
                Cocoons (kg) <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead>Shell %</TableHead>
              <TableHead>Cocoon Wt</TableHead>
              <TableHead>Yield/DFL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const survivalRate = 1 - c.kpis.totalMortality;
              const dfl = Math.round(c.hatchedEggs / 500);
              const yieldPerDFL = dfl > 0 ? c.totalHarvestedWetCocoonWeight / dfl : 0;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">C{c.cycleNumber}</TableCell>
                  <TableCell>{formatNumber(c.totalEggs || c.estimatedStartingEggCount)}</TableCell>
                  <TableCell>
                    {formatPercent(c.kpis.hatchRate)}
                    <StatusDot thresholdKey="hatchRate" value={c.kpis.hatchRate} />
                  </TableCell>
                  <TableCell>{formatNumber(c.kpis.totalWormCount)}</TableCell>
                  <TableCell>
                    {formatPercent(survivalRate)}
                    <StatusDot thresholdKey="survivalRate" value={survivalRate} />
                  </TableCell>
                  <TableCell>
                    {c.finalLarvaeWeight}g
                    <StatusDot thresholdKey="wormWeight" value={c.finalLarvaeWeight} />
                  </TableCell>
                  <TableCell>{formatKg(c.totalHarvestedWetCocoonWeight)}</TableCell>
                  <TableCell>
                    {formatPercent(c.avgShellRatio)}
                    <StatusDot thresholdKey="shellRatio" value={c.avgShellRatio} />
                  </TableCell>
                  <TableCell>{c.avgWeightPerWetCocoon}g</TableCell>
                  <TableCell>
                    {(yieldPerDFL * 1000).toFixed(0)}g
                    <StatusDot thresholdKey="yieldPerDFL" value={yieldPerDFL} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
