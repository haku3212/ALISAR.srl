# 📊 Rediseño del Sistema: Módulo de Proyectos con Análisis Financiero

**Fecha**: Mayo 28, 2026  
**Versión**: v1.0.0-complete (Post-Analysis)  
**Estado**: En Planificación - 9 Fases Definidas

---

## 🎯 Objetivo General

Transformar ALISAR de un sistema de **gestión de proyectos genérico** a una **plataforma de análisis financiero de proyectos** que permita a la empresa:

- ✅ Calcular presupuesto vs gastos reales
- ✅ Conocer ganancia neta por proyecto
- ✅ Analizar margen de ganancia (%)
- ✅ Identificar proyectos rentables
- ✅ Optimizar costos operativos

---

## 📋 Cambios Principales

### 1. **Eliminar Módulos**
- ❌ Madera
- ❌ Rodeos

### 2. **Rediseñar Módulo "Obras" → "Proyectos"**
- Nueva estructura de datos con campos financieros
- Formulario completamente editable
- Cálculos automáticos en tiempo real
- Dashboard con análisis de ganancias

---

## 💰 Modelo de Negocio (Ejemplo Real)

### Proyecto: Mantenimiento Alcaldía 80km

```
INGRESOS
────────────────────────────────────
Presupuesto Adjudicado (Licitación):    450,000 Bs
Impuestos (16%):                        -72,000 Bs
────────────────────────────────────
Presupuesto Neto:                       378,000 Bs

GASTOS OPERATIVOS
────────────────────────────────────
Diesel (20,000L × 9.8 Bs/L):            196,000 Bs
Personal (45 días):                      60,075 Bs
  - Operarios: 7 × 6,000 × 45 = 42,000
  - Ayudantes: 2 × 5,250 × 45 = 10,500
  - Encargado: 1 × 6,000 × 45 = 6,000
  - Cocinera: 1 × 35 × 45 = 1,575
Comida (45 días × 400 Bs):               18,000 Bs
Mantenimiento Maquinaria (7 × 1,200):     8,400 Bs
────────────────────────────────────
TOTAL GASTOS:                           282,475 Bs

RESULTADO FINAL
────────────────────────────────────
Ganancia Neta:                           95,525 Bs
Margen de Ganancia:                         21.2%
Por Kilómetro:                            1,194 Bs
Por Día:                                  2,123 Bs
```

---

## 🏗️ Nueva Estructura de Formulario

### Sección 1: Datos Básicos
- Nombre, Descripción, Fechas, Km, Duración
- Estado (Planeado, En Progreso, Completado)

### Sección 2: Tipo de Presupuesto
- **Opción A**: Presupuesto Fijo (Licitación)
- **Opción B**: Por Tarifa (km × 23,000 Bs)

### Sección 3: Gastos Operativos (TODO EDITABLE)

#### 🛢️ Diesel
```
Litros: [20,000]
Precio/Litro: [9.8] Bs
Total: 196,000 Bs (automático)
```

#### 👥 Personal (Tabla Editable)
```
Rol          | Cantidad | Salario c/u | Días | Subtotal
─────────────┼──────────┼─────────────┼──────┼──────────
Operarios    | [7]      | [6,000]     | [45] | 42,000
Ayudantes    | [2]      | [5,250]     | [45] | 10,500
Encargado    | [1]      | [6,000]     | [45] | 6,000
Cocinera     | [1]      | [35]        | [45] | 1,575
─────────────┴──────────┴─────────────┴──────┴──────────
SUBTOTAL: 60,075 Bs
```

#### 🍽️ Comida
```
Costo Total: [18,000] Bs
O: Días × Costo/Día: [45] × [400] = 18,000 Bs
```

#### 🏗️ Mantenimiento Maquinaria
```
Cantidad Máquinas: [7]
Costo/Máquina: [1,200] Bs
Total: 8,400 Bs (automático)
```

#### 📋 Otros Gastos (Opcionales - Agregables)
```
[ ] Transporte: [5,000] Bs
[ ] Permisos: [2,500] Bs
[ ] Campamento/Alojamiento: [1,500] Bs × [45] días = 67,500 Bs
[ ] Madera: [8,000] Bs
[...más campos según necesidad]
```

