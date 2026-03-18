import { useMemo, useState } from 'react';
import type { CycleData, Assumptions } from '@/lib/types';
import { computeCycleKPIs, formatPercent, formatNumber, getOngoingCycles } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { getTrafficLight } from '@/lib/kpiThresholds';
import { Egg, Activity, Skull, Leaf, Weight, Layers, CheckCircle2, Scale, Calendar, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/store';
import { DailyLogForm } from './DailyLogForm';
import { DailyLogTable } from './DailyLogTable';
import { DailyLogCharts } from './DailyLogCharts';
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
  const { markCycleFinished, getDailyLogsForCycle } = useAppState();
  const ongoingCycles = useMemo(() => getOngoingCycles(cycles), [cycles]);

  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    ongoingCycles.length > 0 ? ongoingCycles[0].id : ''
  );
  const [logFormOpen, setLogFormOpen] = useState(false);

  const selectedCycle = ongoingCycles.find(c => c.id === selectedCycleId) || ongoingCycles[0] || null;
  const kpis = selectedCycle ? computeCycleKPIs(selectedCycle, assumptions) : null;
  const dailyLogs = selectedCycle ? getDailyLogsForCycle(selectedCycle.id) : [];

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
    const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return diffDays;
  })() : 0;

  // Instar chart data
  const instarFeedData = selectedCycle?.instars?.map(i => {
    const feedPerDFL = dflsBrushed > 0 ? (i.totalLeafWeightFedG / 1000) / dflsBrushed : 0;
    return {
      instar: `Instar ${i.instar}`,
      feedKg: Math.round(i.totalLeafWeightFedG / 100) / 10,
      feedPerDFL: Math.round(feedPerDFL * 100) / 100,
      target: i.feedPerDFLTarget || 0,
      days: i.durationDays,
    };
  }) || [];

  const instarMortalityData = selectedCycle?.instars?.map(i => ({
    instar: `Instar ${i.instar}`,
    mortality: Math.round(i.mortalityRatePercent * 10000) / 100,
    cumulative: Math.round(i.cumulativeMortalityRatePercent * 10000) / 100,
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
      {/* Cycle Toggle + Day of Cycle + Add Log */}
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

        {/* Day of Cycle badge */}
        {selectedCycle && currentDayOfCycle > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
            <Calendar className="h-3.5 w-3.5" />
            Day {currentDayOfCycle} of Cycle
          </span>
        )}

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/15 text-warning">
          Ongoing
        </span>

        {/* Add Daily Log */}
        {selectedCycle && (
          <Button onClick={() => setLogFormOpen(true)} size="sm" className="kpi-gradient border-0 text-primary-foreground gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Daily Log
          </Button>
        )}

        {/* Mark as Finished */}
        {selectedCycle && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as Last Completed Cycle
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete Cycle {selectedCycle.cycleNumber}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move Cycle {selectedCycle.cycleNumber} from Ongoing to Finished Cycles. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => markCycleFinished(selectedCycle.id)}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Feed Consumption"
                value={`${formatNumber(leafFedKg, 1)} kg`}
                subtitle={`${formatNumber(selectedCycle.totalLeafWeightFed)}g total`}
                icon={Leaf}
                delay={0.12}
              />
              <KPICard
                title="Larvae Weight"
                value={selectedCycle.finalLarvaeWeight > 0 ? `${selectedCycle.finalLarvaeWeight.toFixed(2)}g` : '—'}
                target="≥ 5.0g"
                icon={Weight}
                trafficLight={selectedCycle.finalLarvaeWeight > 0 ? getTrafficLight(selectedCycle.finalLarvaeWeight, 'wormWeight') : undefined}
                delay={0.15}
              />
              <KPICard
                title="Wet Cocoons"
                value={selectedCycle.totalHarvestedWetCocoonWeight > 0 ? formatNumber(selectedCycle.totalHarvestedWetCocoonWeight, 1) + ' kg' : '—'}
                target={selectedCycle.wetCocoonTarget ? `Target: ${selectedCycle.wetCocoonTarget} kg` : undefined}
                icon={Egg}
                trafficLight={selectedCycle.wetCocoonTarget && selectedCycle.totalHarvestedWetCocoonWeight > 0 ? getTrafficLight(selectedCycle.totalHarvestedWetCocoonWeight / selectedCycle.wetCocoonTarget, 'survivalRate') : undefined}
                delay={0.18}
              />
              <KPICard
                title="Shell Ratio"
                value={selectedCycle.avgShellRatio > 0 ? formatPercent(selectedCycle.avgShellRatio) : '—'}
                target="≥ 21%"
                icon={Scale}
                trafficLight={selectedCycle.avgShellRatio > 0 ? getTrafficLight(selectedCycle.avgShellRatio, 'shellRatio') : undefined}
                delay={0.21}
              />
            </div>
          </div>

          {/* Daily Log Time-Series Charts */}
          {dailyLogs.length >= 2 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground font-display mb-3">
                Daily Trends
              </h2>
              <DailyLogCharts logs={dailyLogs} />
            </div>
          )}

          {/* Instars Performance Section */}
          {selectedCycle.instars && selectedCycle.instars.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground font-display mb-3">
                Instar Performance
              </h2>

              {/* Instar Data Table */}
              <div className="glass-card rounded-xl p-5 mb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground">Instar</th>
                      <th className="text-right py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground">Duration (days)</th>
                      <th className="text-right py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground">Feed (kg)</th>
                      <th className="text-right py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground">Feed/DFL (kg)</th>
                      <th className="text-right py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground">Mortality %</th>
                      <th className="text-right py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground">Cumulative %</th>
                      <th className="text-right py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground">Avg Worm Wt (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCycle.instars.map(i => {
                      const feedPerDFL = dflsBrushed > 0 ? (i.totalLeafWeightFedG / 1000) / dflsBrushed : 0;
                      const avgWeight = i.avgLarvaeWeight ?? 0;
                      return (
                        <tr key={i.instar} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium text-foreground">Instar {i.instar}</td>
                          <td className="py-2 px-3 text-right text-foreground">{i.durationDays}</td>
                          <td className="py-2 px-3 text-right text-foreground">{(i.totalLeafWeightFedG / 1000).toFixed(1)}</td>
                          <td className="py-2 px-3 text-right text-foreground">
                            {feedPerDFL.toFixed(2)}
                            {i.feedPerDFLTarget && (
                              <span className="text-[10px] text-muted-foreground ml-1">
                                (target: {i.feedPerDFLTarget})
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right text-foreground">{(i.mortalityRatePercent * 100).toFixed(1)}%</td>
                          <td className="py-2 px-3 text-right text-foreground">{(i.cumulativeMortalityRatePercent * 100).toFixed(1)}%</td>
                          <td className="py-2 px-3 text-right text-foreground">
                            <div className="flex items-center justify-end gap-1.5">
                              {avgWeight > 0 ? `${avgWeight.toFixed(2)}` : '—'}
                              {avgWeight > 0 && (
                                <span className={`h-2 w-2 rounded-full ${avgWeight >= 5 ? 'bg-success' : avgWeight >= 3 ? 'bg-warning' : 'bg-destructive'}`} />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Instar Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Feed per Instar</h3>
                  <p className="text-[10px] text-muted-foreground mb-4">Feed consumption (kg) and Feed/DFL by instar</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={instarFeedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
                      <XAxis dataKey="instar" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="feedKg" fill="hsl(174, 62%, 32%)" radius={[4, 4, 0, 0]} name="Feed (kg)" />
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
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="mortality" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 4 }} name="Mortality %" />
                      <Line type="monotone" dataKey="cumulative" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Cumulative %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Daily Log Table */}
          <div>
            <h2 className="text-sm font-semibold text-foreground font-display mb-3">
              Daily Log Entries
              {dailyLogs.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground ml-2">({dailyLogs.length} entries)</span>
              )}
            </h2>
            <DailyLogTable cycle={selectedCycle} logs={dailyLogs} />
          </div>

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

      {/* Daily Log Form Dialog */}
      {selectedCycle && (
        <DailyLogForm
          cycle={selectedCycle}
          open={logFormOpen}
          onOpenChange={setLogFormOpen}
        />
      )}
    </div>
  );
}
