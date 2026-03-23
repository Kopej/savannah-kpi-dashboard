// Savannah Seritech Data Models & Types

export interface InstarData {
  instar: number; // 1-5
  durationDays: number;
  totalLeafWeightFedG: number;
  mortality: number;
  mortalityRatePercent: number;
  cumulativeMortalityRatePercent: number;
  avgLarvaeWeight?: number; // grams, from 10-worm sample / 10
  feedPerDFLTarget?: number; // editable target per cycle per instar
}

export interface CycleData {
  id: string;
  cycleNumber: number;
  hatchDate: string;
  status: 'finished' | 'ongoing';
  estimatedStartingEggCount: number;
  hatchedEggs: number;
  mortalityPreCocooning: number; // percentage 0-1
  mortalityCocooning: number; // percentage 0-1
  finalLarvaeWeight: number; // grams
  totalLeafWeightFed: number; // grams
  totalHarvestedWetCocoonWeight: number; // kg
  percentNonDefective: number; // percentage 0-1
  avgWeightPerWetCocoon: number; // grams
  avgShellRatio: number; // percentage 0-1
  totalEggs?: number;
  hatchRatePercent?: number; // 0-1
  // Instar-level data (ongoing cycles)
  instars?: InstarData[];
  // Dried/reeled data (finished cycles, optional)
  driedCocoonWeightKg?: number;
  reeledSilkWeightKg?: number;
  cycleDurationDays?: number; // total days for full cycle
  // Per-cycle editable targets
  wetCocoonTarget?: number; // kg target
  currentDayOfCycle?: number; // live tracking
}

export interface ComputedKPIs {
  hatchRate: number;
  totalMortality: number;
  reelableWetCocoons: number;
  reelableWetCocoonsProductivity: number;
  kgReeledSilkPerAcre: number;
  feedToFinalWormWeightConversion: number;
  wormToWetCocoonConversion: number;
  overallFeedConversion: number;
  noOfWorms: number;
  totalWormCount: number;
  leafShootPerKgWetCocoon: number;
  dflToWetCocoonKg: number;
  wetToDryCocoonConversion: number;
  dryToReeledSilkConversion: number;
  reelability: number;
  dflsBrushed: number;
}

export interface KPISummary {
  avgYieldPerDFL: number;
  avgSurvivalRate: number;
  totalCocoons: number;
  totalDFLsBrushed: number;
  totalProduction: number;
  rearableCapacityUtilization: number;
  avgShellRatio: number;
  avgCocoonWeight: number;
  totalEggs: number;
  totalWorms: number;
  avgHatchRate: number;
  avgLeafShootPerKgWetCocoon: number;
  avgDflToWetCocoonKg: number;
  avgReelability: number;
  avgOverallFeedConversion: number;
  avgWormWeight: number;
}

export interface Assumptions {
  noFarmers: number;
  chawkisPerFarmer: number;
  wormsPerDFL: number;
  rearingCyclesPerMonth: number;
  chawkiHatchRateTarget: number;
  chawkiHatchRateActual: number;
  leafWeightPerDFL: number;
  treePopulationPerAcre: number;
  y1AnnualLeafYieldPerAcre: number;
  y2AnnualLeafYieldPerAcre: number;
  y3AnnualLeafYieldPerAcre: number;
  mulberryMaturityMonths: number;
  mulberryRepropagationDays: number;
  kgLeafShootPerAcrePerHarvest: number;
  wetCocoonToReeledSilkConversion: number;
  wetToDryConversion: number;
  dryToReeledConversion: number;
}

export interface DailyLog {
  id: string;
  cycleId: string;
  cycleNumber: number;
  date: string; // ISO date
  estimatedStartingEggCount: number;
  hatchedEggs: number;
  mortalityPreCocooning: number; // 0-1
  mortalityCocooning: number; // 0-1
  finalLarvaeWeight: number; // grams
  totalLeafWeightFed: number; // grams
  totalHarvestedWetCocoonWeight: number; // kg
  percentNonDefective: number; // 0-1
  avgWeightPerWetCocoon: number; // grams
  avgShellRatio: number; // 0-1
  // computed on read
  hatchRate?: number;
  totalMortality?: number;
}

export interface Ticket {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  category: 'Bug' | 'Data Issue' | 'Suggestion' | 'KPI Error' | 'Other';
  description: string;
  screenshotUrl?: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  notes: string;
  createdAt: string;
  updatedAt: string;
}
