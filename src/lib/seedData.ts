// Seed data from the Excel file
import type { CycleData, MulberryPlot, YieldSample } from './types';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const SEED_CYCLES: CycleData[] = [
  {
    id: uid(), cycleNumber: 8, hatchDate: '2025-06-17',
    estimatedStartingEggCount: 27090, hatchedEggs: 19316,
    mortalityPreCocooning: 0.02, mortalityCocooning: 0.15,
    finalLarvaeWeight: 3.3, totalLeafWeightFed: 486490,
    totalHarvestedWetCocoonWeight: 20, percentNonDefective: 0.79,
    avgWeightPerWetCocoon: 1.2, avgShellRatio: 0.17,
  },
  {
    id: uid(), cycleNumber: 9, hatchDate: '2025-09-13',
    estimatedStartingEggCount: 24827, hatchedEggs: 13639,
    mortalityPreCocooning: 0, mortalityCocooning: 0.04,
    finalLarvaeWeight: 3.6, totalLeafWeightFed: 251520,
    totalHarvestedWetCocoonWeight: 10.5, percentNonDefective: 0.97,
    avgWeightPerWetCocoon: 1.2, avgShellRatio: 0.21,
  },
  {
    id: uid(), cycleNumber: 10, hatchDate: '2025-09-30',
    estimatedStartingEggCount: 22350, hatchedEggs: 21300,
    mortalityPreCocooning: 0, mortalityCocooning: 0.04,
    finalLarvaeWeight: 3.8, totalLeafWeightFed: 521625,
    totalHarvestedWetCocoonWeight: 25.05, percentNonDefective: 1.0,
    avgWeightPerWetCocoon: 1.2, avgShellRatio: 0.24,
  },
  {
    id: uid(), cycleNumber: 11, hatchDate: '2025-09-29',
    estimatedStartingEggCount: 14003, hatchedEggs: 10390,
    mortalityPreCocooning: 0.0196, mortalityCocooning: 0.02,
    finalLarvaeWeight: 3.7, totalLeafWeightFed: 156555,
    totalHarvestedWetCocoonWeight: 6.988, percentNonDefective: 0.87,
    avgWeightPerWetCocoon: 1.6, avgShellRatio: 0.22,
  },
  {
    id: uid(), cycleNumber: 12, hatchDate: '2025-10-28',
    estimatedStartingEggCount: 19100, hatchedEggs: 14100,
    mortalityPreCocooning: 0.0372, mortalityCocooning: 0.04,
    finalLarvaeWeight: 3.0, totalLeafWeightFed: 296850,
    totalHarvestedWetCocoonWeight: 4.21, percentNonDefective: 0.86,
    avgWeightPerWetCocoon: 1.49, avgShellRatio: 0.23,
  },
  {
    id: uid(), cycleNumber: 13, hatchDate: '2025-11-11',
    estimatedStartingEggCount: 0, hatchedEggs: 1000,
    mortalityPreCocooning: 0.05, mortalityCocooning: 0.05,
    finalLarvaeWeight: 3.15, totalLeafWeightFed: 78660,
    totalHarvestedWetCocoonWeight: 0.36, percentNonDefective: 0.83,
    avgWeightPerWetCocoon: 1.2, avgShellRatio: 0.12,
  },
  {
    id: uid(), cycleNumber: 14, hatchDate: '2025-11-13',
    estimatedStartingEggCount: 28000, hatchedEggs: 26500,
    mortalityPreCocooning: 0, mortalityCocooning: 0,
    finalLarvaeWeight: 3.03, totalLeafWeightFed: 994930,
    totalHarvestedWetCocoonWeight: 27.36, percentNonDefective: 0.91,
    avgWeightPerWetCocoon: 1.69, avgShellRatio: 0.21,
  },
];

