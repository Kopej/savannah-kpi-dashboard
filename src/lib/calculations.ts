// KPI Calculation Engine — replicates Excel formulas
import type { CycleData, ComputedKPIs, KPISummary, Assumptions, YieldSample, YieldAverage, YieldPrediction, MulberryPlot } from './types';

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  noFarmers: 10,
  chawkisPerFarmer: 100,
  wormsPerDFL: 500,
  rearingCyclesPerMonth: 1,
  chawkiHatchRateTarget: 0.95,
  chawkiHatchRateActual: 0.71,
  leafWeightPerDFL: 13,
  treePopulationPerAcre: 4000,
  y1AnnualLeafYieldPerAcre: 5200,
  y2AnnualLeafYieldPerAcre: 8000,
  y3AnnualLeafYieldPerAcre: 15000,
  mulberryMaturityMonths: 6,
  mulberryRepropagationDays: 35,
  kgLeafShootPerAcrePerHarvest: 3500,
  wetCocoonToReeledSilkConversion: 0.25,
};

// Number of active cycles to show on dashboard
export const ACTIVE_CYCLE_COUNT = 5;

// Get active cycles (last N by cycle number)
export function getActiveCycles(cycles: CycleData[], count: number = ACTIVE_CYCLE_COUNT): CycleData[] {
  const sorted = [...cycles].sort((a, b) => a.cycleNumber - b.cycleNumber);
  return sorted.slice(-count);
}

// Get archived cycles (all except last N)
export function getArchivedCycles(cycles: CycleData[], count: number = ACTIVE_CYCLE_COUNT): CycleData[] {
  const sorted = [...cycles].sort((a, b) => a.cycleNumber - b.cycleNumber);
  return sorted.slice(0, Math.max(0, sorted.length - count));
}

// Compute KPIs for a single cycle — mirrors Excel formulas row by row
export function computeCycleKPIs(cycle: CycleData, assumptions: Assumptions = DEFAULT_ASSUMPTIONS): ComputedKPIs {
  const hatchRate = cycle.estimatedStartingEggCount > 0
    ? cycle.hatchedEggs / cycle.estimatedStartingEggCount
    : 0;

  const totalMortality = cycle.mortalityPreCocooning + cycle.mortalityCocooning;

  const noOfWorms = Math.round(cycle.hatchedEggs * (1 - totalMortality));

  // Total worm count from totalEggs field
  const totalEggs = cycle.totalEggs || cycle.estimatedStartingEggCount;
  const hatchRateForWorms = cycle.hatchRatePercent || hatchRate;
  const totalWormCount = Math.round(totalEggs * hatchRateForWorms);

  const reelableWetCocoons = cycle.totalHarvestedWetCocoonWeight * cycle.percentNonDefective;

  const leafFedKg = cycle.totalLeafWeightFed / 1000;

  const acresUsed = leafFedKg / assumptions.kgLeafShootPerAcrePerHarvest;
  const reelableWetCocoonsProductivity = acresUsed > 0 ? reelableWetCocoons / acresUsed : 0;

  const kgReeledSilkPerAcre = reelableWetCocoonsProductivity * assumptions.wetCocoonToReeledSilkConversion;

  const totalWormWeightKg = (noOfWorms * cycle.finalLarvaeWeight) / 1000;
  const feedToFinalWormWeightConversion = totalWormWeightKg > 0 ? leafFedKg / totalWormWeightKg : 0;

  const wormToWetCocoonConversion = cycle.totalHarvestedWetCocoonWeight > 0
    ? totalWormWeightKg / cycle.totalHarvestedWetCocoonWeight
    : 0;

  const overallFeedConversion = cycle.totalHarvestedWetCocoonWeight > 0
    ? leafFedKg / cycle.totalHarvestedWetCocoonWeight
    : 0;

  return {
    hatchRate,
    totalMortality,
    noOfWorms,
    totalWormCount,
    reelableWetCocoons,
    reelableWetCocoonsProductivity,
    kgReeledSilkPerAcre,
    feedToFinalWormWeightConversion,
    wormToWetCocoonConversion,
    overallFeedConversion,
  };
}

// Compute aggregate summary KPIs across cycles
export function computeSummaryKPIs(cycles: CycleData[], assumptions: Assumptions = DEFAULT_ASSUMPTIONS): KPISummary {
  if (cycles.length === 0) {
    return { avgYieldPerDFL: 0, avgSurvivalRate: 0, totalCocoons: 0, totalDFLsBrushed: 0, totalProduction: 0, rearableCapacityUtilization: 0, avgShellRatio: 0, avgCocoonWeight: 0, totalEggs: 0, totalWorms: 0, avgHatchRate: 0 };
  }

  const allKPIs = cycles.map(c => computeCycleKPIs(c, assumptions));

  const totalProduction = cycles.reduce((s, c) => s + c.totalHarvestedWetCocoonWeight, 0);
  const totalDFLsBrushed = cycles.reduce((s, c) => s + Math.round(c.hatchedEggs / assumptions.wormsPerDFL), 0);
  const avgYieldPerDFL = totalDFLsBrushed > 0 ? totalProduction / totalDFLsBrushed : 0;

  const validSurvivals = allKPIs.filter(k => k.hatchRate > 0);
  const avgSurvivalRate = validSurvivals.length > 0
    ? validSurvivals.reduce((s, k) => s + (1 - k.totalMortality), 0) / validSurvivals.length
    : 0;

  const totalCocoons = cycles.reduce((s, c) => {
    if (c.avgWeightPerWetCocoon > 0) {
      return s + Math.round((c.totalHarvestedWetCocoonWeight * 1000) / c.avgWeightPerWetCocoon);
    }
    return s;
  }, 0);

  const validShell = cycles.filter(c => c.avgShellRatio > 0);
  const avgShellRatio = validShell.length > 0
    ? validShell.reduce((s, c) => s + c.avgShellRatio, 0) / validShell.length
    : 0;

  const validWeight = cycles.filter(c => c.avgWeightPerWetCocoon > 0);
  const avgCocoonWeight = validWeight.length > 0
    ? validWeight.reduce((s, c) => s + c.avgWeightPerWetCocoon, 0) / validWeight.length
    : 0;

  const totalEggs = cycles.reduce((s, c) => s + (c.totalEggs || c.estimatedStartingEggCount), 0);
  const totalWorms = allKPIs.reduce((s, k) => s + k.totalWormCount, 0);
  const avgHatchRate = allKPIs.length > 0
    ? allKPIs.reduce((s, k) => s + k.hatchRate, 0) / allKPIs.length
    : 0;

  return {
    avgYieldPerDFL,
    avgSurvivalRate,
    totalCocoons,
    totalDFLsBrushed,
    totalProduction,
    rearableCapacityUtilization: 0,
    avgShellRatio,
    avgCocoonWeight,
    totalEggs,
    totalWorms,
    avgHatchRate,
  };
}

