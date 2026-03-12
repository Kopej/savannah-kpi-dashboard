import { useMemo, useState } from 'react';
import type { CycleData, Assumptions } from '@/lib/types';
import { computeCycleKPIs, formatPercent, formatNumber, formatKg, getOngoingCycles } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { getTrafficLight } from '@/lib/kpiThresholds';
import { Egg, Activity, Bug, Leaf, Weight, TrendingUp, ArrowRightLeft, Gauge, Skull, Layers } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface Props {
  cycles: CycleData[];
  assumptions: Assumptions;
}

export function OngoingCyclesDashboard({ cycles, assumptions }: Props) {
  const ongoingCycles = useMemo(() => getOngoingCycles(cycles), [cycles]);

  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    ongoingCycles.length > 0 ? ongoingCycles[0].id : ''
  );

  const selectedCycle = ongoingCycles.find(c => c.id === selectedCycleId) || ongoingCycles[0] || null;
  const kpis = selectedCycle ? computeCycleKPIs(selectedCycle, assumptions) : null;

  if (ongoingCycles.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">No ongoing cycles. All cycles are finished.</p>
      </div>
    );
  }

  const leafFedKg = selectedCycle ? selectedCycle.totalLeafWeightFed / 1000 : 0;
  const totalEggs = selectedCycle ? (selectedCycle.totalEggs || selectedCycle.estimatedStartingEggCount) : 0;
  const hatchRate = kpis?.hatchRate || 0;
  const survivalRate = kpis ? 1 - kpis.totalMortality : 0;

  return (
    <div className="space-y-6">
      {/* Cycle Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Select Cycle:</span>
        <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ongoingCycles.map(c => (
              <SelectItem key={c.id} value={c.id}>
                Cycle {c.cycleNumber} — {c.hatchDate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/15 text-warning">
          Ongoing
        </span>
      </div>

      {selectedCycle && kpis && (
        <motion.div
          key={selectedCycle.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Primary Real-Time Metrics */}
          <div>
            <h2 className="text-sm font-semibold text-foreground font-display mb-3">
              Cycle {selectedCycle.cycleNumber} · Real-Time Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Feed Consumption"
                value={`${formatNumber(leafFedKg, 1)} kg`}
                subtitle={`${formatNumber(selectedCycle.totalLeafWeightFed)}g total`}
                icon={Leaf}
                delay={0}
              />
              <KPICard
                title="Larvae Weight"
                value={selectedCycle.finalLarvaeWeight > 0 ? `${selectedCycle.finalLarvaeWeight.toFixed(2)}g` : '—'}
                target="≥ 3.0g"
                icon={Weight}
                trafficLight={selectedCycle.finalLarvaeWeight > 0 ? getTrafficLight(selectedCycle.finalLarvaeWeight, 'wormWeight') : undefined}
                delay={0.03}
              />
              <KPICard
                title="Mortality Rate"
                value={formatPercent(kpis.totalMortality)}
                target="< 10%"
                icon={Skull}
                trafficLight={getTrafficLight(survivalRate, 'survivalRate')}
                delay={0.06}
              />
              <KPICard
                title="Hatch Rate"
                value={hatchRate > 0 ? formatPercent(hatchRate) : (selectedCycle.hatchRatePercent ? formatPercent(selectedCycle.hatchRatePercent) : '—')}
                target="≥ 95%"
                icon={Activity}
                trafficLight={hatchRate > 0 ? getTrafficLight(hatchRate, 'hatchRate') : (selectedCycle.hatchRatePercent ? getTrafficLight(selectedCycle.hatchRatePercent, 'hatchRate') : undefined)}
                delay={0.09}
              />
            </div>
          </div>

          {/* Additional Metrics */}
          <div>
            <h2 className="text-sm font-semibold text-foreground font-display mb-3">
              Additional KPIs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Total Eggs"
                value={formatNumber(totalEggs)}
                icon={Egg}
                delay={0.12}
              />
              <KPICard
                title="DFLs Brushed"
                value={formatNumber(kpis.dflsBrushed)}
                subtitle={`${assumptions.wormsPerDFL} worms/DFL`}
                icon={Layers}
                delay={0.15}
              />
              <KPICard
                title="Total Worm Count"
                value={formatNumber(kpis.totalWormCount)}
                subtitle="Eggs × Hatch Rate"
                icon={Bug}
                delay={0.18}
              />
              <KPICard
                title="Survival Rate"
                value={formatPercent(survivalRate)}
                target="≥ 90%"
                icon={TrendingUp}
                trafficLight={getTrafficLight(survivalRate, 'survivalRate')}
                delay={0.21}
              />
              {selectedCycle.totalHarvestedWetCocoonWeight > 0 && (
                <>
                  <KPICard
                    title="Leaf+Shoot / kg Cocoon"
                    value={`${kpis.leafShootPerKgWetCocoon.toFixed(1)} kg`}
                    subtitle="Feed per kg wet cocoon"
                    icon={Leaf}
                    delay={0.24}
                  />
                  <KPICard
                    title="DFL → Wet Cocoon"
                    value={`${(kpis.dflToWetCocoonKg * 1000).toFixed(0)}g/DFL`}
                    icon={ArrowRightLeft}
                    delay={0.27}
                  />
                  <KPICard
                    title="Reelability"
                    value={formatPercent(kpis.reelability)}
                    target="≥ 90%"
                    icon={Gauge}
                    trafficLight={getTrafficLight(kpis.reelability, 'nonDefective')}
                    delay={0.30}
                  />
                </>
              )}
            </div>
          </div>

          {/* Raw Data Summary */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-display mb-4">Cycle {selectedCycle.cycleNumber} — Raw Data</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-6 text-sm">
              {[
                ['Hatch Date', selectedCycle.hatchDate],
                ['Starting Egg Count', formatNumber(selectedCycle.estimatedStartingEggCount)],
                ['Hatched Eggs', formatNumber(selectedCycle.hatchedEggs)],
                ['Mortality Pre-Cocooning', formatPercent(selectedCycle.mortalityPreCocooning)],
                ['Mortality Cocooning', formatPercent(selectedCycle.mortalityCocooning)],
                ['Final Larvae Weight', selectedCycle.finalLarvaeWeight > 0 ? `${selectedCycle.finalLarvaeWeight}g` : '—'],
                ['Leaf Weight Fed', `${formatNumber(leafFedKg, 1)} kg`],
                ['Wet Cocoon Weight', selectedCycle.totalHarvestedWetCocoonWeight > 0 ? formatKg(selectedCycle.totalHarvestedWetCocoonWeight) : '—'],
                ['Non-Defective %', selectedCycle.percentNonDefective > 0 ? formatPercent(selectedCycle.percentNonDefective) : '—'],
                ['Avg Cocoon Weight', selectedCycle.avgWeightPerWetCocoon > 0 ? `${selectedCycle.avgWeightPerWetCocoon}g` : '—'],
                ['Shell Ratio', selectedCycle.avgShellRatio > 0 ? formatPercent(selectedCycle.avgShellRatio) : '—'],
                ['Wet→Dry Conversion', formatPercent(kpis.wetToDryCocoonConversion)],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
