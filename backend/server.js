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


// Root route fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
