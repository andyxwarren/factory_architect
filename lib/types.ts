// Core TypeScript interfaces for the Question Factory system

// Generic Math Model Interface
export interface IMathModel<TParams, TOutput> {
  model_id: string;
  generate(params: TParams): TOutput;
  getDefaultParams(year: number): TParams;
}

// Base interfaces
export interface ValueConstraints {
  min: number;
  step: number;
}

export interface DecimalFormatted {
  operands?: string[];
  result: string;
  minuend?: string;
  subtrahend?: string;
  quotient?: string;
}

// ADDITION Model
export interface AdditionDifficultyParams {
  operand_count: number;        // Number of values to sum (2-10)
  max_value: number;            // Maximum value for any operand
  decimal_places: number;       // Number of decimal places (0-3)
  allow_carrying: boolean;      // Whether carrying is required
  value_constraints: ValueConstraints;
}

export interface AdditionOutput {
  operation: "ADDITION";
  operands: number[];
  result: number;
  intermediate_steps: number[];
  decimal_formatted: DecimalFormatted;
}

// SUBTRACTION Model
export interface SubtractionDifficultyParams {
  minuend_max: number;          // Maximum value for the minuend
  subtrahend_max: number;       // Maximum value for the subtrahend
  decimal_places: number;       // Number of decimal places (0-3)
  allow_borrowing: boolean;    // Whether borrowing is required
  ensure_positive: boolean;    // Ensures result is non-negative
  value_constraints: {
    step: number;               // Step size for values
  };
}

export interface SubtractionOutput {
  operation: "SUBTRACTION";
  minuend: number;
  subtrahend: number;
  result: number;
  decimal_formatted: DecimalFormatted;
}

// MULTIPLICATION Model
export interface MultiplicationDifficultyParams {
  multiplicand_max: number;     // Maximum value for multiplicand
  multiplier_max: number;       // Maximum value for multiplier
  decimal_places: number;       // Decimal places in operands (0-3)
  operand_count: number;        // Number of values to multiply (2-4)
  use_fractions: boolean;       // Allow fractional multipliers
}

export interface MultiplicationOutput {
  operation: "MULTIPLICATION";
  multiplicand: number;
  multiplier: number;
  result: number;
  factors: number[];
  decimal_formatted: DecimalFormatted;
}

// DIVISION Model
export interface DivisionDifficultyParams {
  dividend_max: number;         // Maximum value for dividend
  divisor_max: number;          // Maximum value for divisor
  decimal_places: number;       // Decimal places in result (0-3)
  allow_remainder: boolean;     // Whether to include remainders
  ensure_whole: boolean;        // Ensure result is whole number
}

export interface DivisionOutput {
  operation: "DIVISION";
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  decimal_formatted: DecimalFormatted;
}

// MULTI_STEP Model
export interface MultiStepOperation {
  model: string;                // "ADDITION", "SUBTRACTION", etc.
  params: any;                  // Parameters for the specific model
  use_previous_result: boolean; // Use result from previous step
}

export interface MultiStepDifficultyParams {
  operation_sequence: MultiStepOperation[];
  max_steps: number;            // Maximum number of operations (2-5)
  intermediate_visibility: boolean; // Show intermediate results
}

export interface StepResult {
  step: number;
  operation: string;
  inputs: number[];
  result: number;
}

export interface MultiStepOutput {
  operation: "MULTI_STEP";
  steps: StepResult[];
  final_result: number;
  intermediate_results: number[];
}

// LINEAR_EQUATION Model
export interface LinearEquationDifficultyParams {
  slope_max: number;            // Maximum value for slope (m)
  intercept_max: number;        // Maximum value for y-intercept (c)
  input_max: number;            // Maximum input value (x)
  decimal_places: number;       // Decimal places in coefficients
  allow_negative_slope: boolean; // Allow negative slopes
}

export interface LinearEquationOutput {
  operation: "LINEAR_EQUATION";
  equation: {
    slope: number;
    intercept: number;
    formatted: string;
  };
  input: number;
  output: number;
  calculation_steps: {
    mx: number;
    mx_plus_c: number;
  };
}

// PERCENTAGE Model
export interface PercentageDifficultyParams {
  base_value_max: number;       // Maximum base value
  percentage_values: number[];  // Allowed percentage values [10, 20, 25, 50, etc.]
  operation_type: "of" | "increase" | "decrease" | "reverse";
  decimal_places: number;       // Decimal places in result
}

