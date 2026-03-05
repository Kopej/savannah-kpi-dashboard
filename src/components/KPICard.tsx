import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { TrafficLight, getTrafficLightDot, getTrafficLightBg } from '@/lib/kpiThresholds';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  target?: string;
  icon: LucideIcon;
  trafficLight?: TrafficLight;
  delay?: number;
}

export function KPICard({ title, value, subtitle, target, icon: Icon, trafficLight, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
            {trafficLight && (
              <span className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${getTrafficLightDot(trafficLight)}`} />
            )}
          </div>
          <p className="text-2xl font-bold text-foreground mt-1 font-display">{value}</p>
          {target && (
            <p className={`text-xs mt-1 font-medium ${trafficLight ? getTrafficLightBg(trafficLight) + ' inline-block px-2 py-0.5 rounded-full' : 'text-muted-foreground'}`}>
              <span className="text-muted-foreground">Target: {target}</span>
            </p>
          )}
          {subtitle && !target && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0 ml-3">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
      </div>
    </motion.div>
  );
}
