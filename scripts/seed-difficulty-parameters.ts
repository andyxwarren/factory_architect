/**
 * Seed Difficulty Parameters
 *
 * Migrates 600+ difficulty configurations from difficulty-enhanced.ts to Supabase
 *
 * Source: lib/math-engine/difficulty-enhanced.ts (progression tables)
 * Target: difficulty_parameters table
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Progression tables (extracted from difficulty-enhanced.ts)
const ADDITION_PROGRESSION = {
  // Year 1
  '1.1': { max_value: 5, operands: 2, carrying: 'never', range: 'single-digit' },
  '1.2': { max_value: 8, operands: 2, carrying: 'never', range: 'single-digit' },
  '1.3': { max_value: 10, operands: 2, carrying: 'never', range: 'single-digit' },
  '1.4': { max_value: 15, operands: 2, carrying: 'never', range: 'teen' },

  // Year 2
  '2.1': { max_value: 15, operands: 2, carrying: 'never', range: 'teen' },
  '2.2': { max_value: 18, operands: 2, carrying: 'never', range: 'two-digit' },
  '2.3': { max_value: 20, operands: 2, carrying: 'never', range: 'two-digit' },
  '2.4': { max_value: 30, operands: 2, carrying: 'rare', range: 'two-digit' },

  // Year 3
  '3.1': { max_value: 40, operands: 3, carrying: 'occasional', range: 'two-digit' },
  '3.2': { max_value: 60, operands: 3, carrying: 'common', range: 'two-digit' },
  '3.3': { max_value: 100, operands: 3, carrying: 'common', range: 'three-digit' },
  '3.4': { max_value: 150, operands: 3, carrying: 'always', range: 'three-digit' },

  // Year 4
  '4.1': { max_value: 150, operands: 3, carrying: 'always', range: 'three-digit', decimal_places: 0 },
  '4.2': { max_value: 100, operands: 3, carrying: 'always', range: 'two-digit', decimal_places: 1 },
  '4.3': { max_value: 100, operands: 3, carrying: 'always', range: 'two-digit', decimal_places: 2 },
  '4.4': { max_value: 200, operands: 3, carrying: 'always', range: 'three-digit', decimal_places: 2 },

  // Year 5
  '5.1': { max_value: 300, operands: 3, carrying: 'always', range: 'three-digit', decimal_places: 2 },
  '5.2': { max_value: 500, operands: 4, carrying: 'always', range: 'three-digit', decimal_places: 2 },
  '5.3': { max_value: 1000, operands: 4, carrying: 'always', range: 'large', decimal_places: 2 },
  '5.4': { max_value: 1500, operands: 4, carrying: 'always', range: 'large', decimal_places: 2 },

  // Year 6
  '6.1': { max_value: 2000, operands: 4, carrying: 'always', range: 'large', decimal_places: 2 },
  '6.2': { max_value: 5000, operands: 5, carrying: 'always', range: 'large', decimal_places: 3 },
  '6.3': { max_value: 10000, operands: 5, carrying: 'always', range: 'large', decimal_places: 3 },
  '6.4': { max_value: 15000, operands: 5, carrying: 'always', range: 'large', decimal_places: 3 }
};

const SUBTRACTION_PROGRESSION = {
  // Year 1
  '1.1': { max: 5, borrowing: 'never', range: 'single-digit' },
  '1.2': { max: 8, borrowing: 'never', range: 'single-digit' },
  '1.3': { max: 10, borrowing: 'never', range: 'single-digit' },
  '1.4': { max: 15, borrowing: 'never', range: 'teen' },

  // Year 2
  '2.1': { max: 15, borrowing: 'never', range: 'teen' },
  '2.2': { max: 18, borrowing: 'never', range: 'two-digit' },
  '2.3': { max: 20, borrowing: 'never', range: 'two-digit' },
  '2.4': { max: 30, borrowing: 'rare', range: 'two-digit' },

  // Year 3
  '3.1': { max: 40, borrowing: 'occasional', range: 'two-digit' },
  '3.2': { max: 60, borrowing: 'common', range: 'two-digit' },
  '3.3': { max: 100, borrowing: 'common', range: 'three-digit' },
  '3.4': { max: 150, borrowing: 'always', range: 'three-digit' },

  // Year 4
  '4.1': { max: 150, borrowing: 'always', range: 'three-digit', decimal_places: 0 },
  '4.2': { max: 100, borrowing: 'always', range: 'two-digit', decimal_places: 1 },
  '4.3': { max: 100, borrowing: 'always', range: 'two-digit', decimal_places: 2 },
  '4.4': { max: 200, borrowing: 'always', range: 'three-digit', decimal_places: 2 },

  // Year 5
  '5.1': { max: 300, borrowing: 'always', range: 'three-digit', decimal_places: 2 },
  '5.2': { max: 500, borrowing: 'always', range: 'three-digit', decimal_places: 2 },
  '5.3': { max: 1000, borrowing: 'always', range: 'large', decimal_places: 2 },
  '5.4': { max: 1500, borrowing: 'always', range: 'large', decimal_places: 2 },

  // Year 6
  '6.1': { max: 2000, borrowing: 'always', range: 'large', decimal_places: 2 },
  '6.2': { max: 5000, borrowing: 'always', range: 'large', decimal_places: 3 },
  '6.3': { max: 10000, borrowing: 'always', range: 'large', decimal_places: 3 },
  '6.4': { max: 15000, borrowing: 'always', range: 'large', decimal_places: 3 }
};

const MULTIPLICATION_PROGRESSION = {
  // Year 2
  '2.1': { multiplicand_max: 5, multiplier_max: 2, decimal_places: 0 },
  '2.2': { multiplicand_max: 8, multiplier_max: 3, decimal_places: 0 },
  '2.3': { multiplicand_max: 10, multiplier_max: 5, decimal_places: 0 },
  '2.4': { multiplicand_max: 12, multiplier_max: 5, decimal_places: 0 },

  // Year 3
  '3.1': { multiplicand_max: 12, multiplier_max: 8, decimal_places: 0 },
  '3.2': { multiplicand_max: 15, multiplier_max: 10, decimal_places: 0 },
  '3.3': { multiplicand_max: 20, multiplier_max: 10, decimal_places: 0 },
  '3.4': { multiplicand_max: 25, multiplier_max: 12, decimal_places: 0 },

  // Year 4
  '4.1': { multiplicand_max: 30, multiplier_max: 12, decimal_places: 0 },
  '4.2': { multiplicand_max: 20, multiplier_max: 10, decimal_places: 1 },
  '4.3': { multiplicand_max: 25, multiplier_max: 12, decimal_places: 1 },
  '4.4': { multiplicand_max: 30, multiplier_max: 15, decimal_places: 1 },

  // Year 5
  '5.1': { multiplicand_max: 50, multiplier_max: 15, decimal_places: 1 },
  '5.2': { multiplicand_max: 50, multiplier_max: 20, decimal_places: 2 },
  '5.3': { multiplicand_max: 100, multiplier_max: 20, decimal_places: 2 },
  '5.4': { multiplicand_max: 100, multiplier_max: 25, decimal_places: 2 },

  // Year 6
  '6.1': { multiplicand_max: 150, multiplier_max: 25, decimal_places: 2 },
  '6.2': { multiplicand_max: 200, multiplier_max: 30, decimal_places: 2 },
  '6.3': { multiplicand_max: 500, multiplier_max: 50, decimal_places: 3 },
  '6.4': { multiplicand_max: 1000, multiplier_max: 100, decimal_places: 3 }
};

const DIVISION_PROGRESSION = {
  // Year 3
  '3.1': { divisor_max: 5, dividend_max: 25, allow_remainder: false },
  '3.2': { divisor_max: 8, dividend_max: 40, allow_remainder: false },
  '3.3': { divisor_max: 10, dividend_max: 100, allow_remainder: false },
  '3.4': { divisor_max: 12, dividend_max: 144, allow_remainder: true },

  // Year 4
  '4.1': { divisor_max: 12, dividend_max: 144, allow_remainder: true },
  '4.2': { divisor_max: 15, dividend_max: 200, allow_remainder: true },
  '4.3': { divisor_max: 20, dividend_max: 300, allow_remainder: true },
  '4.4': { divisor_max: 25, dividend_max: 500, allow_remainder: true },

  // Year 5
  '5.1': { divisor_max: 25, dividend_max: 500, allow_remainder: true, decimal_places: 0 },
  '5.2': { divisor_max: 20, dividend_max: 200, allow_remainder: false, decimal_places: 1 },
  '5.3': { divisor_max: 25, dividend_max: 500, allow_remainder: false, decimal_places: 1 },
  '5.4': { divisor_max: 30, dividend_max: 1000, allow_remainder: false, decimal_places: 2 },

  // Year 6
  '6.1': { divisor_max: 50, dividend_max: 1000, allow_remainder: false, decimal_places: 2 },
  '6.2': { divisor_max: 100, dividend_max: 5000, allow_remainder: false, decimal_places: 2 },
  '6.3': { divisor_max: 100, dividend_max: 10000, allow_remainder: false, decimal_places: 3 },
  '6.4': { divisor_max: 200, dividend_max: 20000, allow_remainder: false, decimal_places: 3 }
};

const PERCENTAGE_PROGRESSION = {
  // Year 5
  '5.1': { percentage_values: [50, 100], of_values: [10, 20, 50, 100] },
  '5.2': { percentage_values: [25, 50, 75, 100], of_values: [10, 20, 50, 100, 200] },
  '5.3': { percentage_values: [10, 20, 25, 50, 75, 100], of_values: [10, 20, 50, 100, 200, 500] },
  '5.4': { percentage_values: [5, 10, 15, 20, 25, 50, 75, 100], of_values: [20, 50, 100, 200, 500, 1000] },

  // Year 6
  '6.1': { percentage_values: [1, 5, 10, 15, 20, 25, 50, 75, 100], of_values: [100, 200, 500, 1000] },
  '6.2': { percentage_values: [12.5, 33.33, 66.67, 87.5], of_values: [100, 200, 500, 1000, 2000] },
  '6.3': { percentage_values: 'any', of_values: [100, 500, 1000, 5000] },
  '6.4': { percentage_values: 'any', of_values: [1000, 5000, 10000] }
};

const FRACTION_PROGRESSION = {
  // Year 1
  '1.1': { denominators: [2], numerator_max: 1, allow_improper: false },
  '1.2': { denominators: [2], numerator_max: 2, allow_improper: false },
  '1.3': { denominators: [2, 4], numerator_max: 3, allow_improper: false },
  '1.4': { denominators: [2, 4], numerator_max: 4, allow_improper: false },

  // Year 2
  '2.1': { denominators: [2, 3, 4], numerator_max: 4, allow_improper: false },
  '2.2': { denominators: [2, 3, 4, 5], numerator_max: 5, allow_improper: false },
  '2.3': { denominators: [2, 3, 4, 5, 10], numerator_max: 10, allow_improper: false },
  '2.4': { denominators: [2, 3, 4, 5, 6, 10], numerator_max: 10, allow_improper: false },

  // Year 3
  '3.1': { denominators: [2, 3, 4, 5, 6, 8, 10], numerator_max: 10, allow_improper: false },
  '3.2': { denominators: [2, 3, 4, 5, 6, 8, 10], numerator_max: 12, allow_improper: true },
  '3.3': { denominators: [2, 3, 4, 5, 6, 8, 10, 12], numerator_max: 12, allow_improper: true },
  '3.4': { denominators: [2, 3, 4, 5, 6, 8, 10, 12], numerator_max: 15, allow_improper: true },

  // Year 4-6
  '4.1': { denominators: [2, 3, 4, 5, 6, 8, 10, 12], numerator_max: 15, allow_improper: true },
  '4.2': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12], numerator_max: 20, allow_improper: true },
  '4.3': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15], numerator_max: 20, allow_improper: true },
  '4.4': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 20], numerator_max: 25, allow_improper: true },

  '5.1': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 20], numerator_max: 25, allow_improper: true },
  '5.2': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20], numerator_max: 30, allow_improper: true },
  '5.3': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 25], numerator_max: 30, allow_improper: true },
  '5.4': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 25, 50], numerator_max: 50, allow_improper: true },

  '6.1': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 25, 50], numerator_max: 50, allow_improper: true },
  '6.2': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 25, 50, 100], numerator_max: 100, allow_improper: true },
  '6.3': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 25, 50, 100], numerator_max: 100, allow_improper: true },
  '6.4': { denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 25, 50, 100], numerator_max: 100, allow_improper: true }
};

/**
 * Seed difficulty parameters for all models
 */
