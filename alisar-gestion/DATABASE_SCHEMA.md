# 📊 Diagrama de Entidad-Relación - Base de Datos ALISAR

## Esquema Relacional Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ESQUEMA DE BASE DE DATOS ALISAR                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│              USUARIOS (users)            │
├─────────────────────────────────────────┤
│ PK: id (INTEGER)                        │
│    nombre (TEXT)                        │
│    usuario (TEXT) - UNIQUE              │
│    password (TEXT)                      │
│    rol (TEXT)                           │
│    estado (TEXT)                        │
│    fechaCreacion (DATETIME)             │
└─────────────────────────────────────────┘
              ▲
              │ 1:N
              │ (Auditoría)
              │
┌─────────────────────────────────────────┐
│          AUDIT_LOGS (auditoría)         │
├─────────────────────────────────────────┤
│ PK: id (INTEGER)                        │
│    usuario (TEXT) FK → users.usuario    │
│    accion (TEXT)                        │
│    tabla (TEXT)                         │
│    registro_id (INTEGER)                │
│    valores_anteriores (JSON)            │
│    valores_nuevos (JSON)                │
│    timestamp (DATETIME)                 │
└─────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────┐
│           PROYECTOS (obras) - NÚCLEO DEL SISTEMA                 │
├──────────────────────────────────────────────────────────────────┤
│ PK: id (INTEGER)                                                 │
│                                                                   │
│ ══ INFORMACIÓN BÁSICA ══                                         │
│    nombre (TEXT) - Nombre del proyecto                          │
│    descripcion (TEXT)                                           │
│    estado (TEXT) - planeado, ejecucion, completado, suspendido │
│                                                                   │
│ ══ PRESUPUESTO ══                                               │
│    tipo_presupuesto (TEXT) - 'fijo' o 'tarifa'                 │
│    presupuesto_adjudicado (DECIMAL) - Presupuesto licitación   │
│    presupuesto_bruto (DECIMAL) - Calculado o directo           │
│    presupuesto_neto (DECIMAL) - Bruto - Impuestos (16%)        │
│                                                                   │
│ ══ GASTOS OPERATIVOS ══                                         │
│    gasto_diesel (DECIMAL) - Combustible                        │
│    gasto_personal (DECIMAL) - Salarios/honorarios              │
│    gasto_comida (DECIMAL) - Alimentación                       │
│    gasto_mantenimiento (DECIMAL) - Mantenimiento máquinas      │
│    gasto_otros (DECIMAL) - Otros gastos varios                 │
│    gasto_total (DECIMAL) - Suma de todos los gastos            │
│                                                                   │
│ ══ ANÁLISIS FINANCIERO ══                                       │
│    ganancia_neta (DECIMAL) - Presupuesto neto - Gastos        │
│    margen_ganancia (DECIMAL) - (Ganancia/Presupuesto)*100     │
│                                                                   │
│ ══ PLANIFICACIÓN ══                                             │
│    kilometros_totales (INT)                                    │
│    duracion_dias (INT)                                         │
│    fecha_inicio (DATE)                                         │
│    fecha_fin (DATE)                                            │
│                                                                   │
│ ══ TIMESTAMPS ══                                                │
│    fechaCreacion (DATETIME)                                    │
│    ultimaActualizacion (DATETIME)                              │
└──────────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │ 1:N                          │ 1:N
         │                              │
         │                              │
    (Rel. Maquinaria)              (Rel. Personal)
         │                              │
         │                              │
         │                              ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   MAQUINARIA (equipos)   │    │    PERSONAL (empleados)  │
├──────────────────────────┤    ├──────────────────────────┤
│ PK: id (INTEGER)         │    │ PK: id (INTEGER)         │
│    nombre (TEXT)         │    │    nombre (TEXT)         │
│    tipo (TEXT)           │    │    cargo (TEXT)          │
│    estado (TEXT)         │    │    celular (TEXT)        │
│    ultimaRevision (TEXT) │    │    estado (TEXT)         │
└──────────────────────────┘    └──────────────────────────┘
         ▲                              ▲
         │ N                            │ N
         │                              │
         └──────────┬───────────────────┘
                    │
                    │ (Tabla de unión N:M)
                    │
    ┌───────────────────────────────────────┐
    │   PROYECTO_MAQUINARIA (asignaciones)  │
    ├───────────────────────────────────────┤
    │ PK: id (INTEGER)                      │
    │    proyecto_id (INT) FK → obras(id)   │
    │    maquinaria_id (INT) FK → maq(id)   │
    │    dias_utilizados (INT)              │
    └───────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │ PROYECTO_PERSONAL (asignaciones)     │
    ├──────────────────────────────────────┤
    │ PK: id (INTEGER)                     │
    │    proyecto_id (INT) FK → obras(id)  │
    │    personal_id (INT) FK → personal   │
    │    rol (TEXT)                        │
    │    dias_trabajados (INT)             │
    │    salario_dia (DECIMAL)             │
    └──────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       CONFIG (configuración)            │
