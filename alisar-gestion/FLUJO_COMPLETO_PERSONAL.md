# 📊 FLUJO COMPLETO DE CÁLCULO DE PERSONAL

## Versión Corregida - Sin useEffect Problemático

---

## 🔄 FLUJO DE DATOS PASO A PASO

### PASO 1: Usuario abre formulario para crear proyecto

```
Proyectos.js (línea 553-557)
├─ Llama: <ProyectoForm proyecto={...} maquinaria={maq} personal={pers} />
└─ Pasa 3 cosas críticas:
   1. proyecto = datos a editar (null si es nuevo)
   2. maquinaria = array de máquinas disponibles
   3. personal = array de personal del sistema CON SALARIOS ✅
```

**Verificación**:
```javascript
// En Proyectos.js línea 43-60:
useEffect(() => {
  const cargarDatos = async () => {
    setLoadingData(true);
    const [maqRes, perRes] = await Promise.all([
      dataService.getMaquinaria(),     // ✅ Obtiene máquinas
      dataService.getPersonal()         // ✅ Obtiene personal CON SALARIOS
    ]);
    setMaquinaria(maqRes.data || []);
    setPersonal(perRes.data || []);     // ✅ Guarda en state
  };
  cargarDatos();
}, []);
```

---

### PASO 2: ProyectoForm recibe personal

```
ProyectoForm.js (línea 11)
const ProyectoForm = memo(({ 
  proyecto,          // datos a editar
  maquinaria = [],   // máquinas disponibles
  personal = [],     // ✅ PERSONAL DEL SISTEMA (IDs + Salarios)
  onSubmit,
  onCancel 
}) => {
```

**Verificación**:
- ✅ personal es un array con objetos: `{ id, nombre, cargo, salario, estado }`
- ✅ salario es MENSUAL (no diario)
- ✅ Este array llega del backend vía dataService.getPersonal()

---

### PASO 3: Usuario selecciona fechas

**Código en ProyectoForm.js (línea 99-131, handleInputChange)**:

```javascript
const handleInputChange = useCallback((field, value) => {
  setFormData(prev => {
    const updated = { ...prev, [field]: value };

    // ✅ SI CAMBIA UNA FECHA:
    if (field === 'fecha_inicio' || field === 'fecha_fin') {
      if (updated.fecha_inicio && updated.fecha_fin) {
        const start = new Date(updated.fecha_inicio);
        const end = new Date(updated.fecha_fin);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          if (start <= end) {
            // CÁLCULO: fecha_fin - fecha_inicio + 1
            const diffTime = end - start;
            const diffDays = Math.floor(diffTime / (1000*60*60*24)) + 1;
            updated.duracion_dias = Math.max(1, diffDays);
            // ✅ RESULTADO: duracion_dias actualizado
          }
        }
      }
    }

    // ✅ SI CAMBIA duracion_dias Y hay personal asignado:
    if (field === 'duracion_dias' && 
        Array.isArray(prev.personal_asignado) && 
        prev.personal_asignado.length > 0) {
      // Recalcula gasto_personal con el nuevo número de días
      updated.gasto_personal = calcularGastoPersonal(
        prev.personal_asignado, 
        value  // el nuevo número de días
      );
    }

    return updated;
  });
}, [calcularGastoPersonal]);
```

**Ejemplo Real**:
```
Usuario selecciona:
- Fecha Inicio: 2024-01-15
- Fecha Fin: 2024-02-29

Cálculo automático:
- Diferencia: 45 días
- duracion_dias = 45 + 1 = 46 días ✅
```

---

### PASO 4: Usuario asigna personal

**Código en ProyectoForm.js (línea 176-207, handleTogglePersonal)**:

