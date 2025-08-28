const express = require("express");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.post("/api/recipe", (req, res) => {
  const { ingredients } = req.body;
  console.log("Received ingredients:", ingredients);

  res.json({ message: "Recipe received successfully!", ingredients });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});