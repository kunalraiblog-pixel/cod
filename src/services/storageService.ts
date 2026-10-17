import { AppState, WebsiteRule, AlarmSettings, PersonalGoal, StreakState, AccountabilitySettings, AppSettings } from '../types';
import { checkStreakLiveness } from './streakService';

const STORAGE_KEY = 'urgezero_app_state_v1';

export const INITIAL_RULES: WebsiteRule[] = [
  {
    id: 'rule_1',
    domain: 'youtube.com',
    category: 'entertainment',
    enabled: true,
    alarmEnabled: true,
    schedule: { enabled: false, days: [1, 2, 3, 4, 5], startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
    createdAt: new Date().toISOString(),
    breachCount: 2,
  },
  {
    id: 'rule_2',
    domain: 'twitter.com',
    category: 'social',
    enabled: true,
    alarmEnabled: true,
    schedule: { enabled: false, days: [1, 2, 3, 4, 5], startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
    createdAt: new Date().toISOString(),
    breachCount: 1,
  },
  {
    id: 'rule_3',
    domain: 'instagram.com',
    category: 'social',
    enabled: true,
    alarmEnabled: true,
    schedule: { enabled: false, days: [1, 2, 3, 4, 5], startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
    createdAt: new Date().toISOString(),
    breachCount: 0,
  },
];

export const INITIAL_ALARM_SETTINGS: AlarmSettings = {
  masterEnabled: true,
  soundPreset: 'urgent-pulse',
  volume: 0.75,
  difficulty: 'normal',
  activationDelaySeconds: 0,
  emergencyOverrideAllowed: true,
};

export const INITIAL_GOALS: PersonalGoal[] = [
  {
    id: 'goal_1',
    title: 'Focus on Core Engineering & Deep Work',
    description: 'Protect 4 hours of uninterrupted problem-solving every day without mindless feed surfing.',
    category: 'focus',
    dailyPauseTarget: 5,
    safeUrl: 'https://calendar.google.com',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_STREAK: StreakState = {
  currentStreak: 2,
  longestStreak: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  freezesRemaining: 2,
  todayPaused: true,
  history: [
    {
      date: new Date().toISOString().split('T')[0],
      pausesCount: 3,
      breachesPrevented: 3,
      success: true,
    },
  ],
};

export const INITIAL_ACCOUNTABILITY: AccountabilitySettings = {
  enabled: false,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  relationship: '',
  notifyOnBreach: false,
  notifyDailySummary: false,
  consentGranted: false,
  verified: false,
};

export const INITIAL_APP_SETTINGS: AppSettings = {
  defaultSafeUrl: 'https://calendar.google.com',
  defaultPauseDuration: 30,
  strictMode: false,
  temporaryBypassMinutes: 5,
  bypasses: {},
  hasCompletedOnboarding: true,
  extensionInstalled: false,
  lastSynced: new Date().toISOString(),
};

export const INITIAL_STATE: AppState = {
  rules: INITIAL_RULES,
  alarmSettings: INITIAL_ALARM_SETTINGS,
  goals: INITIAL_GOALS,
  streak: INITIAL_STREAK,
  accountability: INITIAL_ACCOUNTABILITY,
  events: [
    {
      id: 'evt_sample_1',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      domain: 'twitter.com',
      actionTaken: 'returned_to_goal',
      durationSeconds: 15,
    },
    {
      id: 'evt_sample_2',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      domain: 'youtube.com',
      actionTaken: 'alarm_completed',
      durationSeconds: 42,
    },
  ],
  settings: INITIAL_APP_SETTINGS,
};

/**
 * Load state from storage with fallback to initial state.
 */
export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppState(INITIAL_STATE);
      return INITIAL_STATE;
    }

    const parsed = JSON.parse(raw);
    const merged: AppState = {
      rules: Array.isArray(parsed.rules) ? parsed.rules : INITIAL_RULES,
      alarmSettings: { ...INITIAL_ALARM_SETTINGS, ...(parsed.alarmSettings || {}) },
      goals: Array.isArray(parsed.goals) ? parsed.goals : INITIAL_GOALS,
      streak: checkStreakLiveness({ ...INITIAL_STREAK, ...(parsed.streak || {}) }),
      accountability: { ...INITIAL_ACCOUNTABILITY, ...(parsed.accountability || {}) },
      events: Array.isArray(parsed.events) ? parsed.events : [],
      settings: { ...INITIAL_APP_SETTINGS, ...(parsed.settings || {}) },
    };

    // Clean up expired domain bypasses
    const now = Date.now();
    const activeBypasses: Record<string, number> = {};
    if (merged.settings.bypasses) {
      for (const [domain, expiry] of Object.entries(merged.settings.bypasses)) {
        if (expiry > now) {
          activeBypasses[domain] = expiry;
        }
      }
    }
    merged.settings.bypasses = activeBypasses;

    return merged;
  } catch (e) {
    console.error('Failed to load Urge Zero state from localStorage:', e);
    return INITIAL_STATE;
  }
}

/**
 * Save state to localStorage and sync with chrome.storage if available.
 */
export function saveAppState(state: AppState): void {
  try {
    state.settings.lastSynced = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Sync to chrome.storage.local if extension environment or bridge exists
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
        if (chrome.runtime?.lastError) {
          console.warn('Chrome storage sync notice:', chrome.runtime.lastError.message);
        }
      });
    }

    // Broadcast change for other tabs
    window.dispatchEvent(new CustomEvent('urgezero_state_changed', { detail: state }));
  } catch (e) {
    console.error('Failed to save Urge Zero state:', e);
  }
}

/**
 * Reset application data to initial factory defaults.
 */
export function resetFactoryDefaults(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.remove([STORAGE_KEY]);
  }
  const fresh = JSON.parse(JSON.stringify(INITIAL_STATE));
  saveAppState(fresh);
  return fresh;
}