export interface PercentageOutput {
  operation: "PERCENTAGE";
  operation_type: string;
  base_value: number;
  percentage: number;
  percentage_amount: number;
  result: number;
}

// UNIT_RATE Model
export interface UnitRateDifficultyParams {
  total_value_max: number;      // Maximum total value
  quantity_max: number;         // Maximum quantity
  decimal_places: number;       // Decimal places
  comparison_count: number;     // Number of rates to compare (1-4)
}

export interface UnitRateCalculation {
  total: number;
  quantity: number;
  unit_rate: number;
}

export interface UnitRateOutput {
  operation: "UNIT_RATE";
  calculations: UnitRateCalculation[];
  best_value_index: number;
}

// FRACTION Model
export interface FractionDifficultyParams {
  whole_value_max: number;       // Maximum whole value to find fraction of
  fraction_types: Array<{        // Allowed fractions
    numerator: number;
    denominator: number;
  }>;
  decimal_places: number;        // Decimal places in result
  ensure_whole_result: boolean;  // Ensure result is whole number when possible
}

export interface FractionOutput {
  operation: "FRACTION";
  whole_value: number;
  fraction: {
    numerator: number;
    denominator: number;
    formatted: string;           // "1/2", "3/4", etc.
  };
  result: number;
  calculation_steps: {
    division_result: number;
    final_result: number;
  };
}

// COUNTING Model
export interface CountingDifficultyParams {
  target_value: number;          // Target amount to make
  allowed_denominations: number[]; // Coins/notes allowed
  solution_type: "exact" | "minimum" | "multiple"; // Type of counting problem
  max_coins: number;             // Maximum coins to use
}

export interface CountingOutput {
  operation: "COUNTING";
  target_value: number;
  solutions: Array<{
    denomination: number;
    count: number;
  }>;
  total_coins: number;
  is_minimum_solution: boolean;
}

// TIME_RATE Model  
export interface TimeRateDifficultyParams {
  rate_value_max: number;        // Maximum rate value
  rate_period: "day" | "week" | "month" | "year"; // Time period
  target_value_max: number;      // Maximum target value
  decimal_places: number;        // Decimal places
  problem_type: "time_to_target" | "total_after_time" | "rate_calculation";
}

export interface TimeRateOutput {
  operation: "TIME_RATE";
  rate: {
    value: number;
    period: string;
  };
  calculation: {
    periods: number;
    total_value: number;
  };
  problem_type: string;
}

// CONVERSION Model
export interface ConversionDifficultyParams {
  value_max: number;             // Maximum value to convert
  conversion_types: Array<{      // Available conversions
    from_unit: string;
    to_unit: string;
    conversion_factor: number;
  }>;
  decimal_places: number;        // Decimal places in result
}

export interface ConversionOutput {
  operation: "CONVERSION";
  original_value: number;
  original_unit: string;
  converted_value: number;
  converted_unit: string;
  conversion_factor: number;
  formatted_original: string;
  formatted_converted: string;
}

// COMPARISON Model
export interface ComparisonDifficultyParams {
  value_count: number;           // Number of values to compare (2-4)
  value_max: number;             // Maximum value
  comparison_type: "direct" | "unit_rate" | "better_value";
  decimal_places: number;        // Decimal places
  include_calculation: boolean;  // Whether to show calculation steps
}

export interface ComparisonOption {
  value: number;
  quantity?: number;
  unit_rate?: number;
  description: string;
}

export interface ComparisonOutput {
  operation: "COMPARISON";
  options: ComparisonOption[];
  comparison_type: string;
  winner_index: number;
  difference?: number;
  explanation: string;
}

// Story Engine Context Types
export interface StoryContext {
  unit_type: string;            // "currency", "measurement", "count"
  unit_symbol: string;          // "£", "kg", ""
  item_descriptors?: string[];  // ["cake", "drink"]
  action_verb?: string;         // "buys", "collects", "earns"
  scenario_type?: string;       // "change", "difference", "remaining"
  initial_context?: string;     // "pays with", "has saved"
  removal_context?: string;     // "costs", "spent"
  quantity_type?: string;       // "groups", "items_per_unit"
  unit_descriptor?: string;     // "tickets", "pens per pack"
  person?: string;              // "Sarah", "Tom", etc.
}

// Question Generation Types
export interface GenerateRequest {
  model_id: string;
  difficulty_params?: any;
  context_type?: string;
  year_level?: number;
}