├─────────────────────────────────────────┤
│ PK: id (INTEGER)                        │
│    clave (TEXT) - UNIQUE                │
│    valor (TEXT)                         │
│    tipo (TEXT)                          │
│    actualizado (DATETIME)               │
└─────────────────────────────────────────┘
```

---

## 📋 Descripción de Tablas

### 1. **users** (Usuarios del sistema)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'residente',
  estado TEXT DEFAULT 'activo',
  fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- **Propósito:** Almacenar credenciales y datos de usuarios
- **Relaciones:** 1:N con audit_logs

---

### 2. **obras** (Proyectos de construcción) ⭐ PRINCIPAL
```sql
CREATE TABLE obras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  avance INTEGER DEFAULT 0,
  presupuesto TEXT,
  presupuesto_bruto DECIMAL(12,2),
  presupuesto_neto DECIMAL(12,2),
  gasto_diesel DECIMAL(12,2) DEFAULT 0,
  gasto_personal DECIMAL(12,2) DEFAULT 0,
  gasto_comida DECIMAL(12,2) DEFAULT 0,
  gasto_mantenimiento DECIMAL(12,2) DEFAULT 0,
  gasto_otros DECIMAL(12,2) DEFAULT 0,
  gasto_total DECIMAL(12,2) DEFAULT 0,
  ganancia_neta DECIMAL(12,2) DEFAULT 0,
  margen_ganancia DECIMAL(5,2) DEFAULT 0,
  kilometros_totales INT,
  duracion_dias INT,
  estado TEXT DEFAULT 'planeado',
  tipo_presupuesto TEXT DEFAULT 'fijo',
  presupuesto_adjudicado DECIMAL(12,2),
  fecha_inicio DATE,
  fecha_fin DATE,
  fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- **Propósito:** Almacenar todos los datos del proyecto
- **Relaciones:** 
  - 1:N con proyecto_maquinaria
  - 1:N con proyecto_personal

---

### 3. **maquinaria** (Equipos disponibles)
```sql
CREATE TABLE maquinaria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  tipo TEXT,
  estado TEXT,
  ultimaRevision TEXT
);
```
- **Propósito:** Catálogo de equipos disponibles
- **Relaciones:** N:M con obras (a través de proyecto_maquinaria)

---

### 4. **personal** (Empleados disponibles)
```sql
CREATE TABLE personal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  cargo TEXT,
  celular TEXT,
  estado TEXT DEFAULT 'Activo'
);
```
- **Propósito:** Catálogo de empleados disponibles
- **Relaciones:** N:M con obras (a través de proyecto_personal)

---

### 5. **proyecto_maquinaria** (Asignación de máquinas a proyectos) 🔗
```sql
CREATE TABLE proyecto_maquinaria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proyecto_id INTEGER NOT NULL,
  maquinaria_id INTEGER NOT NULL,
  dias_utilizados INTEGER DEFAULT 0,
  FOREIGN KEY (proyecto_id) REFERENCES obras(id),
  FOREIGN KEY (maquinaria_id) REFERENCES maquinaria(id)
);
```
- **Propósito:** Tabla de unión N:M
- **Relaciones:** 
  - Muchos a Uno: obras
  - Muchos a Uno: maquinaria

---

### 6. **proyecto_personal** (Asignación de personal a proyectos) 🔗
```sql
CREATE TABLE proyecto_personal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proyecto_id INTEGER NOT NULL,
  personal_id INTEGER NOT NULL,
  rol TEXT,
  dias_trabajados INTEGER DEFAULT 0,
  salario_dia DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (proyecto_id) REFERENCES obras(id),
  FOREIGN KEY (personal_id) REFERENCES personal(id)
);
```
- **Propósito:** Tabla de unión N:M
- **Relaciones:** 
  - Muchos a Uno: obras
  - Muchos a Uno: personal

---

### 7. **audit_logs** (Registro de cambios)
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario TEXT,
  accion TEXT NOT NULL,
  tabla TEXT NOT NULL,
  registro_id INTEGER,
  valores_anteriores TEXT,
  valores_nuevos TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- **Propósito:** Auditoría de todas las operaciones
- **Relaciones:** Muchos a Uno: users

---

