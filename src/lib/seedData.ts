import type { CycleData, MulberryPlot, YieldSample } from './types';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const SEED_CYCLES: CycleData[] = [
  {
    id: uid(), cycleNumber: 8, hatchDate: '2025-06-17', status: 'finished',
    estimatedStartingEggCount: 27090, hatchedEggs: 19316,
    mortalityPreCocooning: 0.02, mortalityCocooning: 0.15,
    finalLarvaeWeight: 3.3, totalLeafWeightFed: 486490,
    totalHarvestedWetCocoonWeight: 20, percentNonDefective: 0.79,
    avgWeightPerWetCocoon: 1.2, avgShellRatio: 0.17,
  },
  {
    id: uid(), cycleNumber: 9, hatchDate: '2025-09-13', status: 'finished',
    estimatedStartingEggCount: 24827, hatchedEggs: 13639,
    mortalityPreCocooning: 0, mortalityCocooning: 0.04,
    finalLarvaeWeight: 3.6, totalLeafWeightFed: 251520,
    totalHarvestedWetCocoonWeight: 10.5, percentNonDefective: 0.97,
    avgWeightPerWetCocoon: 1.2, avgShellRatio: 0.21,
  },
  {
    id: uid(), cycleNumber: 10, hatchDate: '2025-09-30', status: 'finished',
    estimatedStartingEggCount: 22350, hatchedEggs: 21300,
    mortalityPreCocooning: 0, mortalityCocooning: 0.04,
    finalLarvaeWeight: 3.8, totalLeafWeightFed: 521625,
    totalHarvestedWetCocoonWeight: 25.05, percentNonDefective: 1.0,
    avgWeightPerWetCocoon: 1.2, avgShellRatio: 0.24,
  },
  {
    id: uid(), cycleNumber: 11, hatchDate: '2025-09-29', status: 'finished',
    estimatedStartingEggCount: 14003, hatchedEggs: 10390,
    mortalityPreCocooning: 0.0196, mortalityCocooning: 0.02,
    finalLarvaeWeight: 3.7, totalLeafWeightFed: 156555,
    totalHarvestedWetCocoonWeight: 6.988, percentNonDefective: 0.87,
    avgWeightPerWetCocoon: 1.6, avgShellRatio: 0.22,
  },
  {
    id: uid(), cycleNumber: 12, hatchDate: '2025-10-28', status: 'finished',
    estimatedStartingEggCount: 19100, hatchedEggs: 14100,
    mortalityPreCocooning: 0.0372, mortalityCocooning: 0.04,
    finalLarvaeWeight: 3.0, totalLeafWeightFed: 296850,
    totalHarvestedWetCocoonWeight: 4.21, percentNonDefective: 0.86,
    avgWeightPerWetCocoon: 1.49, avgShellRatio: 0.23,
  },
  {
    id: uid(), cycleNumber: 13, hatchDate: '2025-11-11', status: 'finished',
    estimatedStartingEggCount: 0, hatchedEggs: 1000,
    mortalityPreCocooning: 0.05, mortalityCocooning: 0.05,
    finalLarvaeWeight: 3.15, totalLeafWeightFed: 78660,
    totalHarvestedWetCocoonWeight: 0.36, percentNonDefective: 0.83,
    avgWeightPerWetCocoon: 1.2, avgShellRatio: 0.12,
  },
  {
    id: uid(), cycleNumber: 14, hatchDate: '2025-11-13', status: 'finished',
    estimatedStartingEggCount: 28000, hatchedEggs: 26500,
    mortalityPreCocooning: 0, mortalityCocooning: 0,
    finalLarvaeWeight: 3.03, totalLeafWeightFed: 994930,
    totalHarvestedWetCocoonWeight: 27.36, percentNonDefective: 0.91,
    avgWeightPerWetCocoon: 1.69, avgShellRatio: 0.21,
  },
  {
    id: uid(), cycleNumber: 15, hatchDate: '2026-01-26', status: 'ongoing',
    estimatedStartingEggCount: 28000, hatchedEggs: 0,
    mortalityPreCocooning: 0, mortalityCocooning: 0,
    finalLarvaeWeight: 0, totalLeafWeightFed: 0,
    totalHarvestedWetCocoonWeight: 0, percentNonDefective: 0,
    avgWeightPerWetCocoon: 0, avgShellRatio: 0,
    totalEggs: 28000, hatchRatePercent: 0.95,
  },
  {
    id: uid(), cycleNumber: 16, hatchDate: '2026-02-02', status: 'ongoing',
    estimatedStartingEggCount: 0, hatchedEggs: 0,
    mortalityPreCocooning: 0, mortalityCocooning: 0,
    finalLarvaeWeight: 0, totalLeafWeightFed: 0,
    totalHarvestedWetCocoonWeight: 0, percentNonDefective: 0,
    avgWeightPerWetCocoon: 0, avgShellRatio: 0,
  },
  {
    id: uid(), cycleNumber: 17, hatchDate: '2026-02-13', status: 'ongoing',
    estimatedStartingEggCount: 108800, hatchedEggs: 106624,
    mortalityPreCocooning: 0, mortalityCocooning: 0,
    finalLarvaeWeight: 0, totalLeafWeightFed: 515880,
    totalHarvestedWetCocoonWeight: 0, percentNonDefective: 0,
    avgWeightPerWetCocoon: 0, avgShellRatio: 0,
    totalEggs: 108800, hatchRatePercent: 0.98,
  },
];

export const SEED_PLOTS: MulberryPlot[] = [];
export const SEED_YIELD_SAMPLES: YieldSample[] = [];