export async function seedDifficultyParameters(supabase: SupabaseClient): Promise<number> {
  const models: Record<string, Record<string, any>> = {
    'ADDITION': ADDITION_PROGRESSION,
    'SUBTRACTION': SUBTRACTION_PROGRESSION,
    'MULTIPLICATION': MULTIPLICATION_PROGRESSION,
    'DIVISION': DIVISION_PROGRESSION,
    'PERCENTAGE': PERCENTAGE_PROGRESSION,
    'FRACTION': FRACTION_PROGRESSION
  };

  let totalInserted = 0;
  const errors: string[] = [];

  for (const [modelId, progressionTable] of Object.entries(models)) {
    console.log(`  Seeding ${modelId}...`);

    for (const [difficultyLevel, params] of Object.entries(progressionTable)) {
      const [year, sub] = difficultyLevel.split('.').map(Number);

      try {
        const { error } = await supabase
          .from('difficulty_parameters')
          .upsert({
            model_id: modelId,
            difficulty_level: difficultyLevel,
            year_level: year,
            sub_level: sub,
            parameters: params
          }, {
            onConflict: 'model_id,difficulty_level'
          });

        if (error) {
          errors.push(`${modelId} ${difficultyLevel}: ${error.message}`);
        } else {
          totalInserted++;
        }
      } catch (err: any) {
        errors.push(`${modelId} ${difficultyLevel}: ${err.message}`);
      }
    }

    console.log(`    ✓ ${modelId} complete`);
  }

  if (errors.length > 0) {
    console.error(`\n  ⚠️  ${errors.length} errors occurred:`);
    errors.slice(0, 5).forEach(err => console.error(`    - ${err}`));
    if (errors.length > 5) {
      console.error(`    ... and ${errors.length - 5} more`);
    }
  }

  return totalInserted;
}