### 8. **config** (Configuración del sistema)
```sql
CREATE TABLE config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  tipo TEXT DEFAULT 'string',
  actualizado DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- **Propósito:** Almacenar configuraciones globales
- **Ejemplo:** empresa_nombre, empresa_moneda, tema_modo

---

## 🔗 Relaciones (Cardinalidades)

### Relaciones 1:N (Uno a Muchos)
| Tabla A | Tabla B | Descripción |
|---------|---------|-------------|
| users | audit_logs | Un usuario puede tener muchos registros de auditoría |
| obras | proyecto_maquinaria | Un proyecto usa muchas máquinas |
| obras | proyecto_personal | Un proyecto contrata muchas personas |

### Relaciones N:M (Muchos a Muchos)
| Tabla A | Tabla Unión | Tabla B | Descripción |
|---------|-------------|---------|-------------|
| obras | proyecto_maquinaria | maquinaria | Un proyecto usa muchas máquinas, una máquina puede usarse en muchos proyectos |
| obras | proyecto_personal | personal | Un proyecto contrata muchas personas, un empleado puede trabajar en muchos proyectos |

---

## 💰 Flujo de Datos Financiero

### Cálculo de Presupuesto
```
Presupuesto Bruto:
  SI tipo = 'fijo' ENTONCES presupuesto_adjudicado
  SI tipo = 'tarifa' ENTONCES tarifa_km × kilometros_totales

Presupuesto Neto = Presupuesto Bruto - Impuestos(16%)

Impuestos = Presupuesto Bruto × 0.16
```

### Cálculo de Gastos
```
Gasto Diesel = diesel_litros × diesel_precio

Gasto Personal = SUMA(empleados[ cantidad × salario × dias ])

Gasto Comida = cantidad_dias × costo_por_dia (o total directo)

Gasto Mantenimiento = cantidad_maquinas × costo_mantenimiento

Gasto Total = gasto_diesel + gasto_personal + gasto_comida 
              + gasto_mantenimiento + gasto_otros
```

### Cálculo de Ganancias
```
Ganancia Neta = Presupuesto Neto - Gasto Total

Margen Ganancia (%) = (Ganancia Neta / Presupuesto Bruto) × 100

Ganancia por km = Ganancia Neta / Kilometros Totales (si km > 0)

Ganancia por día = Ganancia Neta / Duracion Dias (si días > 0)
```

---

## 📊 Ejemplos de Consultas Comunes

### Obtener todos los proyectos con análisis financiero
```sql
SELECT * FROM obras 
ORDER BY fechaCreacion DESC;
```

### Proyectos rentables (ganancia > 0)
```sql
SELECT nombre, ganancia_neta, margen_ganancia 
FROM obras 
WHERE ganancia_neta > 0
ORDER BY ganancia_neta DESC;
```

### Máquinas asignadas a un proyecto
```sql
SELECT m.id, m.nombre, m.tipo, pm.dias_utilizados
FROM maquinaria m
INNER JOIN proyecto_maquinaria pm ON m.id = pm.maquinaria_id
WHERE pm.proyecto_id = ?;
```

### Personal asignado a un proyecto
```sql
SELECT p.id, p.nombre, p.cargo, pp.dias_trabajados, pp.salario_dia
FROM personal p
INNER JOIN proyecto_personal pp ON p.id = pp.personal_id
WHERE pp.proyecto_id = ?;
```

### Total de gastos por proyecto
```sql
SELECT 
  nombre,
  gasto_diesel,
  gasto_personal,
  gasto_comida,
  gasto_mantenimiento,
  gasto_otros,
  gasto_total
FROM obras
WHERE id = ?;
```

### Historial de cambios en un proyecto
```sql
SELECT usuario, accion, valores_anteriores, valores_nuevos, timestamp
FROM audit_logs
WHERE tabla = 'obras' AND registro_id = ?
ORDER BY timestamp DESC;
```

---

## 🔐 Consideraciones de Diseño

1. **Integridad Referencial:** Las claves foráneas aseguran que no haya maquinaria o personal asignados sin un proyecto válido

2. **Transacciones:** Las operaciones de creación/actualización de proyectos deben ser atómicas (todo o nada)

3. **Auditoría:** Todas las operaciones se registran en audit_logs para rastrabilidad

4. **Precisión Monetaria:** Se usa DECIMAL(12,2) para todos los valores monetarios (12 dígitos, 2 decimales)

5. **Escalabilidad:** 
   - Índices recomendados: obras(estado), audit_logs(tabla), proyecto_maquinaria(proyecto_id), proyecto_personal(proyecto_id)
   - El modelo soporta N proyectos, cada uno con M máquinas y P empleados

---

## 📈 Estadísticas de Base de Datos

| Tabla | Registros Iniciales | Crecimiento |
|-------|-------------------|-------------|
| users | 1 (admin) | Bajo |
| maquinaria | 3 | Bajo |
| personal | 2 | Bajo |
| obras | 2 | Alto |
| config | 4 | Muy bajo |
| audit_logs | N/A | Muy alto |
| proyecto_maquinaria | Variable | Alto |
| proyecto_personal | Variable | Alto |

---

**Última actualización:** 2026-05-28  
**Version:** 1.0  
**Estado:** Documentado y validado ✅
