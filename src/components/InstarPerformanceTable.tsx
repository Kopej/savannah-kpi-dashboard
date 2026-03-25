import type { CycleData } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Feed targets in kg per 100 DFLs
const FEED_TARGETS_PER_100_DFL = [5, 18, 60, 350, 2500];
const MORTALITY_TARGET = 0.05; // 5%

interface Props {
  cycle: CycleData;
  dflsBrushed: number;
}

export function InstarPerformanceTable({ cycle, dflsBrushed }: Props) {
  const instars = cycle.instars || [];
  const instarNumbers = [1, 2, 3, 4, 5];

  const getInstar = (num: number) => instars.find(i => i.instar === num);

  const feedTargetKg = (instarIdx: number) =>
    dflsBrushed > 0 ? (dflsBrushed / 100) * FEED_TARGETS_PER_100_DFL[instarIdx] : null;

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
        Actual feed &amp; mortality compared to operational targets · {dflsBrushed > 0 ? `${dflsBrushed} DFLs` : 'No DFL data'}
      </p>

      <div className="relative w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px] text-xs font-semibold">Metric</TableHead>
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
              {instarNumbers.map((_, idx) => {
                const target = feedTargetKg(idx);
                return (
                  <TableCell key={idx} className="text-center text-sm text-muted-foreground">
                    {target != null ? target.toFixed(1) : '—'}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Feed Status */}
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Feed Status</TableCell>
              {instarNumbers.map((n, idx) => {
                const i = getInstar(n);
                const actual = i ? i.totalLeafWeightFedG / 1000 : 0;
                const target = feedTargetKg(idx);
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