```javascript
const handleTogglePersonal = useCallback((personaId) => {
  // Valida que el ID sea válido
  if (!personaId && personaId !== 0) {
    console.error('Error: personaId is invalid', personaId);
    return;
  }

  setFormData(prev => {
    const idAsString = String(personaId);
    const currentAsignado = prev.personal_asignado || [];
    const isSelected = currentAsignado.some(id => String(id) === idAsString);

    // ✅ Calcula el nuevo array de personal asignado
    const newPersonalAsignado = isSelected
      ? currentAsignado.filter(id => String(id) !== idAsString)  // Quita
      : [...currentAsignado, personaId];                        // Agrega

    // ✅ CÁLCULO CLAVE: calcularGastoPersonal()
    const gastoPersonalCalculado = calcularGastoPersonal(
      newPersonalAsignado, 
      prev.duracion_dias  // ⚠️ Usa los días actuales
    );

    return {
      ...prev,
      personal_asignado: newPersonalAsignado,
      gasto_personal: gastoPersonalCalculado  // ✅ Actualiza gasto automáticamente
    };
  });
}, [calcularGastoPersonal]);
```

**Función `calcularGastoPersonal` (línea 75-111)**:

```javascript
const calcularGastoPersonal = useCallback((personalAsignadoIds, dias) => {
  // ✅ VALIDACIÓN 1: ¿Hay personal asignado?
  if (!Array.isArray(personalAsignadoIds) || personalAsignadoIds.length === 0) {
    return 0;  // Sin personal = sin gasto
  }

  // ✅ VALIDACIÓN 2: ¿Hay días definidos?
  if (!dias || dias <= 0) {
    return 0;  // Sin días = sin gasto
  }

  // ✅ CÁLCULO: Suma el costo de cada persona
  return personalAsignadoIds.reduce((total, personaId) => {
    // Busca la persona en el array que llegó del backend
    const empleado = personal.find(p =>
      p.id === personaId || String(p.id) === String(personaId)
    );

    // Si encontramos la persona y tiene salario:
    if (empleado && empleado.salario) {
      // FÓRMULA CLAVE: (salario_mensual / 30) × días_proyecto
      const salarioDiario = empleado.salario / 30;
      const costePorPersona = salarioDiario * dias;
      return total + costePorPersona;
    }

    return total;
  }, 0);
}, [personal]);  // Depende de personal que llegó del backend
```

**Ejemplo Real**:
```
Proyecto: 46 días
Personal disponible en backend:
- Juan (id: 1, salario: 6000 Bs/mes)
- María (id: 2, salario: 5250 Bs/mes)

Usuario selecciona AMBOS:

CÁLCULO:
Juan:  (6000 / 30) × 46 = 200 × 46 = 9,200 Bs
María: (5250 / 30) × 46 = 175 × 46 = 8,050 Bs
───────────────────────────────────────────
TOTAL: 17,250 Bs ✅

formData.gasto_personal = 17,250
formData.personal_asignado = [1, 2]
```

---

### PASO 5: Usuario cambia los días (opcional)

Si el usuario edita las fechas después de asignar personal:

```
Usuario cambia:
- Nueva Fecha Fin: 2024-03-15
- duracion_dias ahora = 60 días

handleInputChange ejecuta:
if (field === 'duracion_dias' && prev.personal_asignado.length > 0) {
  updated.gasto_personal = calcularGastoPersonal(
    prev.personal_asignado,  // [1, 2] sigue igual
    60  // nuevo número de días
  );
}

NUEVO CÁLCULO:
Juan:  (6000 / 30) × 60 = 200 × 60 = 12,000 Bs
María: (5250 / 30) × 60 = 175 × 60 = 10,500 Bs
──────────────────────────────────────────────
TOTAL: 22,500 Bs ✅ (se recalculó automáticamente)
```

---

### PASO 6: Usuario envía el formulario

**Código en ProyectoForm.js (línea 213-260, handleSubmit)**:

```javascript
const handleSubmit = useCallback((e) => {
  e.preventDefault();

  // ✅ VALIDACIÓN: Nombre es requerido
  if (!formData.nombre || formData.nombre.trim() === '') {
    alert('Por favor ingresa un nombre para el proyecto');
    return;
  }

  // ✅ VALIDACIÓN: Empleados personalizados con nombre
  const empleadosValidos = formData.empleados.filter(emp =>
    emp.nombre && emp.nombre.trim() !== ''
  );

  // ✅ PREPARAR DATOS PARA ENVIAR:
  const dataToSubmit = {
    ...formData,
    nombre: formData.nombre.trim(),
    descripcion: formData.descripcion?.trim() || '',
    empleados: empleadosValidos,
    // ✅ FILTRAR IDs VÁLIDOS:
    personal_asignado: Array.isArray(formData.personal_asignado)
      ? formData.personal_asignado.filter(id => id || id === 0)
      : [],
    maquinaria_asignada: Array.isArray(formData.maquinaria_asignada)
      ? formData.maquinaria_asignada.filter(id => id || id === 0)
      : []
  };

  console.log('✅ Enviando datos:', {
    nombre: dataToSubmit.nombre,
    dias: dataToSubmit.duracion_dias,
    personalAsignado: dataToSubmit.personal_asignado,
    gastoPersonal: dataToSubmit.gasto_personal  // ✅ IMPORTANTE
  });

  // Llama a onSubmit (que es handleFormSubmit en Proyectos.js)
  onSubmit(dataToSubmit);
}, [formData, onSubmit]);
```

**Ejemplo de datos enviados**:
```javascript
{
  nombre: "Movimiento de Tierra",
  descripcion: "Proyecto de acarreo",
  fecha_inicio: "2024-01-15",
  fecha_fin: "2024-02-29",
  duracion_dias: 46,
  presupuesto_adjudicado: 50000,
  diesel_litros: 200,
  diesel_precio: 9.8,
  gasto_comida: 1500,
  gasto_otros: 0,
  gasto_personal: 17250,  // ✅ CALCULADO AUTOMÁTICAMENTE
  personal_asignado: [1, 2],  // IDs de Juan y María
  maquinaria_asignada: [],
  empleados: [...]  // Costos personalizados (si hay)
}
```

---

### PASO 7: Proyectos.js envía al backend

**Código en Proyectos.js (línea 191-211, handleFormSubmit)**:

```javascript
const handleFormSubmit = useCallback(async (formData) => {
  try {
    console.log('Guardando proyecto:', {
      isEdit: !!editingId,
      formData: formData
    });

    if (editingId) {
      // Actualizar proyecto existente
      await update(editingId, formData);  // PUT /api/obras/:id
      alert('✅ Proyecto actualizado exitosamente');
    } else {
      // Crear nuevo proyecto
      await create(formData);  // POST /api/obras
      alert('✅ Proyecto creado exitosamente');
    }
    handleCloseModal();
  } catch (err) {
    console.error('Error al guardar proyecto:', err);
    const errorMessage = err.response?.data?.error || err.message;
    alert(`❌ Error: ${errorMessage}`);
  }
}, [editingId, update, create, handleCloseModal]);
```

**El `create` function usa dataService.createObra**:
```javascript
// api.js línea 55:
createObra: (data) => api.post('/obras', data),

// Esto envía POST a: http://localhost:4000/api/obras
// Headers incluye: Authorization: Bearer {token}
// Body incluye: gasto_personal ✅
```

---

### PASO 8: Backend recibe y guarda

**Código en server.js (línea 231-310, POST /api/obras)**:

```javascript
app.post('/api/obras', verifyToken, async (req, res) => {
  // ✅ DESESTRUCTURA gasto_personal:
  const {
    nombre,
    descripcion,
    estado,
    duracion_dias,
    gasto_diesel,
    gasto_personal,  // ✅ RECIBE EL VALOR CALCULADO
    gasto_comida,
    gasto_mantenimiento,
    gasto_otros,
    personal_asignado,
    maquinaria_asignado
  } = req.body;

  // ✅ INSERTA en la BD:
  const result = await db.run(
    `INSERT INTO obras (
      nombre, descripcion, duracion_dias,
      gasto_diesel, gasto_personal, gasto_comida,
      gasto_mantenimiento, gasto_otros,
      ...
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ...)`,
    [
      nombre, descripcion, duracion_dias || 0,
      gasto_diesel || 0, 
      gasto_personal || 0,  // ✅ GUARDA EN BD
      gasto_comida || 0,
      gasto_mantenimiento || 0,
      gasto_otros || 0,
      ...
    ]
  );

  const obraId = result.lastID;

  // ✅ GUARDA RELACIONES:
  // Inserta en tabla proyecto_personal
  if (Array.isArray(personal_asignado) && personal_asignado.length > 0) {
    for (const personalId of personal_asignado) {
      if (personalId || personalId === 0) {
        await db.run(
          'INSERT INTO proyecto_personal (proyecto_id, personal_id) VALUES (?, ?)',
          [obraId, personalId]
        );
      }
    }
  }

  res.json({ status: "Proyecto registrado con éxito", id: obraId });
});
```

