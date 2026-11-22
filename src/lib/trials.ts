import type { TrialInfo } from './types';

export const INITIAL_TIME_SEC = 90;

export const TRIALS: TrialInfo[] = [
  {
    id: 0,
    brand: 'CloudNote+',
    tabTitle: 'CloudNote+ — Billing',
    url: 'https://billing.cloudnote.plus/account/downgrade?guilt=max&retention_v4=true',
    renewalCost: 24.99,
    accent: '#4f46e5',
    tagline: 'Visual misdirection & triple-negative checkboxes',
  },
  {
    id: 1,
    brand: 'ConsentWall™',
    tabTitle: 'ConsentWall — Privacy',
    url: 'https://privacy.consentwall-adtech.io/preferences?partners=428',
    renewalCost: 19.99,
    accent: '#0284c7',
    tagline: 'Hydra cookie modals & Chad from Customer Success',
  },
  {
    id: 2,
    brand: 'FitPulse AI',
    tabTitle: 'FitPulse — Breakup',
    url: 'https://app.fitpulse.ai/membership/please-dont-leave-us',
    renewalCost: 39.0,
    accent: '#e11d48',
    tagline: 'Cursor-repelling buttons & emotional manipulation',
  },
  {
    id: 3,
    brand: 'VerifyHuman',
    tabTitle: 'Security Check',
    url: 'https://challenge.verifyhuman.net/anti-saving-bot-shield',
    renewalCost: 29.5,
    accent: '#0d9488',
    tagline: 'Corporate buzzword captcha & ice-physics verification',
  },
  {
    id: 4,
    brand: 'OmniSaaS Corp',
    tabTitle: 'OmniSaaS Offboarding',
    url: 'https://portal.omnisaas.corp/enterprise/retention-final-boss',
    renewalCost: 99.0,
    accent: '#d97706',
    tagline: 'ToS clause landmines, fake session timeout & retention override',
  },
];
