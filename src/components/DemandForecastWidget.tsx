import { useMemo } from 'react';
import type { CycleData, Assumptions, MulberryPlot } from '@/lib/types';
import { computeAvgLeafPerDFL, computeYieldPredictions, formatNumber, formatKg } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Zap, Leaf, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  activeCycles: CycleData[];
  plots: MulberryPlot[];
  assumptions: Assumptions;
}

export function DemandForecastWidget({ activeCycles, plots, assumptions }: Props) {
  const TARGET_DFL = 250;

  const avgLeafPerDFL = useMemo(() => computeAvgLeafPerDFL(activeCycles, assumptions), [activeCycles, assumptions]);
  const predictions = useMemo(() => computeYieldPredictions(plots, assumptions), [plots, assumptions]);
  const totalAvailableYield = predictions.reduce((s, p) => s + p.expectedYieldKg, 0);
  const requiredLeafKg = TARGET_DFL * avgLeafPerDFL;
  const surplus = totalAvailableYield - requiredLeafKg;
  const surplusPercent = totalAvailableYield > 0 ? (surplus / totalAvailableYield) * 100 : -100;

  const requiredAcreage = requiredLeafKg / (assumptions.kgLeafShootPerAcrePerHarvest || 3500);
  const totalAcreage = plots.reduce((s, p) => s + p.acreage, 0);

  const status: 'green' | 'orange' | 'red' = surplus > requiredLeafKg * 0.2 ? 'green' : surplus >= 0 ? 'orange' : 'red';
  const statusLabel = status === 'green' ? 'Sufficient' : status === 'orange' ? 'Borderline' : 'Deficit';
  const statusColor = status === 'green' ? 'text-success' : status === 'orange' ? 'text-warning' : 'text-destructive';
  const StatusIcon = status === 'red' ? AlertTriangle : CheckCircle;

  const chartData = [
    { label: 'Available Yield', value: Math.round(totalAvailableYield), fill: 'hsl(152, 45%, 45%)' },
    { label: 'Required (250 DFL)', value: Math.round(requiredLeafKg), fill: status === 'red' ? 'hsl(0, 72%, 51%)' : status === 'orange' ? 'hsl(38, 92%, 50%)' : 'hsl(199, 89%, 48%)' },
  ];

  // Mulberry consumption per cycle (last 5)
  const consumptionData = activeCycles.map(c => ({
    cycle: `C${c.cycleNumber}`,
    leafKg: Math.round(c.totalLeafWeightFed / 1000),
  }));

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-5 border-l-4"
        style={{ borderLeftColor: status === 'green' ? 'hsl(152, 60%, 42%)' : status === 'orange' ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 51%)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground font-display">
            Upcoming 250 DFL Cycle Demand Projection
          </h3>
          <span className={`text-xs font-semibold flex items-center gap-1 ${statusColor}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Required Mulberry</p>
            <p className="text-lg font-bold text-foreground font-display">{formatKg(requiredLeafKg)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Required Acreage</p>
            <p className="text-lg font-bold text-foreground font-display">{requiredAcreage.toFixed(1)} ac</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Available Yield</p>
            <p className="text-lg font-bold text-foreground font-display">{formatKg(totalAvailableYield)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Surplus / Deficit</p>
            <p className={`text-lg font-bold font-display ${statusColor}`}>
              {surplus >= 0 ? '+' : ''}{formatKg(surplus)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Available vs Required</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0 0% 100%)', border: '1px solid hsl(170 15% 88%)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Kg">
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Mulberry Consumption per Cycle</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
                <XAxis dataKey="cycle" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0 0% 100%)', border: '1px solid hsl(170 15% 88%)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="leafKg" fill="hsl(174, 62%, 32%)" radius={[4, 4, 0, 0]} name="Leaf Consumed (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