### Sección 4: Maquinaria Asignada
```
☑ Excavadora CAT 320D (45 días)
☑ Retroexcavadora JCB (45 días)
☑ Motoniveladora CAT 14M (45 días)
☑ Compactador DYNAPAC (45 días)
☑ Volqueta Volvo FH16 (45 días)
☑ Rodillo Compactador (45 días)
☑ Cisterna de Agua (45 días)
[+ Agregar máquina]
```

### Sección 5: Personal Asignado
```
Nombre          | Rol      | Días  | Salario/Día
────────────────┼──────────┼───────┼─────────────
Juan García     | Operario | [45]  | 6,000 Bs
Pedro López     | Operario | [45]  | 6,000 Bs
[+ Agregar personal]
```

### Sección 6: Resumen Financiero (Automático)
```
╔════════════════════════════════════════╗
║    📊 ANÁLISIS FINANCIERO DEL PROYECTO ║
╠════════════════════════════════════════╣
║ Presupuesto Bruto:      450,000 Bs   ║
║ Impuestos (16%):        -72,000 Bs   ║
║ Presupuesto Neto:       378,000 Bs   ║
║                                        ║
║ Total Gastos:           282,475 Bs   ║
║                                        ║
║ GANANCIA NETA:           95,525 Bs   ║
║ MARGEN DE GANANCIA:        21.2%     ║
║                                        ║
║ Ganancia/km:              1,194 Bs   ║
║ Ganancia/día:             2,123 Bs   ║
╚════════════════════════════════════════╝
```

---

## 🎨 Dashboard de Proyectos

### Vista Principal - Tabla de Ganancias
```
PROYECTO                  PRESUPUESTO   GASTOS    GANANCIA   MARGEN
─────────────────────────────────────────────────────────────────────
Alcaldía 80km             450,000      282,475    95,525    21.2% 🟢
Mantenimiento Ruta 5      280,000      145,000   119,000    42.5% 🟢
Limpieza Vías             120,000       65,000    38,500    32.1% 🟢
Mantenimiento Carreteras  350,000      220,000   112,000    32.0% 🟢
─────────────────────────────────────────────────────────────────────
TOTALES                 1,200,000      712,475   365,025    30.4% 🟢
```

**Acciones**: Ver Detalle | Editar | Eliminar | Nuevo Proyecto

---

## 🔄 Sistema de Plantillas (Opcional pero Recomendado)

Para evitar escribir gastos repetitivos manualmente:

### Crear Plantilla Estándar
```
Nombre: "Proyecto Estándar de Carreteras"

Gastos Fijos (siempre iguales):
├─ Transporte:    5,000 Bs
├─ Permisos:      2,500 Bs
└─ Madera:        8,000 Bs

Gastos Variables (se multiplican):
├─ Campamento:    1,500 Bs/día
├─ Comida:          400 Bs/día
└─ Diesel:          245 Bs/km

Gastos por Empleado:
├─ Operario:      6,000 Bs/día
├─ Ayudante:      5,250 Bs/día
├─ Encargado:     6,000 Bs/día
└─ Cocinera:         35 Bs/día

Gastos por Máquina:
└─ Mantenimiento: 1,200 Bs/proyecto
```

**Al crear proyecto nuevo:**
1. Selecciona plantilla → Gastos se pre-llenan automáticamente
2. Edita solo lo que es diferente
3. Ahorra tiempo y evita errores

---

## 📊 Base de Datos - Cambios Requeridos

### Tabla `obras` - Nuevos Campos
```sql
ALTER TABLE obras ADD COLUMN (
  presupuesto_bruto DECIMAL(10,2),
  presupuesto_neto DECIMAL(10,2),
  gasto_diesel DECIMAL(10,2),
  gasto_personal DECIMAL(10,2),
  gasto_comida DECIMAL(10,2),
  gasto_mantenimiento DECIMAL(10,2),
  gasto_otros DECIMAL(10,2),
  gasto_total DECIMAL(10,2),
  ganancia_neta DECIMAL(10,2),
  margen_ganancia DECIMAL(5,2),
  kilometros_totales INT,
  duracion_dias INT,
  estado ENUM('planeado', 'en_progreso', 'completado'),
  fecha_inicio DATE,
  fecha_fin DATE,
  tipo_presupuesto ENUM('fijo', 'tarifa'),
  presupuesto_adjudicado DECIMAL(10,2)
);
```

