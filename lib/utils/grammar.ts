/**
 * Grammar utilities for natural language generation
 * Provides functions for correct article usage, pluralization, etc.
 */

/**
 * Get the correct indefinite article (a/an) for a given word
 * @param word - The word to check
 * @returns "a" or "an" based on the first sound
 */
export function getArticle(word: string): string {
  if (!word || word.length === 0) {
    return 'a';
  }

  const firstLetter = word.charAt(0).toLowerCase();

  // List of vowels that typically use "an"
  const vowels = ['a', 'e', 'i', 'o', 'u'];

  // Special cases that start with vowel but use "a" (based on pronunciation)
  const useA = [
    'european', 'eucalyptus', 'ewe', 'one', 'once', 'uni', 'user', 'usual',
    'utensil', 'utility', 'unanimous'
  ];

  // Special cases that start with consonant but use "an" (based on pronunciation)
  const useAn = [
    'hour', 'honest', 'honour', 'honor', 'heir', 'heirloom'
  ];

  const lowerWord = word.toLowerCase();

  // Check special cases first
  if (useA.some(exception => lowerWord.startsWith(exception))) {
    return 'a';
  }

  if (useAn.some(exception => lowerWord.startsWith(exception))) {
    return 'an';
  }

  // Default rule: use "an" before vowel sounds
  return vowels.includes(firstLetter) ? 'an' : 'a';
}

/**
 * Add the correct article to a noun phrase
 * @param word - The word to add article to
 * @returns The word with correct article (e.g., "an apple", "a banana")
 */
export function withArticle(word: string): string {
  if (!word) {
    return '';
  }

  const article = getArticle(word);
  return `${article} ${word}`;
}

/**
 * Pluralize a word (basic English pluralization rules)
 * @param word - The word to pluralize
 * @param count - The count (will return singular if count is 1)
 * @returns Pluralized word
 */
export function pluralize(word: string, count: number = 2): string {
  if (count === 1) {
    return word;
  }

  const lowerWord = word.toLowerCase();

  // Irregular plurals
  const irregulars: Record<string, string> = {
    'child': 'children',
    'person': 'people',
    'man': 'men',
    'woman': 'women',
    'tooth': 'teeth',
    'foot': 'feet',
    'mouse': 'mice',
    'goose': 'geese',
    'penny': 'pence'
  };

  if (irregulars[lowerWord]) {
    return irregulars[lowerWord];
  }

  // Words ending in s, x, z, ch, sh: add -es
  if (lowerWord.endsWith('s') || lowerWord.endsWith('x') || lowerWord.endsWith('z') ||
      lowerWord.endsWith('ch') || lowerWord.endsWith('sh')) {
    return word + 'es';
  }

  // Words ending in consonant + y: change y to ies
  if (lowerWord.endsWith('y') && lowerWord.length > 1) {
    const beforeY = lowerWord.charAt(lowerWord.length - 2);
    if (!['a', 'e', 'i', 'o', 'u'].includes(beforeY)) {
      return word.slice(0, -1) + 'ies';
    }
  }

  // Words ending in f or fe: change to ves
  if (lowerWord.endsWith('f')) {
    return word.slice(0, -1) + 'ves';
  }
  if (lowerWord.endsWith('fe')) {
    return word.slice(0, -2) + 'ves';
  }

  // Words ending in consonant + o: add -es
  if (lowerWord.endsWith('o') && lowerWord.length > 1) {
    const beforeO = lowerWord.charAt(lowerWord.length - 2);
    if (!['a', 'e', 'i', 'o', 'u'].includes(beforeO)) {
      return word + 'es';
    }
  }

  // Default: add -s
  return word + 's';
}