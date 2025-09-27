/**
 * Utility functions for the Factory Architect application
 */

/**
 * Simple class name utility (fallback without external dependencies)
 */
export function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Generate random number between min and max (inclusive)
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Choose a random element from an array
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Choose multiple random elements from an array without replacement
 */
export function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, array.length))
}

/**
 * Round number to specified decimal places
 */
export function roundToDecimal(num: number, decimals: number): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Format number as currency (UK pounds)
 */
export function formatCurrency(value: number): string {
  if (value >= 1) {
    return `£${value.toFixed(2)}`
  } else {
    return `${Math.round(value * 100)}p`
  }
}

/**
 * Generate a random integer within a range with optional step
 */
export function randomInt(min: number, max: number, step: number = 1): number {
  const range = Math.floor((max - min) / step) + 1
  return min + Math.floor(Math.random() * range) * step
}

/**
 * Clamp a number between min and max values
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

/**
 * Check if a number is within a range (inclusive)
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max
}

/**
 * Generate an array of numbers in a range
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = []
  for (let i = start; i <= end; i += step) {
    result.push(i)
  }
  return result
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Check if addition requires carrying
 */
export function requiresCarrying(a: number, b: number): boolean {
  const aStr = a.toString()
  const bStr = b.toString()
  const maxLen = Math.max(aStr.length, bStr.length)

  let carry = 0
  for (let i = 0; i < maxLen; i++) {
    const digitA = parseInt(aStr[aStr.length - 1 - i] || '0')
    const digitB = parseInt(bStr[bStr.length - 1 - i] || '0')
    const sum = digitA + digitB + carry

    if (sum >= 10) {
      carry = 1
      return true
    } else {
      carry = 0
    }
  }

  return false
}

/**
 * Check if subtraction requires borrowing
 */
export function requiresBorrowing(a: number, b: number): boolean {
  const aStr = a.toString()
  const bStr = b.toString()
  const maxLen = Math.max(aStr.length, bStr.length)

  for (let i = 0; i < maxLen; i++) {
    const digitA = parseInt(aStr[aStr.length - 1 - i] || '0')
    const digitB = parseInt(bStr[bStr.length - 1 - i] || '0')

    if (digitA < digitB) {
      return true
    }
  }

  return false
}

/**
 * Format decimal number with specified precision
 */
export function formatDecimal(num: number, decimals: number = 2): string {
  return num.toFixed(decimals).replace(/\.?0+$/, '')
}

/**
 * Ensure array contains unique values only
 */
export function ensureUnique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Get random name for story contexts
 */
export function getRandomName(): string {
  const names = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank', 'Grace', 'Henry',
    'Ivy', 'Jack', 'Kate', 'Liam', 'Maya', 'Noah', 'Olivia', 'Peter',
    'Quinn', 'Ruby', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xander',
    'Yara', 'Zoe'
  ]
  return randomChoice(names)
}

/**
 * Money items for story contexts
 */
export const MONEY_ITEMS = [
  { name: 'apple', price: 0.45 },
  { name: 'banana', price: 0.32 },
  { name: 'orange', price: 0.58 },
  { name: 'sandwich', price: 2.45 },
  { name: 'drink', price: 1.25 },
  { name: 'chocolate bar', price: 0.85 },
  { name: 'magazine', price: 3.50 },
  { name: 'pencil', price: 0.75 },
  { name: 'notebook', price: 1.95 },
  { name: 'sticker pack', price: 1.20 },
  { name: 'toy car', price: 4.99 },
  { name: 'book', price: 7.99 }
]