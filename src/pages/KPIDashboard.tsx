import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { computeCycleKPIs, computeSummaryKPIs, formatPercent, formatNumber, formatKg } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { AddCycleDialog } from '@/components/AddCycleDialog';
import { KPICharts } from '@/components/KPICharts';
import { CycleDataTable } from '@/components/CycleDataTable';
import { Activity, Bug, Egg, Factory, Gauge, Scale, TrendingUp, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function KPIDashboard() {
  const { cycles, assumptions } = useAppState();
  const [addOpen, setAddOpen] = useState(false);

  const summary = useMemo(() => computeSummaryKPIs(cycles, assumptions), [cycles, assumptions]);
  const cyclesWithKPIs = useMemo(() =>
    cycles.map(c => ({ ...c, kpis: computeCycleKPIs(c, assumptions) })),
    [cycles, assumptions]
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">KPI Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cross-cycle operations performance tracking
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="kpi-gradient border-0 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Cycle Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Production"
          value={formatKg(summary.totalProduction)}
          subtitle="Wet cocoon weight"
          icon={Factory}
          delay={0}
        />
        <KPICard
          title="Avg Survival Rate"
          value={formatPercent(summary.avgSurvivalRate)}
          subtitle="Target: >90%"
          icon={Activity}
          trend={summary.avgSurvivalRate > 0.9 ? 'up' : 'down'}
          delay={0.05}
        />
        <KPICard
          title="Total Cocoons"
          value={formatNumber(summary.totalCocoons)}
          subtitle={`Across ${cycles.length} cycles`}
          icon={Egg}
          delay={0.1}
        />
        <KPICard
          title="Avg Yield / DFL"
          value={`${formatNumber(summary.avgYieldPerDFL * 1000, 0)}g`}
          subtitle={`${summary.totalDFLsBrushed} DFLs brushed`}
          icon={TrendingUp}
          delay={0.15}
        />
        <KPICard
          title="Avg Cocoon Weight"
          value={`${summary.avgCocoonWeight.toFixed(2)}g`}
          subtitle="Target: 2.0g"
          icon={Weight}
          trend={summary.avgCocoonWeight >= 1.5 ? 'up' : 'down'}
          delay={0.2}
        />
        <KPICard
          title="Avg Shell Ratio"
          value={formatPercent(summary.avgShellRatio)}
          subtitle="Target: >21%"
          icon={Gauge}
          trend={summary.avgShellRatio >= 0.21 ? 'up' : 'down'}
          delay={0.25}
        />
        <KPICard
          title="Total DFLs Brushed"
          value={formatNumber(summary.totalDFLsBrushed)}
          icon={Scale}
          delay={0.3}
        />
        <KPICard
          title="Cycles Completed"
          value={String(cycles.length)}
          icon={Bug}
          delay={0.35}
        />
      </div>

      {/* Charts */}
      <KPICharts cyclesWithKPIs={cyclesWithKPIs} />

      {/* Data Table */}
      <CycleDataTable cyclesWithKPIs={cyclesWithKPIs} />

      <AddCycleDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
