import { useMemo } from 'react';
import type { CycleData } from '@/lib/types';
import { Calendar, Flag } from 'lucide-react';

interface Props {
  cycle: CycleData;
  currentDay: number;
}

const INSTAR_COLORS = [
  'bg-emerald-400',
  'bg-sky-400',
  'bg-violet-400',
  'bg-amber-400',
  'bg-rose-400',
];

const INSTAR_BORDER_COLORS = [
  'border-emerald-500',
  'border-sky-500',
  'border-violet-500',
  'border-amber-500',
  'border-rose-500',
];

export function CycleProgressBar({ cycle, currentDay }: Props) {
  const { segments, totalExpectedDays } = useMemo(() => {
    const instars = cycle.instars || [];
    if (instars.length === 0) {
      // Default 5 instars with typical durations
      const defaults = [3, 3, 4, 5, 7];
      const total = defaults.reduce((a, b) => a + b, 0) + 5; // +5 for cocooning
      return {
        segments: defaults.map((d, i) => ({
          instar: i + 1,
          days: d,
          startDay: defaults.slice(0, i).reduce((a, b) => a + b, 0),
        })).concat([{ instar: 6, days: 5, startDay: total - 5 }]),
        totalExpectedDays: total,
      };
    }

    let cumDays = 0;
    const segs = instars.map((inst, i) => {
      const seg = { instar: inst.instar, days: inst.durationDays || 0, startDay: cumDays };
      cumDays += inst.durationDays || 0;
      return seg;
    });

    // Add cocooning phase estimate (~5 days)
    const cocooningDays = 5;
    segs.push({ instar: instars.length + 1, days: cocooningDays, startDay: cumDays });
    cumDays += cocooningDays;

    return { segments: segs, totalExpectedDays: cumDays };
  }, [cycle.instars]);

  const progressPercent = Math.min((currentDay / totalExpectedDays) * 100, 100);
  const isOverdue = currentDay > totalExpectedDays;

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
          Cycle Progress
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Day {currentDay}
          </span>
          <span className="flex items-center gap-1">
            <Flag className="h-3 w-3" />
            ~{totalExpectedDays} days expected
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="flex h-7 rounded-lg overflow-hidden border border-border/50">
          {segments.map((seg, i) => {
            const widthPercent = (seg.days / totalExpectedDays) * 100;
            const isLastInstar = i === segments.length - 1;
            const colorClass = i < 5 ? INSTAR_COLORS[i] : 'bg-muted-foreground/40';
            const filled = currentDay >= seg.startDay + seg.days;
            const partial = currentDay > seg.startDay && currentDay < seg.startDay + seg.days;
            const partialPercent = partial ? ((currentDay - seg.startDay) / seg.days) * 100 : 0;

            return (
              <div
                key={seg.instar}
                className={`relative flex items-center justify-center ${i < segments.length - 1 ? 'border-r border-background/60' : ''}`}
                style={{ width: `${widthPercent}%` }}
              >
                {/* Background */}
                <div className={`absolute inset-0 ${filled ? colorClass : partial ? '' : 'bg-muted/60'}`}>
                  {partial && (
                    <>
                      <div className={`absolute inset-y-0 left-0 ${colorClass}`} style={{ width: `${partialPercent}%` }} />
                      <div className="absolute inset-y-0 right-0 bg-muted/60" style={{ width: `${100 - partialPercent}%` }} />
                    </>
                  )}
                </div>
                {/* Label */}
                <span className={`relative z-10 text-[10px] font-bold ${filled || partial ? 'text-white drop-shadow-sm' : 'text-muted-foreground'}`}>
                  {isLastInstar ? 'Cocoon' : `I${seg.instar}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current day marker */}
        {!isOverdue && (
          <div
            className="absolute top-0 h-7 w-0.5 bg-foreground z-20"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
              Day {currentDay}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {segments.map((seg, i) => {
          const isLastInstar = i === segments.length - 1;
          const colorClass = i < 5 ? INSTAR_COLORS[i] : 'bg-muted-foreground/40';
          return (
            <div key={seg.instar} className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${colorClass}`} />
              <span className="text-[10px] text-muted-foreground">
                {isLastInstar ? 'Cocooning' : `Instar ${seg.instar}`} ({seg.days}d)
              </span>
            </div>
          );
        })}
        {isOverdue && (
          <span className="text-[10px] font-medium text-destructive ml-auto">
            ⚠ {currentDay - totalExpectedDays} days overdue
          </span>
        )}
      </div>
    </div>
  );
}
