import { motion } from 'framer-motion';
import type { CycleData, ComputedKPIs, Assumptions } from '@/lib/types';
import { formatPercent, formatKg, formatNumber } from '@/lib/calculations';
import { ArrowRight } from 'lucide-react';
import { getTrafficLight, getTrafficLightDot } from '@/lib/kpiThresholds';

interface Props {
  cycle: CycleData;
  kpis: ComputedKPIs;
  assumptions: Assumptions;
  /** When true, show averaged data for multi-cycle view */
  isAveraged?: boolean;
  label?: string;
}

interface FunnelStage {
  label: string;
  value: string;
  color: string;
}

interface FunnelTransition {
  metric: string;
  value: number;
  target: number;
  thresholdKey?: string;
  format: 'percent' | 'ratio';
}

export function ConversionFunnel({ cycle, kpis, assumptions, isAveraged, label }: Props) {
  const dflsBrushed = kpis.dflsBrushed;
  const wetCocoonKg = cycle.totalHarvestedWetCocoonWeight;
  const dryCocoonKg = cycle.driedCocoonWeightKg ?? (wetCocoonKg * assumptions.wetToDryConversion);
  const reelableWetKg = kpis.reelableWetCocoons;
  const reeledSilkKg = cycle.reeledSilkWeightKg;

  const wetConversionGPerDFL = dflsBrushed > 0 ? (wetCocoonKg / dflsBrushed) * 1000 : 0;
  const dryConversion = wetCocoonKg > 0 ? dryCocoonKg / wetCocoonKg : 0;
  const reelablePercent = cycle.percentNonDefective;

  const stages: FunnelStage[] = [
    { label: 'Total DFLs', value: formatNumber(dflsBrushed), color: 'bg-primary' },
    { label: 'Wet Cocoons', value: formatKg(wetCocoonKg), color: 'bg-secondary' },
    { label: 'Dry Cocoons', value: formatKg(dryCocoonKg), color: 'bg-accent-foreground' },
    { label: 'Reelable Cocoons', value: formatKg(reelableWetKg), color: 'bg-warning' },
  ];

  const transitions: FunnelTransition[] = [
    { metric: 'DFL → Wet', value: wetConversionGPerDFL, target: 1000, format: 'ratio' },
    { metric: 'Wet → Dry', value: dryConversion, target: 0.45, thresholdKey: 'wetToDry', format: 'percent' },
    { metric: 'Non-Defective', value: reelablePercent, target: 0.95, thresholdKey: 'nonDefective', format: 'percent' },
  ];

  // Cycle 14 special
  if (reeledSilkKg && reeledSilkKg > 0) {
    const reeledConversion = dryCocoonKg > 0 ? reeledSilkKg / dryCocoonKg : 0;
    stages.push({ label: 'Reeled Silk', value: formatKg(reeledSilkKg), color: 'bg-primary' });
    transitions.push({ metric: 'Dry → Silk', value: reeledConversion, target: 0.33, format: 'percent' });
  }

  if (wetCocoonKg <= 0 && dflsBrushed <= 0) return null;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground font-display mb-5">
        Conversion Funnel {label ? `· ${label}` : `· Cycle ${cycle.cycleNumber}`}
        {isAveraged && <span className="text-xs text-muted-foreground ml-2">(Averaged)</span>}
      </h3>

      {/* Horizontal funnel */}
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {stages.map((stage, idx) => (
          <div key={stage.label} className="flex items-start shrink-0">
            {/* Stage block */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className={`${stage.color} text-primary-foreground rounded-xl py-4 px-5 min-w-[120px] text-center`}>
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90">{stage.label}</p>
                <p className="text-lg font-bold mt-1">{stage.value}</p>
              </div>
            </motion.div>

            {/* Transition arrow + metric card */}
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
  const displayValue = transition.format === 'percent'
    ? formatPercent(transition.value)
    : `${transition.value.toFixed(0)}g/DFL`;

  const displayTarget = transition.format === 'percent'
    ? formatPercent(transition.target)
    : `${transition.target}g/DFL`;

  // Simple threshold check
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
