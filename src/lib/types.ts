// Savannah Seritech Data Models & Types

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
  totalEggs?: number; // total eggs laid
  hatchRatePercent?: number; // hatch rate as percentage 0-1
}

export interface ComputedKPIs {
  hatchRate: number;
  totalMortality: number;
  reelableWetCocoons: number; // kg
  reelableWetCocoonsProductivity: number; // kg/acre
  kgReeledSilkPerAcre: number;
  feedToFinalWormWeightConversion: number;
  wormToWetCocoonConversion: number;
  overallFeedConversion: number;
  noOfWorms: number;
  totalWormCount: number;
  // New KPIs
  leafShootPerKgWetCocoon: number; // kg leaf+shoot per kg wet cocoon
  dflToWetCocoonKg: number; // kg wet cocoon per DFL
  wetToDryCocoonConversion: number; // ratio (0.45 = 45% retained)
  dryToReeledSilkConversion: number; // ratio
  reelability: number; // percentage 0-1
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

export interface MulberryPlot {
  id: string;
  name: string;
  acreage: number;
  treePopulation: number;
  dateTransplanted: string;
  dateLastHarvested: string;
  nextEarliestHarvestDate: string;
  irrigated: boolean;
  leaseStatus?: string;
  expectedYieldPerAcre?: number;
  cropAge?: number; // months
}

export interface YieldSample {
  id: string;
  plotName: string;
  dateOfSampling: string;
  irrigated: boolean;
  treeNumber: number;
  treeHeight: number; // meters
  shootGrowthAge?: number; // days
  weightShootsLeaves: number; // grams
  weightLeavesOnly: number; // grams
}

export interface YieldAverage {
  plotName: string;
  dateOfSampling: string;
  shootGrowthDays: number;
  avgShootsLeaves: number;
  avgLeaves: number;
  treeCount: number;
  totalYieldKg: number;
  acres: number;
  avgYieldPerAcre: number;
  irrigated: boolean;
}

export interface YieldPrediction {
  plotName: string;
  expectedYieldKg: number;
  rearingCapacityDFL: number;
  projectedYieldPerTree: number;
  plotProductivityPerAcre: number;
  projectedYieldPerAcrePerYear: number;
}

export interface Assumptions {
  noFarmers: number;
  chawkisPerFarmer: number;
  wormsPerDFL: number;
  rearingCyclesPerMonth: number;
  chawkiHatchRateTarget: number;
  chawkiHatchRateActual: number;
  leafWeightPerDFL: number; // KG
  treePopulationPerAcre: number;
  y1AnnualLeafYieldPerAcre: number;
  y2AnnualLeafYieldPerAcre: number;
  y3AnnualLeafYieldPerAcre: number;
  mulberryMaturityMonths: number;
  mulberryRepropagationDays: number;
  kgLeafShootPerAcrePerHarvest: number;
  wetCocoonToReeledSilkConversion: number;
  wetToDryConversion: number; // 0.45 (55% weight loss during drying)
  dryToReeledConversion: number; // 0.33 (67% weight loss during reeling)
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

export interface MonthlyYield {
  month: string;
  plotName: string;
  expectedYieldKg: number;
  rearingCapacityDFL: number;
}