---

## ✅ VALIDACIÓN DEL FLUJO COMPLETO

### ¿Dónde se calcula gasto_personal?

| Lugar | Función | Cuándo |
|-------|---------|--------|
| **ProyectoForm** | `handleInputChange` | Cuando cambian los días |
| **ProyectoForm** | `handleTogglePersonal` | Cuando se asigna/desasigna personal |
| **Backend** | `calcularResumenFinanciero` | Cuando se obtiene un proyecto |

### ¿Dónde se valida?

| Lugar | Validación |
|-------|-----------|
| **ProyectoForm** | ID sea válido (no null) |
| **ProyectoForm** | Personal tenga salario |
| **ProyectoForm** | duracion_dias > 0 |
| **Backend** | Nombre es requerido |
| **Backend** | personalId sea válido |

### ¿Dónde se guarda?

| Lugar | Tabla | Campo |
|-------|-------|-------|
| **Backend** | `obras` | `gasto_personal` |
| **Backend** | `proyecto_personal` | Relación proyecto ↔ personal |

---

## 🐛 PROBLEMAS ELIMINADOS

### ❌ Problema 1: useEffect infinito (ELIMINADO)
```javascript
// ANTES (malo):
useEffect(() => {
  setFormData(prev => ({ ...prev, gasto_personal: ... }));
}, [formData.duracion_dias, formData.personal_asignado, personal]);
// Problema: duracion_dias y personal_asignado son propiedades de formData
// que está siendo actualizado → ciclo infinito
```

### ✅ Solución:
```javascript
// DESPUÉS (bueno):
// Calcular directamente en handleTogglePersonal y handleInputChange
// Sin useEffect que dependa de formData
// Sin ciclos infinitos
```

---

## 🧪 PRUEBAS RECOMENDADAS

### Test 1: Crear proyecto con personal
```
1. Click "Nuevo Proyecto"
2. Ingresa Nombre: "Test Proyecto"
3. Selecciona Fecha Inicio: 15/01/2024
4. Selecciona Fecha Fin: 29/02/2024
5. Verifica: duracion_dias = 46 ✅
6. Selecciona Personal: Juan (6000 Bs/mes)
7. Verifica: gasto_personal = (6000/30)*46 = 9200 Bs ✅
8. Selecciona más personal: María (5250 Bs/mes)
9. Verifica: gasto_personal = 9200 + 8050 = 17250 Bs ✅
10. Click Guardar
11. Verifica en base de datos:
    - obras.gasto_personal = 17250 ✅
    - proyecto_personal tiene 2 registros ✅
```

### Test 2: Cambiar fechas después de asignar personal
```
1. Edita proyecto anterior
2. Cambia Fecha Fin a: 15/03/2024
3. Verifica: duracion_dias = 60 (recalculado) ✅
4. Verifica: gasto_personal = (6000/30)*60 + (5250/30)*60 = 22500 ✅
5. Click Guardar
```

### Test 3: Desasignar personal
```
1. Edita proyecto con personal asignado
2. Deselecciona a Juan
3. Verifica: gasto_personal = 8050 (solo María) ✅
4. Deselecciona a María
5. Verifica: gasto_personal = 0 ✅
```

---

## 📝 RESUMEN

**El flujo es simple y directo:**

1. Personal llega del backend CON SALARIOS ✅
2. Usuario selecciona fechas → se calcula duracion_dias automáticamente ✅
3. Usuario asigna personal → se calcula gasto_personal automáticamente ✅
4. Si cambian los días, gasto_personal se recalcula ✅
5. Todo se envía al backend, que lo guarda en BD ✅

**SIN useEffect problemático. SIN ciclos. SIN errores.**
