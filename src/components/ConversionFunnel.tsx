import { motion } from 'framer-motion';
import type { CycleData, ComputedKPIs, Assumptions } from '@/lib/types';
import { formatPercent, formatKg, formatNumber } from '@/lib/calculations';
import { ArrowRight } from 'lucide-react';
import { getTrafficLight, getTrafficLightDot } from '@/lib/kpiThresholds';

interface Props {
  cycle: CycleData;
  kpis: ComputedKPIs;
  assumptions: Assumptions;
  isAveraged?: boolean;
  label?: string;
}

interface FunnelStage {
  label: string;
  value: string | null; // null = awaiting data
  color: string;
  hasData: boolean;
}

interface FunnelTransition {
  metric: string;
  value: number | null; // null = can't compute
  target: number;
  thresholdKey?: string;
  format: 'percent' | 'ratio';
}

export function ConversionFunnel({ cycle, kpis, assumptions, isAveraged, label }: Props) {
  const dflsBrushed = kpis.dflsBrushed;
  const wetCocoonKg = cycle.totalHarvestedWetCocoonWeight;
  const dryCocoonKg = cycle.driedCocoonWeightKg;
  const reelableKg = cycle.reelableCocoonWeightKg;
  const reeledSilkKg = cycle.reeledSilkWeightKg;

  const hasDFLs = dflsBrushed > 0;
  const hasWet = wetCocoonKg > 0;
  const hasDry = dryCocoonKg != null && dryCocoonKg > 0;
  const hasReelable = reelableKg != null && reelableKg > 0;
  const hasSilk = reeledSilkKg != null && reeledSilkKg > 0;

  const wetConversionGPerDFL = hasDFLs && hasWet ? (wetCocoonKg / dflsBrushed) * 1000 : null;
  const dryConversion = hasWet && hasDry ? dryCocoonKg! / wetCocoonKg : null;
  const reelablePercent = hasDry && hasReelable ? reelableKg! / dryCocoonKg! : null;
  const silkConversion = hasDry && hasSilk ? reeledSilkKg! / dryCocoonKg! : null;

  const stages: FunnelStage[] = [
    { label: 'Total DFLs', value: hasDFLs ? formatNumber(dflsBrushed) : null, color: 'bg-primary', hasData: hasDFLs },
    { label: 'Wet Cocoons', value: hasWet ? formatKg(wetCocoonKg) : null, color: 'bg-secondary', hasData: hasWet },
    { label: 'Dry Cocoons', value: hasDry ? formatKg(dryCocoonKg!) : null, color: 'bg-accent-foreground', hasData: hasDry },
    { label: 'Reelable Cocoons', value: hasReelable ? formatKg(reelableKg!) : null, color: 'bg-warning', hasData: hasReelable },
    { label: 'Reeled Silk', value: hasSilk ? formatKg(reeledSilkKg!) : null, color: 'bg-primary', hasData: hasSilk },
  ];

  const transitions: FunnelTransition[] = [
    { metric: 'Wet Cocoons/DFL', value: wetConversionGPerDFL, target: 1000, format: 'ratio' },
    { metric: 'Wet → Dry', value: dryConversion, target: 0.50, thresholdKey: 'wetToDry', format: 'percent' },
    { metric: '% Reelable', value: reelablePercent, target: 0.95, thresholdKey: 'nonDefective', format: 'percent' },
    { metric: 'Dry → Silk', value: silkConversion, target: 0.33, format: 'percent' },
  ];

  if (!hasDFLs && !hasWet) return null;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground font-display mb-5">
        Conversion Funnel {label ? `· ${label}` : `· Cycle ${cycle.cycleNumber}`}
        {isAveraged && <span className="text-xs text-muted-foreground ml-2">(Averaged)</span>}
      </h3>

      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {stages.map((stage, idx) => (
          <div key={stage.label} className="flex items-start shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              {stage.hasData ? (
                <div className={`${stage.color} text-primary-foreground rounded-xl py-4 px-5 min-w-[120px] text-center`}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90">{stage.label}</p>
                  <p className="text-lg font-bold mt-1">{stage.value}</p>
                </div>
              ) : (
                <div className="rounded-xl py-4 px-5 min-w-[120px] text-center border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">{stage.label}</p>
                  <p className="text-xs font-medium mt-1.5 text-muted-foreground/50 italic">Awaiting data</p>
                </div>
              )}
            </motion.div>

            {idx < transitions.length && (
              <div className="flex flex-col items-center mx-2 mt-2 shrink-0 min-w-[100px]">
                <ArrowRight className="h-5 w-5 text-muted-foreground mb-1" />
                <TransitionCard transition={transitions[idx]} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TransitionCard({ transition }: { transition: FunnelTransition }) {
  if (transition.value == null) {
    return (
      <div className="rounded-lg p-2.5 text-center border border-dashed border-muted-foreground/30 bg-muted/10 min-w-[90px]">
        <p className="text-[9px] uppercase tracking-wide text-muted-foreground/50 font-medium">{transition.metric}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1 italic">—</p>
      </div>
    );
  }

  const displayValue = transition.format === 'percent'
    ? formatPercent(transition.value)
    : `${transition.value.toFixed(0)}g/DFL`;

  const displayTarget = transition.format === 'percent'
    ? formatPercent(transition.target)
    : `${transition.target}g/DFL`;

  const light = transition.thresholdKey
    ? getTrafficLight(transition.value, transition.thresholdKey)
    : transition.value >= transition.target * 0.9 ? 'green' as const : transition.value >= transition.target * 0.7 ? 'yellow' as const : 'red' as const;

  return (
    <div className="glass-card rounded-lg p-2.5 text-center border">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-medium">{transition.metric}</p>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <span className="text-sm font-bold text-foreground">{displayValue}</span>
        <span className={`h-2 w-2 rounded-full ${getTrafficLightDot(light)}`} />
      </div>
      <p className="text-[9px] text-muted-foreground mt-0.5">Target: {displayTarget}</p>
    </div>
  );
}
