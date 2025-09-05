import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Number formatting utilities
export function formatDecimal(value: number, places: number): string {
  return value.toFixed(places);
}

export function formatCurrency(value: number): string {
  return formatDecimal(value, 2);
}

// Random number generation utilities
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomSample<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate random numbers with constraints
export function generateRandomNumber(
  max: number,
  decimalPlaces: number = 0,
  min: number = 0,
  step: number = 1
): number {
  if (decimalPlaces === 0) {
    const steps = Math.floor((max - min) / step);
    return min + randomInt(0, steps) * step;
  } else {
    let value = randomFloat(min, max, decimalPlaces);
    // Round to nearest step
    if (step !== 1) {
      value = Math.round(value / step) * step;
    }
    return parseFloat(value.toFixed(decimalPlaces));
  }
}

// Generate array of random numbers
export function generateRandomNumbers(
  count: number,
  max: number,
  decimalPlaces: number = 0,
  min: number = 0,
  step: number = 1
): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(generateRandomNumber(max, decimalPlaces, min, step));
  }
  return numbers;
}

// Check if carrying is required for addition
export function requiresCarrying(operands: number[]): boolean {
  let carry = 0;
  const maxLength = Math.max(...operands.map(n => n.toString().length));
  
  for (let position = 0; position < maxLength; position++) {
    let sum = carry;
    for (const operand of operands) {
      const digit = Math.floor((operand / Math.pow(10, position)) % 10);
      sum += digit;
    }
    if (sum >= 10) {
      return true;
    }
    carry = Math.floor(sum / 10);
  }
  return false;
}

// Check if borrowing is required for subtraction
export function requiresBorrowing(minuend: number, subtrahend: number): boolean {
  const minStr = minuend.toString().replace('.', '');
  const subStr = subtrahend.toString().replace('.', '');
  const maxLength = Math.max(minStr.length, subStr.length);
  
  for (let i = 0; i < maxLength; i++) {
    const minDigit = parseInt(minStr[minStr.length - 1 - i] || '0');
    const subDigit = parseInt(subStr[subStr.length - 1 - i] || '0');
    if (minDigit < subDigit) {
      return true;
    }
  }
  return false;
}

// Ensure unique values in array
export function ensureUnique(generator: () => number, count: number, maxAttempts: number = 100): number[] {
  const values = new Set<number>();
  let attempts = 0;
  
  while (values.size < count && attempts < maxAttempts) {
    values.add(generator());
    attempts++;
  }
  
  if (values.size < count) {
    throw new Error(`Could not generate ${count} unique values`);
  }
  
  return Array.from(values);
}

// Name generation for story contexts
export const PERSON_NAMES = [
  "Sarah", "Tom", "Emma", "James", "Sophie", "Oliver", "Lucy", "Harry",
  "Grace", "Jack", "Lily", "William", "Emily", "Daniel", "Mia", "Alex",
  "Chloe", "Ben", "Katie", "Sam", "Amy", "Luke", "Hannah", "Ryan"
];

export function getRandomName(): string {
  return randomChoice(PERSON_NAMES);
}

// Common item descriptors for different contexts
export const MONEY_ITEMS = [
  "book", "pen", "pencil", "ruler", "notebook", "eraser", "comic", "magazine",
  "toy", "game", "puzzle", "sticker", "badge", "poster", "card", "sweet",
  "chocolate", "apple", "banana", "sandwich", "drink", "cake", "biscuit"
];

export const LENGTH_ITEMS = [
  "rope", "ribbon", "string", "wire", "fabric", "paper", "wood", "metal",
  "road", "path", "track", "fence", "wall", "garden", "field", "playground"
];

export const WEIGHT_ITEMS = [
  "flour", "sugar", "rice", "pasta", "potatoes", "apples", "oranges", "bananas",
  "cheese", "butter", "meat", "fish", "vegetables", "fruit", "sand", "stones"
];

// Validation utilities
export function validateDifficultyParams(params: any, model_id: string): boolean {
  if (!params || typeof params !== 'object') {
    return false;
  }
  
  // Basic validation - could be extended per model
  switch (model_id) {
    case 'ADDITION':
      return params.operand_count >= 2 && params.operand_count <= 10 &&
             params.max_value > 0 && params.decimal_places >= 0 && params.decimal_places <= 3;
    case 'SUBTRACTION':
      return params.minuend_max > 0 && params.subtrahend_max > 0 &&
             params.decimal_places >= 0 && params.decimal_places <= 3;
    case 'MULTIPLICATION':
      return params.multiplicand_max > 0 && params.multiplier_max > 0 &&
             params.decimal_places >= 0 && params.decimal_places <= 3;
    case 'DIVISION':
      return params.dividend_max > 0 && params.divisor_max > 0 &&
             params.decimal_places >= 0 && params.decimal_places <= 3;
    default:
      return true;
  }
}

// Question uniqueness check
export function isQuestionUnique(
  newQuestion: string,
  existingQuestions: string[],
  threshold: number = 0.9
): boolean {
  // Simple check - could be enhanced with better similarity algorithms
  return !existingQuestions.includes(newQuestion);
}

// Performance timing utility
export function measureTime<T>(fn: () => T): [T, number] {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return [result, end - start];
}

// Statistics calculation
export function calculateStatistics(values: number[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / values.length,
    median: sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
  };
}