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