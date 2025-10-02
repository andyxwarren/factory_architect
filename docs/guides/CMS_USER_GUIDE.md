# Factory Architect CMS User Guide

**Version**: 1.0
**Last Updated**: 2025-10-01
**Audience**: Educators, Content Managers, Question Curators

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Characters Management](#characters-management)
4. [Items Management](#items-management)
5. [Difficulty Parameters](#difficulty-parameters)
6. [Scenario Templates](#scenario-templates)
7. [Curated Mappings](#curated-mappings)
8. [Generate Questions](#generate-questions)
9. [Approval Queue](#approval-queue)
10. [Common Workflows](#common-workflows)
11. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Accessing the CMS

1. Open your web browser
2. Navigate to: `http://localhost:300  0/admin`
3. You'll see the Dashboard with an overview of your system

### Understanding the Interface

The CMS has three main areas:

**Left Sidebar** - Navigation menu with 8 sections:
- Dashboard (home)
- Difficulty Parameters
- Characters
- Items
- Scenario Templates
- Curated Mappings
- Generate Questions
- Approval Queue

**Top Bar** - Shows:
- Current page title
- Connection status (green dot = connected to database)
- Development mode indicator

**Main Content Area** - Where you'll work with your data

---

## Dashboard Overview

The Dashboard gives you a quick snapshot of your entire system.

### Stats Cards

Six cards show you what's in your database:

1. **Difficulty Parameters** - How many mathematical configurations you have
   - Example: "116 configuration records"
   - Click to manage difficulty settings

2. **Characters** - Names used in story problems
   - Example: "33 available characters"
   - These are people who appear in word problems

3. **Items** - Objects with prices for shopping scenarios
   - Example: "42 items with pricing"
   - Things like apples, notebooks, footballs

4. **Scenario Templates** - Story structures
   - Example: "19 story templates"
   - Reusable sentence patterns for questions

5. **Curated Mappings** - Connections between models and formats
   - Example: "188 Model→Format→Theme mappings"
   - Controls which question types appear for which math operations

6. **Generated Questions** - Questions created by the system
   - Example: "1 generated question (0 approved)"
   - Shows total and how many are approved

### Quick Actions

Three shortcut buttons for common tasks:

- **Generate New Questions** - Create questions immediately
- **Create New Mapping** - Set up new format/theme combinations
- **Review Questions** - Go to approval queue

---

## Characters Management

**Location**: `/admin/characters`

### What Are Characters?

Characters are people who appear in your math word problems. For example:
- "Sarah has 5 apples..."
- "Jack bought 3 notebooks..."
- "Emma saved £10..."

### Viewing Characters

The Characters page shows a table with:
- **Name** - The character's name (e.g., "Alex", "Emma")
- **Gender** - Neutral, Male, or Female (for pronoun usage)
- **Cultural Context** - Geographic/cultural setting (e.g., "UK", "US")
- **Status** - Active (green) or Inactive (gray)

### Search Function

At the top, there's a search box:
- Type any text to filter characters
- Searches across name, gender, and cultural context
- Click the X to clear your search

### Adding a New Character

1. Click the blue **"Add Character"** button (top right)
2. Fill in the form:
   - **Name** - Enter a first name (required)
   - **Gender** - Choose Neutral, Male, or Female
   - **Cultural Context** - Enter region (e.g., "UK")
   - **Active checkbox** - Checked = available for questions
3. Click **"Create"**

### Editing a Character

1. Find the character in the table
2. Click the pencil icon (✏️) on the right
3. Update the fields
4. Click **"Update"**

### Deleting a Character

1. Click the trash icon (🗑️) on the right
2. Confirm you want to delete
3. The character is permanently removed

### Toggle Active/Inactive

Click the green "Active" or gray "Inactive" badge to quickly enable/disable a character without editing.

**Pro Tip**: Keep characters inactive if you're not ready to use them yet. This prevents them from appearing in questions.

---

## Items Management

**Location**: `/admin/items`

### What Are Items?

Items are objects with prices used in shopping scenarios. Examples:
- "A notebook costs £2.50"
- "Apples are £1.20 per bag"
- "A football costs £15.99"

### Viewing Items

The Items page shows:
- **Name** - Item name (e.g., "Apple", "Notebook")
- **Category** - Type of item (Food, Toys, School Supplies, etc.)
- **Themes** - Blue badges showing which scenarios this item fits
- **Price Range** - Min, Typical, and Max prices in pounds (£)
- **Status** - Active or Inactive

### Search Function

Search across item names, categories, and themes. Example searches:
- "apple" - finds all apple-related items
- "school" - finds all school supplies
- "shopping" - finds all items tagged with SHOPPING theme

### Adding a New Item

1. Click **"Add Item"** (top right)
2. Fill in the form:

   **Name** (required)
   - Enter the item name (e.g., "Football")

   **Category** (required)
   - Choose from dropdown:
     - Food, Toys, School Supplies, Sports Equipment
     - Clothing, Electronics, Books, Household, Other

   **Themes** (required - at least one)
   - Click theme badges to select:
     - SHOPPING, SCHOOL, SPORTS, COOKING, POCKET_MONEY
     - TRANSPORT, COLLECTIONS, NATURE, HOUSEHOLD, CELEBRATIONS
   - Selected themes turn blue
   - Click again to deselect (X appears)

   **Prices** (required - in pounds £)
   - **Min Price** - Lowest realistic price (e.g., 0.99)
   - **Typical Price** - Most common price (e.g., 2.50)
   - **Max Price** - Highest realistic price (e.g., 5.00)
   - System validates: min ≤ typical ≤ max

   **Active checkbox**
   - Checked = can appear in questions

3. Click **"Create"**

### Understanding Themes

Themes control which scenarios an item appears in:
- **SHOPPING** - General shopping trips
- **SCHOOL** - School-related contexts
- **POCKET_MONEY** - Allowance and savings
- **COOKING** - Recipes and food prep

An item can have multiple themes. For example, "Apple" might have:
- SHOPPING (buy at store)
- COOKING (use in recipe)
- SCHOOL (snack at school)

### Price Range Best Practices

Set realistic prices for your region:
- Research actual UK prices if targeting UK curriculum
- Min Price: Sale/discount price
- Typical Price: Normal everyday price
- Max Price: Premium/specialty version

**Example: Notebook**
- Min: £0.50 (basic notebook on sale)
- Typical: £2.00 (standard notebook)
- Max: £5.00 (premium/specialty notebook)

---

## Difficulty Parameters

**Location**: `/admin/difficulty-parameters`

### What Are Difficulty Parameters?

These are the mathematical configurations that control how hard questions are. Each record defines the numbers and rules for a specific difficulty level.

For example, "ADDITION Year 1" might use:
```json
{
  "min": 1,
  "max": 10,
  "count": 2
}
```
This means: Add 2 numbers between 1 and 10.

### Viewing Parameters

The table shows:
- **Model ID** - Math operation (ADDITION, SUBTRACTION, MULTIPLICATION, etc.)
- **Difficulty Level** - Level code (e.g., "1", "2.1", "3.4")
- **Year Level** - UK curriculum year (1-6)
- **Parameters** - Click "View JSON" to see the configuration

### Expand/Collapse All Button

At the top right, you'll see:
- **"Expand All"** - Opens all JSON previews at once
- **"Collapse All"** - Closes all JSON previews

This is helpful when you want to scan through many configurations quickly.

### Filtering

Use the dropdown filters to narrow down what you see:
- **Model** - Show only ADDITION, MULTIPLICATION, etc.
- **Year Level** - Show only Year 1, Year 2, etc.

Filters combine - you can select both to see "ADDITION for Year 3" only.

### Viewing JSON Parameters

Each row has a "View JSON" / "Hide JSON" button. Click it to see the raw configuration data.

**Example JSON for ADDITION**:
```json
{
  "min": 1,
  "max": 20,
  "count": 3,
  "allow_negatives": false
}
```

**What the fields mean**:
- `min` - Smallest number to use
- `max` - Largest number to use
- `count` - How many numbers to add together
- `allow_negatives` - Can results be negative?

Different models have different fields. MULTIPLICATION might have:
```json
{
  "multiplicand_min": 2,
  "multiplicand_max": 10,
  "multiplier_min": 2,
  "multiplier_max": 5,
  "include_decimal": false
}
```

### Adding a New Parameter

1. Click **"Add Parameter"**
2. Fill in:
   - **Model ID** - Choose the math operation
   - **Difficulty Level** - Enter level code (e.g., "3.2")
   - **Year Level** - Enter year (1-6)
   - **Parameters (JSON)** - Enter the configuration
3. Click **"Create"**

**JSON Editor Tips**:
- The editor validates your JSON in real-time
- Invalid JSON shows a red error message
- Use proper JSON format with quotes and commas
- Refer to existing parameters for examples

### Editing Parameters

1. Click the pencil icon (✏️)
2. Modify the JSON
3. Click **"Update"**

**Warning**: Changing parameters affects all future questions generated at that difficulty level. Test thoroughly after changes.

### Difficulty Level Codes

The system supports two formats:

**Simple Format**: Just a number
- "1", "2", "3", "4", "5", "6"
- Maps directly to UK curriculum years

**Sub-Level Format**: X.Y where X = year, Y = sub-level
- "3.1" = Year 3, Introductory
- "3.2" = Year 3, Developing
- "3.3" = Year 3, Standard
- "3.4" = Year 3, Advanced

Sub-levels give you fine-grained control over difficulty progression.

---

## Scenario Templates

**Location**: `/admin/scenario-templates`

### What Are Scenario Templates?

Templates are fill-in-the-blank sentence patterns that turn math into stories. For example:

**Template**:
```
{character} went to the {location} and bought {item} for {price}.
```

**Becomes**:
```
Sarah went to the shop and bought a notebook for £2.50.
```

### Viewing Templates

The table shows:
- **Theme** - Context type (SHOPPING, SCHOOL, SPORTS, etc.)
- **Format** - Question type (DIRECT_CALCULATION, COMPARISON, etc.)
- **Template Text** - The sentence pattern (truncated if long)
- **Placeholders** - Variables in the template (shows first 3)
- **Status** - Active or Inactive

### Filtering

Use dropdowns to filter by:
- **Theme** - Show only SHOPPING templates
- **Format** - Show only COMPARISON templates

### Previewing Templates

Click the eye icon (👁️) to see:
- Full template text
- All placeholders
- Example with sample data filled in

This helps you visualize how the template will look in actual questions.

### Adding a New Template

1. Click **"Add Template"**
2. Fill in the form:

   **Theme** (required)
   - Choose from dropdown: SHOPPING, SCHOOL, SPORTS, etc.

   **Format** (required)
   - Choose question type:
     - DIRECT_CALCULATION - "What is 5 + 3?"
     - COMPARISON - "Which costs more?"
     - ESTIMATION - "About how many?"
     - VALIDATION - "Is this correct?"
     - MULTI_STEP - Multiple calculations needed
     - MISSING_VALUE - "Find the unknown"
     - ORDERING - "Put in order"
     - PATTERN_RECOGNITION - "What comes next?"

   **Template Text** (required)
   - Write your sentence pattern
   - Use curly braces for variables: `{character}`, `{item}`, `{price}`

   **Placeholders**
   - Type a placeholder name and click "Add"
   - These must match the `{braces}` in your template
   - Click X on a tag to remove it

   **Active checkbox**
   - Checked = can be used for questions

3. Click **"Create"**

### Template Writing Guidelines

**Good Template**:
```
{character} bought {count} {item}s at {price} each. How much did {character} spend in total?
```

**Placeholders**: character, count, item, price

**Why it's good**:
- Clear question structure
- Multiple placeholders for variety
- Natural language flow
- Appropriate for the format

**Poor Template**:
```
Person buys things. How much?
```

**Why it's poor**:
- Too vague
- No placeholders (no variety)
- Unclear question
- Not engaging

### Common Placeholders

Standard placeholders you should use:
- `{character}` - Person's name
- `{item}` - Object name
- `{price}` - Cost in pounds
- `{quantity}` or `{count}` - How many
- `{location}` - Where (shop, school, park)
- `{total}` - Sum amount
- `{change}` - Money returned

**Pro Tip**: Use consistent placeholder names across templates. This makes the system work better.

### Format-Specific Templates

Different formats need different template structures:

**DIRECT_CALCULATION**:
- State the problem clearly
- Ask for a specific calculation
- Example: "{character} has {value1} and gets {value2} more. How many in total?"

**COMPARISON**:
- Present two options
- Ask which is better/more/less
- Example: "{item1} costs {price1} and {item2} costs {price2}. Which is cheaper?"

**VALIDATION**:
- Show a statement
- Ask if it's correct
- Example: "{character} says {value1} + {value2} = {result}. Is this correct?"

---

## Curated Mappings

**Location**: `/admin/curated-mappings`

### What Are Curated Mappings?

Mappings connect three things:
1. **Math Model** - The operation (ADDITION, MULTIPLICATION, etc.)
2. **Format** - The question type (DIRECT_CALCULATION, COMPARISON, etc.)
3. **Theme** - The story context (SHOPPING, SCHOOL, etc.)

They also link to a **Difficulty Parameter** and have a **Weight**.

**Example Mapping**:
- Model: ADDITION
- Difficulty: Year 2 (level "2")
- Format: DIRECT_CALCULATION
- Theme: SHOPPING
- Weight: 1.0

This means: "For Year 2 addition, we can generate direct calculation questions with shopping themes."

### Why Mappings Matter

Mappings control **what questions are possible**. Without a mapping:
- The system won't generate that combination
- Even if you have templates and characters, no questions appear

Think of mappings as "permission slips" - they tell the system:
"Yes, you're allowed to make ADDITION SHOPPING questions for Year 2."

### Viewing Mappings

The table shows:
- **Model** - Math operation
- **Difficulty** - Level and year in parentheses
- **Format** - Question type
- **Theme** - Story context
- **Weight** - Selection probability (0-10)
- **Status** - Active or Inactive

### Filtering

Three dropdown filters help you find mappings:
- **Model** - e.g., show only ADDITION
- **Format** - e.g., show only COMPARISON
- **Theme** - e.g., show only SHOPPING

Use combinations: "Show me all MULTIPLICATION SPORTS questions"

### Understanding Weight

Weight affects how often a mapping is chosen:
- **1.0** - Normal probability (default)
- **2.0** - Twice as likely to be selected
- **0.5** - Half as likely to be selected
- **10.0** - Very high priority
- **0.1** - Rarely selected

**Use Case**: You want more SHOPPING questions than NATURE questions for ADDITION. Give SHOPPING a weight of 2.0 and NATURE a weight of 0.5.

### Adding a Mapping Manually

1. Click **"Add Mapping"**
2. Fill in the form:

   **Model** (required)
   - Choose math operation

   **Difficulty Parameter** (required)
   - Dropdown shows parameters for your selected model
   - Shows level and year: "2 (Year 2)"
   - If empty: Create difficulty parameters first!

   **Format** (required)
   - Choose question type

   **Theme** (required)
   - Choose story context

   **Weight** (required)
   - Enter 0-10 (decimals allowed)
   - Default: 1.0

   **Active checkbox**
   - Checked = mapping is used

3. Click **"Create"**

**Common Error**: "No difficulty parameters found for ADDITION"
- **Solution**: Go to Difficulty Parameters page first
- Add parameters for that model
- Then return to create mappings

### Bulk Generate Mappings

Instead of creating mappings one by one, use bulk generation:

1. Click **"Bulk Generate"** button (top right)
2. Choose a **Model ID** (e.g., ADDITION)
3. Read the preview:
   - "Creates default mappings for all difficulty parameters"
   - "Uses DIRECT_CALCULATION format and SHOPPING theme"
   - "Weight set to 1.0"
   - "Skips existing mappings (no duplicates)"
4. Click **"Generate Mappings"**
5. Success message shows how many were created

**When to Use Bulk Generate**:
- Setting up a new math model
- You want standard SHOPPING questions for all difficulties
- Quick way to ensure every difficulty level has at least one mapping

**After Bulk Generate**:
- Edit individual mappings to change formats and themes
- Adjust weights based on your preferences
- Add additional mappings for variety

### Best Practices

**Coverage**:
- Each difficulty level should have at least 2-3 mappings
- Mix formats (not all DIRECT_CALCULATION)
- Mix themes (not all SHOPPING)

**Variety Example for Year 3 Addition**:
- Mapping 1: DIRECT_CALCULATION + SHOPPING (weight 2.0)
- Mapping 2: COMPARISON + POCKET_MONEY (weight 1.0)
- Mapping 3: VALIDATION + SCHOOL (weight 1.0)
- Mapping 4: MULTI_STEP + COOKING (weight 0.5)

This gives variety while favoring shopping scenarios.

**Testing**:
After creating mappings, go to **Generate Questions** and test:
- Generate 10-20 questions for that model
- Check if variety matches your expectations
- Adjust weights if needed

---

## Generate Questions

**Location**: `/admin/generate`

### What Is Question Generation?

This is where the magic happens! The system uses everything you've set up to create actual math questions.

### The Generation Form

At the top of the page, you'll see a form with settings:

**Model** (required)
- Choose which math operation
- Example: ADDITION, MULTIPLICATION, DIVISION

**Difficulty Level** (optional)
- Enter a specific level (e.g., "3.2") OR
- Leave blank for random difficulty

**Format Preference** (optional)
- Choose specific format (DIRECT_CALCULATION, COMPARISON, etc.) OR
- Leave as "Random" to let system choose

**Scenario Theme** (optional)
- Choose specific theme (SHOPPING, SCHOOL, etc.) OR
- Leave as "Random" to let system choose

**Number of Questions**
- How many to generate (1-20)
- Default: 1

**Save to Database** (checkbox)
- Checked = questions saved to database (recommended)
- Unchecked = preview only, not saved

**Auto-Approve** (checkbox)
- Only enabled if "Save to Database" is checked
- Checked = questions immediately approved (skip review)
- Unchecked = questions go to Approval Queue (recommended)

### Generating Questions

1. Configure your settings (or use defaults)
2. Click the blue **"Generate Questions"** button
3. Loading spinner appears: "Generating X question(s)..."
4. Results appear below

### Understanding the Results

Each generated question shows:

**Question Card** (one per question):
- Question number (Question 1, Question 2, etc.)
- Question ID (first 8 characters)
- Full question text
- Correct answer (green box)
- Distractors / wrong answers (red boxes)
- Reasoning explanation (blue box)
- Model, Difficulty, Format, Theme
- Full metadata (expandable JSON)

**Example Question**:
```
Question: Sarah has 5 apples and Jack gives her 3 more. How many apples does Sarah have now?

Correct Answer: 8

Distractors:
- 2 (subtraction error)
- 15 (multiplication error)
- 7 (counting error)

Reasoning: This is a simple addition problem. Start with 5, add 3, equals 8.

Model: ADDITION
Difficulty: 2
Format: DIRECT_CALCULATION
Theme: SHOPPING
```

### Action Buttons

After generation, you see:

**Export JSON**
- Downloads questions as JSON file
- Filename: `questions-{timestamp}.json`
- Use for importing into other systems

**Reset**
- Clears all generated questions
- Lets you start fresh

### Generation Tips

**Start Small**:
- Generate 1-2 questions first
- Check quality
- Adjust settings if needed
- Then generate more

**Testing Different Combinations**:
Try generating with:
- Different formats
- Different themes
- Different difficulty levels

This helps you understand what your data produces.

**Quality Issues**:
If questions seem wrong:
1. Check your difficulty parameters (are numbers reasonable?)
2. Check your templates (are placeholders correct?)
3. Check your mappings (do they exist for this combination?)

**Save vs. Auto-Approve**:
- During setup/testing: **Don't auto-approve**
- Review questions in Approval Queue first
- Once confident: **Auto-approve** for speed

---

## Approval Queue

**Location**: `/admin/approval-queue`

### What Is the Approval Queue?

This is where questions wait for review before being published. It's your quality control checkpoint.

The page shows how many questions are pending: "X questions pending approval"

### Viewing Questions

The table shows abbreviated information:
- **Checkbox** - Select for batch actions
- **Question** - Text truncated if long
- **Model** - Math operation
- **Difficulty** - Level
- **Format** - Question type

### Filtering Questions

Three dropdown filters at the top:
- **Model** - Show only ADDITION, MULTIPLICATION, etc.
- **Format** - Show only DIRECT_CALCULATION, COMPARISON, etc.
- **Theme** - Show only SHOPPING, SCHOOL, etc.

Use filters to review similar questions together.

### Previewing a Question

Click the eye icon (👁️) to see full details:
- Complete question text
- Correct answer
- All distractors
- Reasoning
- Model, difficulty, format, theme
- Full metadata

This opens a modal dialog. Click "Close" or outside to dismiss.

### Approving Questions

**Single Question**:
1. Find the question in the table
2. Click the green checkmark icon (✓)
3. Question is approved and removed from queue

**Batch Approve**:
1. Check boxes next to questions you want to approve
2. Or check the header checkbox to select all visible questions
3. Green "Approve X" button appears at top
4. Click it to approve all selected questions at once

### Rejecting Questions

**Single Question**:
1. Click the red X icon
2. Confirmation dialog appears: "Are you sure?"
3. Click "Delete" to permanently remove the question

**Batch Reject**:
1. Select multiple questions with checkboxes
2. Red "Reject X" button appears at top
3. Click it
4. Confirm: "Are you sure you want to reject X questions?"
5. All selected questions are permanently deleted

**Warning**: Rejecting deletes questions permanently. There's no undo.

### When to Approve

Approve questions that:
- Have correct math
- Use proper grammar
- Make logical sense
- Have appropriate difficulty
- Have sensible distractors (wrong answers that reflect common mistakes)

### When to Reject

Reject questions that:
- Have math errors
- Use awkward/confusing wording
- Don't make sense in context
- Are too easy or too hard for the stated level
- Have unrealistic scenarios (e.g., "Buy 1000 apples")
- Have distractors that don't relate to common errors

### Review Workflow

Efficient workflow for reviewing many questions:

1. **Filter by Model** - Review all ADDITION questions together
2. **Preview Each** - Open preview to check quality
3. **Select Good Ones** - Check boxes for acceptable questions
4. **Batch Approve** - Approve all at once
5. **Reject Bad Ones** - Individually reject poor questions
6. **Move to Next Model** - Repeat for MULTIPLICATION, etc.

### Empty State

When queue is empty, you'll see:
"No questions pending approval. All generated questions have been reviewed."

This means:
- Either no questions have been generated yet, OR
- All questions have been approved/rejected

---

## Common Workflows

### Workflow 1: Creating Your First Question

**Goal**: Generate a single question to test the system.

**Steps**:
1. **Go to Generate Questions** (`/admin/generate`)
2. Select settings:
   - Model: ADDITION
   - Difficulty Level: (leave blank)
   - Format: Random
   - Theme: Random
   - Count: 1
   - Save to Database: ✓ (checked)
   - Auto-Approve: ✗ (unchecked)
3. Click **"Generate Questions"**
4. Review the generated question card
5. Go to **Approval Queue** (`/admin/approval-queue`)
6. Find your question
7. Click eye icon (👁️) to preview
8. If good, click green checkmark (✓) to approve
9. Question is now approved and ready to use

**What This Tests**:
- Your database is set up correctly
- Mappings exist for ADDITION
- System can generate and save questions
- Approval workflow works

### Workflow 2: Setting Up a New Math Model

**Goal**: Configure everything needed for MULTIPLICATION questions.

**Steps**:

**Step 1: Add Difficulty Parameters**
1. Go to **Difficulty Parameters** (`/admin/difficulty-parameters`)
2. For each year level (1-6), create a parameter:
   - Click "Add Parameter"
   - Model: MULTIPLICATION
   - Difficulty Level: "1", "2", "3", etc.
   - Year Level: 1, 2, 3, etc.
   - Parameters JSON:
     ```json
     {
       "multiplicand_min": 2,
       "multiplicand_max": 5,
       "multiplier_min": 2,
       "multiplier_max": 5
     }
     ```
   - Adjust ranges for each year
3. Create all 6 parameters (Year 1 through Year 6)

**Step 2: Create Mappings**
1. Go to **Curated Mappings** (`/admin/curated-mappings`)
2. Click **"Bulk Generate"**
3. Select Model: MULTIPLICATION
4. Click **"Generate Mappings"**
5. This creates basic mappings for all difficulty levels

**Step 3: Add Variety**
1. Still in Curated Mappings
2. Click "Add Mapping" manually several times
3. Create diverse combinations:
   - MULTIPLICATION + COMPARISON + SCHOOL
   - MULTIPLICATION + VALIDATION + SPORTS
   - MULTIPLICATION + MISSING_VALUE + SHOPPING
4. Set different weights (1.0, 2.0, 0.5) for variety

**Step 4: Test**
1. Go to **Generate Questions**
2. Model: MULTIPLICATION
3. Count: 10
4. Generate and review results
5. Check for variety in formats and themes

**Step 5: Refine**
Based on testing:
- Adjust difficulty parameters if questions are too easy/hard
- Add more mappings for missing format/theme combinations
- Adjust weights if variety is unbalanced

### Workflow 3: Bulk Reviewing Questions

**Goal**: Efficiently review 50 generated questions.

**Steps**:
1. Go to **Approval Queue**
2. **Filter by Model**: Select "ADDITION"
3. **Scan Table**: Look at questions
4. **Select Good Questions**:
   - Check boxes for obvious good ones
   - Skip any you're unsure about
5. **Batch Approve**: Click "Approve X" button
6. **Review Remaining One-by-One**:
   - Click eye icon (👁️) to preview
   - Approve (✓) or Reject (✗) each
7. **Change Filter**: Select "MULTIPLICATION"
8. Repeat steps 3-7
9. Continue until all models reviewed

**Time-Saving Tips**:
- Don't preview every question if patterns are obvious
- Batch approve similar questions
- Reject obviously bad ones immediately
- Take breaks to avoid fatigue/errors

### Workflow 4: Customizing Characters and Items

**Goal**: Add culturally relevant characters and items.

**Example: Adding Irish Cultural Elements**

**Characters**:
1. Go to **Characters** (`/admin/characters`)
2. Add Irish names:
   - Aoife (Female, Ireland)
   - Cian (Male, Ireland)
   - Saoirse (Female, Ireland)
   - Liam (Male, Ireland)
3. Set Cultural Context: "Ireland"

**Items**:
1. Go to **Items** (`/admin/items`)
2. Add Irish items:
   - Tayto Crisps (Food, €1.00-€2.00)
   - GAA Jersey (Clothing, €30-€60)
   - Irish Soda Bread (Food, €2.50-€4.00)
3. Tag with appropriate themes

**Test**:
1. Generate questions
2. Verify Irish elements appear
3. Check if contexts feel appropriate

### Workflow 5: Adjusting Question Difficulty

**Goal**: Make Year 3 ADDITION harder.

**Current State**: Questions feel too easy.

**Steps**:
1. Go to **Difficulty Parameters**
2. Filter:
   - Model: ADDITION
   - Year Level: 3
3. Find the Year 3 parameter
4. Click pencil icon (✏️) to edit
5. View current JSON:
   ```json
   {
     "min": 1,
     "max": 20,
     "count": 2
   }
   ```
6. Increase difficulty:
   ```json
   {
     "min": 10,
     "max": 50,
     "count": 3
   }
   ```
7. Click "Update"
8. Test: Generate new Year 3 ADDITION questions
9. Review: Are they appropriately harder?
10. Adjust again if needed

---

## Tips & Best Practices

### Search Functionality

**Characters Page**:
- Search finds matches in name, gender, and cultural context
- Example: "UK" shows all UK characters
- Example: "female" shows all female characters

**Items Page**:
- Searches name, category, AND themes
- Example: "school" finds items tagged with SCHOOL theme
- Example: "food" finds items in Food category

**Pro Tip**: Use partial words. "shop" finds "SHOPPING", "shopkeeper", etc.

### Using Filters Effectively

**Combine Filters**:
Don't just use one filter - combine them!
- Difficulty Parameters: Model=ADDITION + Year=3
- Curated Mappings: Model=MULTIPLICATION + Format=COMPARISON + Theme=SPORTS

**Clear Filters**:
Reset filters by selecting "All Models", "All Years", etc.

### Understanding Table Counts

At bottom of most tables: "Showing X of Y records"
- X = Filtered results
- Y = Total records

If X < Y, you have filters active.

### Active vs. Inactive

Every entity has an Active/Inactive toggle:
- **Active** = Currently used by the system
- **Inactive** = Exists in database but not used

**Use Cases for Inactive**:
- Testing new items before making them live
- Temporarily removing problematic characters
- Seasonal items (make inactive when not relevant)

### JSON Editing

When editing parameters or metadata:
- Copy existing JSON as a starting point
- Validate syntax (editor shows errors)
- Test after changes
- Document what each field does (add comments in your notes)

### Backup Strategy

Before major changes:
1. Export current questions as JSON
2. Take note of current configuration
3. Make changes
4. If problems occur, you can restore

### Performance Tips

**Large Tables**:
- Use filters to reduce visible rows
- Search to find specific records
- Don't expand all JSON at once (use Expand All sparingly)

**Batch Operations**:
- Select reasonable batches (10-50 questions)
- Don't select 1000 questions at once
- Process in chunks for reliability

### Common Mistakes to Avoid

**Mistake 1**: Creating mappings without difficulty parameters
- **Fix**: Always create difficulty parameters first

**Mistake 2**: No variety in mappings
- **Symptom**: All questions look the same
- **Fix**: Add mappings with different formats and themes

**Mistake 3**: Unrealistic prices for items
- **Symptom**: Questions about £100 apples
- **Fix**: Research actual prices, set realistic ranges

**Mistake 4**: Auto-approving during testing
- **Symptom**: Database fills with bad questions
- **Fix**: Use approval queue until system is mature

**Mistake 5**: Not using weights
- **Symptom**: Unbalanced question distribution
- **Fix**: Adjust weights to favor desired combinations

**Mistake 6**: Inconsistent placeholder names
- **Symptom**: Templates don't work with scenarios
- **Fix**: Use standard placeholders: {character}, {item}, {price}

### Quality Checklist

Before approving questions, check:
- [ ] Math is correct
- [ ] Grammar is proper
- [ ] Context makes sense
- [ ] Difficulty matches level
- [ ] Distractors are plausible
- [ ] No awkward phrasing
- [ ] Appropriate for target age

### Getting Help

**Common Issues**:

**"No mappings found"**
- Go to Curated Mappings
- Create mappings for that model + difficulty

**"No templates found"**
- Go to Scenario Templates
- Create templates for that format + theme

**"Invalid JSON"**
- Check for missing commas
- Check for missing quotes
- Use online JSON validator

**"Questions too easy/hard"**
- Go to Difficulty Parameters
- Adjust min/max ranges
- Test again

**"Not enough variety"**
- Go to Curated Mappings
- Add more format/theme combinations
- Adjust weights

---

## Quick Reference

### Page Summary

| Page | Purpose | Key Actions |
|------|---------|-------------|
| Dashboard | Overview | View stats, access quick links |
| Characters | Manage names | Add/edit people for stories |
| Items | Manage objects | Add/edit items with prices |
| Difficulty Parameters | Control math difficulty | Configure number ranges |
| Scenario Templates | Story patterns | Create sentence templates |
| Curated Mappings | Connect everything | Link models to formats/themes |
| Generate Questions | Create questions | Generate new questions |
| Approval Queue | Review questions | Approve or reject |

### Keyboard Shortcuts

- **Enter** in search box - Starts search
- **Esc** - Closes dialogs/modals
- **Tab** - Navigate between form fields

### Status Indicators

- **Green dot** - Connected to database
- **Green badge** - Active/Approved
- **Gray badge** - Inactive
- **Red text** - Error or deletion
- **Blue text** - Link or action

### File Locations

If you need technical details:
- Code: `/app/admin/` and `/components/admin/`
- Actions: `/lib/actions/`
- Database: Supabase dashboard
- Migrations: `/supabase/migrations/`

---

## Appendix: Model-Specific Parameters

### ADDITION Parameters

```json
{
  "min": 1,              // Smallest number
  "max": 100,            // Largest number
  "count": 2,            // How many numbers to add
  "allow_negatives": false
}
```

### MULTIPLICATION Parameters

```json
{
  "multiplicand_min": 2,
  "multiplicand_max": 10,
  "multiplier_min": 2,
  "multiplier_max": 5,
  "include_decimal": false
}
```

### PERCENTAGE Parameters

```json
{
  "base_min": 10,
  "base_max": 100,
  "percentage_min": 10,
  "percentage_max": 50,
  "allow_decimal": true
}
```

### FRACTION Parameters

```json
{
  "numerator_min": 1,
  "numerator_max": 10,
  "denominator_min": 2,
  "denominator_max": 12,
  "simplify": true
}
```

---

**End of Guide**

For technical documentation, see:
- `docs/implementation/ENHANCED_QUESTION_SYSTEM.md`
- `docs/architecture/SYSTEM_ARCHITECTURE.md`

For setup instructions, see:
- `SUPABASE_IMPLEMENTATION_GUIDE.md`
- `RESET_DATABASE.md`

Version 1.0 - Last Updated: 2025-10-01
