import { motion } from 'framer-motion';
import type { CycleData, ComputedKPIs, Assumptions } from '@/lib/types';
import { formatPercent, formatKg, formatNumber } from '@/lib/calculations';
import { ArrowDown } from 'lucide-react';

interface Props {
  cycle: CycleData;
  kpis: ComputedKPIs;
  assumptions: Assumptions;
}

interface FunnelStage {
  label: string;
  value: string;
  conversion?: string;
  color: string;
  widthPercent: number;
}

export function ConversionFunnel({ cycle, kpis, assumptions }: Props) {
  const dflsBrushed = kpis.dflsBrushed;
  const wetCocoonKg = cycle.totalHarvestedWetCocoonWeight;
  const reelableWetKg = kpis.reelableWetCocoons;
  const dryCocoonKg = cycle.driedCocoonWeightKg ?? (wetCocoonKg * assumptions.wetToDryConversion);
  const reeledSilkKg = cycle.reeledSilkWeightKg;

  const wetConversion = dflsBrushed > 0 ? (wetCocoonKg / dflsBrushed) : 0;
  const dryConversion = wetCocoonKg > 0 ? (dryCocoonKg / wetCocoonKg) : 0;
  const reelableConversion = dryCocoonKg > 0 ? (reelableWetKg / dryCocoonKg) : 0;

  const stages: FunnelStage[] = [
    {
      label: 'Total DFLs',
      value: formatNumber(dflsBrushed),
      color: 'bg-primary',
      widthPercent: 100,
    },
    {
      label: 'Wet Cocoons',
      value: formatKg(wetCocoonKg),
      conversion: wetCocoonKg > 0 ? `${(wetConversion * 1000).toFixed(0)}g per DFL` : '—',
      color: 'bg-secondary',
      widthPercent: 80,
    },
    {
      label: 'Dry Cocoons',
      value: formatKg(dryCocoonKg),
      conversion: `${formatPercent(dryConversion)} of wet`,
      color: 'bg-accent-foreground',
      widthPercent: 60,
    },
    {
      label: 'Reelable Cocoons',
      value: formatKg(reelableWetKg),
      conversion: `${formatPercent(cycle.percentNonDefective)} non-defective`,
      color: 'bg-warning',
      widthPercent: 45,
    },
  ];

  // Cycle 14 special: add reeled silk stage
  if (reeledSilkKg && reeledSilkKg > 0) {
    const reeledConversion = dryCocoonKg > 0 ? reeledSilkKg / dryCocoonKg : 0;
    stages.push({
      label: 'Reeled Silk',
      value: formatKg(reeledSilkKg),
      conversion: `${formatPercent(reeledConversion)} of dry cocoons`,
      color: 'bg-primary',
      widthPercent: 30,
    });
  }

  if (wetCocoonKg <= 0 && dflsBrushed <= 0) return null;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground font-display mb-5">
        Conversion Funnel · Cycle {cycle.cycleNumber}
      </h3>
      <div className="flex flex-col items-center gap-1">
        {stages.map((stage, idx) => (
          <div key={stage.label} className="w-full flex flex-col items-center">
            {idx > 0 && (
              <div className="flex flex-col items-center my-1">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                {stage.conversion && (
                  <span className="text-[10px] text-muted-foreground font-medium">{stage.conversion}</span>
                )}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`${stage.color} text-primary-foreground rounded-lg py-3 px-4 flex items-center justify-between`}
              style={{ width: `${stage.widthPercent}%`, minWidth: '200px' }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">{stage.label}</span>
              <span className="text-sm font-bold">{stage.value}</span>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