### Nuevas Tablas de Relación
```sql
CREATE TABLE proyecto_maquinaria (
  id INT PRIMARY KEY AUTO_INCREMENT,
  proyecto_id INT,
  maquinaria_id INT,
  dias_utilizados INT,
  FOREIGN KEY (proyecto_id) REFERENCES obras(id),
  FOREIGN KEY (maquinaria_id) REFERENCES maquinaria(id)
);

CREATE TABLE proyecto_personal (
  id INT PRIMARY KEY AUTO_INCREMENT,
  proyecto_id INT,
  personal_id INT,
  rol VARCHAR(100),
  dias_trabajados INT,
  salario_dia DECIMAL(10,2),
  FOREIGN KEY (proyecto_id) REFERENCES obras(id),
  FOREIGN KEY (personal_id) REFERENCES personal(id)
);

CREATE TABLE plantillas_gasto (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  descripcion TEXT,
  gastos_fijos JSON,
  gastos_variables JSON,
  gastos_por_empleado JSON,
  gastos_por_maquina JSON,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ Plan de Implementación (9 Fases)

### Fase 1: Eliminar módulos Madera y Rodeos (0.5h)
- Eliminar componentes, rutas, endpoints, referencias

### Fase 2: Rediseñar BD - Nuevos campos y tablas (1h)
- Alterar tabla `obras`
- Crear tablas de relación
- Migrar datos existentes

### Fase 3: Crear ProyectoForm con formulario editable (2h)
- 6 secciones con inputs editables
- Validaciones básicas
- Manejo de estado

### Fase 4: Crear ResumenFinanciero con cálculos (1h)
- Cálculos automáticos en tiempo real
- Formateo de moneda
- Indicadores visuales

### Fase 5: Crear Dashboard de Proyectos (1.5h)
- Tabla con todos los proyectos
- Búsqueda y filtrado
- Acciones CRUD
- Totales resumidos

### Fase 6: Actualizar Backend - Endpoints (1h)
- GET/POST/PUT/DELETE proyectos
- Endpoint de cálculo financiero
- Remover endpoints de Madera/Rodeos

### Fase 7: Crear utilidades de cálculo (0.5h)
- Funciones puras de cálculo
- Reutilizables en frontend y backend

### Fase 8: Integrar en App.js y navegación (0.5h)
- Renombrar rutas
- Actualizar sidebar
- Verificar navegación

### Fase 9: Testing y validación (1h)
- Crear proyectos con diferentes tipos de presupuesto
- Editar gastos y verificar cálculos
- Verificar impuestos (16%)
- Verificar ganancias y márgenes
- Testing en navegadores

**TIEMPO TOTAL ESTIMADO: 8-10 horas**

---

## ✅ Beneficios del Nuevo Sistema

| Aspecto | Antes | Después |
|---------|-------|---------|
| Análisis Financiero | ❌ Manual | ✅ Automático |
| Presupuesto vs Gasto | ❌ No disponible | ✅ Visible en tiempo real |
| Margen de Ganancia | ❌ No calculado | ✅ % automático |
| Gasto por Km | ❌ No disponible | ✅ Métrica disponible |
| Gasto por Día | ❌ No disponible | ✅ Métrica disponible |
| Rentabilidad por Proyecto | ❌ Desconocida | ✅ Clara y visible |
| Comparación Proyectos | ❌ Difícil | ✅ Dashboard visual |
| Identificar Costos Altos | ❌ Manual | ✅ Automático |

---

## 🚀 Próximos Pasos

1. **Aprobación de diseño** - Validar estructura con usuario
2. **Iniciar Fase 1** - Eliminar Madera y Rodeos
3. **Fase 2-7** - Implementación paralela si es posible
4. **Fase 8-9** - Integración y testing

---

## 📝 Notas Importantes

- Todo es **editable** - precios, salarios, cantidades
- Los cálculos son **automáticos** - se actualizan en tiempo real
- El sistema es **flexible** - soporta presupuestos fijos y por tarifa
- Se puede implementar **plantillas** para acelerar creación de proyectos
- Base sólida para **reportes futuros** (PDF, Excel, etc.)

---

**Documento creado por análisis de 3 agentes especializados:**
- Code Quality Analysis
- Code Efficiency & Performance Analysis
- Code Reuse Analysis

**Estado**: Listo para implementación
