import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AppState, 
  WebsiteRule, 
  AlarmSettings, 
  PersonalGoal, 
  AccountabilitySettings, 
  InterventionEvent, 
  AppSettings,
  DomainCategory,
  ScheduleConfig
} from '../types';
import { loadAppState, saveAppState, resetFactoryDefaults } from '../services/storageService';
import { normalizeDomain, isValidDomain, isDomainMatched } from '../utils/domain';
import { updateStreakOnActivity } from '../services/streakService';

interface AppContextType {
  state: AppState;
  addRule: (domain: string, category?: DomainCategory, alarmEnabled?: boolean, schedule?: ScheduleConfig) => { success: boolean; error?: string };
  updateRule: (id: string, updates: Partial<WebsiteRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  updateAlarmSettings: (updates: Partial<AlarmSettings>) => void;
  addGoal: (goal: Omit<PersonalGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<PersonalGoal>) => void;
  deleteGoal: (id: string) => void;
  updateAccountability: (updates: Partial<AccountabilitySettings>) => void;
  simulateNotification: () => void;
  logInterventionEvent: (event: Omit<InterventionEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  updateAppSettings: (updates: Partial<AppSettings>) => void;
  setDomainBypass: (domain: string, minutes?: number) => void;
  isDomainBypassed: (domain: string) => boolean;
  checkRuleForDomain: (hostname: string) => { isBlocked: boolean; rule?: WebsiteRule; isBypassed?: boolean };
  resetAll: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadAppState());

  // Listen for storage changes from other tabs or background worker
  useEffect(() => {
    const handleStorageChange = () => {
      setState(loadAppState());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('urgezero_state_changed', handleStorageChange);

    // Extension bridge ping: Check if extension is installed and responding
    if (typeof window !== 'undefined') {
      window.postMessage({ type: 'URGEZERO_PING' }, '*');
      const listener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'URGEZERO_PONG') {
          setState((prev) => {
            if (!prev.settings.extensionInstalled) {
              const updated = { ...prev, settings: { ...prev.settings, extensionInstalled: true } };
              saveAppState(updated);
              return updated;
            }
            return prev;
          });
        }
      };
      window.addEventListener('message', listener);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('urgezero_state_changed', handleStorageChange);
        window.removeEventListener('message', listener);
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('urgezero_state_changed', handleStorageChange);
    };
  }, []);

  const addRule = (
    rawDomain: string, 
    category: DomainCategory = 'custom', 
    alarmEnabled: boolean = true,
    schedule?: ScheduleConfig
  ): { success: boolean; error?: string } => {
    const normalized = normalizeDomain(rawDomain);
    
    if (!normalized) {
      return { success: false, error: 'Domain name cannot be empty.' };
    }

    if (!isValidDomain(normalized)) {
      return { success: false, error: 'Please enter a valid hostname (e.g. youtube.com or reddit.com).' };
    }

    // Check duplicates
    const exists = state.rules.some((r) => r.domain.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      return { success: false, error: `"${normalized}" is already on your restricted list.` };
    }

    const newRule: WebsiteRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      domain: normalized,
      category,
      enabled: true,
      alarmEnabled,
      schedule: schedule || {
        enabled: false,
        days: [1, 2, 3, 4, 5],
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      },
      createdAt: new Date().toISOString(),
      breachCount: 0,
    };

    const updated = {
      ...state,
      rules: [newRule, ...state.rules],
    };

