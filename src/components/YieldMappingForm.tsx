import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppState } from '@/lib/store';
import type { YieldSample } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function YieldMappingForm({ open, onOpenChange }: Props) {
  const { plots, addYieldSample } = useAppState();
  const [plotName, setPlotName] = useState('');
  const [date, setDate] = useState('');
  const [irrigated, setIrrigated] = useState('No');
  const [trees, setTrees] = useState([
    { treeNumber: 1, treeHeight: '', weightShootsLeaves: '', weightLeavesOnly: '' },
    { treeNumber: 2, treeHeight: '', weightShootsLeaves: '', weightLeavesOnly: '' },
    { treeNumber: 3, treeHeight: '', weightShootsLeaves: '', weightLeavesOnly: '' },
    { treeNumber: 4, treeHeight: '', weightShootsLeaves: '', weightLeavesOnly: '' },
    { treeNumber: 5, treeHeight: '', weightShootsLeaves: '', weightLeavesOnly: '' },
  ]);

  const updateTree = (idx: number, field: string, val: string) => {
    setTrees(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trees.forEach(t => {
      if (t.treeHeight && t.weightShootsLeaves) {
        const sample: YieldSample = {
          id: Math.random().toString(36).slice(2, 10),
          plotName,
          dateOfSampling: date,
          irrigated: irrigated === 'Yes',
          treeNumber: t.treeNumber,
          treeHeight: parseFloat(t.treeHeight),
          weightShootsLeaves: parseFloat(t.weightShootsLeaves),
          weightLeavesOnly: parseFloat(t.weightLeavesOnly || '0'),
        };
        addYieldSample(sample);
      }
    });
    toast.success('Yield sampling data added — predictions recalculated');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Add Yield Mapping Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Plot</Label>
              <Select value={plotName} onValueChange={setPlotName}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select plot" /></SelectTrigger>
                <SelectContent>
                  {plots.map(p => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date of Sampling</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Irrigated?</Label>
              <Select value={irrigated} onValueChange={setIrrigated}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Tree Measurements (5 samples)</p>
            <div className="grid grid-cols-4 gap-2 mb-1">
              <span className="text-[10px] text-muted-foreground font-medium">Tree #</span>
              <span className="text-[10px] text-muted-foreground font-medium">Height (m)</span>
              <span className="text-[10px] text-muted-foreground font-medium">Shoots+Leaves (g)</span>
              <span className="text-[10px] text-muted-foreground font-medium">Leaves Only (g)</span>
            </div>
            {trees.map((t, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-1.5">
                <div className="flex items-center text-sm text-muted-foreground">{t.treeNumber}</div>
                <Input type="number" step="any" placeholder="1.5" value={t.treeHeight} onChange={e => updateTree(i, 'treeHeight', e.target.value)} className="h-8 text-sm" />
                <Input type="number" step="any" placeholder="500" value={t.weightShootsLeaves} onChange={e => updateTree(i, 'weightShootsLeaves', e.target.value)} className="h-8 text-sm" />
                <Input type="number" step="any" placeholder="300" value={t.weightLeavesOnly} onChange={e => updateTree(i, 'weightLeavesOnly', e.target.value)} className="h-8 text-sm" />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full kpi-gradient border-0 text-primary-foreground" disabled={!plotName || !date}>
            Save & Update Predictions
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
