export type GamePhase = 'intro' | 'playing' | 'victory' | 'timeout';

export interface TrialInfo {
  id: number;
  brand: string;
  tabTitle: string;
  url: string;
  renewalCost: number;
  accent: string;
  tagline: string;
  bossTitle: string;
}

export interface ChargeEntry {
  id: string;
  stageBrand: string;
  label: string;
  amount: number;
  timePenaltySec?: number;
}

export interface ToastItem {
  id: string;
  kind: 'scam' | 'clear' | 'hint' | 'achievement';
  title: string;
  detail: string;
}

export interface BurstParticle {
  id: string;
  x: number;
  y: number;
  tx: string;
  ty: string;
  rot: string;
  text: string;
  color: string;
}