    setState(updated);
    saveAppState(updated);
    return { success: true };
  };

  const updateRule = (id: string, updates: Partial<WebsiteRule>) => {
    const updatedRules = state.rules.map((rule) => {
      if (rule.id === id) {
        if (updates.domain) {
          const norm = normalizeDomain(updates.domain);
          if (isValidDomain(norm)) {
            return { ...rule, ...updates, domain: norm };
          }
        }
        return { ...rule, ...updates };
      }
      return rule;
    });

    const updated = { ...state, rules: updatedRules };
    setState(updated);
    saveAppState(updated);
  };

  const deleteRule = (id: string) => {
    const updatedRules = state.rules.filter((r) => r.id !== id);
    const updated = { ...state, rules: updatedRules };
    setState(updated);
    saveAppState(updated);
  };

  const toggleRule = (id: string) => {
    const updatedRules = state.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    const updated = { ...state, rules: updatedRules };
    setState(updated);
    saveAppState(updated);
  };

  const updateAlarmSettings = (updates: Partial<AlarmSettings>) => {
    const updated = {
      ...state,
      alarmSettings: { ...state.alarmSettings, ...updates },
    };
    setState(updated);
    saveAppState(updated);
  };

  const addGoal = (goal: Omit<PersonalGoal, 'id' | 'createdAt'>) => {
    const newGoal: PersonalGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...state,
      goals: [...state.goals, newGoal],
    };
    setState(updated);
    saveAppState(updated);
  };

  const updateGoal = (id: string, updates: Partial<PersonalGoal>) => {
    const updatedGoals = state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    const updated = { ...state, goals: updatedGoals };
    setState(updated);
    saveAppState(updated);
  };

  const deleteGoal = (id: string) => {
    const updatedGoals = state.goals.filter((g) => g.id !== id);
    const updated = { ...state, goals: updatedGoals };
    setState(updated);
    saveAppState(updated);
  };

  const updateAccountability = (updates: Partial<AccountabilitySettings>) => {
    const updated = {
      ...state,
      accountability: { ...state.accountability, ...updates },
    };
    setState(updated);
    saveAppState(updated);
  };

  const simulateNotification = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = {
      ...state,
      accountability: {
        ...state.accountability,
        verified: true,
        lastSimulatedNotice: `Simulated alert sent to ${state.accountability.contactName || 'Contact'} at ${timeStr}.`,
      },
    };
    setState(updated);
    saveAppState(updated);
  };

  const logInterventionEvent = (eventData: Omit<InterventionEvent, 'id' | 'timestamp'>) => {
    const newEvent: InterventionEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    // Update rule breach count
    const updatedRules = state.rules.map((r) => {
      if (isDomainMatched(eventData.domain, r.domain)) {
        return { ...r, breachCount: r.breachCount + 1 };
      }
      return r;
    });

    // Update streak
    const updatedStreak = updateStreakOnActivity(state.streak);

    const updated: AppState = {
      ...state,
      rules: updatedRules,
      streak: updatedStreak,
      events: [newEvent, ...state.events].slice(0, 200), // Retain latest 200 events
    };

    setState(updated);
    saveAppState(updated);
  };

  const clearEvents = () => {
    const updated = { ...state, events: [] };
    setState(updated);
    saveAppState(updated);
  };

  const updateAppSettings = (updates: Partial<AppSettings>) => {
    const updated = {
      ...state,
      settings: { ...state.settings, ...updates },
    };
    setState(updated);
    saveAppState(updated);
  };

  const setDomainBypass = (domain: string, minutes = state.settings.temporaryBypassMinutes || 5) => {
    const norm = normalizeDomain(domain);
    const expiry = Date.now() + minutes * 60 * 1000;
    const bypasses = { ...state.settings.bypasses, [norm]: expiry };
    const updated = {
      ...state,
      settings: { ...state.settings, bypasses },
    };
    setState(updated);
    saveAppState(updated);
  };

  const isDomainBypassed = (domain: string): boolean => {
    const norm = normalizeDomain(domain);
    const expiry = state.settings.bypasses[norm];
    if (!expiry) return false;
    return expiry > Date.now();
  };

  const checkRuleForDomain = (hostname: string) => {
    const norm = normalizeDomain(hostname);
    if (isDomainBypassed(norm)) {
      return { isBlocked: false, isBypassed: true };
    }

    const matchedRule = state.rules.find((r) => r.enabled && isDomainMatched(norm, r.domain));
    if (!matchedRule) {
      return { isBlocked: false };
    }

    return { isBlocked: true, rule: matchedRule };
  };

  const resetAll = () => {
    const fresh = resetFactoryDefaults();
    setState(fresh);
  };

  const exportData = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.rules)) {
        setState(parsed);
        saveAppState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addRule,
        updateRule,
        deleteRule,
        toggleRule,
        updateAlarmSettings,
        addGoal,
        updateGoal,
        deleteGoal,
        updateAccountability,
        simulateNotification,
        logInterventionEvent,
        clearEvents,
        updateAppSettings,
        setDomainBypass,
        isDomainBypassed,
        checkRuleForDomain,
        resetAll,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
