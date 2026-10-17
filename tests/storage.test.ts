import { describe, it, expect } from 'vitest';
import { 
  INITIAL_STATE, 
  INITIAL_RULES, 
  INITIAL_ALARM_SETTINGS 
} from '../src/services/storageService';

describe('Storage and State Consistency', () => {
  it('supplies comprehensive default state with required rules and alarm settings', () => {
    expect(INITIAL_STATE.rules).toBeDefined();
    expect(INITIAL_STATE.rules.length).toBeGreaterThan(0);
    expect(INITIAL_STATE.alarmSettings.masterEnabled).toBe(true);
    expect(INITIAL_STATE.alarmSettings.volume).toBeGreaterThan(0);
    expect(INITIAL_ALARM_SETTINGS.masterEnabled).toBe(true);
    expect(INITIAL_STATE.settings.defaultSafeUrl).toBeDefined();
  });

  it('guarantees normalized domains in initial rules', () => {
    for (const rule of INITIAL_RULES) {
      expect(rule.domain).toBe(rule.domain.toLowerCase().trim());
      expect(rule.domain).not.toContain('http');
      expect(rule.domain).not.toContain('/');
    }
  });

  it('serializes and deserializes application state cleanly without data loss', () => {
    const serialized = JSON.stringify(INITIAL_STATE);
    const parsed = JSON.parse(serialized);

    expect(parsed.rules.length).toBe(INITIAL_STATE.rules.length);
    expect(parsed.alarmSettings.difficulty).toBe(INITIAL_STATE.alarmSettings.difficulty);
    expect(parsed.goals[0].title).toBe(INITIAL_STATE.goals[0].title);
  });
});
