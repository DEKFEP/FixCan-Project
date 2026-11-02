export type Locale = 'en' | 'es';
export type ThemeMode = 'system' | 'dark' | 'light';

export type ScanCategory =
  | 'gpu'
  | 'cpu'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'motherboard'
  | 'cooling'
  | 'battery'
  | 'phone_part'
  | 'laptop_part'
  | 'other';

export type Severity = 'none' | 'minor' | 'moderate' | 'severe';
export type Repairability = 'yes' | 'partial' | 'no' | 'unknown' | 'not_needed';
export type Difficulty = 'easy' | 'moderate' | 'hard' | 'professional';

export type DamageType =
  | 'corrosion'
  | 'crack'
  | 'burn'
  | 'bent_pin'
  | 'missing'
  | 'dust'
  | 'swelling'
  | 'wear'
  | 'scratch'
  | 'deformation'
  | 'other';

export interface SpecItem {
  label: string;
  value: string;
}

export interface ComponentInfo {
  name: string;
  brand: string;
  model: string;
  category: ScanCategory;
  specs: SpecItem[];
  description: string;
  confidence: number;
  identifiers?: {
    serial?: string;
    partNumber?: string;
  };
}

export interface DamageFinding {
  type: DamageType;
  description: string;
  location?: string;
  confidence: number;
}

export interface DamageAssessment {
  detected: boolean;
  summary: string;
  severity: Severity;
  findings: DamageFinding[];
}

export interface RepairStep {
  title: string;
  detail: string;
  safety?: string;
}

export interface RepairPlan {
  repairability: Repairability;
  difficulty: Difficulty;
  estimatedTime?: string;
  estimatedCost?: {
    min: number;
    max: number;
    currency: string;
  };
  tools: string[];
  steps: RepairStep[];
  warnings: string[];
  whenToSeekPro: string[];
}

export interface Scan {
  id: string;
  createdAt: string;
  imageUri?: string;
  isDemo?: boolean;
  locale: Locale;
  model: string;
  component: ComponentInfo;
  damage: DamageAssessment;
  repair: RepairPlan;
}

export type ScanAnalysis = Pick<Scan, 'component' | 'damage' | 'repair'>;

export interface UserProfile {
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}
