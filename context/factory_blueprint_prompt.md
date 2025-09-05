You are an expert curriculum designer and senior software architect specializing in educational technology. You have a deep understanding of the UK National Curriculum for Mathematics and extensive experience designing logic for programmatic, abstract content generation.

**My Objective:**

I am building a TypeScript-based question generator. I need a comprehensive architectural blueprint for the **"Math Engine"** component. The core architectural principle is the strict **separation of mathematical logic from narrative context**.

**The Architectural Vision:**

*   The **Math Engine** must be a collection of pure, abstract, and **atomic mathematical models**. These models operate only on numbers and logical parameters. They are completely unaware of "money," "kilograms," or any other real-world context.
*   The **Story Engine** (a separate component) will consume the output from the Math Engine and apply contextual variables (like `currency_symbol`, `item_noun`, etc.) to create a final, human-readable word problem.
*   The difficulty of questions must be incrementally adjustable by manipulating the numerical parameters of each model.

**Your Mission:**

Your mission is to analyze the provided curriculum data and example questions to define a set of these atomic **Mathematical Models**. Your blueprint must be so clear and well-defined that a developer could implement it directly with minimal ambiguity.

**Core Instructions:**

For each abstract **Mathematical Model** you identify, you must provide the following:

1.  **`model_id`**: A unique, machine-friendly identifier (e.g., `ADDITION`, `SUBTRACTION`, `LINEAR_EQUATION`).
2.  **`core_mathematical_operation`**: A concise description of the pure mathematical skill the model represents (e.g., "Summing an array of numbers," "Evaluating a `y = mx + c` function").
3.  **`difficulty_parameters`**: The specific, named **numerical and logical variables** that the Math Engine would use to control the difficulty. This is the most critical part.
4.  **`progression_logic`**: A clear, tiered explanation of how to manipulate the `difficulty_parameters` to scale complexity from Year 1 to Year 6.
5.  **`json_output_contract`**: A clear example of the JSON data structure that this model should output. This serves as a "contract" for the Story Engine, showing the model's solution and key calculated values.
6.  **`required_context_variables`**: A list of the placeholder variables the Story Engine would need to provide to wrap the pure math in a story.
7.  **`example_mapping`**: Deconstruct one of the provided example questions, showing the `difficulty_parameters` passed to the Math Engine and the `context_variables` used by the Story Engine.

**Architectural Constraints (Please follow these strictly):**

*   **Atomicity is Key:** Each of the four basic arithmetic operations (`ADDITION`, `SUBTRACTION`, `MULTIPLICATION`, `DIVISION`) must be its own separate, atomic model. Do not bundle them into one "basic arithmetic" group.
*   **Create a `MULTI_STEP` Model:** Define a specific model for sequencing the atomic models. Its parameters should include a sequence of operations to perform (e.g., `[{model: 'MULTIPLICATION', params: {...}}, {model: 'SUBTRACTION', params: {...}}]`).
*   **Include `LINEAR_EQUATION`:** Ensure you define a distinct model for linear equations (`y = mx + c`), as seen in problems like taxi fares.
*   **Exclude Pre-Math Operations:** Do not create models for simple `VALUE_RECOGNITION` or `COMPARISON`. These can be considered utility functions within the Story Engine or other models. The focus must be on models that perform a **calculation**.

**Input Data:**

Here is the relevant curriculum information and the example questions you must use for your analysis.

**--- START OF RELEVANT CURRICULUM DATA (MEASUREMENT STRAND) ---**

```json
[
  {
    "Strand": "Measurement",
    "Substrand": "money",
    "Years": {
      "Year 1": "recognise and know the value of different denominations of coins and notes",
      "Year 2": "recognise and use symbols for pounds (£) and pence (p); combine amounts to make a particular value; find different combinations of coins that equal the same amounts of money",
      "Year 3": "Key stage 1 content domain"
    }
  },
  {
    "Strand": "Measurement",
    "Substrand": "solve problems (a, money; b, length; c, mass / weight; d, capacity / volume)",
    "Years": {
      "Year 2": "solve simple problems in a practical context involving addition and subtraction of money of the same unit, including giving change",
      "Year 3": "add and subtract amounts of money to give change, using both pounds (£) and pence (p) in practical contexts",
      "Year 4": "calculate different measures, including money in pounds and pence",
      "Year 5": "use all four operations to solve problems involving measures [money] using decimal notation, including scaling",
      "Year 6": "solve problems involving the calculation and conversion of units of measure, using decimal notation up to three decimal places where appropriate"
    }
  }
]
```

**--- END OF CURRICULUM DATA ---**

**--- START OF EXAMPLE MONEY QUESTIONS (Years 1-6) ---**

