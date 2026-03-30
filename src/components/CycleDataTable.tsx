import { useState, useCallback, useEffect } from 'react';
import type { CycleData, InstarData } from '@/lib/types';
import { useAppState } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, X, Pencil } from 'lucide-react';

interface Props {
  cycle: CycleData;
}

const INSTAR_LABELS = ['Instar 1', 'Instar 2', 'Instar 3', 'Instar 4', 'Instar 5'];

interface EditState {
  instars: InstarData[];
  finalLarvaeWeight: number;
  cocooningMortality: number;
  wetWeightAll: number;
  wetWeightDefective: number;
  avgWeightPerWetCocoon: number;
  avgShellRatio: number;
  driedCocoonWeightKg: number;
  reelableCocoonWeightKg: number;
  reeledSilkWeightKg: number;
}

function calcMortalityRate(mortality: number, hatchedEggs: number): number {
  if (hatchedEggs <= 0) return 0;
  return mortality / hatchedEggs;
}

function calcCumulativeMortality(instars: InstarData[], upToIndex: number, hatchedEggs: number): number {
  if (hatchedEggs <= 0) return 0;
  let total = 0;
  for (let i = 0; i <= upToIndex; i++) {
    total += instars[i].mortality;
  }
  return total / hatchedEggs;
}

