import { useState } from 'react';
import { useAppState } from '@/lib/store';
import { AddCycleDialog } from '@/components/AddCycleDialog';
import { FinishedCyclesDashboard } from '@/components/FinishedCyclesDashboard';
import { OngoingCyclesDashboard } from '@/components/OngoingCyclesDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Clock } from 'lucide-react';

export default function KPIDashboard() {
  const { cycles, assumptions } = useAppState();
  const [addOpen, setAddOpen] = useState(false);

  const finishedCount = cycles.filter(c => c.status === 'finished').length;
  const ongoingCount = cycles.filter(c => c.status === 'ongoing').length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">KPI Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {finishedCount} finished · {ongoingCount} ongoing cycles
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="kpi-gradient border-0 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Cycle Data
        </Button>
      </div>

      <Tabs defaultValue="finished" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="finished" className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Finished Cycles
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Ongoing Cycles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="finished">
          <FinishedCyclesDashboard cycles={cycles} assumptions={assumptions} />
        </TabsContent>

        <TabsContent value="ongoing">
          <OngoingCyclesDashboard cycles={cycles} assumptions={assumptions} />
        </TabsContent>
      </Tabs>

      <AddCycleDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
