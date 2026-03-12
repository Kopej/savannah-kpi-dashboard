// KPI Calculation Engine — replicates Excel formulas
import type { CycleData, ComputedKPIs, KPISummary, Assumptions } from './types';

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
  wetToDryConversion: 0.45, // 55% weight lost during drying
  dryToReeledConversion: 0.33, // 67% weight lost during reeling
};

export const ACTIVE_CYCLE_COUNT = 5;

export function getActiveCycles(cycles: CycleData[], count: number = ACTIVE_CYCLE_COUNT): CycleData[] {
  const sorted = [...cycles].sort((a, b) => a.cycleNumber - b.cycleNumber);
  return sorted.slice(-count);
}

export function getArchivedCycles(cycles: CycleData[], count: number = ACTIVE_CYCLE_COUNT): CycleData[] {
  const sorted = [...cycles].sort((a, b) => a.cycleNumber - b.cycleNumber);
  return sorted.slice(0, Math.max(0, sorted.length - count));
}

export function getFinishedCycles(cycles: CycleData[]): CycleData[] {
  return [...cycles].filter(c => c.status === 'finished').sort((a, b) => a.cycleNumber - b.cycleNumber);
}

export function getOngoingCycles(cycles: CycleData[]): CycleData[] {
  return [...cycles].filter(c => c.status === 'ongoing').sort((a, b) => a.cycleNumber - b.cycleNumber);
}

export function computeCycleKPIs(cycle: CycleData, assumptions: Assumptions = DEFAULT_ASSUMPTIONS): ComputedKPIs {
  const hatchRate = cycle.estimatedStartingEggCount > 0
    ? cycle.hatchedEggs / cycle.estimatedStartingEggCount
    : 0;

  const totalMortality = cycle.mortalityPreCocooning + cycle.mortalityCocooning;
  const noOfWorms = Math.round(cycle.hatchedEggs * (1 - totalMortality));

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

  // New KPIs
  const dflsBrushed = assumptions.wormsPerDFL > 0
    ? Math.round(cycle.hatchedEggs / assumptions.wormsPerDFL)
    : 0;

  const leafShootPerKgWetCocoon = cycle.totalHarvestedWetCocoonWeight > 0
    ? leafFedKg / cycle.totalHarvestedWetCocoonWeight
    : 0;

  const dflToWetCocoonKg = dflsBrushed > 0
    ? cycle.totalHarvestedWetCocoonWeight / dflsBrushed
    : 0;

  const wetToDryCocoonConversion = assumptions.wetToDryConversion;
  const dryToReeledSilkConversion = assumptions.dryToReeledConversion;
  const reelability = cycle.percentNonDefective;

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
    leafShootPerKgWetCocoon,
    dflToWetCocoonKg,
    wetToDryCocoonConversion,
    dryToReeledSilkConversion,
    reelability,
    dflsBrushed,
  };
}

export function computeSummaryKPIs(cycles: CycleData[], assumptions: Assumptions = DEFAULT_ASSUMPTIONS): KPISummary {
  if (cycles.length === 0) {
    return {
      avgYieldPerDFL: 0, avgSurvivalRate: 0, totalCocoons: 0, totalDFLsBrushed: 0,
      totalProduction: 0, rearableCapacityUtilization: 0, avgShellRatio: 0, avgCocoonWeight: 0,
      totalEggs: 0, totalWorms: 0, avgHatchRate: 0, avgLeafShootPerKgWetCocoon: 0,
      avgDflToWetCocoonKg: 0, avgReelability: 0, avgOverallFeedConversion: 0, avgWormWeight: 0,
    };
  }

  const allKPIs = cycles.map(c => computeCycleKPIs(c, assumptions));
  const totalProduction = cycles.reduce((s, c) => s + c.totalHarvestedWetCocoonWeight, 0);
  const totalDFLsBrushed = allKPIs.reduce((s, k) => s + k.dflsBrushed, 0);
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

  // New averages
  const validFeed = allKPIs.filter(k => k.leafShootPerKgWetCocoon > 0 && isFinite(k.leafShootPerKgWetCocoon));
  const avgLeafShootPerKgWetCocoon = validFeed.length > 0
    ? validFeed.reduce((s, k) => s + k.leafShootPerKgWetCocoon, 0) / validFeed.length
    : 0;

  const validDfl = allKPIs.filter(k => k.dflToWetCocoonKg > 0);
  const avgDflToWetCocoonKg = validDfl.length > 0
    ? validDfl.reduce((s, k) => s + k.dflToWetCocoonKg, 0) / validDfl.length
    : 0;

  const validReel = cycles.filter(c => c.percentNonDefective > 0);
  const avgReelability = validReel.length > 0
    ? validReel.reduce((s, c) => s + c.percentNonDefective, 0) / validReel.length
    : 0;

  const validOFC = allKPIs.filter(k => k.overallFeedConversion > 0 && isFinite(k.overallFeedConversion));
  const avgOverallFeedConversion = validOFC.length > 0
    ? validOFC.reduce((s, k) => s + k.overallFeedConversion, 0) / validOFC.length
    : 0;

  const validWW = cycles.filter(c => c.finalLarvaeWeight > 0);
  const avgWormWeight = validWW.length > 0
    ? validWW.reduce((s, c) => s + c.finalLarvaeWeight, 0) / validWW.length
    : 0;

  return {
    avgYieldPerDFL, avgSurvivalRate, totalCocoons, totalDFLsBrushed, totalProduction,
    rearableCapacityUtilization: 0, avgShellRatio, avgCocoonWeight, totalEggs, totalWorms,
    avgHatchRate, avgLeafShootPerKgWetCocoon, avgDflToWetCocoonKg, avgReelability,
    avgOverallFeedConversion, avgWormWeight,
  };
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
