// system and user prompt
async function getRecipe() {
  const ingredients = document.getElementById("ingredients").value;

  const response = await fetch("http://localhost:5000/api/recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients })
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.recipe;
}

// zero shot prompting
async function getZeroShotRecipe() {
  const ingredients = document.getElementById("ingredients").value;

  const response = await fetch("http://localhost:5000/api/zero-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients })
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.recipe;
}

// one shot prompting
async function getOneShotRecipe() {  
  const ingredients = document.getElementById("ingredients").value;

  const response = await fetch("http://localhost:5000/api/one-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients })
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.recipe;
}

// multi-shot prompting
async function getMultiShotRecipe() {  
  const ingredients = document.getElementById("ingredients").value;

  const response = await fetch("http://localhost:5000/api/multi-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients })
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.recipe;
}

// Dynamic Prompting
async function getDynamicRecipe() {
  const ingredients = document.getElementById("ingredients").value;

  const response = await fetch("http://localhost:5000/api/dynamic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients})
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.recipe;
}

// Chain-of-Thought Prompting
async function getChainOfThoughtRecipe() {
  const ingredients = document.getElementById("ingredients").value;

  const response = await fetch("http://localhost:5000/api/chain-of-thought", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients })
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.recipe;
}


// Run Evaluation
async function runEvaluation() {
  const response = await fetch("http://localhost:5000/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });

  const data = await response.json();
  
  let output = "<h2>Evaluation Results</h2>";
  data.evaluationResults.forEach((res, index) => {
    output += `
      <div style="margin-bottom: 15px;">
        <strong>Test Case ${index + 1}:</strong><br>
        Ingredients: ${res.ingredients}<br>
        Expected Recipe: ${res.expected}<br>
        Judge Result: ${res.judge}<br>
      </div>
    `;
  });

  document.getElementById("result").innerHTML = output;
}
