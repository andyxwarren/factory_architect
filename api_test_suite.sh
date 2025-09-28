#!/bin/bash

# ==============================================================================
# Factory Architect API Test Suite
#
# Description:
# This script contains a comprehensive suite of tests for the mathematics
# question generator API endpoint. It covers smoke tests, model and format
# coverage, difficulty progression, scenario themes, error handling, and
# batch generation.
#
# Prerequisites:
# 1. `curl` must be installed.
# 2. `jq` must be installed for pretty-printing JSON responses.
#    (e.g., on macOS: `brew install jq`, on Debian/Ubuntu: `sudo apt-get install jq`)
# 3. The Factory Architect application server must be running on localhost:3000.
#
# How to Run:
# 1. Open your terminal.
# 2. Make the script executable: `chmod +x api_test_suite.sh`
# 3. Run the script: `./api_test_suite.sh` or bash ./api_test_suite.sh > test_results.txt 2>&1
#
# ==============================================================================

# Define the API endpoint URL
API_URL="http://localhost:3000/api/generate/enhanced"

# --- SUITE A: SMOKE TESTS ---
echo "--- SUITE A: SMOKE TESTS ---"
echo "Running basic tests to ensure the API is online and responsive..."

# Test 1: Basic valid request for ADDITION model
echo "# Test A.1: Basic ADDITION request"
curl -s -X POST "$API_URL" \
-H "Content-Type: application/json" \
-d '{
  "model_id": "ADDITION",
  "difficulty_level": "1.1"
}' | jq

# Test 2: Basic valid request for SUBTRACTION model
echo "# Test A.2: Basic SUBTRACTION request"
curl -s -X POST "$API_URL" \
-H "Content-Type: application/json" \
-d '{
  "model_id": "SUBTRACTION",
  "difficulty_level": "1.2"
}' | jq


# --- SUITE B: MODEL COVERAGE TESTS ---
echo ""
echo "--- SUITE B: MODEL COVERAGE TESTS ---"
echo "Testing every mathematical model to ensure basic generation and catch crashes..."

# Test B.1: ADDITION
echo "# Test B.1: ADDITION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "4.1"}' | jq

# Test B.2: SUBTRACTION
echo "# Test B.2: SUBTRACTION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "SUBTRACTION", "difficulty_level": "4.1"}' | jq

# Test B.3: MULTIPLICATION
echo "# Test B.3: MULTIPLICATION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MULTIPLICATION", "difficulty_level": "4.1"}' | jq

# Test B.4: DIVISION
echo "# Test B.4: DIVISION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "DIVISION", "difficulty_level": "4.1"}' | jq

# Test B.5: PERCENTAGE
echo "# Test B.5: PERCENTAGE model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "PERCENTAGE", "difficulty_level": "4.1"}' | jq

# Test B.6: FRACTION
echo "# Test B.6: FRACTION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "FRACTION", "difficulty_level": "4.1"}' | jq

# Test B.7: COUNTING
echo "# Test B.7: COUNTING model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "COUNTING", "difficulty_level": "4.1"}' | jq

# Test B.8: TIME_RATE
echo "# Test B.8: TIME_RATE model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "TIME_RATE", "difficulty_level": "4.1"}' | jq

# Test B.9: CONVERSION
echo "# Test B.9: CONVERSION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "CONVERSION", "difficulty_level": "4.1"}' | jq

# Test B.10: COMPARISON
echo "# Test B.10: COMPARISON model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "COMPARISON", "difficulty_level": "4.1"}' | jq

# Test B.11: MULTI_STEP
echo "# Test B.11: MULTI_STEP model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MULTI_STEP", "difficulty_level": "4.1"}' | jq

# Test B.12: LINEAR_EQUATION
echo "# Test B.12: LINEAR_EQUATION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "LINEAR_EQUATION", "difficulty_level": "4.1"}' | jq

# Test B.13: UNIT_RATE
echo "# Test B.13: UNIT_RATE model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "UNIT_RATE", "difficulty_level": "4.1"}' | jq