export interface GeneratedQuestion {
  question: string;
  answer: string | number;
  math_output: any;
  context: StoryContext;
  metadata: {
    model_id: string;
    year_level: number;
    difficulty_params: any;
    timestamp: Date;
  };
}

// Model Information Types
export interface ModelParameter {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'array';
  min?: number;
  max?: number;
  default: any;
  description: string;
}

export interface ModelInfo {
  model_id: string;
  description: string;
  difficulty_parameters: ModelParameter[];
  supported_year_levels: number[];
  context_types: string[];
}

// Test Types
export interface TestRequest {
  model_id: string;
  test_count: number;
  difficulty_params: any;
}

export interface TestResult {
  question: string;
  answer: string | number;
  generation_time_ms: number;
}

export interface TestResponse {
  results: TestResult[];
  statistics: {
    avg_generation_time: number;
    success_rate: number;
    unique_questions: number;
    total_time_ms: number;
  };
}

// Export Request Types
export interface ExportRequest {
  questions: GeneratedQuestion[];
  format: 'json' | 'csv';
  include_metadata: boolean;
}

// Type guards
export function isAdditionOutput(output: any): output is AdditionOutput {
  return output.operation === "ADDITION";
}

export function isSubtractionOutput(output: any): output is SubtractionOutput {
  return output.operation === "SUBTRACTION";
}

export function isMultiplicationOutput(output: any): output is MultiplicationOutput {
  return output.operation === "MULTIPLICATION";
}

export function isDivisionOutput(output: any): output is DivisionOutput {
  return output.operation === "DIVISION";
}

// Money Models - UK National Curriculum Specific

// COIN_RECOGNITION Model
export interface CoinRecognitionDifficultyParams {
  include_coins: number[];          // Which coin denominations to include (in pence)
  include_notes: number[];          // Which note denominations to include (in pence)
  problem_types: string[];          // Types of problems: identify_value, identify_name, count_collection, compare_values
  max_coin_count: number;           // Maximum number of coins in a collection
  allow_mixed_denominations: boolean; // Whether to mix different coin types
  include_combinations: boolean;    // Whether to include combination problems
}

export interface CoinRecognitionOutput {
  operation: "COIN_RECOGNITION";
  problem_type: string;
  target_denomination?: number;
  denomination_name?: string;
  formatted_value?: string;
  is_note?: boolean;
  collection: Array<{ denomination: number; count: number }>;
  total_value: number;
  answer_type: string;
  comparison_result?: string;
}

// CHANGE_CALCULATION Model
export interface ChangeCalculationDifficultyParams {
  max_item_cost: number;            // Maximum cost of individual items
  payment_methods: number[];        // Available payment denominations
  decimal_places: number;           // Number of decimal places
  problem_types: string[];          // Types: simple_change, exact_payment, multiple_items, change_breakdown
  include_breakdown: boolean;       // Whether to break down change into denominations
  max_items: number;                // Maximum number of items in a transaction
  allow_overpayment: boolean;       // Whether to allow overpayment scenarios
}

export interface ChangeCalculationOutput {
  operation: "CHANGE_CALCULATION";
  problem_type: string;
  items: Array<{ name: string; cost: number; quantity: number }>;
  total_cost: number;
  payment_amount: number;
  change_amount: number;
  change_breakdown: Array<{ denomination: number; count: number; formatted: string }>;
  payment_description: string;
}

// MONEY_COMBINATIONS Model
export interface MoneyCombinationsDifficultyParams {
  target_amount_range: { min: number; max: number };
  available_denominations: number[];
  problem_types: string[];          // Types: find_combinations, make_amount, equivalent_amounts, compare_combinations
  max_combinations: number;
  allow_notes: boolean;
  require_exact_combinations: boolean;
  decimal_places: number;
}

export interface MoneyCombinationsOutput {
  operation: "MONEY_COMBINATIONS";
  problem_type: string;
  target_amount: number;
  available_denominations: number[];
  combinations: Array<Array<{ denomination: number; count: number; formatted: string }>>;
  total_combinations: number;
  formatted_target: string;
  specific_combination?: Array<{ denomination: number; count: number; formatted: string }>;
  comparison_criteria?: string;
}

// MIXED_MONEY_UNITS Model
export interface MixedMoneyUnitsDifficultyParams {
  pounds_range: { min: number; max: number };
  pence_range: { min: number; max: number };
  problem_types: string[];          // Types: convert_units, add_mixed_units, subtract_mixed_units, compare_mixed_amounts
  decimal_places: number;
  allow_complex_operations: boolean;
  include_comparisons: boolean;
  max_operands: number;
}

