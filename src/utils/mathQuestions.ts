import { MathQuestion, AlarmDifficulty } from '../types';

/**
 * Generate a random integer between min and max (inclusive).
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates an addition question based on difficulty.
 */
function generateAddition(difficulty: AlarmDifficulty): MathQuestion {
  let a = 0;
  let b = 0;

  switch (difficulty) {
    case 'easy':
      a = getRandomInt(4, 19);
      b = getRandomInt(3, 19);
      break;
    case 'normal':
      a = getRandomInt(14, 59);
      b = getRandomInt(12, 49);
      break;
    case 'hard':
      a = getRandomInt(45, 145);
      b = getRandomInt(38, 125);
      break;
  }

  const answer = a + b;
  return {
    id: `add_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    operand1: a,
    operand2: b,
    operator: '+',
    answer,
    promptText: `${a} + ${b} = ?`,
  };
}

/**
 * Generates a subtraction question ensuring non-negative result.
 */
function generateSubtraction(difficulty: AlarmDifficulty): MathQuestion {
  let a = 0;
  let b = 0;

  switch (difficulty) {
    case 'easy':
      a = getRandomInt(10, 25);
      b = getRandomInt(2, a);
      break;
    case 'normal':
      a = getRandomInt(30, 89);
      b = getRandomInt(11, a - 5);
      break;
    case 'hard':
      a = getRandomInt(85, 230);
      b = getRandomInt(29, a - 12);
      break;
  }

  const answer = a - b;
  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    operand1: a,
    operand2: b,
    operator: '-',
    answer,
    promptText: `${a} − ${b} = ?`,
  };
}

/**
 * Generates a multiplication question.
 */
function generateMultiplication(difficulty: AlarmDifficulty): MathQuestion {
  let a = 0;
  let b = 0;

  switch (difficulty) {
    case 'easy':
      a = getRandomInt(2, 6);
      b = getRandomInt(2, 7);
      break;
    case 'normal':
      a = getRandomInt(6, 12);
      b = getRandomInt(4, 12);
      break;
    case 'hard':
      a = getRandomInt(11, 24);
      b = getRandomInt(6, 16);
      break;
  }

  const answer = a * b;
  return {
    id: `mul_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    operand1: a,
    operand2: b,
    operator: '×',
    answer,
    promptText: `${a} × ${b} = ?`,
  };
}

/**
 * Generates a division question ensuring exact integer quotient.
 */
function generateDivision(difficulty: AlarmDifficulty): MathQuestion {
  let divisor = 0;
  let quotient = 0;

  switch (difficulty) {
    case 'easy':
      divisor = getRandomInt(2, 5);
      quotient = getRandomInt(2, 6);
      break;
    case 'normal':
      divisor = getRandomInt(4, 12);
      quotient = getRandomInt(3, 12);
      break;
    case 'hard':
      divisor = getRandomInt(7, 18);
      quotient = getRandomInt(8, 25);
      break;
  }

  const dividend = divisor * quotient;
  return {
    id: `div_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    operand1: dividend,
    operand2: divisor,
    operator: '÷',
    answer: quotient,
    promptText: `${dividend} ÷ ${divisor} = ?`,
  };
}

/**
 * Generate a sequence of 5 distinct math questions for a Focus Breach Alarm challenge.
 */
export function generateFiveQuestions(difficulty: AlarmDifficulty = 'normal'): MathQuestion[] {
  // Balanced mix across operations:
  // Q1: Addition
  // Q2: Subtraction
  // Q3: Multiplication
  // Q4: Division
  // Q5: Random operator from +, -, ×, ÷
  const ops: Array<() => MathQuestion> = [
    () => generateAddition(difficulty),
    () => generateSubtraction(difficulty),
    () => generateMultiplication(difficulty),
    () => generateDivision(difficulty),
    () => {
      const extra = getRandomInt(0, 3);
      if (extra === 0) return generateAddition(difficulty);
      if (extra === 1) return generateSubtraction(difficulty);
      if (extra === 2) return generateMultiplication(difficulty);
      return generateDivision(difficulty);
    },
  ];

  return ops.map((fn) => fn());
}