```
  "money": {
    "Year 1": [
      "What is the value of a 10p coin?",
      "Which is worth more, a 2p coin or a 5p coin?",
      "Can you name all the UK coins?",
      "If you have a 1p, 2p, and 5p coin, how much money do you have altogether?",
      "I have a coin that is silver and has seven sides. What coin is it?",
      "How many 1p coins do you need to make 5p?",
      "Can you find a coin that is brown? What is its value?",
      "I have two 10p coins. How much money do I have?",
      "Which note has the lowest value? (£5, £10, £20).",
      "Is a 50p coin worth more or less than a £1 coin?",
      "If I have three 2p coins, how much do I have?",
      "Name a coin that is gold and silver.",
      "What is the colour of a £10 note?",
      "How many 5p coins are worth the same as a 20p coin?",
      "I have a £2 coin and a £1 coin. How much money do I have?",
      "Find two coins that add up to 3p.",
      "What coin has 12 sides?",
      "How many 1p coins are in a £1 coin?",
      "If I have a 20p coin and a 5p coin, do I have more or less than 22p?",
      "Can you show me 8p using exactly three coins?",
      "Name all the silver coins.",
      "What is the value of a £20 note?",
      "If I have two 50p coins, how much money do I have?",
      "Find three coins that add up to 16p.",
      "Which is worth more: four 1p coins or one 5p coin?",
      "What coin is small, silver and round?",
      "How many 1p coins make 10p?",
      "If you have a 5p coin and a 2p coin, how much do you have?",
      "Which is worth less: a £5 note or a £10 note?",
      "Can you find two coins that have the same value?",
      "What is the biggest coin in size?",
      "I have a 10p coin and a 5p coin. How much money is that?",
      "Name a bank note that is orange.",
      "How many 2p coins make 10p?",
      "What is the total value of a 50p coin and a 10p coin?",
      "Find a coin that is worth 100 pennies.",
      "If I have four 1p coins, how much do I have?",
      "Which is worth more: a 50p coin or three 10p coins?",
      "What is the value of the coin with two colours?",
      "How many 5p coins make 15p?",
      "I have a 20p coin and a 2p coin. How much is that?",
      "Which coin is worth the most?",
      "Which bank note is worth the least?",
      "If I have a £1 coin and a 10p coin, do I have more than 105p?",
      "Show me 6p using the smallest number of coins.",
      "How much is a 1p, a 2p and another 1p coin altogether?",
      "What is the shape of a 20p coin?",
      "How many 10p coins are equal to a 50p coin?",
      "Can you add a 50p coin and a £1 coin?",
      "Which is worth less: a 2p coin or a 1p coin?"
    ],
    "Year 2": [
      "How many 10p coins make £1?",
      "If you buy a comic for 60p and pay with a £1 coin, how much change will you get?",
      "Sophie buys a cake for 35p and a drink for 25p. How much does she spend altogether?",
      "Write down two different ways to make 20p using coins.",
      "What do the symbols £ and p stand for?",
      "A pen costs 45p. Which coins could you use to pay for it exactly?",
      "You have £1 and spend 70p. How much change do you get?",
      "How much is two £5 notes and three £1 coins?",
      "Find the total of £2, 50p, and 5p.",
      "Show three ways to make 50p.",
      "If you save 10p every day for a week, how much will you have?",
      "An ice cream costs 85p. You pay with a £1 coin. What is your change?",
      "Which costs more, a comic for £1.50 or a book for £1.25?",
      "How many 20p coins do you need to make £2?",
      "Sarah has £5. She buys a magazine for £2.50. How much is left?",
      "Add these amounts: £3 and 40p + £1 and 20p.",
      "What is the difference between £10 and £6.50?",
      "A bus ticket is 90p. How much for two tickets?",
      "Can you buy a toy for £3.75 if you have a £5 note?",
      "I have three 50p coins and two 20p coins. How much money is that?",
      "How much more do I need to make £1 if I have 65p?",
      "A rubber costs 15p. A ruler costs 25p. How much for both?",
      "Find the value of one £10 note, one £5 note, and three £2 coins.",
      "If I share £2 equally between two people, how much do they get each?",
      "I buy a drink for 65p and crisps for 55p. How much have I spent?",
      "Tom has a 50p coin and three 10p coins. How much money does he have?",
      "A banana costs 30p. An apple costs 25p. How much for one of each?",
      "How can you make 75p using exactly three coins?",
      "I have £1 and buy a chocolate bar for 55p. What change will I receive?",
      "How many 5p coins are in 50p?",
      "Lily has two 20p coins and one 5p coin. Does she have enough to buy a comic for 40p?",
      "Find the total of a £1 coin, a 50p coin, and a 5p coin.",
      "Show £1.50 using the smallest number of coins.",
      "If I have three 20p coins, how much more do I need to make £1?",
      "A toy car costs £1.20. A toy boat costs £1.50. What is the difference in price?",
      "How many £2 coins are there in £10?",
      "Sam wants to buy a book for £5. He has saved £3.50. How much more does he need?",
      "Add together 45p and 35p.",
      "Can you make 37p using UK coins?",
      "I pay for a 70p item with a £2 coin. How much change do I get?",
      "What is the total of a £5 note and a £10 note?",
      "A pack of stickers costs 80p. How much would 2 packs cost?",
      "How would you write one pound and five pence using the £ symbol?",
      "If I have two 50p coins and I spend 80p, how much do I have left?",
      "Find three coins that total 26p.",
      "How many 50p coins make £3.00?",
      "Which is more money: four 20p coins or three 50p coins?",
      "A cup of juice is 40p. A biscuit is 15p. How much for both?",
      "What is double £1.25?",
      "Show how to make £2.35 using four coins."
    ],
    "Year 3": [
      "A computer game costs £15. You have saved £8.50. How much more do you need?",
      "Calculate the change from £10 for items costing £3.40 and £2.80.",
      "Three friends share the cost of a pizza that is £9.60. How much do they each pay?",
      "A cinema ticket costs £4.75. How much would it cost for a family of four?",
      "Find the total cost of a book at £6.99 and a pen at £1.25.",
      "How much is five £2 coins, three 50p coins, and seven 5p coins?",
      "I bought two items for £5.60. One cost £2.90. What did the other one cost?",
      "A weekly bus pass costs £12.50. How much would four weeks cost?",
      "A sandwich costs £2.80, a drink 95p, and a cake £1.50. What is the total?",
      "If I have a £20 note, can I buy three books that cost £6 each? What change will I get?",
      "Find half of £7.50.",
      "I have a mixture of 8 coins in my pocket worth 97p. What could they be?",
      "What is the difference in price between a £12.99 toy and a £17.50 toy?",
      "A school trip costs £14 per child. How much for 10 children?",
      "Find 1/4 of £20.",
      "I bought 5 pens for 40p each. How much did I spend in total?",
      "A meal costs £23.70. How much change is there from a £50 note?",
      "If I save £3 a week, how long will it take to save for a bike that costs £36?",
      "A DVD costs £8.99. A Blu-ray costs £11.49. How much more is the Blu-ray?",
      "Add up these amounts: £10.60, £5.80 and £3.20.",
      "A t-shirt costs £5.50 and a pair of shorts costs £4.75. How much do they cost altogether?",
      "A pack of pens costs £2.40. There are 6 pens in the pack. What is the cost per pen?",
      "A café sells coffee for £2.60 and tea for £1.90. How much more does the coffee cost?",
      "If I pay for a £2.80 magazine with a £5 note, how much change will I get?",
      "I buy a book for £4.80 and pay with a £10 note. What is my change?",
      "A football costs £8.25. A pump costs £3.99. What is the total cost?",
      "How much change would you get from a £10 note if you spent £6.35?",
      "If 4 children share £10 equally, how much does each child get?",
      "A swimming lesson costs £6.50. How much would 5 lessons cost?",
      "Find the sum of £12.45 and £7.80.",
      "I have £15. I buy a DVD for £8.99. How much money is left?",
      "A train ticket costs £22.50. How much would it cost for 3 people?",
      "Convert 350p into pounds and pence.",
      "A family meal costs £34.60. They pay with two £20 notes. What is their change?",
      "What is £10 minus £4.72?",
      "If I save £1.50 each week, how much will I save in 6 weeks?",
      "A jacket costs £25. It is in a sale with £5.50 off. What is the new price?",
      "Find the cost of 10 stamps if one stamp costs 65p.",
      "Add £3.45, £2.99 and £1.50 together.",
      "A book costs £7.49. How much change from £20?",
      "If a pack of 8 batteries costs £4.80, what does one battery cost?",
      "Subtract £2.80 from £5.00.",
      "A monthly magazine subscription is £4.25. What is the cost for a whole year?",
      "What is one third of £9.30?",
      "A comic is £1.25 and a magazine is £2.10. How much more is the magazine?",
      "How many 50p coins do you need to make £5.50?",
      "If you spend £1.75 and £2.50, what is the total spend?",
      "A toy car costs £3.75. How much would 3 cost?",
      "What is the difference between £20 and £11.65?",
      "If I have £8.40 and I divide it among 4 people, how much does each get?"
    ]
  },
```

**--- END OF EXAMPLE QUESTIONS ---**

**Required Output:**

Please present your findings as a clear, well-structured report. Use headings and subheadings for each **Mathematical Model**. The final blueprint should be a practical and robust guide for a TypeScript developer, free of redundancy and focused on creating a scalable and efficient Math Engine.