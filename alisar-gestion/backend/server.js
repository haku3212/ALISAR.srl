const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// REEMPLAZA EL LINK DE ABAJO CON TU URI DE MONGO ATLAS
const MONGO_URI = "tu_enlace_de_mongo_aqui"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas (Demostración)"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Esquema para Maquinaria (Sopladoras, Zarandas, etc.)
const MaquinaSchema = new mongoose.Schema({
  nombre: String,
  tipo: String,
  estado: String,
  ultimaRevision: String
});
const Maquina = mongoose.model('Maquina', MaquinaSchema);

// Ruta para obtener maquinaria
app.get('/api/maquinaria', async (req, res) => {
  const maquinas = await Maquina.find();
  res.json(maquinas);
});

// Ruta para agregar maquinaria (Para la demo)
app.post('/api/maquinaria', async (req, res) => {
  const nuevaMaq = new Maquina(req.body);
  await nuevaMaq.save();
  res.json({ mensaje: "Equipo registrado" });
});

app.listen(4000, () => console.log("🚀 Servidor de Demo en puerto 4000"));