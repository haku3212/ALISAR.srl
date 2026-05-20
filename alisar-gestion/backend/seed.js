const mongoose = require('mongoose');

// Asegúrate de que el enlace coincida con el de tu panel de Atlas
const MONGO_URI = "mongodb+srv://admin_alisar:riberalta2026@cluster0.mongodb.net/alisar_db?retryWrites=true&w=majority"; 

const MaquinaSchema = new mongoose.Schema({
  nombre: String,
  tipo: String,
  estado: String,
  ultimaRevision: String
});

const Maquina = mongoose.models.Maquina || mongoose.model('Maquina', MaquinaSchema);

const datos = [
  { nombre: 'Sopladora N1 - Riberalta', tipo: 'Procesamiento', estado: 'Operativo', ultimaRevision: '2026-05-01' },
  { nombre: 'Zaranda Clasificadora A2', tipo: 'Clasificación', estado: 'Mantenimiento', ultimaRevision: '2026-04-15' },
  { nombre: 'Hornos de Secado Industrial', tipo: 'Secado', estado: 'Operativo', ultimaRevision: '2026-05-10' },
  { nombre: 'Peladora Automática P3', tipo: 'Procesamiento', estado: 'Operativo', ultimaRevision: '2026-05-12' }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("🛰️ Intentando conectar a Cluster0...");
    await Maquina.deleteMany({}); 
    await Maquina.insertMany(datos);
    console.log("✅ ¡DATOS CARGADOS! La base de datos de ALISAR está lista.");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error de conexión:", err.message);
    console.log("Revisa si tu IP está habilitada en Network Access de Atlas.");
    process.exit(1);
  });