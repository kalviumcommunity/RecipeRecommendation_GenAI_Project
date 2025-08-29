import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

const app = express();
const PORT = 5000;

const __dirname = path.resolve();

// Initialize GoogleGenAI client
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// API endpoint
// systemand user prompting
app.post('/api/recipe', async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

  const prompt = `
System: You are an expert chef with deep knowledge of flavors, cuisines, and cooking techniques.

User Task: Suggest a recipe using ONLY the following ingredients: ${ingredients}.

Format: Provide the recipe in this structure:
1. Recipe Name
2. Ingredients (list with measurements)
3. Step-by-step Instructions
4. Prep Time
5. Cook Time
6. Servings
7. Optional Tips / Variations

Constraints:
- Do NOT add any ingredients not listed above.
- Keep instructions simple and easy to follow.
- Make it suitable for home cooking.
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }],
    });

    res.json({ recipe: response.text });
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// zero shot prompting

app.post('/api/zero-shot', async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

  // Zero-Shot: Only instructions, no examples
  // user prompt example
  // Suggest quick Indian vegetarian dinner recipes.
  const zeroShotPrompt = `
You are a master chef.
Task: Create a complete recipe using ONLY these ingredients: ${ingredients}.
Do NOT use any extra ingredients.

Output the recipe in this format:
1. Recipe Name
2. Ingredients (list with measurements)
3. Step-by-step Instructions
4. Prep Time
5. Cook Time
6. Servings
7. Optional Tips / Variations
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: zeroShotPrompt }],
    });

    res.json({ recipe: response.text });
  } catch (error) {
    console.error('Error generating zero-shot recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// One-Shot Prompting
app.post('/api/one-shot', async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

//  user prompt example
//  I have chicken, garlic, and onion. Suggest a recipes.

  const example = `
Example:
Ingredients: Tomato, Onion, Salt, Pepper
Recipe:
1. Recipe Name: Simple Tomato-Onion Salad
2. Ingredients:
   - 1 Tomato, chopped
   - 1 Onion, sliced
   - 1/2 tsp Salt
   - 1/4 tsp Pepper
3. Step-by-step Instructions:
   - Mix tomato and onion in a bowl.
   - Sprinkle salt and pepper.
   - Toss well and serve fresh.
4. Prep Time: 5 mins
5. Cook Time: 0 mins
6. Servings: 2
7. Optional Tips: Add lemon juice for extra tang.
`;

  const oneShotPrompt = `
You are a world-class chef.
Task: Given some ingredients, generate a recipe in the same style and structure as the example below.

${example}

Now, using ONLY these ingredients: ${ingredients}, create a recipe.
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: oneShotPrompt }],
    });

    res.json({ recipe: response.text });
  } catch (error) {
    console.error('Error generating one-shot recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Multi-Shot Prompting
// user prompt example
// Potato, Carrot, Onion, Bell Pepper, Salt, Oil

app.post('/api/multi-shot', async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

  // Multi-shot examples
  
  const examples = `
Example 1:
Ingredients: Potato, Salt, Oil
Recipe:
1. Recipe Name: Crispy Salted Fries
2. Ingredients:
   - 2 Potatoes, sliced
   - 1/2 tsp Salt
   - 2 tbsp Oil
3. Step-by-step Instructions:
   - Heat oil in a pan.
   - Fry sliced potatoes until golden.
   - Sprinkle salt and serve hot.
4. Prep Time: 10 mins
5. Cook Time: 15 mins
6. Servings: 2
7. Optional Tips: Add chili powder for spicy fries.

Example 2:
Ingredients: Rice, Tomato, Onion, Garlic, Salt
Recipe:
1. Recipe Name: Tomato Garlic Rice
2. Ingredients:
   - 1 cup Rice
   - 2 Tomatoes, chopped
   - 1 Onion, chopped
   - 2 Garlic cloves, minced
   - 1 tsp Salt
3. Step-by-step Instructions:
   - Cook rice and set aside.
   - Sauté onion and garlic in oil.
   - Add tomatoes and salt, cook until soft.
   - Mix in rice and stir well.
4. Prep Time: 10 mins
5. Cook Time: 20 mins
6. Servings: 3
7. Optional Tips: Garnish with coriander.
`;

  const multiShotPrompt = `
You are a world-class chef.
Task: Given some ingredients, generate a recipe in the same style and structure as the examples below.

${examples}

Now, using ONLY these ingredients: ${ingredients}, create a recipe.
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: multiShotPrompt }],
    });

    res.json({ recipe: response.text });
  } catch (error) {
    console.error('Error generating multi-shot recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dynamic Prompting
// apple,banana, mango,sugar,milk

app.post('/api/dynamic', async (req, res) => {
  const { ingredients} = req.body; 

  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

  // Dynamic prompt: add user preference dynamically
  const dynamicPrompt = `
You are a master chef.
Task: Create a recipe using ONLY these ingredients: ${ingredients}.
If the ingredients include any dietary preferences (e.g., vegetarian, vegan, gluten-free), ensure the recipe adheres to those preferences. If no such preferences are indicated, create a general recipe.

Format:
1. Recipe Name
2. Ingredients (list with measurements)
3. Step-by-step Instructions
4. Prep Time
5. Cook Time
6. Servings
7. Optional Tips / Variations

Constraints:
- Do NOT use any ingredients not listed above.
- Follow the user preference if specified.
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: dynamicPrompt }],
    });

    res.json({ recipe: response.text });
  } catch (error) {
    console.error('Error generating dynamic recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Chain-of-Thought Prompting
// Chicken, Garlic, Onion, Bell Pepper, Olive Oil, Salt, Black Pepper

app.post('/api/chain-of-thought', async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

  // CoT Prompt: AI explains reasoning step by step before giving recipe
  const cotPrompt = `
You are a master chef.
Task: Suggest a recipe using ONLY these ingredients: ${ingredients}.
Before giving the final recipe, explain your thought process step by step:
1. How to combine flavors.
2. Cooking techniques to use.
3. Any optional variations.
Then provide the final recipe in this format:
1. Recipe Name
2. Ingredients (list with measurements)
3. Step-by-step Instructions
4. Prep Time
5. Cook Time
6. Servings
7. Optional Tips / Variations
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: cotPrompt }],
    });

    res.json({ recipe: response.text });
  } catch (error) {
    console.error('Error generating chain-of-thought recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Evaluation Dataset and Testing Framework
// Tomato, Onion, Salt, Pepper
// Tests a basic salad-style recipe. Matches your “Simple Tomato-Onion Salad” expected output.
// Potato, Salt, Oil
// Tests a simple fried dish. Matches “Crispy Salted Fries”.
// Rice, Tomato, Onion, Garlic, Salt
// Tests a cooked dish with multiple ingredients. Matches “Tomato Garlic Rice”.
// Chicken, Garlic, Onion, Pepper
// Tests a protein-based recipe. Matches “Garlic Chicken Stir-Fry”.
// Carrot, Peas, Corn, Salt, Oil

// Tests a mixed vegetable recipe. Matches “Simple Veggie Stir-Fry”.
app.post('/api/evaluate', async (req, res) => {
  // 5 sample test cases
  const testCases = [
    {
      ingredients: "Tomato, Onion, Salt, Olive Oil",
      expectedRecipeName: "Simple Tomato-Onion Salad"
    },
    {
      ingredients: "Rice, Garlic, Salt, Oil",
      expectedRecipeName: "Garlic Rice"
    },
    {
      ingredients: "Potato, Salt, Oil",
      expectedRecipeName: "Crispy Salted Fries"
    },
    {
      ingredients: "Chicken, Garlic, Onion, Pepper",
      expectedRecipeName: "Garlic Chicken Stir-Fry"
    },
    {
      ingredients: "Milk, Sugar, Mango",
      expectedRecipeName: "Mango Milkshake"
    }
  ];

  const results = [];

  for (const test of testCases) {
    const prompt = `
You are a food expert. Evaluate the AI-generated recipe based on the ingredients: ${test.ingredients}.
Compare it with the expected recipe name: "${test.expectedRecipeName}".
Judge whether the recipe follows the instructions, includes only the given ingredients, and matches the expected dish type.
Answer YES if it is correct, otherwise NO. Also provide a short explanation.
`;

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: prompt }],
      });

      results.push({
        ingredients: test.ingredients,
        expected: test.expectedRecipeName,
        judge: response.text
      });
    } catch (error) {
      console.error("Error evaluating recipe:", error);
      results.push({
        ingredients: test.ingredients,
        expected: test.expectedRecipeName,
        judge: "Error generating evaluation"
      });
    }
  }

  res.json({ evaluationResults: results });
});




// Root route fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
