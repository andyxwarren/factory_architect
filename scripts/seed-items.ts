/**
 * Seed Items
 *
 * Migrates items with realistic UK pricing from scenario.service.ts to Supabase
 *
 * Source: lib/services/scenario.service.ts:1076-1107
 * Target: items table
 */

import { SupabaseClient } from '@supabase/supabase-js';

const ITEMS = [
  // Food items
  { name: 'apple', category: 'food', pricing: { min: 0.20, max: 0.50, typical: 0.35, unit: 'each' }, themes: ['SHOPPING', 'COOKING'] },
  { name: 'banana', category: 'food', pricing: { min: 0.15, max: 0.40, typical: 0.25, unit: 'each' }, themes: ['SHOPPING', 'COOKING'] },
  { name: 'orange', category: 'food', pricing: { min: 0.25, max: 0.60, typical: 0.40, unit: 'each' }, themes: ['SHOPPING', 'COOKING'] },
  { name: 'sandwich', category: 'food', pricing: { min: 2.00, max: 5.00, typical: 3.50, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'chocolate bar', category: 'food', pricing: { min: 0.50, max: 1.50, typical: 1.00, unit: 'each' }, themes: ['SHOPPING', 'POCKET_MONEY'] },
  { name: 'crisps', category: 'food', pricing: { min: 0.40, max: 1.20, typical: 0.75, unit: 'bag' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'drink', category: 'food', pricing: { min: 0.50, max: 2.00, typical: 1.20, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'cake', category: 'food', pricing: { min: 1.50, max: 4.00, typical: 2.50, unit: 'each' }, themes: ['SHOPPING', 'COOKING'] },

  // Stationery
  { name: 'pen', category: 'stationery', pricing: { min: 0.50, max: 2.00, typical: 1.00, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'pencil', category: 'stationery', pricing: { min: 0.30, max: 1.00, typical: 0.50, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'ruler', category: 'stationery', pricing: { min: 0.75, max: 2.50, typical: 1.50, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'rubber', category: 'stationery', pricing: { min: 0.40, max: 1.20, typical: 0.75, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'notebook', category: 'stationery', pricing: { min: 1.00, max: 3.50, typical: 2.00, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'folder', category: 'stationery', pricing: { min: 0.75, max: 2.50, typical: 1.50, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'calculator', category: 'stationery', pricing: { min: 3.00, max: 15.00, typical: 8.00, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },

  // Sports equipment
  { name: 'football', category: 'sports', pricing: { min: 5.00, max: 30.00, typical: 15.00, unit: 'each' }, themes: ['SPORTS', 'SHOPPING'] },
  { name: 'tennis ball', category: 'sports', pricing: { min: 1.00, max: 4.00, typical: 2.50, unit: 'each' }, themes: ['SPORTS', 'SHOPPING'] },
  { name: 'skipping rope', category: 'sports', pricing: { min: 3.00, max: 10.00, typical: 6.00, unit: 'each' }, themes: ['SPORTS', 'SHOPPING'] },
  { name: 'swimming goggles', category: 'sports', pricing: { min: 5.00, max: 20.00, typical: 12.00, unit: 'each' }, themes: ['SPORTS', 'SHOPPING'] },
  { name: 'water bottle', category: 'sports', pricing: { min: 2.00, max: 10.00, typical: 5.00, unit: 'each' }, themes: ['SPORTS', 'SCHOOL', 'SHOPPING'] },

  // Toys & Hobbies
  { name: 'toy car', category: 'toy', pricing: { min: 2.00, max: 15.00, typical: 6.00, unit: 'each' }, themes: ['SHOPPING', 'POCKET_MONEY'] },
  { name: 'puzzle', category: 'toy', pricing: { min: 5.00, max: 20.00, typical: 10.00, unit: 'each' }, themes: ['SHOPPING', 'POCKET_MONEY'] },
  { name: 'colouring book', category: 'toy', pricing: { min: 2.00, max: 8.00, typical: 4.50, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'sticker pack', category: 'toy', pricing: { min: 1.00, max: 4.00, typical: 2.00, unit: 'pack' }, themes: ['SHOPPING', 'POCKET_MONEY'] },

  // Books
  { name: 'book', category: 'book', pricing: { min: 3.00, max: 15.00, typical: 7.00, unit: 'each' }, themes: ['SHOPPING', 'SCHOOL'] },
  { name: 'magazine', category: 'book', pricing: { min: 2.00, max: 6.00, typical: 3.50, unit: 'each' }, themes: ['SHOPPING', 'POCKET_MONEY'] },
  { name: 'comic', category: 'book', pricing: { min: 1.50, max: 5.00, typical: 3.00, unit: 'each' }, themes: ['SHOPPING', 'POCKET_MONEY'] },

  // Clothes (basic items)
  { name: 'socks', category: 'clothing', pricing: { min: 2.00, max: 8.00, typical: 4.00, unit: 'pair' }, themes: ['SHOPPING'] },
  { name: 't-shirt', category: 'clothing', pricing: { min: 5.00, max: 20.00, typical: 10.00, unit: 'each' }, themes: ['SHOPPING'] },
  { name: 'hat', category: 'clothing', pricing: { min: 4.00, max: 15.00, typical: 8.00, unit: 'each' }, themes: ['SHOPPING'] },
  { name: 'scarf', category: 'clothing', pricing: { min: 5.00, max: 20.00, typical: 12.00, unit: 'each' }, themes: ['SHOPPING'] },

  // Cooking/baking ingredients
  { name: 'flour', category: 'ingredient', pricing: { min: 0.50, max: 2.00, typical: 1.00, unit: 'kg' }, themes: ['COOKING', 'SHOPPING'] },
  { name: 'sugar', category: 'ingredient', pricing: { min: 0.60, max: 2.50, typical: 1.20, unit: 'kg' }, themes: ['COOKING', 'SHOPPING'] },
  { name: 'eggs', category: 'ingredient', pricing: { min: 1.50, max: 4.00, typical: 2.50, unit: 'dozen' }, themes: ['COOKING', 'SHOPPING'] },
  { name: 'butter', category: 'ingredient', pricing: { min: 1.00, max: 3.50, typical: 2.00, unit: 'pack' }, themes: ['COOKING', 'SHOPPING'] },
  { name: 'milk', category: 'ingredient', pricing: { min: 0.80, max: 1.50, typical: 1.10, unit: 'litre' }, themes: ['COOKING', 'SHOPPING'] },

  // Snacks
  { name: 'biscuits', category: 'food', pricing: { min: 0.80, max: 3.00, typical: 1.50, unit: 'pack' }, themes: ['SHOPPING', 'POCKET_MONEY'] },
  { name: 'sweets', category: 'food', pricing: { min: 0.50, max: 2.50, typical: 1.20, unit: 'bag' }, themes: ['SHOPPING', 'POCKET_MONEY'] },
  { name: 'ice cream', category: 'food', pricing: { min: 1.00, max: 4.00, typical: 2.00, unit: 'each' }, themes: ['SHOPPING', 'POCKET_MONEY'] },

  // Household
  { name: 'plant pot', category: 'household', pricing: { min: 2.00, max: 10.00, typical: 5.00, unit: 'each' }, themes: ['SHOPPING'] },
  { name: 'mug', category: 'household', pricing: { min: 3.00, max: 12.00, typical: 6.00, unit: 'each' }, themes: ['SHOPPING'] },
  { name: 'plate', category: 'household', pricing: { min: 2.00, max: 10.00, typical: 5.00, unit: 'each' }, themes: ['SHOPPING'] }
];

/**
 * Seed items table
 */
export async function seedItems(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('items')
    .upsert(ITEMS, {
      onConflict: 'name',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('  ❌ Failed to seed items:', error.message);
    return 0;
  }

  return ITEMS.length;
}
