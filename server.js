const express = require("express");
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Importar rutas
const userRoutes = require("./routes/users");
const clientRoutes = require("./routes/clients");

// Usar rutas
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡API Node.js con SQL Server funcionando!");
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