export function CycleDataTable({ cycle }: Props) {
  const { updateCycleData } = useAppState();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(true);

  const buildState = useCallback((): EditState => {
    const instars: InstarData[] = (cycle.instars && cycle.instars.length === 5)
      ? cycle.instars.map(i => ({ ...i }))
      : Array.from({ length: 5 }, (_, idx) => ({
          instar: idx + 1,
          durationDays: 0,
          totalLeafWeightFedG: 0,
          mortality: 0,
          mortalityRatePercent: 0,
          cumulativeMortalityRatePercent: 0,
        }));

    return {
      instars,
      finalLarvaeWeight: cycle.finalLarvaeWeight || 0,
      cocooningMortality: cycle.mortalityCocooning > 0 && cycle.mortalityCocooning < 1
        ? Math.round(cycle.mortalityCocooning * cycle.hatchedEggs)
        : 0,
      wetWeightAll: cycle.totalHarvestedWetCocoonWeight || 0,
      wetWeightDefective: cycle.totalHarvestedWetCocoonWeight > 0
        ? Math.round((cycle.totalHarvestedWetCocoonWeight * (1 - cycle.percentNonDefective)) * 100) / 100
        : 0,
      avgWeightPerWetCocoon: cycle.avgWeightPerWetCocoon || 0,
      avgShellRatio: Math.round((cycle.avgShellRatio || 0) * 100 * 100) / 100,
      driedCocoonWeightKg: cycle.driedCocoonWeightKg || 0,
      reelableCocoonWeightKg: cycle.reelableCocoonWeightKg || 0,
      reeledSilkWeightKg: cycle.reeledSilkWeightKg || 0,
    };
  }, [cycle]);

  const [state, setState] = useState<EditState>(buildState);

  useEffect(() => {
    if (!editing) setState(buildState());
  }, [cycle, editing, buildState]);

  const updateInstar = (idx: number, field: keyof InstarData, value: number) => {
    setState(prev => {
      const instars = prev.instars.map((inst, i) => {
        if (i !== idx) return inst;
        return { ...inst, [field]: value };
      });
      const hatchedEggs = cycle.hatchedEggs;
      const recalced = instars.map((inst, i) => ({
        ...inst,
        mortalityRatePercent: calcMortalityRate(inst.mortality, hatchedEggs),
        cumulativeMortalityRatePercent: calcCumulativeMortality(instars, i, hatchedEggs),
      }));
      return { ...prev, instars: recalced };
    });
    setSaved(false);
  };

  const updateField = (field: keyof Omit<EditState, 'instars'>, value: number) => {
    setState(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Shell ratio validation: max 25%
    if (state.avgShellRatio > 25) {
      toast.error('Shell ratio must be 25% or below. Please correct the value before saving.');
      return;
    }

    const totalFeed = state.instars.reduce((s, i) => s + i.totalLeafWeightFedG, 0);
    const totalInstarMortality = state.instars.reduce((s, i) => s + i.mortality, 0);
    const preCocooningMort = cycle.hatchedEggs > 0 ? totalInstarMortality / cycle.hatchedEggs : 0;
    const cocooningMortPercent = cycle.hatchedEggs > 0 ? state.cocooningMortality / cycle.hatchedEggs : 0;
    const nonDefectivePercent = state.wetWeightAll > 0
      ? (state.wetWeightAll - state.wetWeightDefective) / state.wetWeightAll
      : 0;

    updateCycleData(cycle.id, {
      instars: state.instars,
      finalLarvaeWeight: state.finalLarvaeWeight,
      totalLeafWeightFed: totalFeed,
      mortalityPreCocooning: preCocooningMort,
      mortalityCocooning: cocooningMortPercent,
      totalHarvestedWetCocoonWeight: state.wetWeightAll,
      percentNonDefective: Math.max(0, nonDefectivePercent),
      avgWeightPerWetCocoon: state.avgWeightPerWetCocoon,
      avgShellRatio: state.avgShellRatio / 100,
      driedCocoonWeightKg: state.driedCocoonWeightKg || undefined,
      reelableCocoonWeightKg: state.reelableCocoonWeightKg || undefined,
      reeledSilkWeightKg: state.reeledSilkWeightKg || undefined,
    });

    setSaved(true);
    setEditing(false);
    toast.success(`Cycle ${cycle.cycleNumber} data updated`);
  };

  const handleCancel = () => {
    setState(buildState());
    setEditing(false);
    setSaved(true);
  };

  const cocooningMortPercent = cycle.hatchedEggs > 0
    ? ((state.cocooningMortality / cycle.hatchedEggs) * 100).toFixed(2)
    : '0.00';

  const cellBase = "py-2.5 px-3 text-sm text-right border border-border/40";
  const headerCell = "py-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-right border border-border/40";
  const labelCell = "py-2.5 px-3 text-xs font-medium text-left text-muted-foreground border border-border/40 bg-muted/30 whitespace-nowrap";
  const editableCell = `${cellBase} bg-primary/5`;

  const EditableNum = ({ value, onChange, step = '1', disabled = false }: {
    value: number; onChange: (v: number) => void; step?: string; disabled?: boolean;
  }) => {
    if (!editing || disabled) {
      return <span className="text-foreground font-medium">{value || '—'}</span>;
    }
    return (
      <Input
        type="number"
        step={step}
        min="0"
        value={value || ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="h-7 w-full text-right text-sm border-0 bg-transparent focus:bg-background p-1"
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {!editing ? (
          <Button onClick={() => setEditing(true)} size="sm" className="kpi-gradient border-0 text-primary-foreground gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit Cycle Data
          </Button>
        ) : (
          <>
            <Button onClick={handleSave} size="sm" className="kpi-gradient border-0 text-primary-foreground gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} size="sm" variant="outline" className="gap-1.5">
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </>
        )}
        {!saved && editing && (
          <span className="text-xs text-warning font-medium animate-pulse">Unsaved changes</span>
        )}
        {saved && !editing && (
          <span className="text-xs text-success font-medium">✓ Saved</span>
        )}
      </div>

      {/* Instar Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className={`${headerCell} text-left min-w-[180px]`}>Metric</th>
                {INSTAR_LABELS.map(label => (
                  <th key={label} className={`${headerCell} min-w-[110px]`}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Duration */}
              <tr className="hover:bg-muted/20">
                <td className={labelCell}>Duration (days)</td>
                {state.instars.map((inst, i) => (
                  <td key={i} className={editing ? editableCell : cellBase}>
                    <EditableNum value={inst.durationDays} onChange={v => updateInstar(i, 'durationDays', v)} />
                  </td>
                ))}
              </tr>

              {/* Total Leaf Weight Fed */}
              <tr className="hover:bg-muted/20">
                <td className={labelCell}>Total Leaf Weight Fed (g)</td>
                {state.instars.map((inst, i) => (
                  <td key={i} className={editing ? editableCell : cellBase}>
                    <EditableNum value={inst.totalLeafWeightFedG} onChange={v => updateInstar(i, 'totalLeafWeightFedG', v)} />
                  </td>
                ))}
              </tr>

              {/* Mortality (number) */}
              <tr className="hover:bg-muted/20">
                <td className={labelCell}>Mortality</td>
                {state.instars.map((inst, i) => (
                  <td key={i} className={editing ? editableCell : cellBase}>
                    <EditableNum value={inst.mortality} onChange={v => updateInstar(i, 'mortality', v)} step="0.1" />
                  </td>
                ))}
              </tr>

              {/* Mortality Rate % (auto) */}
              <tr className="bg-muted/10 hover:bg-muted/20">
                <td className={labelCell}>
                  Mortality Rate (%)
                  <span className="text-[9px] text-primary ml-1">auto</span>
                </td>
                {state.instars.map((inst, i) => (
                  <td key={i} className={cellBase}>
                    <span className="text-foreground font-medium">
                      {(inst.mortalityRatePercent * 100).toFixed(2)}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Cumulative Mortality Rate % (auto) */}
              <tr className="bg-muted/10 hover:bg-muted/20">
                <td className={labelCell}>
                  Cumulative Mortality (%)
                  <span className="text-[9px] text-primary ml-1">auto</span>
                </td>
                {state.instars.map((inst, i) => (
                  <td key={i} className={cellBase}>
                    <span className="text-foreground font-medium">
                      {(inst.cumulativeMortalityRatePercent * 100).toFixed(2)}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Avg Larvae Weight (g) */}
              <tr className="hover:bg-muted/20">
                <td className={labelCell}>Avg Larvae Weight (g)</td>
                {state.instars.map((inst, i) => (
                  <td key={i} className={editing ? editableCell : cellBase}>
                    <EditableNum
                      value={inst.avgLarvaeWeight || 0}
                      onChange={v => updateInstar(i, 'avgLarvaeWeight' as keyof InstarData, v)}
                      step="0.01"
                      disabled={i < 2}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* End of Cycle Summary */}
      <div className="rounded-xl border-2 border-primary/30 bg-primary/[0.03] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-sm font-bold text-foreground font-display tracking-wide uppercase">
            End of Cycle Summary
          </h3>
          <span className="text-[10px] text-muted-foreground ml-1">Completion-critical data</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricField
            label="Final Larvae Weight (g)"
            value={state.finalLarvaeWeight}
            onChange={v => updateField('finalLarvaeWeight', v)}
            editing={editing}
            step="0.01"
          />
          <MetricField
            label="Cocooning Mortality"
            value={state.cocooningMortality}
            onChange={v => updateField('cocooningMortality', v)}
            editing={editing}
          />
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Cocooning Mortality (%)
              <span className="text-[9px] text-primary ml-1">auto</span>
            </label>
            <div className="h-9 flex items-center px-3 rounded-md bg-muted/30 text-sm font-medium text-foreground border border-border/40">
              {cocooningMortPercent}%
            </div>
          </div>
          <MetricField
            label="Wet Weight – All Cocoons (kg)"
            value={state.wetWeightAll}
            onChange={v => updateField('wetWeightAll', v)}
            editing={editing}
            step="0.01"
          />
          <MetricField
            label="Wet Weight – Defective Cocoons (kg)"
            value={state.wetWeightDefective}
            onChange={v => updateField('wetWeightDefective', v)}
            editing={editing}
            step="0.01"
          />
          <MetricField
            label="Average Weight per Wet Cocoon (g)"
            value={state.avgWeightPerWetCocoon}
            onChange={v => updateField('avgWeightPerWetCocoon', v)}
            editing={editing}
            step="0.01"
          />
          <MetricField
            label="Average Shell Ratio (%)"
            value={state.avgShellRatio}
            onChange={v => updateField('avgShellRatio', v)}
            editing={editing}
            step="0.1"
          />
        </div>
      </div>

      {/* Post-Processing Data (always visible, useful for finished cycles) */}
      <div className="rounded-xl border-2 border-warning/30 bg-warning/[0.03] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-warning" />
          <h3 className="text-sm font-bold text-foreground font-display tracking-wide uppercase">
            Post-Processing Data
          </h3>
          <span className="text-[10px] text-muted-foreground ml-1">Drying, reeling & grading — add when available</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricField
            label="Dried Cocoon Weight (kg)"
            value={state.driedCocoonWeightKg}
            onChange={v => updateField('driedCocoonWeightKg', v)}
            editing={editing}
            step="0.01"
          />
          <MetricField
            label="Reelable Cocoon Weight (kg)"
            value={state.reelableCocoonWeightKg}
            onChange={v => updateField('reelableCocoonWeightKg', v)}
            editing={editing}
            step="0.01"
          />
          <MetricField
            label="Reeled Silk Weight (kg)"
            value={state.reeledSilkWeightKg}
            onChange={v => updateField('reeledSilkWeightKg', v)}
            editing={editing}
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
}

function MetricField({ label, value, onChange, editing, step = '1' }: {
  label: string; value: number; onChange: (v: number) => void; editing: boolean; step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</label>
      {editing ? (
        <Input
          type="number"
          step={step}
          min="0"
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="h-9"
        />
      ) : (
        <div className="h-9 flex items-center px-3 rounded-md bg-muted/30 text-sm font-medium text-foreground">
          {value || '—'}
        </div>
      )}
    </div>
  );
}