// Calculate average mulberry consumption per DFL from given cycles
export function computeAvgLeafPerDFL(cycles: CycleData[], assumptions: Assumptions): number {
  if (cycles.length === 0) return assumptions.leafWeightPerDFL;
  const totalLeafKg = cycles.reduce((s, c) => s + c.totalLeafWeightFed / 1000, 0);
  const totalDFLs = cycles.reduce((s, c) => s + Math.round(c.hatchedEggs / assumptions.wormsPerDFL), 0);
  return totalDFLs > 0 ? totalLeafKg / totalDFLs : assumptions.leafWeightPerDFL;
}

// Compute yield averages from raw sampling data
export function computeYieldAverages(samples: YieldSample[], plots: MulberryPlot[]): YieldAverage[] {
  const grouped: Record<string, YieldSample[]> = {};
  samples.forEach(s => {
    const key = `${s.plotName}|${s.dateOfSampling}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  return Object.entries(grouped).map(([key, items]) => {
    const [plotName, dateOfSampling] = key.split('|');
    const avgShootsLeaves = items.reduce((s, i) => s + i.weightShootsLeaves, 0) / items.length;
    const avgLeaves = items.reduce((s, i) => s + i.weightLeavesOnly, 0) / items.length;
    const plot = plots.find(p => p.name === plotName);
    const treeCount = plot?.treePopulation || 0;
    const totalYieldKg = (avgShootsLeaves * treeCount) / 1000;
    const acres = plot?.acreage || 1;
    const avgYieldPerAcre = totalYieldKg / acres;
    const growthDays = items[0]?.shootGrowthAge || 0;

    return {
      plotName,
      dateOfSampling,
      shootGrowthDays: growthDays,
      avgShootsLeaves: Math.round(avgShootsLeaves),
      avgLeaves: Math.round(avgLeaves),
      treeCount,
      totalYieldKg: Math.round(totalYieldKg),
      acres,
      avgYieldPerAcre: Math.round(avgYieldPerAcre),
      irrigated: items[0]?.irrigated || false,
    };
  });
}

// Compute yield predictions per plot
export function computeYieldPredictions(
  plots: MulberryPlot[],
  assumptions: Assumptions = DEFAULT_ASSUMPTIONS
): YieldPrediction[] {
  const targetYieldPerTree = 750; // grams, from Excel

  return plots.map(plot => {
    const projectedYieldPerTree = targetYieldPerTree;
    const expectedYieldKg = (plot.treePopulation * projectedYieldPerTree) / 1000;
    const rearingCapacityDFL = expectedYieldKg / assumptions.leafWeightPerDFL;
    const plotProductivityPerAcre = plot.acreage > 0 ? expectedYieldKg / plot.acreage : 0;
    const projectedYieldPerAcrePerYear = plotProductivityPerAcre * 9;

    return {
      plotName: plot.name,
      expectedYieldKg: Math.round(expectedYieldKg),
      rearingCapacityDFL: Math.round(rearingCapacityDFL * 10) / 10,
      projectedYieldPerTree,
      plotProductivityPerAcre: Math.round(plotProductivityPerAcre),
      projectedYieldPerAcrePerYear: Math.round(projectedYieldPerAcrePerYear),
    };
  });
}

// Compute monthly expected yields per plot
export function computeMonthlyYields(
  plots: MulberryPlot[],
  assumptions: Assumptions = DEFAULT_ASSUMPTIONS
): Record<string, number[]> {
  const months = ['Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25','Jan-26','Feb-26','Mar-26','Apr-26','May-26','Jun-26'];
  const result: Record<string, number[]> = {};

  plots.forEach(plot => {
    const harvestDate = new Date(plot.nextEarliestHarvestDate);
    const yieldPerHarvest = (plot.treePopulation * 750) / 1000;

    result[plot.name] = months.map((m, i) => {
      const [mon, yr] = m.split('-');
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthIdx = monthNames.indexOf(mon);
      const year = 2000 + parseInt(yr);
      const monthDate = new Date(year, monthIdx, 1);

      if (monthDate >= harvestDate) {
        return Math.round(yieldPerHarvest);
      }
      return 0;
    });
  });

  return result;
}

// Format helpers
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatKg(value: number): string {
  return `${formatNumber(value, 1)} kg`;
}
