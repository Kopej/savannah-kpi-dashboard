import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import type { CycleData, ComputedKPIs } from '@/lib/types';

interface Props {
  cyclesWithKPIs: (CycleData & { kpis: ComputedKPIs })[];
}

export function KPICharts({ cyclesWithKPIs }: Props) {
  const chartData = useMemo(() =>
    cyclesWithKPIs.map(c => ({
      cycle: `C${c.cycleNumber}`,
      yield: c.totalHarvestedWetCocoonWeight,
      survival: Math.round((1 - c.kpis.totalMortality) * 100),
      hatchRate: Math.round(c.kpis.hatchRate * 100),
      cocoonWeight: c.avgWeightPerWetCocoon,
      shellRatio: Math.round(c.avgShellRatio * 100),
      wormWeight: c.finalLarvaeWeight,
      totalEggs: c.totalEggs || c.estimatedStartingEggCount,
      totalWorms: c.kpis.totalWormCount,
    })),
    [cyclesWithKPIs]
  );

  // Compute averages for titles
  const avgYield = chartData.length > 0 ? (chartData.reduce((s, d) => s + d.yield, 0) / chartData.length).toFixed(1) : '0';
  const avgSurvival = chartData.length > 0 ? (chartData.reduce((s, d) => s + d.survival, 0) / chartData.length).toFixed(1) : '0';
  const avgHatchRate = chartData.length > 0 ? (chartData.reduce((s, d) => s + d.hatchRate, 0) / chartData.length).toFixed(1) : '0';
  const avgCocoonWt = chartData.length > 0 ? (chartData.reduce((s, d) => s + d.cocoonWeight, 0) / chartData.length).toFixed(2) : '0';
  const avgWormWt = chartData.length > 0 ? (chartData.reduce((s, d) => s + d.wormWeight, 0) / chartData.length).toFixed(2) : '0';

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'hsl(0 0% 100%)',
      border: '1px solid hsl(170 15% 88%)',
      borderRadius: '8px',
      fontSize: '12px',
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Yield over cycles */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Yield per Cycle (kg)</h3>
        <p className="text-[10px] text-muted-foreground mb-4">Average: {avgYield} kg</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="yield" fill="hsl(174, 62%, 32%)" radius={[4, 4, 0, 0]} name="Wet Cocoon (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Survival & Hatch Rate */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Survival & Hatch Rate (%)</h3>
        <p className="text-[10px] text-muted-foreground mb-4">Avg Survival: {avgSurvival}% · Avg Hatch: {avgHatchRate}%</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="survival" stroke="hsl(152, 45%, 45%)" strokeWidth={2} dot={{ r: 4 }} name="Survival %" />
            <Line type="monotone" dataKey="hatchRate" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 4 }} name="Hatch Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cocoon Weight & Worm Weight */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Cocoon Weight & Worm Weight (g)</h3>
        <p className="text-[10px] text-muted-foreground mb-4">Avg Cocoon: {avgCocoonWt}g · Avg Worm: {avgWormWt}g</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="cocoonWeight" stroke="hsl(174, 62%, 32%)" strokeWidth={2} dot={{ r: 4 }} name="Cocoon Weight (g)" />
            <Line type="monotone" dataKey="wormWeight" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Worm Weight (g)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Egg & Worm Count */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Total Eggs & Worm Count</h3>
        <p className="text-[10px] text-muted-foreground mb-4">Across {chartData.length} active cycles</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="totalEggs" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Total Eggs" />
            <Bar dataKey="totalWorms" fill="hsl(152, 45%, 45%)" radius={[4, 4, 0, 0]} name="Total Worms" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
