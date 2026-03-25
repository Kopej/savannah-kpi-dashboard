import type { CycleData } from '@/lib/types';
import type { InstarTarget } from '@/hooks/useInstarTargets';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Props {
  cycle: CycleData;
  dflsBrushed: number;
  targets?: InstarTarget[];
}

// Fallback defaults if targets not loaded yet
const DEFAULT_FEED = [5, 18, 60, 350, 2500];
const DEFAULT_WEIGHT = [1, 2, 3, 4, 5];
const MORTALITY_TARGET = 0.05;

export function InstarPerformanceTable({ cycle, dflsBrushed, targets }: Props) {
  const instars = cycle.instars || [];
  const instarNumbers = [1, 2, 3, 4, 5];

  const getInstar = (num: number) => instars.find(i => i.instar === num);
  const getTarget = (num: number) => targets?.find(t => t.instar === num);

  const feedTargetKg = (num: number) => {
    const t = getTarget(num);
    const rate = t ? t.feedTargetPer100Dfl : DEFAULT_FEED[num - 1];
    return dflsBrushed > 0 ? (dflsBrushed / 100) * rate : null;
  };

  const weightTarget = (num: number) => {
    const t = getTarget(num);
    return t ? t.larvaeWeightTargetG : DEFAULT_WEIGHT[num - 1];
  };

  const hasData = (num: number) => {
    const i = getInstar(num);
    return i && (i.totalLeafWeightFedG > 0 || i.mortality > 0 || i.durationDays > 0);
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground font-display mb-1">
        Instar Performance vs Targets
      </h3>
      <p className="text-[10px] text-muted-foreground mb-4">
        Actual feed, mortality &amp; larvae weight compared to targets · {dflsBrushed > 0 ? `${dflsBrushed} DFLs` : 'No DFL data'}
      </p>

      <div className="relative w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px] text-xs font-semibold">Metric</TableHead>
              {instarNumbers.map(n => (
                <TableHead key={n} className="text-center text-xs font-semibold min-w-[110px]">
                  Instar {n}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Duration */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Duration (days)</TableCell>
              {instarNumbers.map(n => {
                const i = getInstar(n);
                return (
                  <TableCell key={n} className="text-center text-sm">
                    {i && i.durationDays > 0 ? i.durationDays : <span className="text-muted-foreground/50">—</span>}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Actual Feed */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Actual Feed (kg)</TableCell>
              {instarNumbers.map(n => {
                const i = getInstar(n);
                const val = i ? i.totalLeafWeightFedG / 1000 : null;
                return (
                  <TableCell key={n} className="text-center text-sm font-medium">
                    {val != null && val > 0
                      ? val.toFixed(1)
                      : <span className="text-muted-foreground/50">—</span>}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Feed Target */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Feed Target (kg)</TableCell>
              {instarNumbers.map(n => {
                const target = feedTargetKg(n);
                return (
                  <TableCell key={n} className="text-center text-sm text-muted-foreground">
                    {target != null ? target.toFixed(1) : '—'}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Feed Status */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Feed Status</TableCell>
              {instarNumbers.map(n => {
                const i = getInstar(n);
                const actual = i ? i.totalLeafWeightFedG / 1000 : 0;
                const target = feedTargetKg(n);
                const dataPresent = hasData(n) && actual > 0;

                if (!dataPresent || target == null) {
                  return (
                    <TableCell key={n} className="text-center">
                      <span className="text-[10px] text-muted-foreground/50">Pending</span>
                    </TableCell>
                  );
                }

                const ok = actual >= target;
                return (
                  <TableCell key={n} className="text-center">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
                      ok
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-destructive/10 text-destructive'
                    )}>
                      {ok ? '✓ On Target' : '✗ Below Target'}
                    </span>
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Actual Mortality */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Actual Mortality (%)</TableCell>
              {instarNumbers.map(n => {
                const i = getInstar(n);
                const val = i ? i.mortalityRatePercent * 100 : null;
                const dataPresent = hasData(n);
                return (
                  <TableCell key={n} className="text-center text-sm font-medium">
                    {dataPresent && val != null
                      ? `${val.toFixed(1)}%`
                      : <span className="text-muted-foreground/50">—</span>}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Mortality Target */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Mortality Target</TableCell>
              {instarNumbers.map(n => (
                <TableCell key={n} className="text-center text-sm text-muted-foreground">
                  &lt; 5%
                </TableCell>
              ))}
            </TableRow>

            {/* Mortality Status */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Mortality Status</TableCell>
              {instarNumbers.map(n => {
                const i = getInstar(n);
                const val = i ? i.mortalityRatePercent : 0;
                const dataPresent = hasData(n);

                if (!dataPresent) {
                  return (
                    <TableCell key={n} className="text-center">
                      <span className="text-[10px] text-muted-foreground/50">Pending</span>
                    </TableCell>
                  );
                }

                const ok = val <= MORTALITY_TARGET;
                return (
                  <TableCell key={n} className="text-center">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
                      ok
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-destructive/10 text-destructive'
                    )}>
                      {ok ? '✓ Within Limit' : '✗ Above Limit'}
                    </span>
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Larvae Weight Target */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Larvae Weight Target (g)</TableCell>
              {instarNumbers.map(n => (
                <TableCell key={n} className="text-center text-sm text-muted-foreground">
                  {weightTarget(n).toFixed(1)}
                </TableCell>
              ))}
            </TableRow>

            {/* Actual Larvae Weight */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Actual Larvae Weight (g)</TableCell>
              {instarNumbers.map(n => {
                const i = getInstar(n);
                const val = i?.avgLarvaeWeight;
                if (n <= 2) {
                  return (
                    <TableCell key={n} className="text-center text-sm text-muted-foreground/60 italic">
                      {val && val > 0 ? val.toFixed(2) : 'Not measured'}
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={n} className="text-center text-sm font-medium">
                    {val && val > 0 ? val.toFixed(2) : <span className="text-muted-foreground/50">—</span>}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Larvae Weight Status */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Larvae Weight Status</TableCell>
              {instarNumbers.map(n => {
                if (n <= 2) {
                  return (
                    <TableCell key={n} className="text-center">
                      <span className="text-[10px] text-muted-foreground/50 italic">N/A</span>
                    </TableCell>
                  );
                }

                const i = getInstar(n);
                const val = i?.avgLarvaeWeight;
                if (!val || val <= 0) {
                  return (
                    <TableCell key={n} className="text-center">
                      <span className="text-[10px] text-muted-foreground/50">Pending</span>
                    </TableCell>
                  );
                }

                const target = weightTarget(n);
                const ok = val >= target;
                return (
                  <TableCell key={n} className="text-center">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
                      ok
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-destructive/10 text-destructive'
                    )}>
                      {ok ? '✓ On Target' : '✗ Below Target'}
                    </span>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
