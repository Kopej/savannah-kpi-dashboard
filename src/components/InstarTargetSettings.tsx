import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Settings2 } from 'lucide-react';
import type { InstarTarget } from '@/hooks/useInstarTargets';

interface Props {
  targets: InstarTarget[];
  onUpdate: (instar: number, updates: Partial<Omit<InstarTarget, 'instar'>>) => Promise<void>;
}

const INSTAR_LABELS = ['Instar 1', 'Instar 2', 'Instar 3', 'Instar 4', 'Instar 5'];

export function InstarTargetSettings({ targets, onUpdate }: Props) {
  const [local, setLocal] = useState(() => targets.map(t => ({ ...t })));
  const [dirty, setDirty] = useState(false);

  const updateLocal = (instar: number, field: 'feedTargetPer100Dfl' | 'larvaeWeightTargetG', value: number) => {
    setLocal(prev => prev.map(t => t.instar === instar ? { ...t, [field]: value } : t));
    setDirty(true);
  };

  const handleSave = async () => {
    for (const t of local) {
      const orig = targets.find(o => o.instar === t.instar);
      if (!orig || orig.feedTargetPer100Dfl !== t.feedTargetPer100Dfl || orig.larvaeWeightTargetG !== t.larvaeWeightTargetG) {
        await onUpdate(t.instar, {
          feedTargetPer100Dfl: t.feedTargetPer100Dfl,
          larvaeWeightTargetG: t.larvaeWeightTargetG,
        });
      }
    }
    setDirty(false);
    toast.success('Instar targets updated');
  };

  const cellBase = "py-2.5 px-3 text-sm text-center border border-border/40";
  const headerCell = "py-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-center border border-border/40";
  const labelCell = "py-2.5 px-3 text-xs font-medium text-left text-muted-foreground border border-border/40 bg-muted/30 whitespace-nowrap";

  return (
    <div className="rounded-xl border-2 border-accent/30 bg-accent/[0.03] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground font-display tracking-wide uppercase">
            Instar Feed & Weight Targets
          </h3>
          <span className="text-[10px] text-muted-foreground ml-1">Admin-configurable benchmarks</span>
        </div>
        <Button onClick={handleSave} size="sm" disabled={!dirty} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          Save Targets
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className={`${headerCell} text-left min-w-[200px]`}>Target Metric</th>
                {INSTAR_LABELS.map(label => (
                  <th key={label} className={`${headerCell} min-w-[110px]`}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/20">
                <td className={labelCell}>Feed Target (kg / 100 DFLs)</td>
                {local.map(t => (
                  <td key={t.instar} className={`${cellBase} bg-primary/5`}>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={t.feedTargetPer100Dfl || ''}
                      onChange={e => updateLocal(t.instar, 'feedTargetPer100Dfl', parseFloat(e.target.value) || 0)}
                      className="h-7 w-full text-center text-sm border-0 bg-transparent focus:bg-background p-1"
                    />
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20">
                <td className={labelCell}>Larvae Weight Target (g)</td>
                {local.map(t => (
                  <td key={t.instar} className={`${cellBase} bg-primary/5`}>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={t.larvaeWeightTargetG || ''}
                      onChange={e => updateLocal(t.instar, 'larvaeWeightTargetG', parseFloat(e.target.value) || 0)}
                      className="h-7 w-full text-center text-sm border-0 bg-transparent focus:bg-background p-1"
                    />
                  </td>
                ))}
              </tr>
              <tr className="bg-muted/10">
                <td className={labelCell}>Mortality Target</td>
                {local.map(t => (
                  <td key={t.instar} className={`${cellBase} text-muted-foreground`}>
                    &lt; 5%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {dirty && (
        <p className="text-xs text-warning font-medium animate-pulse">Unsaved target changes</p>
      )}
    </div>
  );
}
