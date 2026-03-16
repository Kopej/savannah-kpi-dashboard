// Configurable KPI thresholds for traffic light indicators

export interface KPIThreshold {
  green: number;
  yellow?: number;
  direction: 'higher-better' | 'lower-better';
}

export const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
  hatchRate: { green: 0.95, yellow: 0.85, direction: 'higher-better' },
  survivalRate: { green: 0.90, yellow: 0.80, direction: 'higher-better' },
  cocoonWeight: { green: 2.0, yellow: 1.5, direction: 'higher-better' },
  shellRatio: { green: 0.21, yellow: 0.18, direction: 'higher-better' },
  yieldPerDFL: { green: 0.035, yellow: 0.025, direction: 'higher-better' },
  wormWeight: { green: 5.0, yellow: 3.0, direction: 'higher-better' },
  nonDefective: { green: 0.95, yellow: 0.85, direction: 'higher-better' },
  dflCount: { green: 500, yellow: 300, direction: 'higher-better' },
  mortality: { green: 0.10, yellow: 0.15, direction: 'lower-better' },
  fcr: { green: 20, yellow: 30, direction: 'lower-better' },
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
