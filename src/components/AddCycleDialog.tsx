import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppState } from '@/lib/store';
import type { CycleData } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues = {
  cycleNumber: '',
  hatchDate: '',
  status: 'ongoing' as 'finished' | 'ongoing',
  totalEggs: '',
  hatchRatePercent: '',
  estimatedStartingEggCount: '',
  hatchedEggs: '',
  mortalityPreCocooning: '',
  mortalityCocooning: '',
  finalLarvaeWeight: '',
  totalLeafWeightFed: '',
  totalHarvestedWetCocoonWeight: '',
  percentNonDefective: '',
  avgWeightPerWetCocoon: '',
  avgShellRatio: '',
};

export function AddCycleDialog({ open, onOpenChange }: Props) {
  const { addCycle } = useAppState();
  const [form, setForm] = useState(defaultValues);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const totalEggs = parseFloat(form.totalEggs) || 0;
  const hatchRate = parseFloat(form.hatchRatePercent) || 0;
  const computedWorms = Math.round(totalEggs * (hatchRate / 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cycle: CycleData = {
      id: Math.random().toString(36).slice(2, 10),
      cycleNumber: parseInt(form.cycleNumber),
      hatchDate: form.hatchDate,
      status: form.status,
      totalEggs: parseInt(form.totalEggs) || undefined,
      hatchRatePercent: parseFloat(form.hatchRatePercent) ? parseFloat(form.hatchRatePercent) / 100 : undefined,
      estimatedStartingEggCount: parseInt(form.estimatedStartingEggCount) || 0,
      hatchedEggs: parseInt(form.hatchedEggs) || 0,
      mortalityPreCocooning: (parseFloat(form.mortalityPreCocooning) || 0) / 100,
      mortalityCocooning: (parseFloat(form.mortalityCocooning) || 0) / 100,
      finalLarvaeWeight: parseFloat(form.finalLarvaeWeight) || 0,
      totalLeafWeightFed: parseFloat(form.totalLeafWeightFed) || 0,
      totalHarvestedWetCocoonWeight: parseFloat(form.totalHarvestedWetCocoonWeight) || 0,
      percentNonDefective: (parseFloat(form.percentNonDefective) || 0) / 100,
      avgWeightPerWetCocoon: parseFloat(form.avgWeightPerWetCocoon) || 0,
      avgShellRatio: (parseFloat(form.avgShellRatio) || 0) / 100,
    };
    addCycle(cycle);
    setForm(defaultValues);
    onOpenChange(false);
    toast.success(`Cycle ${cycle.cycleNumber} added (${cycle.status}) — KPIs recalculated`);
  };

  const fields = [
    { key: 'cycleNumber', label: 'Cycle Number', type: 'number', placeholder: 'e.g. 18', required: true },
    { key: 'hatchDate', label: 'Hatch Date', type: 'date', placeholder: '', required: true },
    { key: 'totalEggs', label: 'Total Eggs', type: 'number', placeholder: 'e.g. 30000', required: false },
    { key: 'hatchRatePercent', label: 'Hatch Rate (%)', type: 'number', placeholder: 'e.g. 85', required: false },
    { key: 'estimatedStartingEggCount', label: 'Starting Egg Count', type: 'number', placeholder: 'e.g. 28000', required: false },
    { key: 'hatchedEggs', label: 'Hatched Eggs', type: 'number', placeholder: 'e.g. 26500', required: false },
    { key: 'mortalityPreCocooning', label: 'Mortality Pre-Cocooning (%)', type: 'number', placeholder: 'e.g. 2', required: false },
    { key: 'mortalityCocooning', label: 'Mortality Cocooning (%)', type: 'number', placeholder: 'e.g. 4', required: false },
    { key: 'finalLarvaeWeight', label: 'Final Larvae Weight (g)', type: 'number', placeholder: 'e.g. 3.5', required: false },
    { key: 'totalLeafWeightFed', label: 'Total Leaf Weight Fed (g)', type: 'number', placeholder: 'e.g. 500000', required: false },
    { key: 'totalHarvestedWetCocoonWeight', label: 'Harvested Cocoon Weight (kg)', type: 'number', placeholder: 'e.g. 25', required: false },
    { key: 'percentNonDefective', label: 'Non-Defective Cocoons (%)', type: 'number', placeholder: 'e.g. 95', required: false },
    { key: 'avgWeightPerWetCocoon', label: 'Avg Weight per Cocoon (g)', type: 'number', placeholder: 'e.g. 1.6', required: false },
    { key: 'avgShellRatio', label: 'Avg Shell Ratio (%)', type: 'number', placeholder: 'e.g. 21', required: false },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Cycle Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status selector */}
          <div>
            <Label className="text-xs text-muted-foreground">Cycle Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v as 'finished' | 'ongoing' }))}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key}>
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                <Input
                  type={f.type}
                  step={f.type === 'number' ? 'any' : undefined}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  required={f.required}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            ))}
          </div>

          {totalEggs > 0 && hatchRate > 0 && (
            <div className="bg-accent/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">Computed Total Worms: <span className="font-semibold text-foreground">{computedWorms.toLocaleString()}</span></p>
            </div>
          )}

          <Button type="submit" className="w-full kpi-gradient border-0 text-primary-foreground">
            Save & Recalculate KPIs
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
