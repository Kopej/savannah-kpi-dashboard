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
      larvaeWeight: c.finalLarvaeWeight,
      productivity: Math.round(c.kpis.reelableWetCocoonsProductivity * 10) / 10,
      totalEggs: c.totalEggs || c.estimatedStartingEggCount,
      totalWorms: c.kpis.totalWormCount,
    })),
    [cyclesWithKPIs]
  );

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
        <h3 className="text-sm font-semibold text-foreground mb-4 font-display">Yield per Cycle (kg)</h3>
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
        <h3 className="text-sm font-semibold text-foreground mb-4 font-display">Survival & Hatch Rate (%)</h3>
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

      {/* Cocoon Weight & Shell Ratio */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 font-display">Cocoon Weight (g) & Shell Ratio (%)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="cocoonWeight" stroke="hsl(174, 62%, 32%)" strokeWidth={2} dot={{ r: 4 }} name="Cocoon Weight (g)" />
            <Line yAxisId="right" type="monotone" dataKey="shellRatio" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Shell Ratio (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Egg & Worm Count */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 font-display">Total Eggs & Worm Count</h3>
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