export interface MixedMoneyUnitsOutput {
  operation: "MIXED_MONEY_UNITS";
  problem_type: string;
  source_amount?: { pounds: number; pence: number };
  target_format?: string;
  result: number;
  result_mixed?: { pounds: number; pence: number; total_decimal: number };
  operands?: Array<{ pounds: number; pence: number }>;
  minuend?: { pounds: number; pence: number };
  subtrahend?: { pounds: number; pence: number };
  amount1?: { pounds: number; pence: number };
  amount2?: { pounds: number; pence: number };
  comparison_result?: string;
  difference?: number;
  formatted_source?: string;
  formatted_result?: string;
  formatted_operands?: string[];
  formatted_minuend?: string;
  formatted_subtrahend?: string;
  formatted_amount1?: string;
  formatted_amount2?: string;
  formatted_difference?: string;
  conversion_type?: string;
  requires_borrowing?: boolean;
}

// MONEY_FRACTIONS Model
export interface MoneyFractionsDifficultyParams {
  amount_range: { min: number; max: number };
  allowed_fractions: Array<{ numerator: number; denominator: number }>;
  problem_types: string[];          // Types: fraction_of_amount, find_whole_from_fraction, compare_fractional_amounts, add_fractional_money
  decimal_places: number;
  ensure_whole_results: boolean;
  include_word_problems: boolean;
  max_fraction_complexity: number;
}

export interface MoneyFractionsOutput {
  operation: "MONEY_FRACTIONS";
  problem_type: string;
  whole_amount?: number;
  base_amount?: number;
  fraction?: { numerator: number; denominator: number };
  fraction1?: { numerator: number; denominator: number };
  fraction2?: { numerator: number; denominator: number };
  result: number;
  fractional_amount?: number;
  amount1?: number;
  amount2?: number;
  comparison_result?: string;
  formatted_whole?: string;
  formatted_base?: string;
  formatted_fraction?: string;
  formatted_fraction1?: string;
  formatted_fraction2?: string;
  formatted_result?: string;
  formatted_fractional_amount?: string;
  formatted_amount1?: string;
  formatted_amount2?: string;
  fraction_name?: string;
  calculation_steps?: Array<{ step: string; calculation: string; result: string }>;
}

// MONEY_SCALING Model
export interface MoneyScalingDifficultyParams {
  base_amount_range: { min: number; max: number };
  scale_factor_range: { min: number; max: number };
  problem_types: string[];          // Types: scale_up, scale_down, proportional_reasoning, rate_problems
  decimal_places: number;
  include_fractional_scaling: boolean;
  allow_complex_ratios: boolean;
  context_types: string[];
}

export interface MoneyScalingOutput {
  operation: "MONEY_SCALING";
  problem_type: string;
  base_amount?: number;
  scale_factor?: number;
  scaled_amount?: number;
  original_amount?: number;
  base_quantity?: number;
  new_quantity?: number;
  new_amount?: number;
  unit_cost?: number;
  rate?: number;
  time_amount?: number;
  time_unit?: string;
  total_amount?: number;
  context: string;
  formatted_base?: string;
  formatted_scaled?: string;
  formatted_original?: string;
  formatted_new?: string;
  formatted_scale_factor?: string;
  formatted_unit_cost?: string;
  formatted_rate?: string;
  formatted_total?: string;
  calculation?: string;
}

// GEOMETRY Models

// SHAPE_RECOGNITION Model
export interface ShapeRecognitionDifficultyParams {
  include_2d_shapes: string[];      // ['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon']
  include_3d_shapes: string[];      // ['cube', 'sphere', 'cylinder', 'cone', 'pyramid']
  problem_types: string[];          // ['identify_shape', 'count_sides', 'count_vertices', 'compare_shapes']
  max_shapes_count: number;         // Maximum number of shapes to show at once
  include_irregular_shapes: boolean; // Include irregular versions of shapes
  allow_rotations: boolean;         // Include rotated versions of shapes
}

export interface ShapeRecognitionOutput {
  operation: "SHAPE_RECOGNITION";
  problem_type: string;            // 'identify_shape', 'count_sides', 'count_vertices', 'compare_shapes'
  shape_data: {
    name: string;                  // 'circle', 'triangle', etc.
    type: '2d' | '3d';
    sides?: number;                // For polygons
    vertices?: number;             // For polygons
    properties: string[];          // ['curved', 'straight_sides', 'equal_sides', etc.]
    category: string;              // 'polygon', 'circle', 'polyhedron', etc.
  }[];
  target_shape?: string;           // For identification problems
  correct_answer: string | number;
  distractors?: string[];          // Incorrect options for multiple choice
  comparison_result?: string;      // For comparison problems
}

