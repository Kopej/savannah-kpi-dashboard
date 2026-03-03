import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { computeYieldAverages, computeYieldPredictions, formatNumber, formatKg } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { YieldMappingForm } from '@/components/YieldMappingForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Leaf, TreePine, Map, TrendingUp, Download, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';

export default function MulberryPipeline() {
  const { plots, yieldSamples, assumptions } = useAppState();
  const [formOpen, setFormOpen] = useState(false);

  const yieldAverages = useMemo(() => computeYieldAverages(yieldSamples, plots), [yieldSamples, plots]);
  const predictions = useMemo(() => computeYieldPredictions(plots, assumptions), [plots, assumptions]);

  const totalAcreage = plots.reduce((s, p) => s + p.acreage, 0);
  const totalTrees = plots.reduce((s, p) => s + p.treePopulation, 0);
  const totalEstimatedYield = predictions.reduce((s, p) => s + p.expectedYieldKg, 0);
  const totalDFLCapacity = predictions.reduce((s, p) => s + p.rearingCapacityDFL, 0);

  const predictionChartData = predictions.map(p => ({
    plot: p.plotName.length > 15 ? p.plotName.slice(0, 15) + '…' : p.plotName,
    yield: p.expectedYieldKg,
    dfl: Math.round(p.rearingCapacityDFL),
  }));

  const yieldAvgChartData = yieldAverages.map(y => ({
    plot: y.plotName.length > 12 ? y.plotName.slice(0, 12) + '…' : y.plotName,
    avgPerAcre: y.avgYieldPerAcre,
    irrigated: y.irrigated ? 'Yes' : 'No',
  }));

  const downloadYieldMapping = () => {
    const wsData = [
      ['Plot', 'Date', 'Irrigated', 'Tree No.', 'Tree Height (m)', 'Weight Shoots+Leaves (g)', 'Weight Leaves Only (g)'],
      ...yieldSamples.map(s => [s.plotName, s.dateOfSampling, s.irrigated ? 'Yes' : 'No', s.treeNumber, s.treeHeight, s.weightShootsLeaves, s.weightLeavesOnly]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Yield Mapping');
    XLSX.writeFile(wb, 'Savannah_Yield_Mapping.xlsx');
  };

  const tooltipStyle = {
    contentStyle: { backgroundColor: 'hsl(0 0% 100%)', border: '1px solid hsl(170 15% 88%)', borderRadius: '8px', fontSize: '12px' },
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Mulberry Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Yield mapping, predictions & rearing capacity
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setFormOpen(true)} className="kpi-gradient border-0 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Yield Data
          </Button>
          <Button variant="outline" onClick={downloadYieldMapping}>
            <Download className="h-4 w-4 mr-2" />
            Export XLSX
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Acreage" value={`${totalAcreage.toFixed(2)} ac`} icon={Map} delay={0} />
        <KPICard title="Total Trees" value={formatNumber(totalTrees)} icon={TreePine} delay={0.05} />
        <KPICard title="Est. Yield / Harvest" value={formatKg(totalEstimatedYield)} icon={Leaf} delay={0.1} />
        <KPICard title="DFL Capacity" value={formatNumber(Math.round(totalDFLCapacity))} subtitle="Per harvest cycle" icon={TrendingUp} delay={0.15} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 font-display">Predicted Yield by Plot (kg)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictionChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="plot" width={120} tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="yield" fill="hsl(174, 62%, 32%)" radius={[0, 4, 4, 0]} name="Expected Yield (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 font-display">Avg Yield per Acre by Plot</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yieldAvgChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
              <XAxis dataKey="plot" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="avgPerAcre" fill="hsl(152, 45%, 45%)" radius={[4, 4, 0, 0]} name="Avg Yield/Acre (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Plots Table */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 font-display">Plot & Prediction Details</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plot</TableHead>
                <TableHead>Acres</TableHead>
                <TableHead>Trees</TableHead>
                <TableHead>Transplanted</TableHead>
                <TableHead>Irrigated</TableHead>
                <TableHead>Est. Yield (kg)</TableHead>
                <TableHead>DFL Capacity</TableHead>
                <TableHead>Yield/Acre/Yr (MT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map(p => {
                const plot = plots.find(pl => pl.name === p.plotName)!;
                return (
                  <TableRow key={p.plotName}>
                    <TableCell className="font-medium">{p.plotName}</TableCell>
                    <TableCell>{plot.acreage}</TableCell>
                    <TableCell>{formatNumber(plot.treePopulation)}</TableCell>
                    <TableCell>{plot.dateTransplanted}</TableCell>
                    <TableCell>{plot.irrigated ? '✅' : '—'}</TableCell>
                    <TableCell>{formatNumber(p.expectedYieldKg)}</TableCell>
                    <TableCell>{p.rearingCapacityDFL}</TableCell>
                    <TableCell>{(p.projectedYieldPerAcrePerYear / 1000).toFixed(1)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <YieldMappingForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
