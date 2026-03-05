// Configurable KPI thresholds for traffic light indicators

export interface KPIThreshold {
  green: number;   // >= this value = green
  yellow?: number; // >= this value = yellow (optional)
  // below yellow (or green if no yellow) = red
  direction: 'higher-better' | 'lower-better';
}

export const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
  hatchRate: { green: 0.85, yellow: 0.70, direction: 'higher-better' },
  survivalRate: { green: 0.90, yellow: 0.80, direction: 'higher-better' },
  cocoonWeight: { green: 1.5, yellow: 1.2, direction: 'higher-better' },
  shellRatio: { green: 0.21, yellow: 0.18, direction: 'higher-better' },
  yieldPerDFL: { green: 0.035, yellow: 0.025, direction: 'higher-better' }, // in kg
  wormWeight: { green: 3.0, yellow: 2.5, direction: 'higher-better' },
  nonDefective: { green: 0.90, yellow: 0.80, direction: 'higher-better' },
};

export type TrafficLight = 'green' | 'yellow' | 'red';

export function getTrafficLight(value: number, thresholdKey: string): TrafficLight {
  const t = KPI_THRESHOLDS[thresholdKey];
  if (!t) return 'green';

  if (t.direction === 'higher-better') {
    if (value >= t.green) return 'green';
    if (t.yellow !== undefined && value >= t.yellow) return 'yellow';
    return 'red';
  } else {
    if (value <= t.green) return 'green';
    if (t.yellow !== undefined && value <= t.yellow) return 'yellow';
    return 'red';
  }
}

export function getTrafficLightColor(light: TrafficLight): string {
  switch (light) {
    case 'green': return 'text-success';
    case 'yellow': return 'text-warning';
    case 'red': return 'text-destructive';
  }
}

export function getTrafficLightBg(light: TrafficLight): string {
  switch (light) {
    case 'green': return 'bg-success/15';
    case 'yellow': return 'bg-warning/15';
    case 'red': return 'bg-destructive/15';
  }
}

export function getTrafficLightDot(light: TrafficLight): string {
  switch (light) {
    case 'green': return 'bg-success';
    case 'yellow': return 'bg-warning';
    case 'red': return 'bg-destructive';
  }
}
