const express = require("express");
const cors = require("cors");

const N = 17;
const CLAVE_SECRETA = `CIAF-${N}`;
const PORT = 3000;

const app = express();

// 1) CORS va primero
app.use(
  cors({
    origin: "http://localhost:5500",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "X-Red-Equipo"],
    exposedHeaders: ["X-Servidor-Procesado"],
  }),
);

// 2) El portero: revisa la clave secreta
function portero(req, res, next) {
  const clave = req.get("X-Red-Equipo");
  if (clave !== CLAVE_SECRETA) {
    return res.status(401).json({
      error: "No autorizado",
      mensaje: "Falta el encabezado X-Red-Equipo o su valor es incorrecto.",
      formato: "CIAF-<numero de tu equipo>",
    });
  }
  next();
}
app.use("/api", portero);

// 3) Leer JSON
app.use(express.json());

const mascotas = [
  { id: 1, nombre: "Firulais", tipo: "perro" },
  { id: 2, nombre: "Michi", tipo: "gato" },
];

// GET: ver mascotas
app.get("/api/mascotas", (req, res) => {
  res.set("X-Servidor-Procesado", `Equipo-${N}`);
  res.status(200).json(mascotas);
});

// POST: registrar mascota
app.post("/api/mascotas", (req, res) => {
  const { nombre, tipo } = req.body || {};
  if (!nombre || !tipo) {
    return res.status(400).json({
      error: "Datos incompletos",
      mensaje: 'Envia un JSON con "nombre" y "tipo".',
    });
  }
  const nueva = { id: mascotas.length + 1, nombre, tipo };
  mascotas.push(nueva);
  res.set("X-Servidor-Procesado", `Equipo-${N}`);
  res.status(201).json(nueva);
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON mal escrito" });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
  console.log(`Clave secreta esperada: X-Red-Equipo: ${CLAVE_SECRETA}`);
});