# Test B.14: COIN_RECOGNITION
echo "# Test B.14: COIN_RECOGNITION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "COIN_RECOGNITION", "difficulty_level": "4.1"}' | jq

# Test B.15: CHANGE_CALCULATION
echo "# Test B.15: CHANGE_CALCULATION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "CHANGE_CALCULATION", "difficulty_level": "4.1"}' | jq

# Test B.16: MONEY_COMBINATIONS
echo "# Test B.16: MONEY_COMBINATIONS model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MONEY_COMBINATIONS", "difficulty_level": "4.1"}' | jq

# Test B.17: MIXED_MONEY_UNITS
echo "# Test B.17: MIXED_MONEY_UNITS model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MIXED_MONEY_UNITS", "difficulty_level": "4.1"}' | jq

# Test B.18: MONEY_FRACTIONS
echo "# Test B.18: MONEY_FRACTIONS model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MONEY_FRACTIONS", "difficulty_level": "4.1"}' | jq

# Test B.19: MONEY_SCALING
echo "# Test B.19: MONEY_SCALING model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MONEY_SCALING", "difficulty_level": "4.1"}' | jq

# Test B.20: SHAPE_RECOGNITION
echo "# Test B.20: SHAPE_RECOGNITION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "SHAPE_RECOGNITION", "difficulty_level": "4.1"}' | jq

# Test B.21: SHAPE_PROPERTIES
echo "# Test B.21: SHAPE_PROPERTIES model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "SHAPE_PROPERTIES", "difficulty_level": "4.1"}' | jq

# Test B.22: ANGLE_MEASUREMENT
echo "# Test B.22: ANGLE_MEASUREMENT model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ANGLE_MEASUREMENT", "difficulty_level": "4.1"}' | jq

# Test B.23: POSITION_DIRECTION
echo "# Test B.23: POSITION_DIRECTION model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "POSITION_DIRECTION", "difficulty_level": "4.1"}' | jq

# Test B.24: AREA_PERIMETER
echo "# Test B.24: AREA_PERIMETER model"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "AREA_PERIMETER", "difficulty_level": "4.1"}' | jq


# --- SUITE C: FORMAT COVERAGE TESTS ---
echo ""
echo "--- SUITE C: FORMAT COVERAGE TESTS ---"
echo "Testing every question format using the ADDITION model..."

# Test C.1: DIRECT_CALCULATION
echo "# Test C.1: DIRECT_CALCULATION format"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "5.3", "format_preference": "DIRECT_CALCULATION"}' | jq

# Test C.2: COMPARISON
echo "# Test C.2: COMPARISON format"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "5.3", "format_preference": "COMPARISON"}' | jq

# Test C.3: ESTIMATION
echo "# Test C.3: ESTIMATION format"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "5.3", "format_preference": "ESTIMATION"}' | jq

# Test C.4: ORDERING
echo "# Test C.4: ORDERING format"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "5.3", "format_preference": "ORDERING"}' | jq

# Test C.5: VALIDATION
echo "# Test C.5: VALIDATION format"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "5.3", "format_preference": "VALIDATION"}' | jq

# Test C.6: MULTI_STEP
echo "# Test C.6: MULTI_STEP format"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "5.3", "format_preference": "MULTI_STEP"}' | jq

# Test C.7: MISSING_VALUE
echo "# Test C.7: MISSING_VALUE format"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "5.3", "format_preference": "MISSING_VALUE"}' | jq

# Test C.8: PATTERN_RECOGNITION
echo "# Test C.8: PATTERN_RECOGNITION format"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "5.3", "format_preference": "PATTERN_RECOGNITION"}' | jq


# --- SUITE D: DIFFICULTY PROGRESSION TESTS ---
echo ""
echo "--- SUITE D: DIFFICULTY PROGRESSION TESTS ---"
echo "Testing smooth difficulty increase for the MULTIPLICATION model..."

# Test D.1: Year 2.1
echo "# Test D.1: MULTIPLICATION at difficulty 2.1"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MULTIPLICATION", "difficulty_level": "2.1"}' | jq

