import { useState } from 'react';
import type { DailyLog, CycleData } from '@/lib/types';
import { useAppState } from '@/lib/store';
import { formatPercent, formatNumber } from '@/lib/calculations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DailyLogForm } from './DailyLogForm';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Props {
  cycle: CycleData;
  logs: DailyLog[];
}

export function DailyLogTable({ cycle, logs }: Props) {
  const { deleteDailyLog } = useAppState();
  const [editLog, setEditLog] = useState<DailyLog | null>(null);

  if (logs.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-muted-foreground text-sm">No daily entries yet. Add your first log to start tracking.</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-xl p-5 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Eggs</TableHead>
              <TableHead className="text-xs text-right">Hatched</TableHead>
              <TableHead className="text-xs text-right">Hatch %</TableHead>
              <TableHead className="text-xs text-right">Mort. Pre %</TableHead>
              <TableHead className="text-xs text-right">Mort. Coc %</TableHead>
              <TableHead className="text-xs text-right">Larvae Wt (g)</TableHead>
              <TableHead className="text-xs text-right">Feed (g)</TableHead>
              <TableHead className="text-xs text-right">Cocoon (kg)</TableHead>
              <TableHead className="text-xs text-right">Non-Def %</TableHead>
              <TableHead className="text-xs text-right">Shell %</TableHead>
              <TableHead className="text-xs text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => {
              const hr = log.estimatedStartingEggCount > 0
                ? log.hatchedEggs / log.estimatedStartingEggCount
                : 0;
              return (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm font-medium">{log.date}</TableCell>
                  <TableCell className="text-sm text-right">{formatNumber(log.estimatedStartingEggCount)}</TableCell>
                  <TableCell className="text-sm text-right">{formatNumber(log.hatchedEggs)}</TableCell>
                  <TableCell className="text-sm text-right">{hr > 0 ? formatPercent(hr) : '—'}</TableCell>
                  <TableCell className="text-sm text-right">{formatPercent(log.mortalityPreCocooning)}</TableCell>
                  <TableCell className="text-sm text-right">{formatPercent(log.mortalityCocooning)}</TableCell>
                  <TableCell className="text-sm text-right">{log.finalLarvaeWeight > 0 ? log.finalLarvaeWeight.toFixed(2) : '—'}</TableCell>
                  <TableCell className="text-sm text-right">{formatNumber(log.totalLeafWeightFed)}</TableCell>
                  <TableCell className="text-sm text-right">{log.totalHarvestedWetCocoonWeight > 0 ? log.totalHarvestedWetCocoonWeight.toFixed(2) : '—'}</TableCell>
                  <TableCell className="text-sm text-right">{formatPercent(log.percentNonDefective)}</TableCell>
                  <TableCell className="text-sm text-right">{formatPercent(log.avgShellRatio)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditLog(log)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete entry for {log.date}?</AlertDialogTitle>
                            <AlertDialogDescription>This will remove this daily log and recalculate KPIs.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { deleteDailyLog(log.id); toast.success('Entry deleted'); }}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editLog && (
        <DailyLogForm
          cycle={cycle}
          open={!!editLog}
          onOpenChange={(open) => { if (!open) setEditLog(null); }}
          editLog={editLog}
        />
      )}
    </>
  );
}
