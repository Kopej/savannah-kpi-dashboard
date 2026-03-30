import { useMemo, useState } from 'react';
import type { CycleData, Assumptions, ComputedKPIs } from '@/lib/types';
import { computeCycleKPIs, computeSummaryKPIs, formatPercent, formatNumber, formatKg, getFinishedCycles } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { KPICharts } from '@/components/KPICharts';
import { FinishedCycleTable } from '@/components/FinishedCycleTable';
import { ConversionFunnel } from '@/components/ConversionFunnel';
import { getTrafficLight } from '@/lib/kpiThresholds';
import { Activity, Bug, Calendar, Factory, Scale, TrendingUp, Weight, Layers, Leaf, ArrowRightLeft, Sparkles, CircleOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Props {
  cycles: CycleData[];
  assumptions: Assumptions;
}

export function FinishedCyclesDashboard({ cycles, assumptions }: Props) {
  const finishedCycles = useMemo(() => getFinishedCycles(cycles), [cycles]);

  const years = useMemo(() => {
    const yrs = [...new Set(finishedCycles.map(c => new Date(c.hatchDate).getFullYear()))].sort((a, b) => b - a);
    return yrs;
  }, [finishedCycles]);

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCycleIds, setSelectedCycleIds] = useState<Set<string>>(new Set());

  const yearFilteredCycles = useMemo(() => {
    if (selectedYear === 'all') return finishedCycles;
    return finishedCycles.filter(c => new Date(c.hatchDate).getFullYear() === parseInt(selectedYear));
  }, [finishedCycles, selectedYear]);

  // Reset selection when year changes
  const toggleCycle = (id: string) => {
    setSelectedCycleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedCycleIds.size === yearFilteredCycles.length) {
      setSelectedCycleIds(new Set());
    } else {
      setSelectedCycleIds(new Set(yearFilteredCycles.map(c => c.id)));
    }
  };

  // Active cycles = selected ones, or all if none selected
  const activeCycles = useMemo(() => {
    if (selectedCycleIds.size === 0) return yearFilteredCycles;
    return yearFilteredCycles.filter(c => selectedCycleIds.has(c.id));
  }, [yearFilteredCycles, selectedCycleIds]);

  const isMultiSelect = activeCycles.length > 1;
  const singleCycle = !isMultiSelect && activeCycles.length === 1 ? activeCycles[0] : null;

  // Compute KPIs
  const singleKPIs = singleCycle ? computeCycleKPIs(singleCycle, assumptions) : null;
  const summary = useMemo(() => computeSummaryKPIs(activeCycles, assumptions), [activeCycles, assumptions]);

  const cyclesWithKPIs = useMemo(() =>
    yearFilteredCycles.map(c => ({ ...c, kpis: computeCycleKPIs(c, assumptions) })),
    [yearFilteredCycles, assumptions]
  );

  const activeCyclesWithKPIs = useMemo(() =>
    activeCycles.map(c => ({ ...c, kpis: computeCycleKPIs(c, assumptions) })),
    [activeCycles, assumptions]
  );

  // For funnel in multi-select, create an averaged pseudo-cycle
  const funnelCycle = singleCycle;
  const funnelKPIs = singleKPIs;

  // Averaged funnel data for multi-select
  const avgFunnelCycle = useMemo<CycleData | null>(() => {
    if (!isMultiSelect || activeCycles.length === 0) return null;
    const n = activeCycles.length;
    return {
      id: 'avg',
      cycleNumber: 0,
      hatchDate: '',
      status: 'finished',
      estimatedStartingEggCount: Math.round(activeCycles.reduce((s, c) => s + c.estimatedStartingEggCount, 0) / n),
      hatchedEggs: Math.round(activeCycles.reduce((s, c) => s + c.hatchedEggs, 0) / n),
      mortalityPreCocooning: activeCycles.reduce((s, c) => s + c.mortalityPreCocooning, 0) / n,
      mortalityCocooning: activeCycles.reduce((s, c) => s + c.mortalityCocooning, 0) / n,
      finalLarvaeWeight: activeCycles.reduce((s, c) => s + c.finalLarvaeWeight, 0) / n,
      totalLeafWeightFed: activeCycles.reduce((s, c) => s + c.totalLeafWeightFed, 0) / n,
      totalHarvestedWetCocoonWeight: activeCycles.reduce((s, c) => s + c.totalHarvestedWetCocoonWeight, 0) / n,
      percentNonDefective: activeCycles.reduce((s, c) => s + c.percentNonDefective, 0) / n,
      avgWeightPerWetCocoon: activeCycles.reduce((s, c) => s + c.avgWeightPerWetCocoon, 0) / n,
      avgShellRatio: activeCycles.reduce((s, c) => s + c.avgShellRatio, 0) / n,
      totalEggs: Math.round(activeCycles.reduce((s, c) => s + (c.totalEggs || c.estimatedStartingEggCount), 0) / n),
      hatchRatePercent: activeCycles.reduce((s, c) => s + (c.hatchRatePercent || 0), 0) / n,
      driedCocoonWeightKg: activeCycles.some(c => c.driedCocoonWeightKg) ? activeCycles.reduce((s, c) => s + (c.driedCocoonWeightKg || 0), 0) / n : undefined,
      reelableCocoonWeightKg: activeCycles.some(c => c.reelableCocoonWeightKg) ? activeCycles.reduce((s, c) => s + (c.reelableCocoonWeightKg || 0), 0) / n : undefined,
    };
  }, [isMultiSelect, activeCycles]);

  const avgFunnelKPIs = avgFunnelCycle ? computeCycleKPIs(avgFunnelCycle, assumptions) : null;

  // Display values
  const displayCycle = singleCycle || avgFunnelCycle;
  const displayKPIs = singleKPIs || (avgFunnelKPIs ? avgFunnelKPIs : null);

  const totalFeedKg = displayCycle ? displayCycle.totalLeafWeightFed / 1000 : 0;
  const totalWormCount = displayKPIs?.totalWormCount || 0;
  const dflsBrushed = displayKPIs?.dflsBrushed || 0;
  const survivalRate = displayKPIs ? 1 - displayKPIs.totalMortality : 0;
  const fcr = displayKPIs?.overallFeedConversion || 0;
  const cycleDays = useMemo(() => {
    if (singleCycle) return singleCycle.cycleDurationDays || 0;
    if (isMultiSelect && activeCycles.length > 0) {
      const total = activeCycles.reduce((s, c) => s + (c.cycleDurationDays || 0), 0);
      const count = activeCycles.filter(c => c.cycleDurationDays && c.cycleDurationDays > 0).length;
      return count > 0 ? Math.round(total / count) : 0;
    }
    return 0;
  }, [singleCycle, isMultiSelect, activeCycles]);

  const cycleLabel = isMultiSelect
    ? `Average of ${activeCycles.length} Cycles (C${activeCycles[0]?.cycleNumber}–C${activeCycles[activeCycles.length - 1]?.cycleNumber})`
    : singleCycle ? `Cycle ${singleCycle.cycleNumber}` : '';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Year:</span>
          <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setSelectedCycleIds(new Set()); }}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {activeCycles.length} of {yearFilteredCycles.length} cycles selected
          </span>
        </div>

        {/* Multi-select cycle toggles */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={selectAll}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCycleIds.size === 0 || selectedCycleIds.size === yearFilteredCycles.length
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            All
          </button>
          {yearFilteredCycles.map(c => (
            <button
              key={c.id}
              onClick={() => toggleCycle(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCycleIds.has(c.id)
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : selectedCycleIds.size === 0
                    ? 'bg-primary/20 text-primary hover:bg-primary/30'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              C{c.cycleNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      {displayCycle && displayKPIs && (
        <div>
          <h2 className="text-sm font-semibold text-foreground font-display mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {cycleLabel}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <KPICard title="Number of DFLs" value={formatNumber(dflsBrushed)} subtitle={`${assumptions.wormsPerDFL} worms/DFL`} icon={Layers} delay={0} />
            <KPICard title="Cycle Duration" value={cycleDays > 0 ? `${cycleDays} days` : '—'} subtitle={isMultiSelect ? 'avg across cycles' : 'hatch to harvest'} target="≤ 45 days" icon={Calendar} delay={0.03} />
            <KPICard title="Total Worm Count" value={formatNumber(totalWormCount)} subtitle="Eggs × Hatch Rate" icon={Bug} delay={0.06} />
            <KPICard title="Total Feed Used" value={`${formatNumber(totalFeedKg, 1)} kg`} subtitle="Leaf + Shoot" icon={Leaf} delay={0.09} />
            <KPICard
              title="Feed Conversion Ratio"
              value={fcr > 0 && isFinite(fcr) ? `${fcr.toFixed(1)}` : '—'}
              subtitle="kg feed / kg wet cocoon"
              target="≤ 20"
              icon={ArrowRightLeft}
              trafficLight={fcr > 0 && isFinite(fcr) ? getTrafficLight(fcr, 'fcr') : undefined}
              delay={0.12}
            />
          </div>
        </div>
      )}

      {/* Performance Indicators */}
      {displayCycle && displayKPIs && (
        <div>
          <h2 className="text-sm font-semibold text-foreground font-display mb-3">
            Performance Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <KPICard title="Hatch Rate" value={formatPercent(displayKPIs.hatchRate)} target="≥ 95%" icon={Activity} trafficLight={getTrafficLight(displayKPIs.hatchRate, 'hatchRate')} delay={0.12} />
            <KPICard title="Survival Rate" value={formatPercent(survivalRate)} target="≥ 90%" icon={TrendingUp} trafficLight={getTrafficLight(survivalRate, 'survivalRate')} delay={0.15} />
            <KPICard title="% Unspun Larvae" value={formatPercent(displayCycle.mortalityCocooning)} target="≤ 5%" icon={CircleOff} trafficLight={getTrafficLight(displayCycle.mortalityCocooning, 'unspunLarvae')} delay={0.17} />
            <KPICard title="Avg Worm Weight" value={`${displayCycle.finalLarvaeWeight.toFixed(2)}g`} target="≥ 5.0g" icon={Weight} trafficLight={getTrafficLight(displayCycle.finalLarvaeWeight, 'wormWeight')} delay={0.18} />
            <KPICard title="Wet Cocoon g/DFL" value={dflsBrushed > 0 ? `${formatNumber(displayCycle.totalHarvestedWetCocoonWeight * 1000 / dflsBrushed, 0)}g` : '—'} target="≥ 1,000g/DFL" icon={Factory} delay={0.21} />
            <KPICard title="Shell Ratio" value={formatPercent(displayCycle.avgShellRatio)} target="≥ 21%" icon={Scale} trafficLight={getTrafficLight(displayCycle.avgShellRatio, 'shellRatio')} delay={0.24} />
          </div>
        </div>
      )}

      {/* Horizontal Conversion Funnel */}
      {singleCycle && funnelKPIs && (
        <ConversionFunnel cycle={singleCycle} kpis={funnelKPIs} assumptions={assumptions} />
      )}
      {isMultiSelect && avgFunnelCycle && avgFunnelKPIs && (
        <ConversionFunnel
          cycle={avgFunnelCycle}
          kpis={avgFunnelKPIs}
          assumptions={assumptions}
          isAveraged
          label={cycleLabel}
        />
      )}

      {/* Trend Charts */}
      <KPICharts cyclesWithKPIs={activeCyclesWithKPIs} />

      {/* Data Table */}
      <FinishedCycleTable cyclesWithKPIs={cyclesWithKPIs} />
    </div>
  );
}
