/**
 * Runtime Validation Schemas for Difficulty Parameters
 *
 * Uses Zod for runtime type validation of JSONB difficulty parameters
 * before inserting into database.
 *
 * Usage:
 *   import { validateDifficultyParams } from '@/lib/validation/difficulty-params.schema';
 *   const validated = validateDifficultyParams('ADDITION', params);
 */

import { z } from 'zod';

// Addition parameters schema
const AdditionParamsSchema = z.object({
  max_value: z.number().int().positive(),
  operands: z.number().int().min(2).max(5),
  carrying: z.enum(['never', 'rare', 'occasional', 'common', 'sometimes', 'always']).optional(),
  range: z.string().optional(),
  decimal_places: z.number().int().min(0).max(3).optional(),
});

// Subtraction parameters schema
const SubtractionParamsSchema = z.object({
  max: z.number().int().positive(),
  borrowing: z.enum(['never', 'rare', 'occasional', 'common', 'sometimes', 'always']).optional(),
  range: z.string().optional(),
  decimal_places: z.number().int().min(0).max(3).optional(),
});

// Multiplication parameters schema
const MultiplicationParamsSchema = z.object({
  multiplicand_max: z.number().int().positive(),
  multiplier_max: z.number().int().positive(),
  decimal_places: z.number().int().min(0).max(3).optional(),
});

// Division parameters schema
const DivisionParamsSchema = z.object({
  divisor_max: z.number().int().positive(),
  dividend_max: z.number().int().positive(),
  allow_remainder: z.boolean().optional(),
  decimal_places: z.number().int().min(0).max(3).optional(),
});

// Percentage parameters schema
const PercentageParamsSchema = z.object({
  percentage_values: z.union([z.array(z.number()), z.literal('any')]),
  of_values: z.array(z.number()),
});

// Fraction parameters schema
const FractionParamsSchema = z.object({
  denominators: z.array(z.number().int().positive()),
  numerator_max: z.number().int().positive(),
  allow_improper: z.boolean().optional(),
});

// Generic schema for other models
const GenericParamsSchema = z.record(z.any());

/**
 * Get the appropriate schema for a model
 */
export function getSchemaForModel(modelId: string) {
  const schemas: Record<string, z.ZodSchema> = {
    'ADDITION': AdditionParamsSchema,
    'SUBTRACTION': SubtractionParamsSchema,
    'MULTIPLICATION': MultiplicationParamsSchema,
    'DIVISION': DivisionParamsSchema,
    'PERCENTAGE': PercentageParamsSchema,
    'FRACTION': FractionParamsSchema,
  };

  return schemas[modelId] || GenericParamsSchema;
}

/**
 * Validate difficulty parameters for a specific model
 * @throws {z.ZodError} if validation fails
 */
export function validateDifficultyParams(modelId: string, params: unknown) {
  const schema = getSchemaForModel(modelId);
  return schema.parse(params);
}

/**
 * Safe validation that returns { success, data, error }
 */
export function safeDifficultyParams(modelId: string, params: unknown) {
  const schema = getSchemaForModel(modelId);
  return schema.safeParse(params);
}
