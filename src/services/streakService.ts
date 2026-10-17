import { StreakState } from '../types';

export interface Milestone {
  days: number;
  title: string;
  badge: string;
  description: string;
  unlocked: boolean;
}

export function getTodayDateString(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

export function getYesterdayDateString(d: Date = new Date()): string {
  const yesterday = new Date(d);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export const STREAK_MILESTONES = [
  { days: 3, title: 'Initial Spark', badge: '🌱', description: '3 days of mindful pause awareness' },
  { days: 7, title: 'One Week Momentum', badge: '🔥', description: '7 consecutive days pausing before impulse' },
  { days: 14, title: 'Iron Focus', badge: '⚡', description: '14 days of sustained intention' },
  { days: 30, title: 'Mindful Architect', badge: '🛡️', description: '30 days rewriting your digital habits' },
  { days: 60, title: 'Zen Clarity', badge: '🧘', description: '60 days of calm, conscious browsing' },
  { days: 100, title: 'Urge Zero Legend', badge: '⭐', description: '100 days of purposeful space and freedom' },
];

export function getMilestones(currentStreak: number): Milestone[] {
  return STREAK_MILESTONES.map((m) => ({
    ...m,
    unlocked: currentStreak >= m.days,
  }));
}

/**
 * Evaluates and updates the streak based on date transitions and activity.
 */
export function updateStreakOnActivity(state: StreakState, activityDateStr = getTodayDateString()): StreakState {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const history = [...(state.history || [])];
  let todayEntry = history.find((h) => h.date === activityDateStr);

  if (!todayEntry) {
    todayEntry = {
      date: activityDateStr,
      pausesCount: 1,
      breachesPrevented: 1,
      success: true,
    };
    history.push(todayEntry);
  } else {
    todayEntry.pausesCount += 1;
    todayEntry.breachesPrevented += 1;
    todayEntry.success = true;
  }

  let newStreak = state.currentStreak;
  let newFreezes = state.freezesRemaining;

  if (state.lastActiveDate === today) {
    // Already active today; streak maintained
    newStreak = Math.max(1, state.currentStreak);
  } else if (state.lastActiveDate === yesterday) {
    // Continuous consecutive day
    newStreak = state.currentStreak + 1;
  } else if (!state.lastActiveDate) {
    // First active day ever
    newStreak = 1;
  } else {
    // Gap occurred: calculate how many days missed
    const lastDate = new Date(state.lastActiveDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      newStreak = state.currentStreak + 1;
    } else if (diffDays === 2 && newFreezes > 0) {
      // 1 missed day protected by streak freeze shield
      newFreezes -= 1;
      newStreak = state.currentStreak + 1;
    } else {
      // Missed without shield: reset to 1
      newStreak = 1;
    }
  }

  const longestStreak = Math.max(state.longestStreak || 0, newStreak);

  return {
    currentStreak: newStreak,
    longestStreak,
    lastActiveDate: today,
    freezesRemaining: newFreezes,
    todayPaused: true,
    history: history.slice(-90), // Keep last 90 days
  };
}

/**
 * Check if streak needs reset when user opens app on a new day without activity yet.
 */
export function checkStreakLiveness(state: StreakState): StreakState {
  if (!state.lastActiveDate) return state;

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (state.lastActiveDate === today) {
    return { ...state, todayPaused: true };
  }

  if (state.lastActiveDate === yesterday) {
    return { ...state, todayPaused: false };
  }

  // Calculate missed days
  const lastDate = new Date(state.lastActiveDate);
  const currentDate = new Date(today);
  const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

  if (diffDays > 2) {
    // Lost streak if > 1 day gap
    return {
      ...state,
      currentStreak: 0,
      todayPaused: false,
    };
  }

  return { ...state, todayPaused: false };
}
