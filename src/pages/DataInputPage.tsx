import { useState } from 'react';
import { useAppState } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { CycleDataTable } from '@/components/CycleDataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, Database } from 'lucide-react';
import { useInstarTargets } from '@/hooks/useInstarTargets';
import { InstarTargetSettings } from '@/components/InstarTargetSettings';

export default function DataInputPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { cycles, loading } = useAppState();
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  // Auth loading
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Not logged in or not admin
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-bold font-display text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {!user
            ? 'Please sign in to access the Data Input page.'
            : 'This page is only accessible to admin users. Contact your administrator for access.'}
        </p>
      </div>
    );
  }

  const ongoingCycles = cycles.filter(c => c.status === 'ongoing');
  const finishedCycles = cycles.filter(c => c.status === 'finished');
  const allCycles = [...ongoingCycles, ...finishedCycles];

  const selectedCycle = allCycles.find(c => c.id === selectedCycleId) || allCycles[0] || null;

  // Set default selection
  if (!selectedCycleId && allCycles.length > 0) {
    setTimeout(() => setSelectedCycleId(allCycles[0].id), 0);
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Data Input
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Admin-only · Edit cycle data that feeds into the KPI dashboard
          </p>
        </div>
      </div>

      {/* Cycle Selector */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-foreground">Select Cycle:</label>
          <Select value={selectedCycle?.id || ''} onValueChange={setSelectedCycleId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Choose a cycle..." />
            </SelectTrigger>
            <SelectContent>
              {ongoingCycles.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Ongoing Cycles
                  </div>
                  {ongoingCycles.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      Cycle {c.cycleNumber} — Ongoing
                    </SelectItem>
                  ))}
                </>
              )}
              {finishedCycles.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Finished Cycles
                  </div>
                  {finishedCycles.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      Cycle {c.cycleNumber} — Finished
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          {selectedCycle && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              selectedCycle.status === 'ongoing'
                ? 'bg-warning/15 text-warning'
                : 'bg-success/15 text-success'
            }`}>
              {selectedCycle.status === 'ongoing' ? 'Ongoing' : 'Finished'}
            </span>
          )}
        </div>
      </div>

      {/* Editable Data Table */}
      {selectedCycle ? (
        <div className="rounded-xl bg-muted/40 border border-border p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground font-display">
              Cycle {selectedCycle.cycleNumber} — Edit Data
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Changes are saved to the database and reflected across all devices.
            </p>
          </div>
          <CycleDataTable cycle={selectedCycle} />
        </div>
      ) : (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground">No cycles available. Add a cycle first.</p>
        </div>
      )}
    </div>
  );
}
