import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1 font-display">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0 ml-3">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
            {trend === 'up' ? '↑ Improving' : trend === 'down' ? '↓ Declining' : '— Stable'}
          </span>
        </div>
      )}
    </motion.div>
  );
}
