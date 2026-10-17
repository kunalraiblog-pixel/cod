import { describe, it, expect } from 'vitest';
import { 
  updateStreakOnActivity, 
  getMilestones, 
  getTodayDateString, 
  getYesterdayDateString 
} from '../src/services/streakService';
import { StreakState } from '../src/types';

describe('Streak System', () => {
  const initialStreakState: StreakState = {
    currentStreak: 3,
    longestStreak: 5,
    lastActiveDate: getYesterdayDateString(),
    freezesRemaining: 2,
    todayPaused: false,
    history: [],
  };

  it('increments streak when active on consecutive days', () => {
    const updated = updateStreakOnActivity(initialStreakState);
    expect(updated.currentStreak).toBe(4);
    expect(updated.todayPaused).toBe(true);
    expect(updated.lastActiveDate).toBe(getTodayDateString());
  });

  it('maintains streak on multiple activities on the same day', () => {
    const day1 = updateStreakOnActivity(initialStreakState);
    expect(day1.currentStreak).toBe(4);

    const secondActivity = updateStreakOnActivity(day1);
    expect(secondActivity.currentStreak).toBe(4); // Stays at 4, doesn't over-increment
  });

  it('consumes a freeze shield when a day is missed', () => {
    // 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const stateWithMissedDay: StreakState = {
      currentStreak: 10,
      longestStreak: 12,
      lastActiveDate: twoDaysAgo.toISOString().split('T')[0],
      freezesRemaining: 2,
      todayPaused: false,
      history: [],
    };

    const protectedState = updateStreakOnActivity(stateWithMissedDay);
    expect(protectedState.currentStreak).toBe(11);
    expect(protectedState.freezesRemaining).toBe(1); // 1 shield consumed
  });

  it('unlocks milestones accurately based on current streak count', () => {
    const milestones3 = getMilestones(3);
    expect(milestones3.find((m) => m.days === 3)?.unlocked).toBe(true);
    expect(milestones3.find((m) => m.days === 7)?.unlocked).toBe(false);

    const milestones30 = getMilestones(30);
    expect(milestones30.find((m) => m.days === 7)?.unlocked).toBe(true);
    expect(milestones30.find((m) => m.days === 14)?.unlocked).toBe(true);
    expect(milestones30.find((m) => m.days === 30)?.unlocked).toBe(true);
    expect(milestones30.find((m) => m.days === 60)?.unlocked).toBe(false);
  });
});
