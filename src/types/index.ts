export type DomainCategory = 'social' | 'entertainment' | 'news' | 'shopping' | 'gaming' | 'custom';

export interface ScheduleConfig {
  enabled: boolean;
  days: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startHour: number; // 0-23
  startMinute: number; // 0-59
  endHour: number; // 0-23
  endMinute: number; // 0-59
}

export interface WebsiteRule {
  id: string;
  domain: string; // Normalized hostname, e.g. "youtube.com"
  category: DomainCategory;
  enabled: boolean;
  alarmEnabled: boolean; // Triggers 5-question Focus Breach Alarm
  schedule: ScheduleConfig;
  createdAt: string;
  breachCount: number;
}

export type AlarmDifficulty = 'easy' | 'normal' | 'hard';
export type SoundPreset = 'urgent-pulse' | 'radar-siren' | 'chime-beep';

export interface AlarmSettings {
  masterEnabled: boolean;
  soundPreset: SoundPreset;
  volume: number; // 0 to 1
  difficulty: AlarmDifficulty;
  activationDelaySeconds: number; // 0, 3, 5
  emergencyOverrideAllowed: boolean;
}

export interface MathQuestion {
  id: string;
  operand1: number;
  operand2: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  promptText: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  description: string;
  category: 'focus' | 'health' | 'learning' | 'sleep' | 'custom';
  dailyPauseTarget: number;
  safeUrl: string;
  active: boolean;
  createdAt: string;
}

export interface StreakDay {
  date: string; // YYYY-MM-DD
  pausesCount: number;
  breachesPrevented: number;
  success: boolean;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  freezesRemaining: number;
  todayPaused: boolean;
  history: StreakDay[];
}

export interface AccountabilitySettings {
  enabled: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  relationship: string;
  notifyOnBreach: boolean;
  notifyDailySummary: boolean;
  consentGranted: boolean;
  verified: boolean;
  lastSimulatedNotice?: string;
}

export type InterventionAction = 
  | 'returned_to_goal'
  | 'paused'
  | 'alarm_completed'
  | 'continued_intentionally'
  | 'emergency_override';

export interface InterventionEvent {
  id: string;
  timestamp: string;
  domain: string;
  actionTaken: InterventionAction;
  reflectionNote?: string;
  durationSeconds?: number;
}

export interface AppSettings {
  defaultSafeUrl: string;
  defaultPauseDuration: number; // in seconds, e.g. 30
  strictMode: boolean; // If true, "Continue" option is disabled
  temporaryBypassMinutes: number; // Default 5 mins after intentional continue
  bypasses: Record<string, number>; // domain -> timestamp until when it's bypassed
  hasCompletedOnboarding: boolean;
  extensionInstalled: boolean;
  lastSynced: string;
}

export interface AppState {
  rules: WebsiteRule[];
  alarmSettings: AlarmSettings;
  goals: PersonalGoal[];
  streak: StreakState;
  accountability: AccountabilitySettings;
  events: InterventionEvent[];
  settings: AppSettings;
}
