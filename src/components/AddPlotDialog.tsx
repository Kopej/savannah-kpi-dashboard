import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAppState } from '@/lib/store';
import type { MulberryPlot } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultForm = {
  name: '',
  acreage: '',
  treePopulation: '',
  dateTransplanted: '',
  irrigated: false,
  leaseStatus: 'Active',
  expectedYieldPerAcre: '',
};

export function AddPlotDialog({ open, onOpenChange }: Props) {
  const { addPlot } = useAppState();
  const [form, setForm] = useState(defaultForm);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transplantDate = new Date(form.dateTransplanted);
    const maturityDate = new Date(transplantDate);
    maturityDate.setMonth(maturityDate.getMonth() + 6);

    const plot: MulberryPlot = {
      id: Math.random().toString(36).slice(2, 10),
      name: form.name,
      acreage: parseFloat(form.acreage),
      treePopulation: parseInt(form.treePopulation),
      dateTransplanted: form.dateTransplanted,
      dateLastHarvested: '',
      nextEarliestHarvestDate: maturityDate.toISOString().split('T')[0],
      irrigated: form.irrigated,
      leaseStatus: form.leaseStatus,
      expectedYieldPerAcre: parseFloat(form.expectedYieldPerAcre) || undefined,
    };
    addPlot(plot);
    setForm(defaultForm);
    onOpenChange(false);
    toast.success(`Plot "${plot.name}" added — predictions updated`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Mulberry Plot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Plot Name / ID</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} required className="mt-1 h-9 text-sm" placeholder="e.g. John Ochieng Farm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Acreage</Label>
              <Input type="number" step="any" value={form.acreage} onChange={e => set('acreage', e.target.value)} required className="mt-1 h-9 text-sm" placeholder="e.g. 1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tree Population</Label>
              <Input type="number" value={form.treePopulation} onChange={e => set('treePopulation', e.target.value)} required className="mt-1 h-9 text-sm" placeholder="e.g. 4000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Planting Date</Label>
              <Input type="date" value={form.dateTransplanted} onChange={e => set('dateTransplanted', e.target.value)} required className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lease Status</Label>
              <Select value={form.leaseStatus} onValueChange={v => set('leaseStatus', v)}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <Label className="text-xs text-muted-foreground">Expected Yield/Acre (kg)</Label>
              <Input type="number" step="any" value={form.expectedYieldPerAcre} onChange={e => set('expectedYieldPerAcre', e.target.value)} className="mt-1 h-9 text-sm" placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Switch checked={form.irrigated} onCheckedChange={v => set('irrigated', v)} />
              <Label className="text-xs text-muted-foreground">Irrigated</Label>
            </div>
          </div>
          <Button type="submit" className="w-full kpi-gradient border-0 text-primary-foreground">
            Add Plot
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
