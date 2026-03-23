import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart } from 'recharts';
import type { CycleData, ComputedKPIs } from '@/lib/types';

interface Props {
  cyclesWithKPIs: (CycleData & { kpis: ComputedKPIs })[];
}

export function KPICharts({ cyclesWithKPIs }: Props) {
  const chartData = useMemo(() =>
    cyclesWithKPIs.map(c => ({
      cycle: `C${c.cycleNumber}`,
      yield: c.totalHarvestedWetCocoonWeight,
      dfls: c.kpis.dflsBrushed,
      survival: Math.round((1 - c.kpis.totalMortality) * 100),
      hatchRate: Math.round(c.kpis.hatchRate * 100),
      cocoonWeight: c.avgWeightPerWetCocoon,
      shellRatio: Math.round(c.avgShellRatio * 100),
      wormWeight: c.finalLarvaeWeight,
      totalEggs: c.totalEggs || c.estimatedStartingEggCount,
      totalWorms: c.kpis.totalWormCount,
      feedPerCocoon: c.kpis.leafShootPerKgWetCocoon > 0 && isFinite(c.kpis.leafShootPerKgWetCocoon)
        ? Math.round(c.kpis.leafShootPerKgWetCocoon * 10) / 10
        : 0,
      dflConversion: c.kpis.dflToWetCocoonKg > 0 ? Math.round(c.kpis.dflToWetCocoonKg * 1000) : 0,
      reelability: Math.round(c.kpis.reelability * 100),
    })),
    [cyclesWithKPIs]
  );

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const avgYield = avg(chartData.map(d => d.yield)).toFixed(1);
  const avgSurvival = avg(chartData.map(d => d.survival)).toFixed(1);
  const avgHatchRate = avg(chartData.map(d => d.hatchRate)).toFixed(1);
  const avgCocoonWt = avg(chartData.map(d => d.cocoonWeight)).toFixed(2);
  const avgWormWt = avg(chartData.map(d => d.wormWeight)).toFixed(2);
  const validFeed = chartData.filter(d => d.feedPerCocoon > 0);
  const avgFeed = avg(validFeed.map(d => d.feedPerCocoon)).toFixed(1);

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
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Yield & DFLs per Cycle</h3>
        <p className="text-[10px] text-muted-foreground mb-4">Avg Yield: {avgYield} kg · Avg DFLs: {avg(chartData.map(d => d.dfls)).toFixed(0)}</p>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="yield" fill="hsl(174, 62%, 32%)" radius={[4, 4, 0, 0]} name="Wet Cocoon (kg)" />
            <Line yAxisId="right" type="monotone" dataKey="dfls" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 4 }} name="Total DFLs" />
          </ComposedChart>
          </BarChart>
        </ResponsiveContainer>
      </div>

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

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Feed Conversion (kg leaf / kg cocoon)</h3>
        <p className="text-[10px] text-muted-foreground mb-4">Average: {avgFeed} kg leaf per kg wet cocoon</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={validFeed}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="feedPerCocoon" fill="hsl(152, 45%, 45%)" radius={[4, 4, 0, 0]} name="kg Leaf / kg Cocoon" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
