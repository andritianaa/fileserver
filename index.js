const express = require("express");
const { FileRouter } = require("./routes/file.routes");

const app = express();
const port = 3000;

// Middleware pour gérer les fichiers
app.use(express.static('public'));
app.use(express.json());

// Utilisation du routeur de fichiers
app.use("/", FileRouter);
app.use("/public", express.static(path.join(__dirname, "/public")))

// Gestion des routes inconnues
app.use((req, res) => {
  res.status(404).send("File not found");
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).send("Something went wrong!");
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
