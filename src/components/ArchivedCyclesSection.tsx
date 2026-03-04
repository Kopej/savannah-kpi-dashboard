import { useMemo, useState } from 'react';
import type { CycleData, Assumptions } from '@/lib/types';
import { computeCycleKPIs, formatPercent, formatNumber, formatKg } from '@/lib/calculations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  archivedCycles: CycleData[];
  assumptions: Assumptions;
}

export function ArchivedCyclesSection({ archivedCycles, assumptions }: Props) {
  const [open, setOpen] = useState(false);
  const withKPIs = useMemo(() =>
    archivedCycles.map(c => ({ ...c, kpis: computeCycleKPIs(c, assumptions) })),
    [archivedCycles, assumptions]
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="glass-card rounded-xl p-4 w-full flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground font-display">
              Archived Cycles ({archivedCycles.length})
            </span>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              C{archivedCycles[0]?.cycleNumber}–C{archivedCycles[archivedCycles.length - 1]?.cycleNumber}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-5 mt-2"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Hatch Date</TableHead>
                  <TableHead>Eggs</TableHead>
                  <TableHead>Hatched</TableHead>
                  <TableHead>Hatch Rate</TableHead>
                  <TableHead>Mortality</TableHead>
                  <TableHead>Cocoon Wt (kg)</TableHead>
                  <TableHead>Shell %</TableHead>
                  <TableHead>Wt/Cocoon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withKPIs.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">Cycle {c.cycleNumber}</TableCell>
                    <TableCell>{c.hatchDate}</TableCell>
                    <TableCell>{formatNumber(c.estimatedStartingEggCount)}</TableCell>
                    <TableCell>{formatNumber(c.hatchedEggs)}</TableCell>
                    <TableCell>{formatPercent(c.kpis.hatchRate)}</TableCell>
                    <TableCell>{formatPercent(c.kpis.totalMortality)}</TableCell>
                    <TableCell>{formatKg(c.totalHarvestedWetCocoonWeight)}</TableCell>
                    <TableCell>{formatPercent(c.avgShellRatio)}</TableCell>
                    <TableCell>{c.avgWeightPerWetCocoon}g</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}