// SHAPE_PROPERTIES Model  
export interface ShapePropertiesDifficultyParams {
  shape_types: string[];           // ['triangle', 'quadrilateral', 'polygon', 'circle']
  property_types: string[];        // ['sides', 'vertices', 'angles', 'symmetry', 'parallel_lines']
  max_sides: number;               // Maximum sides for polygons
  include_angle_types: boolean;    // Include right angles, acute, obtuse
  include_symmetry: boolean;       // Include line/rotational symmetry
  problem_complexity: 'simple' | 'medium' | 'complex';
}

export interface ShapePropertiesOutput {
  operation: "SHAPE_PROPERTIES";
  problem_type: string;            // 'count_properties', 'identify_property', 'compare_properties'
  shape_name: string;
  properties: {
    sides: number;
    vertices: number;
    angles?: number;
    right_angles?: number;
    parallel_sides?: number;
    lines_of_symmetry?: number;
    rotational_symmetry?: number;
  };
  question_focus: string;          // Which property is being asked about
  correct_answer: string | number;
  explanation?: string;
}

// ANGLE_MEASUREMENT Model
export interface AngleMeasurementDifficultyParams {
  angle_types: string[];           // ['right', 'acute', 'obtuse', 'straight', 'reflex']
  measurement_units: string[];     // ['degrees', 'turns', 'right_angles']
  include_angle_drawing: boolean;  // Include problems about drawing angles
  include_angle_calculation: boolean; // Include calculating missing angles
  max_angle_degrees: number;       // Maximum angle size in degrees
  problem_types: string[];         // ['identify_type', 'measure_angle', 'draw_angle', 'calculate_missing']
}

export interface AngleMeasurementOutput {
  operation: "ANGLE_MEASUREMENT";
  problem_type: string;
  angle_degrees: number;
  angle_type: string;              // 'right', 'acute', 'obtuse', etc.
  measurement_in_turns?: number;   // Angle as fraction of full turn
  measurement_in_right_angles?: number; // Angle as multiple of right angles
  context: string;                 // 'clock', 'shape', 'lines', etc.
  visual_description?: string;     // Description of the angle's appearance
  correct_answer: string | number;
}

// POSITION_DIRECTION Model
export interface PositionDirectionDifficultyParams {
  coordinate_types: string[];      // ['grid_references', 'coordinates', 'compass_directions']
  grid_size: number;               // Size of coordinate grid
  include_negative_numbers: boolean; // Include negative coordinates
  transformation_types: string[]; // ['translation', 'rotation', 'reflection']
  problem_types: string[];        // ['find_position', 'give_directions', 'transform_shape']
  max_movements: number;          // Maximum number of movement steps
}

export interface PositionDirectionOutput {
  operation: "POSITION_DIRECTION";
  problem_type: string;
  start_position?: { x: number; y: number; label?: string };
  end_position?: { x: number; y: number; label?: string };
  movements?: Array<{ direction: string; distance: number }>;
  transformation?: {
    type: string;                  // 'translation', 'rotation', 'reflection'
    parameters: any;               // Specific transformation details
  };
  grid_reference?: string;         // Grid reference like 'A3' or '(2,3)'
  compass_direction?: string;      // 'North', 'Northeast', etc.
  correct_answer: string;
}

// AREA_PERIMETER Model
export interface AreaPerimeterDifficultyParams {
  shape_types: string[];           // ['rectangle', 'square', 'triangle', 'circle', 'compound']
  measurement_units: string[];     // ['cm', 'mm', 'm', 'units']
  max_dimensions: number;          // Maximum length/width values
  include_decimal_measurements: boolean;
  calculation_types: string[];     // ['area', 'perimeter', 'both', 'find_missing_dimension']
  allow_compound_shapes: boolean;  // Shapes made of multiple rectangles
}

export interface AreaPerimeterOutput {
  operation: "AREA_PERIMETER";
  problem_type: string;           // 'calculate_area', 'calculate_perimeter', 'find_dimension'
  shape_type: string;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    radius?: number;
    side_lengths?: number[];      // For irregular shapes
  };
  area?: number;
  perimeter?: number;
  units: string;
  formula_used?: string;
  working_steps?: string[];
  correct_answer: string | number;
}