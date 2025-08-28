async function getRecipe() {
  const ingredients = document.getElementById("ingredients").value;

  const response = await fetch("http://localhost:5000/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients })
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.recipe;
}
