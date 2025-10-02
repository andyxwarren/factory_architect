/**
 * Seed Scenario Templates
 *
 * Creates story templates for question generation
 * These templates are used by controllers to generate contextual questions
 *
 * Target: scenario_templates table
 */

import { SupabaseClient } from '@supabase/supabase-js';

const SCENARIO_TEMPLATES = [
  // SHOPPING theme templates
  {
    theme: 'SHOPPING',
    format: 'DIRECT_CALCULATION',
    template_text: '{{character}} goes to the shop and buys {{items}}. How much does {{character}} spend in total?',
    template_data: {
      required_fields: ['character', 'items'],
      item_count: { min: 2, max: 5 },
      operation: 'addition'
    }
  },
  {
    theme: 'SHOPPING',
    format: 'COMPARISON',
    template_text: 'Pack A costs {{price_a}} for {{quantity_a}}. Pack B costs {{price_b}} for {{quantity_b}}. Which is better value?',
    template_data: {
      required_fields: ['price_a', 'price_b', 'quantity_a', 'quantity_b'],
      operation: 'unit_rate_comparison'
    }
  },
  {
    theme: 'SHOPPING',
    format: 'VALIDATION',
    template_text: '{{character}} has {{money_available}}. {{character}} wants to buy {{items}}. Does {{character}} have enough money?',
    template_data: {
      required_fields: ['character', 'money_available', 'items'],
      answer_type: 'yes_no'
    }
  },

  // SCHOOL theme templates
  {
    theme: 'SCHOOL',
    format: 'DIRECT_CALCULATION',
    template_text: '{{character}} needs to buy school supplies: {{items}}. What is the total cost?',
    template_data: {
      required_fields: ['character', 'items'],
      item_count: { min: 2, max: 4 },
      operation: 'addition'
    }
  },
  {
    theme: 'SCHOOL',
    format: 'MULTI_STEP',
    template_text: 'A class of {{student_count}} students each need {{item}}. Each {{item}} costs {{price}}. How much does the teacher need to spend?',
    template_data: {
      required_fields: ['student_count', 'item', 'price'],
      operation: 'multiplication_then_total'
    }
  },

  // SPORTS theme templates
  {
    theme: 'SPORTS',
    format: 'DIRECT_CALCULATION',
    template_text: '{{character}} buys {{items}} for their sports team. What is the total cost?',
    template_data: {
      required_fields: ['character', 'items'],
      item_count: { min: 2, max: 4 }
    }
  },
  {
    theme: 'SPORTS',
    format: 'VALIDATION',
    template_text: 'The sports club has £{{budget}}. They want to buy {{items}}. Can they afford it?',
    template_data: {
      required_fields: ['budget', 'items'],
      answer_type: 'yes_no'
    }
  },

  // COOKING theme templates
  {
    theme: 'COOKING',
    format: 'DIRECT_CALCULATION',
    template_text: '{{character}} is baking a cake and needs {{items}}. How much will the ingredients cost?',
    template_data: {
      required_fields: ['character', 'items'],
      item_count: { min: 3, max: 5 }
    }
  },
  {
    theme: 'COOKING',
    format: 'MULTI_STEP',
    template_text: 'A recipe needs {{quantity}} {{item}}. {{character}} is making {{batches}} batches. How much {{item}} is needed in total?',
    template_data: {
      required_fields: ['quantity', 'item', 'character', 'batches'],
      operation: 'multiplication'
    }
  },

  // POCKET_MONEY theme templates
  {
    theme: 'POCKET_MONEY',
    format: 'DIRECT_CALCULATION',
    template_text: '{{character}} gets £{{weekly_amount}} pocket money each week. How much does {{character}} get in {{weeks}} weeks?',
    template_data: {
      required_fields: ['character', 'weekly_amount', 'weeks'],
      operation: 'multiplication'
    }
  },
  {
    theme: 'POCKET_MONEY',
    format: 'VALIDATION',
    template_text: '{{character}} has saved £{{savings}}. {{character}} wants to buy {{items}}. Does {{character}} have enough?',
    template_data: {
      required_fields: ['character', 'savings', 'items'],
      answer_type: 'yes_no'
    }
  },
  {
    theme: 'POCKET_MONEY',
    format: 'MULTI_STEP',
    template_text: '{{character}} saves £{{weekly_savings}} each week for {{weeks}} weeks. After buying a {{item}} for £{{item_cost}}, how much does {{character}} have left?',
    template_data: {
      required_fields: ['character', 'weekly_savings', 'weeks', 'item', 'item_cost'],
      operation: 'multiply_then_subtract'
    }
  },

  // ESTIMATION templates (applicable to multiple themes)
  {
    theme: 'SHOPPING',
    format: 'ESTIMATION',
    template_text: '{{character}} buys {{items}}. Estimate the total cost to the nearest £{{round_to}}.',
    template_data: {
      required_fields: ['character', 'items', 'round_to'],
      operation: 'rounding'
    }
  },
  {
    theme: 'SCHOOL',
    format: 'ESTIMATION',
    template_text: 'The school needs approximately {{quantity}} {{item}}. Estimate the cost to the nearest £{{round_to}}.',
    template_data: {
      required_fields: ['quantity', 'item', 'round_to'],
      operation: 'rounding'
    }
  },

  // MISSING_VALUE templates
  {
    theme: 'SHOPPING',
    format: 'MISSING_VALUE',
    template_text: '{{character}} buys {{items}} and pays £{{total}}. If {{item_1}} costs £{{price_1}}, how much did {{item_2}} cost?',
    template_data: {
      required_fields: ['character', 'items', 'total', 'item_1', 'price_1', 'item_2'],
      operation: 'find_missing_addend'
    }
  },
  {
    theme: 'POCKET_MONEY',
    format: 'MISSING_VALUE',
    template_text: '{{character}} saved for {{weeks}} weeks to buy a {{item}} costing £{{cost}}. How much did {{character}} save each week?',
    template_data: {
      required_fields: ['character', 'weeks', 'item', 'cost'],
      operation: 'find_missing_factor'
    }
  },

  // PATTERN_RECOGNITION templates (generic)
  {
    theme: 'SHOPPING',
    format: 'PATTERN_RECOGNITION',
    template_text: '{{character}} goes shopping each week. Week 1: £{{value_1}}, Week 2: £{{value_2}}, Week 3: £{{value_3}}. If the pattern continues, how much will {{character}} spend in Week {{target_week}}?',
    template_data: {
      required_fields: ['character', 'value_1', 'value_2', 'value_3', 'target_week'],
      operation: 'arithmetic_sequence'
    }
  },

  // ORDERING templates
  {
    theme: 'SHOPPING',
    format: 'ORDERING',
    template_text: 'Order these prices from smallest to largest: {{values}}',
    template_data: {
      required_fields: ['values'],
      operation: 'ascending_sort',
      value_count: { min: 3, max: 5 }
    }
  },
  {
    theme: 'POCKET_MONEY',
    format: 'ORDERING',
    template_text: '{{characters}} saved different amounts: {{savings}}. Order the amounts from smallest to largest.',
    template_data: {
      required_fields: ['characters', 'savings'],
      operation: 'ascending_sort'
    }
  }
];

/**
 * Seed scenario templates table
 */
export async function seedScenarioTemplates(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('scenario_templates')
    .upsert(SCENARIO_TEMPLATES, {
      onConflict: 'theme,format,template_text', // No unique constraint defined, will insert all
      ignoreDuplicates: true
    });

  if (error) {
    console.error('  ❌ Failed to seed scenario templates:', error.message);
    return 0;
  }

  return SCENARIO_TEMPLATES.length;
}
