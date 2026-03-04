import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Leaf, Factory, MapPin, TrendingUp, Lock } from 'lucide-react';

export default function RoadmapPage() {
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sprint to 65 Acres & 5MT Production
          </p>
        </div>
        <Badge className="bg-warning/15 text-warning border-warning/30 text-xs font-semibold px-3 py-1">
          Coming Soon
        </Badge>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6 border-l-4 border-l-primary"
      >
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="text-base font-semibold text-foreground font-display mb-1">Strategic Growth Objective</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This section will track progress toward acquiring <span className="font-semibold text-foreground">65 acres</span> of mulberry farmland and achieving <span className="font-semibold text-foreground">5 metric tonnes</span> of annual wet cocoon production. Real-time KPIs, milestones, and projections will be displayed once tracking is activated.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Target Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground font-display">Land Acquisition</h3>
                <p className="text-[10px] text-muted-foreground">Target: 65 Acres</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground font-medium">0 / 65 acres</span>
            </div>
            <Progress value={0} className="h-3" />
            <p className="text-[10px] text-muted-foreground italic">Tracking will begin when land acquisition data is connected.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                <Factory className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground font-display">Production Scale</h3>
                <p className="text-[10px] text-muted-foreground">Target: 5 MT / Year</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground font-medium">0 / 5,000 kg</span>
            </div>
            <Progress value={0} className="h-3" />
            <p className="text-[10px] text-muted-foreground italic">Annual production tracking will be enabled in a future release.</p>
          </div>
        </motion.div>
      </div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold text-foreground font-display mb-4">Key Milestones</h3>
        <div className="space-y-3">
          {[
            { label: 'Phase 1: 15 Acres Secured', target: '15 ac', icon: Leaf, status: 'Upcoming' },
            { label: 'Phase 2: 30 Acres & 1 MT Production', target: '30 ac / 1 MT', icon: TrendingUp, status: 'Upcoming' },
            { label: 'Phase 3: 50 Acres & 3 MT Production', target: '50 ac / 3 MT', icon: TrendingUp, status: 'Upcoming' },
            { label: 'Phase 4: 65 Acres & 5 MT Production', target: '65 ac / 5 MT', icon: Target, status: 'Upcoming' },
          ].map((milestone, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <milestone.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{milestone.label}</p>
                <p className="text-[10px] text-muted-foreground">{milestone.target}</p>
              </div>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/20 shrink-0">
                {milestone.status}
              </Badge>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
