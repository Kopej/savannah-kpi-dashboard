import type { DailyLog } from '@/lib/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
  logs: DailyLog[];
}

export function DailyLogCharts({ logs }: Props) {
  if (logs.length < 2) return null;

  const data = logs.map(l => {
    const hr = l.estimatedStartingEggCount > 0 ? (l.hatchedEggs / l.estimatedStartingEggCount) * 100 : 0;
    return {
      date: l.date.slice(5), // MM-DD
      hatchRate: Math.round(hr * 10) / 10,
      mortality: Math.round((l.mortalityPreCocooning + l.mortalityCocooning) * 10000) / 100,
      feedG: l.totalLeafWeightFed,
      feedKg: Math.round(l.totalLeafWeightFed / 100) / 10,
      larvaeWeight: l.finalLarvaeWeight,
      cocoonKg: l.totalHarvestedWetCocoonWeight,
    };
  });

  // Cumulative feed
  let cumFeed = 0;
  let cumCocoon = 0;
  const cumulativeData = data.map(d => {
    cumFeed += d.feedG;
    cumCocoon += d.cocoonKg;
    return { ...d, cumFeedKg: Math.round(cumFeed / 100) / 10, cumCocoonKg: Math.round(cumCocoon * 100) / 100 };
  });

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'hsl(0 0% 100%)',
      border: '1px solid hsl(170 15% 88%)',
      borderRadius: '8px',
      fontSize: '12px',
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Hatch Rate */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Hatch Rate Over Time</h3>
        <p className="text-[10px] text-muted-foreground mb-3">Daily hatch rate progression (%)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="hatchRate" stroke="hsl(174, 62%, 32%)" strokeWidth={2} dot={{ r: 3 }} name="Hatch Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mortality */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Mortality Over Time</h3>
        <p className="text-[10px] text-muted-foreground mb-3">Total mortality percentage per entry</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="mortality" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 3 }} name="Mortality %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Feed */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Cumulative Feed Consumption</h3>
        <p className="text-[10px] text-muted-foreground mb-3">Running total feed (kg)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="cumFeedKg" stroke="hsl(152, 45%, 45%)" strokeWidth={2} dot={{ r: 3 }} name="Feed (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Larvae Weight */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 font-display">Larvae Weight Progression</h3>
        <p className="text-[10px] text-muted-foreground mb-3">Final larvae weight (g) per entry</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170 15% 88%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="larvaeWeight" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="Weight (g)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