export const SEED_PLOTS: MulberryPlot[] = [
  { id: uid(), name: 'Regenerative', acreage: 0.5, treePopulation: 331, dateTransplanted: '2024-10-05', dateLastHarvested: '2025-06-18', nextEarliestHarvestDate: '2025-07-23', irrigated: false },
  { id: uid(), name: 'Margaret', acreage: 0.8, treePopulation: 1013, dateTransplanted: '2024-10-28', dateLastHarvested: '2025-06-14', nextEarliestHarvestDate: '2025-07-19', irrigated: true },
  { id: uid(), name: 'Prisca', acreage: 1.2, treePopulation: 4112, dateTransplanted: '2024-12-02', dateLastHarvested: '2025-07-17', nextEarliestHarvestDate: '2025-08-21', irrigated: true },
  { id: uid(), name: 'Bernard & George Maemba', acreage: 2.19, treePopulation: 7174, dateTransplanted: '2025-04-04', dateLastHarvested: '', nextEarliestHarvestDate: '2025-10-04', irrigated: false },
  { id: uid(), name: 'Walter Markwet Hamisi', acreage: 1.06, treePopulation: 2507, dateTransplanted: '2025-04-07', dateLastHarvested: '', nextEarliestHarvestDate: '2025-10-07', irrigated: false },
  { id: uid(), name: 'Arphaxard Nguka Apolo', acreage: 1.0, treePopulation: 2944, dateTransplanted: '2025-04-08', dateLastHarvested: '', nextEarliestHarvestDate: '2025-10-08', irrigated: false },
  { id: uid(), name: 'Raphael Kisesso 1', acreage: 0.75, treePopulation: 2507, dateTransplanted: '2025-04-10', dateLastHarvested: '', nextEarliestHarvestDate: '2025-10-10', irrigated: true },
  { id: uid(), name: 'Raphael Kisesso 2', acreage: 0.67, treePopulation: 2078, dateTransplanted: '2025-04-11', dateLastHarvested: '', nextEarliestHarvestDate: '2025-10-11', irrigated: false },
  { id: uid(), name: 'Michael Odhiambo Ojwala', acreage: 1.0, treePopulation: 2971, dateTransplanted: '2025-04-14', dateLastHarvested: '', nextEarliestHarvestDate: '2025-10-14', irrigated: true },
  { id: uid(), name: 'Joseph Onyango Kadeka', acreage: 1.09, treePopulation: 3096, dateTransplanted: '2025-04-29', dateLastHarvested: '', nextEarliestHarvestDate: '2025-10-29', irrigated: false },
  { id: uid(), name: 'Andrew & Paul Ogweno Onduru', acreage: 0.97, treePopulation: 2681, dateTransplanted: '2025-04-30', dateLastHarvested: '', nextEarliestHarvestDate: '2025-10-30', irrigated: false },
  { id: uid(), name: 'George Ogunda', acreage: 1.1, treePopulation: 2667, dateTransplanted: '2025-05-02', dateLastHarvested: '', nextEarliestHarvestDate: '2025-11-02', irrigated: true },
  { id: uid(), name: 'Dickens Odhiambo Otieno', acreage: 0.7, treePopulation: 1706, dateTransplanted: '2025-05-02', dateLastHarvested: '', nextEarliestHarvestDate: '2025-11-02', irrigated: false },
  { id: uid(), name: 'Beatrice Jabuto', acreage: 0.83, treePopulation: 3064, dateTransplanted: '2025-05-06', dateLastHarvested: '', nextEarliestHarvestDate: '2025-11-06', irrigated: false },
];

export const SEED_YIELD_SAMPLES: YieldSample[] = [
  // July 2025 sampling - Bernard & George
  { id: uid(), plotName: 'Bernard & George Maemba', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 1, treeHeight: 2.1, weightShootsLeaves: 1012, weightLeavesOnly: 538 },
  { id: uid(), plotName: 'Bernard & George Maemba', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 2, treeHeight: 1.92, weightShootsLeaves: 474, weightLeavesOnly: 250 },
  { id: uid(), plotName: 'Bernard & George Maemba', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 3, treeHeight: 1.67, weightShootsLeaves: 497, weightLeavesOnly: 281 },
  { id: uid(), plotName: 'Bernard & George Maemba', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 4, treeHeight: 1.6, weightShootsLeaves: 623, weightLeavesOnly: 372 },
  { id: uid(), plotName: 'Bernard & George Maemba', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 5, treeHeight: 1.45, weightShootsLeaves: 446, weightLeavesOnly: 267 },
  // Walter
  { id: uid(), plotName: 'Walter Markwet Hamisi', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 1, treeHeight: 1.9, weightShootsLeaves: 1577, weightLeavesOnly: 862 },
  { id: uid(), plotName: 'Walter Markwet Hamisi', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 2, treeHeight: 1.47, weightShootsLeaves: 712, weightLeavesOnly: 426 },
  { id: uid(), plotName: 'Walter Markwet Hamisi', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 3, treeHeight: 1.45, weightShootsLeaves: 301, weightLeavesOnly: 179 },
  { id: uid(), plotName: 'Walter Markwet Hamisi', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 4, treeHeight: 1.33, weightShootsLeaves: 406, weightLeavesOnly: 253 },
  { id: uid(), plotName: 'Walter Markwet Hamisi', dateOfSampling: '2025-07-22', irrigated: false, treeNumber: 5, treeHeight: 1.28, weightShootsLeaves: 471, weightLeavesOnly: 279 },
  // Prisca Jan 2026
  { id: uid(), plotName: 'Prisca', dateOfSampling: '2026-01-26', irrigated: true, treeNumber: 1, treeHeight: 2.5, shootGrowthAge: 71, weightShootsLeaves: 2020, weightLeavesOnly: 1000 },
  { id: uid(), plotName: 'Prisca', dateOfSampling: '2026-01-26', irrigated: true, treeNumber: 2, treeHeight: 1.5, shootGrowthAge: 71, weightShootsLeaves: 720, weightLeavesOnly: 400 },
  { id: uid(), plotName: 'Prisca', dateOfSampling: '2026-01-26', irrigated: true, treeNumber: 3, treeHeight: 2.0, shootGrowthAge: 71, weightShootsLeaves: 2180, weightLeavesOnly: 1120 },
  { id: uid(), plotName: 'Prisca', dateOfSampling: '2026-01-26', irrigated: true, treeNumber: 4, treeHeight: 1.9, shootGrowthAge: 71, weightShootsLeaves: 1740, weightLeavesOnly: 940 },
  { id: uid(), plotName: 'Prisca', dateOfSampling: '2026-01-26', irrigated: true, treeNumber: 5, treeHeight: 2.05, shootGrowthAge: 71, weightShootsLeaves: 1400, weightLeavesOnly: 740 },
];
