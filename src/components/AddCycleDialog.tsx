import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cycle: CycleData = {
      id: Math.random().toString(36).slice(2, 10),
      cycleNumber: parseInt(form.cycleNumber),
      hatchDate: form.hatchDate,
      estimatedStartingEggCount: parseInt(form.estimatedStartingEggCount),
      hatchedEggs: parseInt(form.hatchedEggs),
      mortalityPreCocooning: parseFloat(form.mortalityPreCocooning) / 100,
      mortalityCocooning: parseFloat(form.mortalityCocooning) / 100,
      finalLarvaeWeight: parseFloat(form.finalLarvaeWeight),
      totalLeafWeightFed: parseFloat(form.totalLeafWeightFed),
      totalHarvestedWetCocoonWeight: parseFloat(form.totalHarvestedWetCocoonWeight),
      percentNonDefective: parseFloat(form.percentNonDefective) / 100,
      avgWeightPerWetCocoon: parseFloat(form.avgWeightPerWetCocoon),
      avgShellRatio: parseFloat(form.avgShellRatio) / 100,
    };
    addCycle(cycle);
    setForm(defaultValues);
    onOpenChange(false);
    toast.success(`Cycle ${cycle.cycleNumber} added — KPIs recalculated`);
  };

  const fields = [
    { key: 'cycleNumber', label: 'Cycle Number', type: 'number', placeholder: 'e.g. 15' },
    { key: 'hatchDate', label: 'Hatch Date', type: 'date', placeholder: '' },
    { key: 'estimatedStartingEggCount', label: 'Starting Egg Count', type: 'number', placeholder: 'e.g. 28000' },
    { key: 'hatchedEggs', label: 'Hatched Eggs', type: 'number', placeholder: 'e.g. 26500' },
    { key: 'mortalityPreCocooning', label: 'Mortality Pre-Cocooning (%)', type: 'number', placeholder: 'e.g. 2' },
    { key: 'mortalityCocooning', label: 'Mortality Cocooning (%)', type: 'number', placeholder: 'e.g. 4' },
    { key: 'finalLarvaeWeight', label: 'Final Larvae Weight (g)', type: 'number', placeholder: 'e.g. 3.5' },
    { key: 'totalLeafWeightFed', label: 'Total Leaf Weight Fed (g)', type: 'number', placeholder: 'e.g. 500000' },
    { key: 'totalHarvestedWetCocoonWeight', label: 'Harvested Cocoon Weight (kg)', type: 'number', placeholder: 'e.g. 25' },
    { key: 'percentNonDefective', label: 'Non-Defective Cocoons (%)', type: 'number', placeholder: 'e.g. 95' },
    { key: 'avgWeightPerWetCocoon', label: 'Avg Weight per Cocoon (g)', type: 'number', placeholder: 'e.g. 1.6' },
    { key: 'avgShellRatio', label: 'Avg Shell Ratio (%)', type: 'number', placeholder: 'e.g. 21' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Cycle Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f.key} className={f.key === 'hatchDate' ? 'col-span-1' : ''}>
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                type={f.type}
                step={f.type === 'number' ? 'any' : undefined}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => set(f.key, e.target.value)}
                required
                className="mt-1 h-9 text-sm"
              />
            </div>
          ))}
          <div className="col-span-2 mt-2">
            <Button type="submit" className="w-full kpi-gradient border-0 text-primary-foreground">
              Save & Recalculate KPIs
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
