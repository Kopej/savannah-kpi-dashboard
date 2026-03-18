import { useState } from 'react';
import { useAppState } from '@/lib/store';
import type { DailyLog, CycleData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Save } from 'lucide-react';

interface Props {
  cycle: CycleData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLog?: DailyLog | null;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const today = () => new Date().toISOString().split('T')[0];

const FIELDS = [
  { key: 'estimatedStartingEggCount', label: 'Estimated Starting Egg Count', type: 'number', step: '1' },
  { key: 'hatchedEggs', label: 'Hatched Eggs', type: 'number', step: '1' },
  { key: 'mortalityPreCocooning', label: 'Mortality – Pre-cocooning (%)', type: 'number', step: '0.1', percent: true },
  { key: 'mortalityCocooning', label: 'Mortality – Cocooning (%)', type: 'number', step: '0.1', percent: true },
  { key: 'finalLarvaeWeight', label: 'Final Larvae Weight (g)', type: 'number', step: '0.01' },
  { key: 'totalLeafWeightFed', label: 'Total Leaf Weight Fed (g)', type: 'number', step: '1' },
  { key: 'totalHarvestedWetCocoonWeight', label: 'Harvested Wet Cocoon Weight (kg)', type: 'number', step: '0.01' },
  { key: 'percentNonDefective', label: '% Non-defective Cocoons', type: 'number', step: '0.1', percent: true },
  { key: 'avgWeightPerWetCocoon', label: 'Avg Weight per Wet Cocoon (g)', type: 'number', step: '0.01' },
  { key: 'avgShellRatio', label: 'Avg Shell Ratio (%)', type: 'number', step: '0.1', percent: true },
] as const;

type FieldKey = typeof FIELDS[number]['key'];

export function DailyLogForm({ cycle, open, onOpenChange, editLog }: Props) {
  const { addDailyLog, updateDailyLog } = useAppState();
  const isEdit = !!editLog;

  const getInitial = () => {
    if (editLog) {
      return {
        date: editLog.date,
        estimatedStartingEggCount: editLog.estimatedStartingEggCount,
        hatchedEggs: editLog.hatchedEggs,
        mortalityPreCocooning: editLog.mortalityPreCocooning * 100,
        mortalityCocooning: editLog.mortalityCocooning * 100,
        finalLarvaeWeight: editLog.finalLarvaeWeight,
        totalLeafWeightFed: editLog.totalLeafWeightFed,
        totalHarvestedWetCocoonWeight: editLog.totalHarvestedWetCocoonWeight,
        percentNonDefective: editLog.percentNonDefective * 100,
        avgWeightPerWetCocoon: editLog.avgWeightPerWetCocoon,
        avgShellRatio: editLog.avgShellRatio * 100,
      };
    }
    return {
      date: today(),
      estimatedStartingEggCount: cycle.estimatedStartingEggCount,
      hatchedEggs: 0,
      mortalityPreCocooning: 0,
      mortalityCocooning: 0,
      finalLarvaeWeight: 0,
      totalLeafWeightFed: 0,
      totalHarvestedWetCocoonWeight: 0,
      percentNonDefective: 0,
      avgWeightPerWetCocoon: 0,
      avgShellRatio: 0,
    };
  };

  const [form, setForm] = useState(getInitial);
  const [addAnother, setAddAnother] = useState(false);

  const update = (key: string, val: string) => {
    setForm(prev => ({ ...prev, [key]: val === '' ? 0 : parseFloat(val) }));
  };

  const handleSubmit = (keepOpen: boolean) => {
    const log: DailyLog = {
      id: isEdit ? editLog!.id : uid(),
      cycleId: cycle.id,
      cycleNumber: cycle.cycleNumber,
      date: form.date as string,
      estimatedStartingEggCount: form.estimatedStartingEggCount,
      hatchedEggs: form.hatchedEggs,
      mortalityPreCocooning: form.mortalityPreCocooning / 100,
      mortalityCocooning: form.mortalityCocooning / 100,
      finalLarvaeWeight: form.finalLarvaeWeight,
      totalLeafWeightFed: form.totalLeafWeightFed,
      totalHarvestedWetCocoonWeight: form.totalHarvestedWetCocoonWeight,
      percentNonDefective: form.percentNonDefective / 100,
      avgWeightPerWetCocoon: form.avgWeightPerWetCocoon,
      avgShellRatio: form.avgShellRatio / 100,
    };

    if (isEdit) {
      updateDailyLog(log.id, log);
      toast.success(`Daily log updated for ${log.date}`);
    } else {
      addDailyLog(log);
      toast.success(`Daily log saved for Cycle ${cycle.cycleNumber} — ${log.date}`);
    }

    if (keepOpen) {
      setForm({ ...getInitial(), date: today() });
    } else {
      onOpenChange(false);
    }
  };

  const displayValue = (key: FieldKey, field: typeof FIELDS[number]) => {
    const val = form[key as keyof typeof form];
    if (typeof val === 'string') return val;
    return val === 0 ? '' : String(val);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? 'Edit' : 'New'} Daily Log — Cycle {cycle.cycleNumber}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update this daily entry.' : 'Enter daily operational data. KPIs will recalculate automatically.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={form.date as string}
              onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Hatch Date (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Hatch Date</Label>
            <Input type="date" value={cycle.hatchDate} disabled className="opacity-60" />
          </div>

          {/* Dynamic Fields */}
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{f.label}</Label>
                <Input
                  type="number"
                  step={f.step}
                  min="0"
                  placeholder="0"
                  value={displayValue(f.key, f)}
                  onChange={e => update(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Computed preview */}
          {form.estimatedStartingEggCount > 0 && form.hatchedEggs > 0 && (
            <div className="rounded-lg bg-accent/30 p-3 text-xs space-y-1">
              <p className="font-medium text-foreground">Live Preview</p>
              <p className="text-muted-foreground">
                Hatch Rate: <span className="text-foreground font-medium">
                  {((form.hatchedEggs / form.estimatedStartingEggCount) * 100).toFixed(1)}%
                </span>
              </p>
              <p className="text-muted-foreground">
                Total Mortality: <span className="text-foreground font-medium">
                  {(form.mortalityPreCocooning + form.mortalityCocooning).toFixed(1)}%
                </span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => handleSubmit(false)} className="flex-1 kpi-gradient border-0 text-primary-foreground">
              <Save className="h-4 w-4 mr-1.5" />
              {isEdit ? 'Update Entry' : 'Save Entry'}
            </Button>
            {!isEdit && (
              <Button variant="outline" onClick={() => handleSubmit(true)} className="flex-1">
                <Plus className="h-4 w-4 mr-1.5" />
                Save & Add Another
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
