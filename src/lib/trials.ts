import type { TrialInfo } from './types';

export const INITIAL_TIME_SEC = 90;

export const TRIALS: TrialInfo[] = [
  {
    id: 0,
    brand: 'CloudNote+',
    tabTitle: 'CloudNote+ — Billing',
    url: 'https://billing.cloudnote.plus/account/downgrade?guilt=max&retention_v4=true',
    renewalCost: 24.99,
    accent: '#4338ca',
    tagline: 'Visual misdirection & triple-negative checkboxes',
    bossTitle: 'BOSS 1/5 • THE GUILT-TRIP MODAL',
  },
  {
    id: 1,
    brand: 'ConsentWall™',
    tabTitle: 'ConsentWall — Privacy',
    url: 'https://privacy.consentwall-adtech.io/preferences?partners=428',
    renewalCost: 19.99,
    accent: '#0369a1',
    tagline: 'Hydra cookie modals & Chad from Customer Success',
    bossTitle: 'BOSS 2/5 • THE 428-PARTNER HYDRA',
  },
  {
    id: 2,
    brand: 'FitPulse AI',
    tabTitle: 'FitPulse — Breakup',
    url: 'https://app.fitpulse.ai/membership/please-dont-leave-us',
    renewalCost: 39.0,
    accent: '#be123c',
    tagline: 'Cursor-repelling buttons & emotional manipulation',
    bossTitle: 'BOSS 3/5 • PULSEY THE CRYING KETTLEBELL',
  },
  {
    id: 3,
    brand: 'VerifyHuman',
    tabTitle: 'Security Check',
    url: 'https://challenge.verifyhuman.net/anti-saving-bot-shield',
    renewalCost: 29.5,
    accent: '#0f766e',
    tagline: 'Corporate buzzword captcha & ice-physics verification',
    bossTitle: 'BOSS 4/5 • CORPORATE CAPTCHA SHIELD',
  },
  {
    id: 4,
    brand: 'OmniSaaS Corp',
    tabTitle: 'OmniSaaS Offboarding',
    url: 'https://portal.omnisaas.corp/enterprise/retention-final-boss',
    renewalCost: 99.0,
    accent: '#b45309',
    tagline: 'ToS clause landmines, fake session timeout & retention override',
    bossTitle: 'FINAL BOSS 5/5 • VP OF RETENTION',
  },
];
