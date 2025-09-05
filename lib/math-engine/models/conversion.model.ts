import {
  IMathModel,
  ConversionDifficultyParams,
  ConversionOutput
} from '@/lib/types';
import {
  generateRandomNumber,
  randomChoice
} from '@/lib/utils';

export class ConversionModel implements IMathModel<ConversionDifficultyParams, ConversionOutput> {
  public readonly model_id = "CONVERSION";

  private static readonly COMMON_CONVERSIONS = [
    { from_unit: "pence", to_unit: "pounds", conversion_factor: 0.01 },
    { from_unit: "pounds", to_unit: "pence", conversion_factor: 100 },
    { from_unit: "grams", to_unit: "kilograms", conversion_factor: 0.001 },
    { from_unit: "kilograms", to_unit: "grams", conversion_factor: 1000 },
    { from_unit: "millilitres", to_unit: "litres", conversion_factor: 0.001 },
    { from_unit: "litres", to_unit: "millilitres", conversion_factor: 1000 },
    { from_unit: "millimetres", to_unit: "centimetres", conversion_factor: 0.1 },
    { from_unit: "centimetres", to_unit: "millimetres", conversion_factor: 10 },
    { from_unit: "centimetres", to_unit: "metres", conversion_factor: 0.01 },
    { from_unit: "metres", to_unit: "centimetres", conversion_factor: 100 },
    { from_unit: "metres", to_unit: "kilometres", conversion_factor: 0.001 },
    { from_unit: "kilometres", to_unit: "metres", conversion_factor: 1000 }
  ];

  generate(params: ConversionDifficultyParams): ConversionOutput {
    const conversion = this.selectConversion(params);
    const originalValue = this.generateValue(params, conversion);
    const convertedValue = this.performConversion(originalValue, conversion.conversion_factor);

    return {
      operation: "CONVERSION",
      original_value: originalValue,
      original_unit: conversion.from_unit,
      converted_value: convertedValue,
      converted_unit: conversion.to_unit,
      conversion_factor: conversion.conversion_factor,
      formatted_original: this.formatValue(originalValue, conversion.from_unit, params.decimal_places),
      formatted_converted: this.formatValue(convertedValue, conversion.to_unit, params.decimal_places)
    };
  }

  getDefaultParams(year: number): ConversionDifficultyParams {
    if (year <= 2) {
      return {
        value_max: 100,
        conversion_types: [
          { from_unit: "pence", to_unit: "pounds", conversion_factor: 0.01 }
        ],
        decimal_places: 2
      };
    } else if (year <= 4) {
      return {
        value_max: 1000,
        conversion_types: [
          { from_unit: "pence", to_unit: "pounds", conversion_factor: 0.01 },
          { from_unit: "pounds", to_unit: "pence", conversion_factor: 100 },
          { from_unit: "centimetres", to_unit: "metres", conversion_factor: 0.01 },
          { from_unit: "metres", to_unit: "centimetres", conversion_factor: 100 }
        ],
        decimal_places: 2
      };
    } else {
      return {
        value_max: 10000,
        conversion_types: ConversionModel.COMMON_CONVERSIONS,
        decimal_places: 3
      };
    }
  }

  private selectConversion(params: ConversionDifficultyParams): {
    from_unit: string;
    to_unit: string;
    conversion_factor: number;
  } {
    return randomChoice(params.conversion_types);
  }

  private generateValue(
    params: ConversionDifficultyParams,
    conversion: { from_unit: string; to_unit: string; conversion_factor: number }
  ): number {
    // Adjust max value based on conversion to avoid extreme results
    let adjustedMax = params.value_max;
    
    if (conversion.conversion_factor > 10) {
      // For conversions that multiply (e.g., pounds to pence), use smaller input values
      adjustedMax = Math.min(adjustedMax, 100);
    }

    return generateRandomNumber(
      adjustedMax,
      conversion.from_unit === "pounds" ? 2 : 0, // Use decimals for pounds
      1,
      0.01
    );
  }

  private performConversion(value: number, factor: number): number {
    const result = value * factor;
    // Round to avoid floating point precision issues
    return Math.round(result * 1000) / 1000;
  }

  private formatValue(value: number, unit: string, decimalPlaces: number): string {
    // Special formatting for currency
    if (unit === "pounds") {
      return `£${value.toFixed(2)}`;
    } else if (unit === "pence") {
      return `${Math.round(value)}p`;
    }
    
    // Standard formatting for other units
    const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(decimalPlaces);
    return `${formattedValue} ${unit}`;
  }

  // Helper method to get unit abbreviations
  static getUnitAbbreviation(unit: string): string {
    const abbreviations: { [key: string]: string } = {
      pounds: "£",
      pence: "p",
      kilograms: "kg",
      grams: "g",
      litres: "l",
      millilitres: "ml",
      metres: "m",
      centimetres: "cm",
      millimetres: "mm",
      kilometres: "km"
    };
    
    return abbreviations[unit] || unit;
  }

  // Helper method to determine if result should be whole number
  static shouldBeWholeNumber(unit: string): boolean {
    return ["pence", "grams", "millilitres", "millimetres", "centimetres"].includes(unit);
  }
}