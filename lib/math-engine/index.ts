import { AdditionModel } from './models/addition.model';
import { SubtractionModel } from './models/subtraction.model';
import { MultiplicationModel } from './models/multiplication.model';
import { DivisionModel } from './models/division.model';
import { PercentageModel } from './models/percentage.model';
import { FractionModel } from './models/fraction.model';
import { CountingModel } from './models/counting.model';
import { TimeRateModel } from './models/time-rate.model';
import { ConversionModel } from './models/conversion.model';
import { ComparisonModel } from './models/comparison.model';
import { MultiStepModel } from './models/multi-step.model';
import { LinearEquationModel } from './models/linear-equation.model';
import { UnitRateModel } from './models/unit-rate.model';
import { CoinRecognitionModel } from './models/coin-recognition.model';
import { ChangeCalculationModel } from './models/change-calculation.model';
import { MoneyCombinationsModel } from './models/money-combinations.model';
import { MixedMoneyUnitsModel } from './models/mixed-money-units.model';
import { MoneyFractionsModel } from './models/money-fractions.model';
import { MoneyScalingModel } from './models/money-scaling.model';
import { ShapeRecognitionModel } from './models/shape-recognition.model';
import { DifficultyPresets } from './difficulty';

// Model Registry
export const mathModels = {
  ADDITION: new AdditionModel(),
  SUBTRACTION: new SubtractionModel(),
  MULTIPLICATION: new MultiplicationModel(),
  DIVISION: new DivisionModel(),
  PERCENTAGE: new PercentageModel(),
  FRACTION: new FractionModel(),
  COUNTING: new CountingModel(),
  TIME_RATE: new TimeRateModel(),
  CONVERSION: new ConversionModel(),
  COMPARISON: new ComparisonModel(),
  MULTI_STEP: new MultiStepModel(),
  LINEAR_EQUATION: new LinearEquationModel(),
  UNIT_RATE: new UnitRateModel(),
  COIN_RECOGNITION: new CoinRecognitionModel(),
  CHANGE_CALCULATION: new ChangeCalculationModel(),
  MONEY_COMBINATIONS: new MoneyCombinationsModel(),
  MIXED_MONEY_UNITS: new MixedMoneyUnitsModel(),
  MONEY_FRACTIONS: new MoneyFractionsModel(),
  MONEY_SCALING: new MoneyScalingModel(),
  SHAPE_RECOGNITION: new ShapeRecognitionModel()
};

export type ModelId = keyof typeof mathModels;

// Get a specific model
export function getModel(modelId: ModelId) {
  const model = mathModels[modelId];
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  return model;
}

// Get all available models
export function getAllModels() {
  return Object.keys(mathModels);
}

// Generate a question using a specific model
export function generateMathQuestion(
  modelId: ModelId,
  year?: number,
  customParams?: any
) {
  const model = getModel(modelId);
  const params = customParams || model.getDefaultParams(year || 4);
  return model.generate(params);
}

// Export components
export { DifficultyPresets };
export * from './models/addition.model';
export * from './models/subtraction.model';
export * from './models/multiplication.model';
export * from './models/division.model';
export * from './models/percentage.model';