export type GamePhase = 'intro' | 'playing' | 'victory' | 'timeout';

export type WindowId = 'browser' | 'bank' | 'chat' | 'terminal' | 'sticky';

export interface DesktopWindowState {
  id: WindowId;
  title: string;
  open: boolean;
  minimized: boolean;
  z: number;
  x: number;
  y: number;
}

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
  kind: 'scam' | 'saved';
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

export interface ChatBubble {
  id: string;
  sender: string;
  handle: string;
  avatarBg: string;
  text: string;
  time: string;
}

export interface SpamPopup {
  id: number;
  title: string;
  body: string;
  cta: string;
  fee: number;
  x: number;
  y: number;
}
