import { useMemo, useState } from 'react';
import type { CycleData, Assumptions } from '@/lib/types';
import { computeCycleKPIs, formatPercent, formatNumber, getOngoingCycles } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { getTrafficLight } from '@/lib/kpiThresholds';
import { Egg, Activity, Skull, Leaf, Weight, Layers, CheckCircle2, Scale, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/store';
import { CycleProgressBar } from '@/components/CycleProgressBar';
import { InstarPerformanceTable } from '@/components/InstarPerformanceTable';
import { useInstarTargets } from '@/hooks/useInstarTargets';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  cycles: CycleData[];
  assumptions: Assumptions;
}

export function OngoingCyclesDashboard({ cycles, assumptions }: Props) {
  const { markCycleFinished } = useAppState();
  const { targets: instarTargets } = useInstarTargets();
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
  const hatchRate = kpis?.hatchRate || selectedCycle?.hatchRatePercent || 0;
  const totalMortality = kpis?.totalMortality || 0;
  const dflsBrushed = kpis?.dflsBrushed || 0;

  // Current day of cycle
  const currentDayOfCycle = selectedCycle ? (() => {
    if (selectedCycle.currentDayOfCycle) return selectedCycle.currentDayOfCycle;
    const hatch = new Date(selectedCycle.hatchDate);
    const now = new Date();
    const diffMs = now.getTime() - hatch.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  })() : 0;

  // Instar chart data
  const instarFeedData = selectedCycle?.instars?.map(i => {
    const feedPerDFL = dflsBrushed > 0 ? (i.totalLeafWeightFedG / 1000) / dflsBrushed : 0;
    return {
      instar: `Instar ${i.instar}`,
      feedPerDFL: Math.round(feedPerDFL * 100) / 100,
      days: i.durationDays,
    };
  }) || [];

  const instarMortalityData = selectedCycle?.instars?.map(i => ({
    instar: `Instar ${i.instar}`,
    mortality: Math.round(i.mortalityRatePercent * 10000) / 100,
    cumulative: Math.round(i.cumulativeMortalityRatePercent * 10000) / 100,
    mortalityTarget: 2,
  })) || [];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'hsl(0 0% 100%)',
      border: '1px solid hsl(170 15% 88%)',
      borderRadius: '8px',
      fontSize: '12px',
    },
  };

  return (
    <div className="space-y-6">
      {/* Cycle Toggle + Day of Cycle */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Select Cycle:</span>
        <div className="flex gap-2">
          {ongoingCycles.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCycleId(c.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCycleId === c.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Cycle {c.cycleNumber}
            </button>
          ))}
        </div>

        {selectedCycle && currentDayOfCycle > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
            <Calendar className="h-3.5 w-3.5" />
            Day {currentDayOfCycle} of Cycle
          </span>
        )}

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/15 text-warning">
          Ongoing
        </span>

        {/* Mark as Finished */}
        {selectedCycle && (() => {
          const missingFields: string[] = [];
          if (!selectedCycle.finalLarvaeWeight) missingFields.push('Final Larvae Weight');
          if (!selectedCycle.totalHarvestedWetCocoonWeight) missingFields.push('Wet Weight – All Cocoons');
          if (!selectedCycle.avgWeightPerWetCocoon) missingFields.push('Avg Weight per Wet Cocoon');
          if (!selectedCycle.avgShellRatio) missingFields.push('Avg Shell Ratio');
          const canComplete = missingFields.length === 0;

          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark as Last Completed Cycle
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {canComplete ? `Complete Cycle ${selectedCycle.cycleNumber}?` : 'Cannot Complete Cycle'}
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    {canComplete ? (
                      <p>This will move Cycle {selectedCycle.cycleNumber} from Ongoing to Finished Cycles. This action cannot be undone.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-destructive font-medium">
                          Please complete all End of Cycle Summary fields before marking the cycle as complete.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground">
                          {missingFields.map(f => <li key={f}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{canComplete ? 'Cancel' : 'Close'}</AlertDialogCancel>
                  {canComplete && (
                    <AlertDialogAction onClick={() => markCycleFinished(selectedCycle.id)}>
                      Confirm
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        })()}
      </div>

      {/* Cycle Progress Bar */}
      {selectedCycle && currentDayOfCycle > 0 && (
        <CycleProgressBar cycle={selectedCycle} currentDay={currentDayOfCycle} />
      )}

      {selectedCycle && kpis && (
        <motion.div
          key={selectedCycle.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Key Insight Tiles */}
          <div>
            <h2 className="text-sm font-semibold text-foreground font-display mb-3">
              Cycle {selectedCycle.cycleNumber} · Key Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard
                title="Total DFLs"
                value={formatNumber(dflsBrushed)}
                target="≥ 500 DFL"
                icon={Layers}
                trafficLight={getTrafficLight(dflsBrushed, 'dflCount')}
                delay={0}
              />
              <KPICard
                title="Hatch Rate"
                value={formatPercent(hatchRate)}
                target="≥ 95%"
                icon={Activity}
                trafficLight={getTrafficLight(hatchRate, 'hatchRate')}
                delay={0.05}
              />
              <KPICard
                title="Mortality"
                value={formatPercent(totalMortality)}
                target="< 10%"
                icon={Skull}
                trafficLight={getTrafficLight(totalMortality, 'mortality')}
                delay={0.1}
              />
            </div>
          </div>

          {/* Real-Time Metrics */}
          <div>
            <h2 className="text-sm font-semibold text-foreground font-display mb-3">
              Real-Time Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KPICard
                title="Feed Consumption"
                value={`${formatNumber(leafFedKg, 1)} kg`}
                subtitle={undefined}
                icon={Leaf}
                delay={0.12}
              />
              {(() => {
                // Find latest instar with avgLarvaeWeight data
                const instars = selectedCycle.instars || [];
                const latestInstarWithWeight = [...instars].reverse().find(i => i.avgLarvaeWeight && i.avgLarvaeWeight > 0);
                const latestWeight = latestInstarWithWeight?.avgLarvaeWeight ?? selectedCycle.finalLarvaeWeight;
                const latestInstarNum = latestInstarWithWeight?.instar;
                const subtitleParts: string[] = [];
                if (latestInstarNum) subtitleParts.push(`Instar ${latestInstarNum}`);
                
                return (
                  <KPICard
                    title="Latest Larvae Weight"
                    value={latestWeight > 0 ? `${latestWeight.toFixed(2)}g` : '—'}
                    target="≥ 5.0g at end of cycle"
                    subtitle={subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined}
                    icon={Weight}
                    trafficLight={undefined}
                    delay={0.15}
                  />
                );
              })()}
            </div>
          </div>

          {/* Instar Charts */}
          {selectedCycle.instars && selectedCycle.instars.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground font-display mb-3">
                Instar Charts
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Feed/DFL per Instar</h3>
                  <p className="text-[10px] text-muted-foreground mb-4">Feed per DFL (kg) by instar</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={instarFeedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
                      <XAxis dataKey="instar" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="feedPerDFL" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Feed/DFL (kg)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Mortality per Instar</h3>
                  <p className="text-[10px] text-muted-foreground mb-4">Mortality rate (%) by instar stage</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={instarMortalityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
                      <XAxis dataKey="instar" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, (dataMax: number) => Math.max(dataMax, 3)]} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="mortalityTarget" stroke="hsl(152, 45%, 45%)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Target (< 2%)" />
                      <Line type="monotone" dataKey="cumulative" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 5 }} name="Cumulative %" />
                      <Line type="monotone" dataKey="mortality" stroke="hsl(0, 72%, 51%)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2 }} name="Mortality %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Instar Performance vs Targets */}
          {selectedCycle.instars && selectedCycle.instars.length > 0 && (
            <InstarPerformanceTable cycle={selectedCycle} dflsBrushed={dflsBrushed} targets={instarTargets} />
          )}

          {/* Raw Data Summary */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-display mb-4">Cycle {selectedCycle.cycleNumber} — Raw Data</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-6 text-sm">
              {[
                ['Hatch Date', selectedCycle.hatchDate],
                ['Starting Egg Count', formatNumber(selectedCycle.estimatedStartingEggCount)],
                ['Hatched Eggs', formatNumber(selectedCycle.hatchedEggs)],
                ['Hatch Rate', hatchRate > 0 ? formatPercent(hatchRate) : '—'],
                ['Mortality Pre-Cocooning', formatPercent(selectedCycle.mortalityPreCocooning)],
                ['Mortality Cocooning', formatPercent(selectedCycle.mortalityCocooning)],
                ['Final Larvae Weight', selectedCycle.finalLarvaeWeight > 0 ? `${selectedCycle.finalLarvaeWeight}g` : '—'],
                ['Total Leaf Weight Fed', `${formatNumber(leafFedKg, 1)} kg`],
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