# Test D.2: Year 2.4
echo "# Test D.2: MULTIPLICATION at difficulty 2.4"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MULTIPLICATION", "difficulty_level": "2.4"}' | jq

# Test D.3: Year 3.2
echo "# Test D.3: MULTIPLICATION at difficulty 3.2"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MULTIPLICATION", "difficulty_level": "3.2"}' | jq

# Test D.4: Year 4.1
echo "# Test D.4: MULTIPLICATION at difficulty 4.1"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MULTIPLICATION", "difficulty_level": "4.1"}' | jq

# Test D.5: Year 5.3
echo "# Test D.5: MULTIPLICATION at difficulty 5.3"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MULTIPLICATION", "difficulty_level": "5.3"}' | jq

# Test D.6: Year 6.4
echo "# Test D.6: MULTIPLICATION at difficulty 6.4"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "MULTIPLICATION", "difficulty_level": "6.4"}' | jq


# --- SUITE E: SCENARIO THEME TESTS ---
echo ""
echo "--- SUITE E: SCENARIO THEME TESTS ---"
echo "Testing that each scenario theme can be applied..."

# Test E.1: SHOPPING
echo "# Test E.1: SHOPPING theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "SHOPPING"}' | jq

# Test E.2: COOKING
echo "# Test E.2: COOKING theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "COOKING"}' | jq

# Test E.3: SPORTS
echo "# Test E.3: SPORTS theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "SPORTS"}' | jq

# Test E.4: SCHOOL
echo "# Test E.4: SCHOOL theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "SCHOOL"}' | jq

# Test E.5: POCKET_MONEY
echo "# Test E.5: POCKET_MONEY theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "POCKET_MONEY"}' | jq

# Test E.6: NATURE
echo "# Test E.6: NATURE theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "NATURE"}' | jq

# Test E.7: TRANSPORT
echo "# Test E.7: TRANSPORT theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "TRANSPORT"}' | jq

# Test E.8: COLLECTIONS
echo "# Test E.8: COLLECTIONS theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "COLLECTIONS"}' | jq

# Test E.9: HOUSEHOLD
echo "# Test E.9: HOUSEHOLD theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "HOUSEHOLD"}' | jq

# Test E.10: CELEBRATIONS
echo "# Test E.10: CELEBRATIONS theme"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "3.1", "format_preference": "DIRECT_CALCULATION", "scenario_theme": "CELEBRATIONS"}' | jq


# --- SUITE F: EDGE CASE AND ERROR HANDLING TESTS ---
echo ""
echo "--- SUITE F: EDGE CASE AND ERROR HANDLING TESTS ---"
echo "Testing invalid inputs and expected error responses..."

# Test F.1: Non-existent model_id
echo "# Test F.1: Request with a non-existent model_id"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "FOOBAR", "difficulty_level": "4.1"}' | jq

# Test F.2: Invalid difficulty_level
echo "# Test F.2: Request with an invalid difficulty_level"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "9.9"}' | jq

# Test F.3: Invalid format_preference
echo "# Test F.3: Request with an invalid format_preference"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "4.1", "format_preference": "INVALID_FORMAT"}' | jq

# Test F.4: Known broken model
echo "# Test F.4: Request with a dedicated broken model (TEST_BROKEN)"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "TEST_BROKEN", "difficulty_level": "6.1"}' | jq

# Test F.5: Quantity greater than 20
echo "# Test F.5: Request with a quantity greater than 20"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "ADDITION", "difficulty_level": "4.1", "quantity": 25}' | jq

# Test F.6: Missing required model_id field
echo "# Test F.6: Request missing the required model_id field"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"difficulty_level": "4.1"}' | jq


# --- SUITE G: BATCH GENERATION TESTS ---
echo ""
echo "--- SUITE G: BATCH GENERATION TESTS ---"
echo "Testing the ability to generate multiple questions in one request..."

# Test G.1: Request for 5 questions
echo "# Test G.1: Request a batch of 5 questions"
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"model_id": "SUBTRACTION", "difficulty_level": "3.3", "quantity": 5}' | jq


echo ""
echo "--- API TEST SUITE COMPLETE ---"
