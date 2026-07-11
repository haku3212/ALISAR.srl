# Mi Control Personal

Aplicación de escritorio para Windows, **100 % personal y offline**, para controlar:

- ⏱️ Horas trabajadas y cuánto deben pagarte (Bs 13,50/hora, configurable)
- 🚌 Pasajes que adelantas y luego te devuelven
- 💰 Ingresos y 🛒 gastos personales con categorías
- 🎯 Meta de ahorro (inicial: Bs 7.000) con estimación de cuándo la alcanzarás
- 📊 Presupuestos mensuales con alertas, calendario, historial y reportes

Todo se guarda localmente en **SQLite**. No necesita internet.

## Tecnologías

React · TypeScript · Vite · Electron · SQLite (sql.js) · Node.js

## Estructura

```
mi-control-personal/
├── electron/          Proceso principal de Electron
│   ├── main.ts        Ventana, IPC, respaldos, exportación PDF
│   ├── preload.ts     Puente seguro (contextBridge) hacia React
│   └── db.ts          Base de datos SQLite: esquema, validaciones, CRUD
├── shared/types.ts    Tipos compartidos entre Electron y React
├── src/               Interfaz React
│   ├── pages/         Dashboard, Horas, Pasajes, Ingresos, Gastos,
│   │                  Meta, Presupuesto, Calendario, Historial,
│   │                  Reportes, Configuración
│   ├── components/    Tarjetas, modales, tablas, gráficos SVG, iconos
│   ├── context/       Estado global (carga de datos + notificaciones)
│   └── utils/         Cálculos automáticos, fechas y formato de moneda
└── scripts/
    ├── test-db.mjs    22 pruebas de la capa de datos (npm run test:db)
    └── e2e-check.mjs  Verificación de la app real con capturas
```

## Base de datos

Archivo `mi-control-personal.db` en la carpeta de datos del usuario
(`%APPDATA%/mi-control-personal` en Windows). Tablas:

| Tabla | Contenido |
|---|---|
| `settings` | nombre, moneda, valor/hora, tema, formato de fecha… |
| `categories` | categorías de ingreso y gasto (se pueden crear más) |
| `work_entries` | horas trabajadas, tarifa, pago, estado pendiente/pagado |
| `fares` | pasajes ida/vuelta, estado pendiente/devuelto |
| `incomes` / `expenses` | movimientos con categoría, método y observación |
| `goal` | meta de ahorro (monto, fecha inicio, fecha objetivo opcional) |
| `budgets` | límites mensuales por categoría de gasto |

Reglas importantes ya implementadas:

- Los **pasajes pendientes no cuentan como gasto definitivo**: descuentan del
  saldo en caja pero no del ahorro.
- Al marcar horas como **pagadas** se crea automáticamente el ingreso
  correspondiente (y se elimina si vuelves a marcarlas pendientes).
- Validación de fechas, horarios y montos; rechazo de registros duplicados;
  mensajes de error claros en pantalla.

## Cómo desarrollar

```bash
npm install
npm run dev        # Vite + Electron con recarga
```

## Pruebas

```bash
npm run test:db    # pruebas de la base de datos (Node puro)
node scripts/e2e-check.mjs   # recorre toda la app real y saca capturas
```

## Crear el instalador para Windows

En una máquina Windows:

```bash
npm install
npm run dist:win
```

El instalador NSIS queda en `release/` (con acceso directo en el escritorio).

## Respaldos

- Copia automática al cerrar la app (configurable, conserva las últimas 20)
- Copia manual, restauración y exportación de la base desde **Configuración**
- Los respaldos se guardan en la carpeta `respaldos` dentro de los datos de la app
