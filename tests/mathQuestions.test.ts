import { describe, it, expect } from 'vitest';
import { generateFiveQuestions } from '../src/utils/mathQuestions';

describe('Focus Breach Alarm Mathematics Question Generator', () => {
  it('generates exactly five questions per challenge', () => {
    const questions = generateFiveQuestions('normal');
    expect(questions).toHaveLength(5);
  });

  it('guarantees valid, integer answers without fractions or decimals', () => {
    for (const diff of ['easy', 'normal', 'hard'] as const) {
      for (let run = 0; run < 10; run++) {
        const questions = generateFiveQuestions(diff);
        for (const q of questions) {
          expect(Number.isInteger(q.answer)).toBe(true);
          expect(q.promptText).toContain('= ?');

          if (q.operator === '+') {
            expect(q.operand1 + q.operand2).toBe(q.answer);
          } else if (q.operator === '-') {
            expect(q.operand1 - q.operand2).toBe(q.answer);
            expect(q.answer).toBeGreaterThanOrEqual(0); // Never negative subtraction
          } else if (q.operator === '×') {
            expect(q.operand1 * q.operand2).toBe(q.answer);
          } else if (q.operator === '÷') {
            expect(q.operand1 / q.operand2).toBe(q.answer);
            expect(q.operand1 % q.operand2).toBe(0); // Exact integer division
          }
        }
      }
    }
  });

  it('generates fresh and distinct questions on subsequent calls', () => {
    const batch1 = generateFiveQuestions('normal');
    const batch2 = generateFiveQuestions('normal');

    const prompts1 = batch1.map((q) => q.promptText).join('|');
    const prompts2 = batch2.map((q) => q.promptText).join('|');

    expect(prompts1).not.toBe(prompts2);
  });
});
