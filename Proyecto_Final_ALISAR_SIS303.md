# UNIVERSIDAD TECNOLÓGICA PRIVADA DE SANTA CRUZ  
## PROYECTO FINAL  
### Sistema de Información Integral para ALISAR S.R.L.

---

**MATERIA:** ANÁLISIS Y MODELADO DE SISTEMAS — SIS-303  
**DOCENTE:** [Nombre del Docente]  
**GRUPO:** Grupo ALISAR — Equipo de Desarrollo  
**INTEGRANTES:**  
- Armando Martin Cortez Uechi  
- [Integrante 2 — Nombre Completo]  
- [Integrante 3 — Nombre Completo]  

**SANTA CRUZ — BOLIVIA**  
**2026**

---

## Tabla de Contenido

1. Introducción  
2. Planteamiento del Problema  
3. Justificación General  
4. Objetivos  
   - 4.1 Objetivo General  
   - 4.2 Objetivos Específicos  
5. Alcance del Proyecto  
6. Metodología de Desarrollo  
7. Fase de Análisis  
   - 7.1 Entrevista y/o Cuestionario  
   - 7.2 Actores del Sistema  
   - 7.3 Requerimientos  
     - 7.3.1 Requerimientos Funcionales  
     - 7.3.2 Requerimientos No Funcionales  
     - 7.3.3 Identificación de Procesos  
     - 7.3.4 Análisis de Requerimientos — Casos de Uso  
8. Fase de Diseño  
   - 8.1 Diseño General de Base de Datos  
   - 8.2 Diseño Específico de BD — Casos de Uso  
   - 8.3 Diseño de Interfaces  
   - 8.4 Diseño de Arquitectura  
9. Desarrollo (Codificación – Programación)  
   - 9.1 Herramientas Utilizadas  
   - 9.2 Codificación del Sistema  
10. Pruebas  

---

## 1. Introducción

ALISAR S.R.L. es una empresa constructora privada con sede en Santa Cruz de la Sierra, Bolivia. Se dedica al desarrollo de proyectos de infraestructura civil, incluyendo obras viales, edificaciones y explotación de recursos madereros en campamentos distribuidos en el departamento de Santa Cruz y zonas del Beni.

La empresa opera simultáneamente en múltiples frentes de trabajo: gestiona contratos de construcción con clientes públicos y privados, administra una flota de maquinaria pesada (topadoras, motoniveladoras, retroexcavadoras, volquetes), coordina campamentos forestales en zonas remotas y mantiene una planilla de personal técnico y operativo distribuida entre la oficina central y los campamentos.

Ante la creciente complejidad de sus operaciones y la necesidad de contar con información centralizada y oportuna para la toma de decisiones gerenciales, surge la necesidad de implementar un Sistema de Información Integral que reemplace los métodos manuales actuales basados en hojas de cálculo Excel, cuadernos físicos y archivos dispersos.

El presente documento describe el proceso completo de análisis, diseño, desarrollo y pruebas del **Sistema de Información ALISAR**, desarrollado como proyecto final de la materia Análisis y Modelado de Sistemas (SIS-303) en la Universidad Tecnológica Privada de Santa Cruz (UTEPSA).

---

## 2. Planteamiento del Problema

ALISAR S.R.L. actualmente gestiona la totalidad de sus operaciones administrativas y operativas mediante hojas de cálculo en Microsoft Excel, cuadernos físicos y archivos dispersos en diferentes computadoras. Esta situación genera múltiples inconvenientes que impactan directamente en la eficiencia operativa y en la toma de decisiones gerenciales. Entre los principales problemas identificados se encuentran:

- **Ausencia de sistema centralizado para obras:** No existe una forma unificada de conocer en tiempo real el avance, los costos incurridos y el personal asignado a cada proyecto de construcción o forestal.

- **Falta de control sobre maquinaria pesada:** La asignación de equipos se maneja verbalmente o en planillas sueltas, lo que provoca duplicaciones en la asignación y demoras en la detección de equipos que requieren mantenimiento preventivo.

- **Gestión manual de recursos humanos:** Los contratos, asistencia en campamentos, cálculo de salarios con bonos por campo y registros de vacaciones se manejan manualmente, generando errores y pérdida de tiempo administrativo.

- **Control deficiente del ciclo forestal:** El seguimiento de las etapas del "rodeo" (tumbado, jalado, clasificación en punto medio, entrega al aserradero) se registra en cuadernos físicos, sin control de volúmenes ni trazabilidad del proceso.

- **Manejo desorganizado de permisos forestales:** Documentos críticos como el POAT (Plan Operativo Anual de Aprovechamiento Forestal) y permisos de corte no cuentan con alertas de vencimiento, lo que representa un riesgo legal y operativo para la empresa.

- **Imposibilidad de generar reportes consolidados:** La gerencia no puede obtener en tiempo real una visión global del estado financiero, de avance y de recursos de todos los proyectos simultáneos, lo que limita la calidad de las decisiones estratégicas.

---

## 3. Justificación General

Se requiere desarrollar un Sistema de Información Web que permita a ALISAR S.R.L. centralizar y automatizar la gestión de sus operaciones principales, reemplazando el uso de hojas de cálculo y registros manuales.

El sistema aporta valor en tres dimensiones:

**Dimensión operativa:** Permite a los jefes de obra e ingenieros de campo registrar y actualizar el avance de proyectos, el estado de la maquinaria y el personal asignado desde cualquier computadora, eliminando la dependencia de archivos físicos.

**Dimensión administrativa:** Centraliza la gestión de personal, contratos, permisos forestales y documentos legales en una sola plataforma, con alertas automáticas de vencimiento y un historial completo de cambios para auditoría.

**Dimensión gerencial:** Brinda a la gerencia un panel de control (Dashboard) con indicadores clave, gráficos de avance de obras, estado de maquinaria y volumen forestal extraído, facilitando la toma de decisiones basada en datos reales y actualizados.

Desde el punto de vista académico, el proyecto aplica de forma integral los conceptos de análisis de requerimientos, modelado de sistemas, diseño de bases de datos y desarrollo de aplicaciones web estudiados en la materia SIS-303.

---

## 4. Objetivos

### 4.1 Objetivo General

Diseñar y desarrollar un sistema de información centralizado para la empresa ALISAR S.R.L., empleando herramientas de gestión de bases de datos y modelado de sistemas, para automatizar el control de las operaciones forestales, el rendimiento de la maquinaria, la gestión de obras y la toma de decisiones gerenciales.

### 4.2 Objetivos Específicos

1. Identificar los procesos operativos y administrativos de ALISAR S.R.L. mediante el levantamiento de información con los responsables de cada área, utilizando entrevistas semiestructuradas como técnica principal.

2. Modelar el flujo de trabajo de la empresa mediante diagramas de actividades y casos de uso, asegurando la trazabilidad de cada operación técnica y administrativa.

3. Diseñar la estructura relacional de la base de datos necesaria para almacenar y gestionar de forma segura y consistente la información de proyectos, personal, maquinaria y operaciones forestales.

4. Implementar los módulos de registro, seguimiento y reporte que permitan a los usuarios optimizar la gestión de mantenimiento de maquinaria, control de obras y cumplimiento de permisos forestales.

5. Desarrollar un panel de control gerencial con indicadores estadísticos y alertas automáticas que faciliten la supervisión integral de todas las operaciones de la empresa.

6. Validar la funcionalidad del sistema mediante pruebas unitarias, de integración y funcionales que aseguren la correcta interacción entre los distintos módulos y roles de usuario.

---

## 5. Alcance del Proyecto

El sistema permitirá a ALISAR S.R.L. migrar de un control manual a una gestión digital integral. Los módulos y funcionalidades comprendidos dentro del alcance son:

**Módulo de Obras:** Registro completo de proyectos (nombre, código, cliente, presupuesto, fechas, responsables, estado y fases), control de avance porcentual, registro de gastos desglosados por categoría (diesel, materiales, mano de obra, mantenimiento) y exportación de reportes en PDF y Excel.

**Módulo de Maquinaria:** Inventario de equipos pesados con control de asignación a obras, registro de horas de operación, litros de diesel consumidos, historial de fallas y programación de mantenimientos preventivos con alertas de vencimiento.

**Módulo de Personal:** Gestión de la planilla de empleados con datos personales, laborales, tipo de contrato, cargo, departamento, salario y contacto de emergencia. Control de estado (Activo, Inactivo, Licencia, Vacaciones).

**Módulo de Control Forestal (Madera):** Registro del ciclo completo del rodeo forestal: contrato, equipo en campamento, extracción desde el monte al punto medio, clasificación de madera por especie y volumen, y entrega al aserradero. Control de permisos forestales con alertas de vencimiento. Asignación de personal al campamento mediante relación muchos a muchos.

**Dashboard Gerencial:** Panel de control con estadísticas en tiempo real (obras activas, equipos, personal, volumen forestal), gráficos interactivos (presupuesto vs. ejecutado, estado de maquinaria, contratos por estado, volumen mensual) y alertas de mantenimiento próximo.

**Historial de Auditoría:** Registro automático de todas las operaciones de creación, modificación y eliminación en el sistema, con filtros por módulo y acción, y paginación de resultados.

**Configuración y Respaldo:** Configuración de parámetros de la empresa (razón social, NIT, teléfono, email, ubicación) y funcionalidad de descarga de respaldo de la base de datos.

**Fuera del alcance:** El sistema no incluye módulo de nómina automatizada, control de inventario de insumos por ítem, gestión de proveedores, ni integración con sistemas contables externos.

---

## 6. Metodología de Desarrollo

El proyecto se desarrolla bajo la **Metodología Clásica de Desarrollo de Sistemas (SDLC — Systems Development Life Cycle)**. Este enfoque estructurado define una secuencia lógica de fases que permite trabajar de forma ordenada, asegurando que cada etapa cumpla con los objetivos antes de avanzar a la siguiente.

Las fases aplicadas en este proyecto son:

| Fase | Descripción | Resultado |
|------|-------------|-----------|
| **1. Planificación** | Definición del problema, objetivos y alcance del sistema. Identificación de actores y recursos. | Documento de alcance y plan de trabajo |
| **2. Análisis** | Levantamiento de requerimientos mediante entrevista al gerente. Identificación de actores, procesos y requerimientos funcionales/no funcionales. | Casos de uso, diagramas de actividades, listado de requerimientos |
| **3. Diseño** | Diseño conceptual y lógico de la base de datos. Diseño de interfaces y arquitectura del sistema. | Modelo ER, esquema relacional, prototipos de pantallas, diagrama de arquitectura |
| **4. Desarrollo** | Codificación del sistema usando React.js (frontend) y Node.js + Express.js (backend) con SQLite como motor de base de datos. | Sistema funcional con todos los módulos implementados |
| **5. Pruebas** | Verificación del correcto funcionamiento mediante pruebas unitarias, de integración y funcionales. | Registro de casos de prueba y resultados |

Esta metodología garantiza la coherencia del sistema frente a las necesidades reales de ALISAR S.R.L., al validar en cada fase que los entregables corresponden a los requerimientos levantados.

---

## 7. Fase de Análisis

### 7.1 Entrevista y/o Cuestionario

#### Datos de la Entrevista

| Campo | Detalle |
|-------|---------|
| Entrevistado | Gerente General — ALISAR S.R.L. |
| Entrevistador | Armando Martin Cortez Uechi |
| Institución | UTEPSA — Ing. en Sistemas |
| Asignatura | SIS-303 Análisis y Modelado de Sistemas |
| Tipo | Entrevista semiestructurada |
| Fecha | Junio 2026 |

#### Resumen de la Entrevista

La entrevista se realizó al representante y gerente general de ALISAR S.R.L. a través de una guía semiestructurada de 48 preguntas organizadas en 10 módulos temáticos. A continuación se presenta el resumen de las respuestas obtenidas por módulo.

---

**MÓDULO 1 — Información General de la Empresa**

*P1. ¿Cuál es el nombre completo y razón social?*  
ALISAR S.R.L. Opera desde hace más de 10 años en el rubro de la construcción civil y explotación forestal en Bolivia.

*P2. ¿Principales rubros de trabajo?*  
Obras viales y de infraestructura civil (carreteras, puentes, edificaciones), y explotación y comercialización de madera en campamentos forestales distribuidos en el departamento del Beni y Santa Cruz.

*P3. ¿Cuántas obras activas simultáneamente?*  
Entre 3 y 6 obras activas en simultáneo, dependiendo de la temporada. En época seca aumentan las operaciones forestales.

*P4. ¿Cuántos empleados y cómo se distribuyen?*  
Aproximadamente 25 a 40 empleados según la temporada: 4-5 en administración (oficina central), 8-12 operadores de maquinaria, y el resto como personal de campo en campamentos (jefes de monte, motosierristas, madereros, cocineros).

*P5. ¿Sucursales o campamentos?*  
Una oficina central en Santa Cruz. Los campamentos son temporales y se establecen en la zona de explotación; en promedio operan 2 a 3 campamentos simultáneos.

---

**MÓDULO 2 — Gestión de Proyectos y Obras**

*P6. ¿Cómo se registra una nueva obra?*  
Actualmente en una planilla Excel. Los datos que registran son: nombre del proyecto, cliente, presupuesto total, fechas de inicio y fin estimadas, responsable técnico (ingeniero residente) y número de contrato.

*P7. ¿Control de avance?*  
El ingeniero residente o el jefe de monte reporta el avance semanalmente mediante planillas físicas o mensajes de WhatsApp a la administración. No existe un sistema formal de registro de avance.

*P8. ¿Autorización de gastos?*  
Los gastos deben ser autorizados por el Gerente o Co-Gerente. Existe un presupuesto máximo definido por contrato. Los gastos en campo son enviados por el jefe de obra para aprobación.

*P9. ¿Fases definidas por proyecto?*  
Sí. Las fases más comunes son: Planificación, Diseño, Preparación del terreno, Ejecución, Acabados y Cierre.

*P10. ¿Contratos con clientes?*  
Sí, todo trabajo se formaliza con contrato. Es importante adjuntar la documentación correspondiente a cada proyecto (contratos, actas, memorandos).

---

**MÓDULO 3 — Maquinaria Pesada y Equipos**

*P11. ¿Tipos de maquinaria?*  
Topadoras (2-3), motoniveladoras (1-2), retroexcavadoras (1), volquetes/camiones (3-4), motosierras (varias). Total aproximado: 10-15 unidades entre equipos pesados y livianos.

*P12. ¿Control de asignación?*  
La asignación se comunica verbalmente y se anota en un cuaderno. No hay registro formal de fechas de traslado entre obras.

*P13. ¿Registro de horas trabajadas?*  
Se lleva un control básico del horómetro (maquinaria pesada) y kilometraje (camiones), registrado por el operador en planillas físicas que entrega al jefe de obra.

*P14. ¿Mantenimiento preventivo y correctivo?*  
El mantenimiento se realiza al salir de un proyecto o cada 200 horas de trabajo. Lo ejecutan mecánicos en campamento o en obra. No existe un historial formal de fallas o reparaciones, lo cual es un problema recurrente.

*P15. ¿Control de combustible?*  
Sí, se controla por planilla. El abastecimiento en campamentos se realiza mediante cisternas o bidones transportados desde la ciudad.

*P16. ¿Operadores fijos o rotantes?*  
Los operadores tienen equipos asignados preferentemente, pero pueden operar otros equipos según la necesidad de la obra.

---

**MÓDULO 4 — Rodeos y Manejo de Madera**

*P17. ¿Qué es un "rodeo" en ALISAR?*  
Un rodeo es el ciclo completo de extracción forestal: desde el tumbado de los árboles en el monte, el jalado (arrastre) hasta el punto medio o cargadero, la clasificación por especie y calidad, y finalmente el transporte al aserradero de destino. No es solo extracción; es todo el proceso hasta la entrega.

*P18. ¿Datos que registran de cada rodeo?*  
Nombre del contrato, contratante, ingeniero forestal responsable, campamento, zona de extracción, punto medio de carga, fechas de inicio de tumba y llegada al punto medio, especie de madera, volumen en m³, número de piezas, aserradero de destino, fecha de entrega y precio de venta.

*P19. ¿Rodeos asociados a obras específicas?*  
Los rodeos forestales son operaciones independientes de las obras civiles, aunque comparten maquinaria y personal. Tienen su propio circuito contractual (contratante, permiso forestal, aserradero).

*P20. ¿Permisos forestales con fecha de vencimiento?*  
Sí. El permiso crítico es el POAT (Plan Operativo Anual de Aprovechamiento Forestal), que vence anualmente. Operar con un POAT vencido genera sanciones legales graves. Actualmente no tienen un sistema de alerta para esto.

*P21. ¿Venden la madera? ¿A quiénes?*  
Sí, se vende a aserraderos y compradores locales. El precio se negocia por m³ según la especie. El registro de estas transacciones se lleva en cuadernos o en Excel de forma básica.

---

**MÓDULO 5 — Campamentos y Logística de Campo**

*P22. ¿Cuántos campamentos activos?*  
Generalmente 1 a 3 campamentos activos. Cada campamento está asociado a una zona de explotación forestal (no necesariamente a una obra civil).

*P23. ¿Asignación de personal a campamentos?*  
El personal se asigna por decisión del jefe de monte o gerente. Una persona puede trabajar en distintos trabajos en distintos períodos, pero generalmente está en un campamento a la vez.

*P24. ¿Control de asistencia en campamentos?*  
Lista de asistencia manual llevada por el jefe de campamento. Se envía semanalmente a la administración.

*P25. ¿Inventario de insumos en campamentos?*  
Sí. Se maneja inventario de combustible (diesel), alimentos y herramientas básicas. El encargado de campamento registra las entradas y salidas en cuaderno.

*P26. ¿Comunicación con la oficina?*  
El jefe de campamento reporta diariamente por WhatsApp o llamada telefónica. En zonas sin señal, los reportes son semanales.

---

**MÓDULO 6 — Recursos Humanos**

*P27. ¿Qué datos guardan de empleados?*  
CI/Cédula, nombre completo, cargo, fecha de ingreso, tipo de contrato (fijo/eventual), categoría salarial, celular y contacto de emergencia.

*P28. ¿Empleados fijos y eventuales?*  
Sí, los administrativos e ingenieros son personal fijo. Los operadores de maquinaria y el personal de campo son generalmente eventuales por proyecto o temporada.

*P29. ¿Cálculo de salario?*  
El salario base más bono por campamento (estadía en campo) para el personal operativo. Horas extra según registro del jefe de obra. Los viáticos se otorgan para traslados.

*P30. ¿Control de vacaciones y licencias?*  
Se lleva en planilla Excel. Las vacaciones las autoriza el gerente. No hay un control automatizado de días disponibles.

---

**MÓDULO 9 — Reportes y Necesidades de Gerencia**

*P41. ¿Qué información necesita ver la gerencia?*  
Estado de avance de cada obra con su porcentaje de ejecución, equipos disponibles vs. asignados, volumen de madera extraída en el período, permisos próximos a vencer y comparativo de presupuesto vs. gasto real por obra.

*P42. ¿Reportes actuales en Excel?*  
Se generan semanalmente: lista de obras con avance, planilla de personal por campamento y control de maquinaria asignada. El proceso toma 2-3 horas por semana de trabajo manual.

*P43. ¿Ver costo total por obra en tiempo real?*  
Es una necesidad crítica. Actualmente no se puede comparar el presupuesto contra el gasto real de forma inmediata; hay que consolidar múltiples archivos.

*P44. ¿Información inaccesible por estar dispersa?*  
Sí: el estado real de la maquinaria (¿cuántas están en mantenimiento ahora?), el total de m³ extraídos en el año, y el detalle de gastos por categoría por obra son imposibles de consultar sin consolidar múltiples fuentes.

---

**MÓDULO 10 — Usuarios del Sistema**

*P45. ¿Quiénes usarían el sistema?*  
Gerente General, Co-Gerente, Administrador, Ingenieros de obra (jefes de obra), Jefes de campamento/monte. Aproximadamente 6 a 10 usuarios activos.

*P46. ¿Acceso diferenciado por rol?*  
Sí. El gerente debe ver todo. Los jefes de obra solo deberían ver y editar sus proyectos asignados. El administrador gestiona el sistema.

*P47. ¿Acceso desde campo?*  
Preferentemente sí, desde computadora portátil o tablet en campamento.

*P48. ¿Internet en campamentos?*  
Variable. Algunos campamentos tienen señal móvil (3G/4G), otros no. Se prefiere que el sistema funcione en red local cuando hay conectividad.

---

**Preguntas de Cierre**

- **Problema más grande:** No saber en tiempo real cuánto se ha gastado en cada obra ni si los permisos forestales están vigentes.
- **Lo que más cuesta tiempo:** Consolidar la información de campo semanalmente para hacer reportes a la gerencia.
- **Función crítica que no puede faltar:** Las alertas de vencimiento de permisos forestales (POAT) y el control de avance de obras.
- **Fecha límite:** El sistema debería estar operativo antes de la próxima temporada de extracción forestal (inicio de época seca, mayo-junio).
- **Participación en pruebas:** Sí, el gerente y el administrador están dispuestos a participar en las pruebas del sistema.

---

### 7.2 Actores del Sistema

Los actores identificados a partir del análisis de la entrevista son los siguientes:

| Actor | Rol en el Sistema | Acceso |
|-------|-------------------|--------|
| **Gerente General** | Máxima autoridad operativa. Consulta el Dashboard, aprueba gastos y supervisa todos los módulos. | Total (lectura/escritura en todos los módulos) |
| **Co-Gerente** | Funciones equivalentes al Gerente General en ausencia del mismo. | Total |
| **Administrador del Sistema** | Gestiona los registros del sistema: crea, edita y elimina registros en todos los módulos. Administra usuarios y configuración. | Total |
| **Jefe de Obra / Ingeniero Residente** | Registra y actualiza el avance de su obra asignada, gestiona el personal y la maquinaria de su proyecto. | Lectura de todos; escritura en obras y madera asignadas |
| **Jefe de Campamento / Jefe de Monte** | Registra las operaciones forestales (rodeos), el personal en campamento y el estado de los equipos en campo. | Lectura/escritura en módulo de madera y personal asignado |
| **Sistema (automático)** | Genera alertas de mantenimiento de maquinaria y vencimiento de permisos forestales. Registra el log de auditoría. | Interno |

---

### 7.3 Requerimientos

#### 7.3.1 Requerimientos Funcionales

Los requerimientos funcionales definen las funciones que el sistema debe ejecutar para cumplir con las necesidades de ALISAR S.R.L.

**RF-01 — Gestión de Obras**
- El sistema permitirá el registro de obras con: nombre, código, descripción, tipo, cliente, provincia, municipio, localidad, dirección exacta, responsable técnico, supervisor, contratista, fechas de inicio/fin planeadas y reales, presupuesto y monto ejecutado.
- El sistema habilitará el control de avance porcentual (0%-100%) de cada obra.
- El sistema gestionará el desglose de gastos por categoría: diesel, mantenimiento, materiales, mano de obra y otros.
- El sistema permitirá filtrar obras por nombre, cliente y tipo.

**RF-02 — Gestión de Maquinaria**
- El sistema controlará el inventario de equipos con: nombre, tipo, marca, modelo, placa/serie, año, estado operativo, obra asignada, operador, horas de operación y litros de diesel consumidos.
- El sistema registrará el próximo mantenimiento preventivo y generará alertas cuando la fecha esté próxima (≤14 días).
- El sistema diferenciará estados: Operativo, Mantenimiento, Reparación, Inactivo, Desmantelado.

**RF-03 — Gestión de Personal**
- El sistema gestionará los datos de empleados: nombre, cédula, cargo, departamento, tipo de contrato, fecha de ingreso, salario, estado laboral, celular, email, contacto de emergencia y dirección.
- El sistema mostrará totales por estado (activos, en licencia) y suma de planilla mensual.
- El sistema diferenciará estados: Activo, Inactivo, Licencia, Vacaciones.

**RF-04 — Control Forestal (Rodeos)**
- El sistema registrará el ciclo completo del rodeo forestal en seis etapas: Contrato, Equipo/Campamento, Personal Asignado, Extracción Monte→Punto Medio, Clasificación en Punto Medio y Entrega al Aserradero.
- El sistema gestionará la asignación de personal al campamento mediante una relación muchos a muchos (una persona puede estar en varios trabajos en distintos períodos).
- El sistema registrará permisos forestales con fecha de vencimiento y generará alertas cuando la fecha esté a ≤30 días o haya vencido.
- El sistema mostrará el volumen total en m³ extraído y la cantidad de piezas por trabajo.

**RF-05 — Dashboard Gerencial**
- El sistema presentará estadísticas en tiempo real: número de obras activas, equipos registrados, personal total, contratos forestales activos y volumen forestal acumulado en m³.
- El sistema mostrará gráficos de: presupuesto vs. ejecutado por obra, estado de maquinaria (distribución), contratos forestales por estado y volumen forestal mensual.
- El sistema generará alertas visibles de mantenimiento de equipos próximo o vencido.

**RF-06 — Reportes y Exportación**
- El sistema generará reportes en formato PDF para cada módulo (Obras, Maquinaria, Personal, Madera) y un reporte general desde el Dashboard.
- El sistema exportará datos a formato Excel (.xlsx) con todos los campos de cada módulo.
- El sistema generará fichas PDF individuales por registro (ficha de obra, ficha de empleado, ficha forestal, ficha de equipo).

**RF-07 — Historial de Auditoría**
- El sistema registrará automáticamente todas las operaciones de creación (CREATE), modificación (UPDATE) y eliminación (DELETE) realizadas en el sistema.
- El historial incluirá: usuario, acción, módulo afectado, ID del registro, valores anteriores y nuevos, y fecha/hora.
- El historial será filtrable por módulo y tipo de acción, con paginación de 25 registros por página.

**RF-08 — Configuración y Respaldo**
- El sistema permitirá configurar los parámetros de la empresa: razón social, NIT, teléfono, email y ubicación.
- El sistema permitirá descargar un respaldo completo de la base de datos en formato .db.

**RF-09 — Autenticación y Seguridad**
- El sistema requerirá autenticación con usuario y contraseña para acceder a cualquier módulo.
- El sistema utilizará tokens JWT (JSON Web Token) para gestionar las sesiones de usuario.

---

#### 7.3.2 Requerimientos No Funcionales

Los requerimientos no funcionales establecen los atributos de calidad que el sistema debe cumplir:

**RNF-01 — Seguridad y Control de Acceso**  
El sistema implementará autenticación mediante JWT. Todas las rutas de la API requerirán un token válido. Las contraseñas se almacenarán con hash bcrypt. El sistema diferenciará roles de acceso (administrador, residente, operador).

**RNF-02 — Integridad y Respaldo de Datos**  
El sistema implementará un endpoint de backup que permita descargar la base de datos completa. La base de datos SQLite garantiza consistencia mediante transacciones ACID. El log de auditoría garantiza trazabilidad de todos los cambios.

**RNF-03 — Disponibilidad y Rendimiento**  
El sistema está diseñado para operar en red local (LAN) desde una PC de escritorio o laptop, garantizando disponibilidad durante el horario laboral. Los tiempos de respuesta deben ser menores a 2 segundos para operaciones de listado.

**RNF-04 — Usabilidad**  
La interfaz debe ser intuitiva para usuarios no técnicos. Los formularios incluirán validación en tiempo real con mensajes de error claros. El diseño será responsivo para funcionar en pantallas de distintos tamaños.

**RNF-05 — Mantenibilidad**  
El código estará organizado en módulos separados por funcionalidad (routes, components, services, hooks). Las rutas del backend utilizarán listas blancas de campos (CAMPOS arrays) para prevenir inyección de datos no autorizados.

**RNF-06 — Auditoría**  
Todas las modificaciones realizadas en el sistema quedarán registradas en la tabla `audit_logs` con usuario responsable, fecha, hora y valores antes/después del cambio, permitiendo rastrear cualquier modificación histórica.

---

#### 7.3.3 Identificación de Procesos

A continuación se describen los procesos principales identificados mediante el análisis de la entrevista. Cada proceso corresponde a un diagrama de actividades.

---

**PROCESO 1 — Registro y Seguimiento de Obra**

```
[INICIO]
   ↓
¿La obra ya está registrada?
   ├── NO → Administrador ingresa datos de la obra
   │           (nombre, cliente, presupuesto, fechas, responsable)
   │         Sistema valida campos obligatorios
   │         Sistema guarda en BD y registra en auditoría
   └── SÍ → Jefe de Obra actualiza avance porcentual
                Sistema verifica rango 0-100%
                Sistema actualiza registro y auditoría
   ↓
¿Se requiere registrar gastos?
   ├── SÍ → Jefe de Obra ingresa gastos por categoría
   │           Sistema suma total de gastos
   │           Sistema compara con presupuesto
   └── NO ──────────────────────────┐
   ↓                                ↓
Dashboard actualiza estadísticas en tiempo real
   ↓
[FIN]
```

---

**PROCESO 2 — Gestión de Maquinaria y Mantenimiento**

```
[INICIO]
   ↓
Administrador registra equipo (nombre, tipo, placa, estado)
   ↓
Sistema asigna equipo a una obra
   ↓
Operador actualiza horas de operación (horómetro)
   ↓
¿Fecha de próximo mantenimiento ≤ 14 días?
   ├── SÍ → Sistema genera alerta en Dashboard
   │           Jefe de Obra actualiza estado a "Mantenimiento"
   │           Mecánico realiza el servicio
   │           Se actualiza próxima fecha de mantenimiento
   └── NO → Continúa operación normal
   ↓
[FIN]
```

---

**PROCESO 3 — Ciclo de Rodeo Forestal**

```
[INICIO]
   ↓
Gerente firma contrato con contratante forestal
   ↓
Administrador registra contrato en sistema
   (nombre, contratante, permiso POAT, ing. forestal)
   ↓
Se constituye el campamento y se asigna personal
   (jefe campamento, maquinaria, personal operativo)
   ↓
¿Permiso POAT vigente?
   ├── NO → Sistema alerta vencimiento → DETENER OPERACIÓN
   └── SÍ → Continúa
   ↓
Inicio de tumba en zona de extracción
   (registro: zona, fecha inicio tumba)
   ↓
Jalado/arrastre al punto medio
   (registro: punto medio, fecha llegada)
   ↓
Clasificación de madera en punto medio
   (registro: especie, volumen m³, n° piezas, calidad)
   ↓
Entrega al aserradero de destino
   (registro: aserradero, fecha entrega, responsable recepción, precio venta)
   ↓
Dashboard actualiza volumen forestal mensual
   ↓
[FIN]
```

---

**PROCESO 4 — Gestión de Personal y Asignación a Campamento**

```
[INICIO]
   ↓
Administrador registra nuevo empleado
   (nombre, CI, cargo, departamento, salario, contrato)
   ↓
Se asigna empleado a trabajo forestal (campamento)
   Sistema registra relación muchos-a-muchos (madera_personal)
   ↓
¿Cambio de estado del empleado?
   ├── Licencia → Sistema actualiza estado, Dashboard refleja cambio
   ├── Vacaciones → Sistema actualiza estado
   └── Inactivo → Sistema actualiza estado, excluye de planilla activa
   ↓
Generación de reporte de personal (PDF/Excel)
   ↓
[FIN]
```

---

#### 7.3.4 Análisis de Requerimientos — Diagramas de Casos de Uso

A continuación se presentan los casos de uso identificados para cada módulo del sistema.

---

**Casos de Uso — Módulo de Obras**

| ID | Caso de Uso | Actor Principal | Descripción |
|----|------------|-----------------|-------------|
| CU-01 | Registrar Obra | Administrador | Crear un nuevo registro de obra con todos sus datos. |
| CU-02 | Actualizar Avance | Jefe de Obra | Modificar el porcentaje de avance de una obra asignada. |
| CU-03 | Registrar Gastos | Jefe de Obra | Ingresar gastos desglosados por categoría en una obra. |
| CU-04 | Consultar Obras | Gerente / Admin | Listar y filtrar todas las obras con su estado y avance. |
| CU-05 | Eliminar Obra | Administrador | Eliminar un registro de obra con confirmación previa. |
| CU-06 | Exportar Reporte Obras | Gerente / Admin | Generar PDF o Excel con el listado completo de obras. |
| CU-07 | Ver Ficha Individual | Gerente / Admin | Generar PDF de una sola obra con todos sus datos. |

---

**Casos de Uso — Módulo de Maquinaria**

| ID | Caso de Uso | Actor Principal | Descripción |
|----|------------|-----------------|-------------|
| CU-08 | Registrar Equipo | Administrador | Crear nuevo registro de maquinaria o vehículo. |
| CU-09 | Asignar a Obra | Administrador | Asignar un equipo a una obra o campamento específico. |
| CU-10 | Actualizar Horas/Estado | Jefe de Obra | Actualizar horómetro, litros diesel y estado del equipo. |
| CU-11 | Programar Mantenimiento | Administrador | Registrar fecha de próximo mantenimiento preventivo. |
| CU-12 | Ver Alertas Mantenimiento | Gerente | Ver en Dashboard los equipos con mantenimiento próximo o vencido. |
| CU-13 | Exportar Reporte Maquinaria | Gerente / Admin | Generar PDF o Excel del inventario de equipos. |

---

**Casos de Uso — Módulo de Personal**

| ID | Caso de Uso | Actor Principal | Descripción |
|----|------------|-----------------|-------------|
| CU-14 | Registrar Empleado | Administrador | Crear ficha completa de un nuevo colaborador. |
| CU-15 | Actualizar Estado | Administrador | Cambiar estado del empleado (Activo/Licencia/Vacaciones/Inactivo). |
| CU-16 | Consultar Personal | Gerente / Admin | Listar, filtrar y buscar empleados por nombre o cargo. |
| CU-17 | Ver Totales Planilla | Gerente | Ver total de activos, en licencia y suma de salarios. |
| CU-18 | Exportar Reporte Personal | Gerente / Admin | Generar PDF o Excel con datos de todos los empleados. |
| CU-19 | Ver Ficha Empleado | Admin / RRHH | Generar PDF individual con todos los datos de un empleado. |

---

**Casos de Uso — Módulo de Control Forestal**

| ID | Caso de Uso | Actor Principal | Descripción |
|----|------------|-----------------|-------------|
| CU-20 | Registrar Trabajo Forestal | Admin / Jefe Monte | Crear nuevo rodeo con datos del contrato forestal. |
| CU-21 | Registrar Equipo Campamento | Jefe Monte | Registrar personal e ingenieros asignados al campamento. |
| CU-22 | Asignar Personal | Jefe Monte | Seleccionar y asignar empleados del módulo Personal al campamento (muchos-a-muchos). |
| CU-23 | Registrar Extracción | Jefe Monte | Registrar zona, punto medio y fechas de extracción. |
| CU-24 | Registrar Clasificación | Jefe Monte | Registrar especie, volumen m³, piezas y calidad. |
| CU-25 | Registrar Entrega Aserradero | Admin | Registrar destino, fecha, precio y responsable de recepción. |
| CU-26 | Ver Alerta Permiso Vencido | Gerente / Admin | Ver en la lista de trabajos los permisos vencidos o por vencer. |
| CU-27 | Ver Totales Forestales | Gerente | Ver volumen total m³, piezas, contratos activos y permisos vencidos. |
| CU-28 | Exportar Reporte Forestal | Gerente / Admin | Generar PDF o Excel del registro de trabajos forestales. |

---

## 8. Fase de Diseño

### 8.1 Diseño General de Base de Datos

#### Modelo Conceptual (Entidad-Relación)

Las entidades principales del sistema y sus relaciones son:

```
USUARIOS ─────── gestiona ────→ OBRAS
    │                              │
    │                         tiene muchos
    │                              │
    │                           GASTOS (embebidos en obra)
    │
    ├── gestiona ────→ MAQUINARIA
    │                      │
    │                 asignada a OBRA
    │
    ├── gestiona ────→ PERSONAL
    │                      │
    │                 asignado a (N:N)
    │                      │
    │                   MADERA_PERSONAL ── MADERA (Trabajo Forestal)
    │                                          │
    │                                     tiene ──→ PERMISO_FORESTAL
    │
    ├── genera ─────→ AUDIT_LOGS
    │
    └── configura ──→ CONFIG
```

**Entidades y atributos principales:**

- **OBRAS:** id, nombre, código, descripción, tipo, cliente, provincia, municipio, localidad, dirección, fase_actual, avance, responsable_técnico, supervisor, contratista, presupuesto, monto_ejecutado, inicio_planeado, fin_planeado, inicio_real, fin_real, estado, gastos (diesel, mantenimiento, materiales, mano_obra, otros), observaciones.

- **MAQUINARIA:** id, nombre, tipo, marca, modelo, placa, año, estado, obra_asignada, operador, horas_operación, litros_diesel_total, ultima_revisión, mantenimiento_próximo, historial_fallas, observaciones.

- **PERSONAL:** id, nombre, cédula, email, celular, fecha_nacimiento, género, cargo, departamento, fecha_ingreso, salario, tipo_contrato, estado, contacto_emergencia_nombre, contacto_emergencia_tel, contacto_emergencia_relación, dirección, notas.

- **MADERA (Trabajo Forestal):** id, nombre, contratante, segunda_parte, estado_contrato, permiso_forestal, fecha_vencimiento_permiso, ing_forestal, jefe_campamento, campamento, personal_asignado, maquinaria_asignada, obs_campamento, zona_extracción, punto_medio, fecha_inicio_tumba, fecha_llegada_punto_medio, obs_extracción, especie, nombre_común, nombre_científico, tipo_corte, grado_calidad, volumen, num_piezas, obs_clasificación, aserradero_destino, fecha_entrega_aserradero, responsable_recepción, precio_unitario, precio_venta, obs_entrega.

- **MADERA_PERSONAL (relación N:M):** id, madera_id (FK), personal_id (FK). [Restricción UNIQUE en (madera_id, personal_id)]

- **AUDIT_LOGS:** id, usuario, acción, tabla, registro_id, valores_anteriores (JSON), valores_nuevos (JSON), timestamp.

- **CONFIG:** id, clave, valor, tipo, actualizado.

- **USERS:** id, nombre, usuario (UNIQUE), password (hash bcrypt), rol, estado.

---

#### Modelo Lógico (Esquema Relacional)

```sql
-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   TEXT NOT NULL,
    usuario  TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol      TEXT DEFAULT 'residente',
    estado   TEXT DEFAULT 'activo'
);

-- Tabla de obras
CREATE TABLE IF NOT EXISTS obras (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre               TEXT NOT NULL,
    codigo               TEXT,
    descripcion          TEXT,
    tipo                 TEXT,
    cliente              TEXT,
    provincia            TEXT,
    municipio            TEXT,
    localidad            TEXT,
    direccion_exacta     TEXT,
    fase_actual          TEXT,
    avance               REAL DEFAULT 0,
    responsable_tecnico  TEXT,
    supervisor           TEXT,
    contratista          TEXT,
    personal_asignado    INTEGER,
    monto_ejecutado      REAL DEFAULT 0,
    inicio_planeado      TEXT,
    fin_planeado         TEXT,
    inicio_real          TEXT,
    fin_real             TEXT,
    observaciones        TEXT,
    estado               TEXT,
    presupuesto          REAL,
    gasto_diesel         REAL DEFAULT 0,
    gasto_mantenimiento  REAL DEFAULT 0,
    gasto_materiales     REAL DEFAULT 0,
    gasto_mano_obra      REAL DEFAULT 0,
    gasto_otros          REAL DEFAULT 0
);

-- Tabla de maquinaria
CREATE TABLE IF NOT EXISTS maquinaria (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre                TEXT NOT NULL,
    tipo                  TEXT,
    marca                 TEXT,
    modelo                TEXT,
    placa                 TEXT,
    anio                  INTEGER,
    estado                TEXT DEFAULT 'Operativo',
    obra_asignada         TEXT,
    operador              TEXT,
    horas_operacion       REAL DEFAULT 0,
    litros_diesel_total   REAL DEFAULT 0,
    ultima_revision       TEXT,
    mantenimiento_proximo TEXT,
    historial_fallas      TEXT,
    observaciones         TEXT
);

-- Tabla de personal
CREATE TABLE IF NOT EXISTS personal (
    id                           INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre                       TEXT NOT NULL,
    cedula                       TEXT,
    email                        TEXT,
    celular                      TEXT,
    fecha_nacimiento             TEXT,
    genero                       TEXT,
    cargo                        TEXT,
    departamento                 TEXT,
    fecha_ingreso                TEXT,
    salario                      REAL,
    tipo_contrato                TEXT,
    estado                       TEXT DEFAULT 'Activo',
    contacto_emergencia_nombre   TEXT,
    contacto_emergencia_tel      TEXT,
    contacto_emergencia_relacion TEXT,
    direccion                    TEXT,
    notas                        TEXT
);

-- Tabla de trabajos forestales (madera/rodeos)
CREATE TABLE IF NOT EXISTS madera (
    id                        INTEGER PRIMARY KEY AUTOINCREMENT,
    especie                   TEXT,
    nombre_comun              TEXT,
    nombre_cientifico         TEXT,
    procedencia               TEXT,
    destino                   TEXT,
    tipo_corte                TEXT,
    volumen                   REAL,
    campamento                TEXT,
    ubicacion_exacta          TEXT,
    responsable               TEXT,
    permiso_forestal          TEXT,
    fecha_vencimiento_permiso TEXT,
    comprador                 TEXT,
    precio_venta              REAL,
    -- Datos del contrato
    nombre                    TEXT,
    contratante               TEXT,
    segunda_parte             TEXT,
    estado_contrato           TEXT,
    -- Equipo y campamento
    ing_forestal              TEXT,
    jefe_campamento           TEXT,
    personal_asignado         TEXT,
    maquinaria_asignada       TEXT,
    obs_campamento            TEXT,
    -- Extracción
    zona_extraccion           TEXT,
    punto_medio               TEXT,
    fecha_inicio_tumba        TEXT,
    fecha_llegada_punto_medio TEXT,
    obs_extraccion            TEXT,
    -- Clasificación
    num_piezas                INTEGER,
    obs_clasificacion         TEXT,
    -- Entrega
    aserradero_destino        TEXT,
    fecha_entrega_aserradero  TEXT,
    responsable_recepcion     TEXT,
    obs_entrega               TEXT,
    precio_unitario           REAL,
    grado_calidad             TEXT,
    piezas                    INTEGER DEFAULT 0,
    -- Otros
    largo                     REAL,
    ancho                     REAL,
    espesor                   REAL,
    cantidad                  INTEGER,
    peso_estimado             REAL,
    estado_conservacion       TEXT,
    humedad                   REAL,
    defectos                  TEXT,
    fecha_aserrado            TEXT,
    fecha_recepcion           TEXT,
    valor_total               REAL,
    ubicacion_campamento      TEXT,
    notas                     TEXT,
    obra_asociada             TEXT
);

-- Tabla de relación personal-trabajo forestal (N:M)
CREATE TABLE IF NOT EXISTS madera_personal (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    madera_id   INTEGER NOT NULL,
    personal_id INTEGER NOT NULL,
    UNIQUE(madera_id, personal_id)
);

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario            TEXT,
    accion             TEXT,
    tabla              TEXT,
    registro_id        INTEGER,
    valores_anteriores TEXT,
    valores_nuevos     TEXT,
    timestamp          DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS config (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    clave      TEXT NOT NULL UNIQUE,
    valor      TEXT,
    tipo       TEXT DEFAULT 'string',
    actualizado DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 8.2 Diseño Específico de BD — Casos de Uso

La siguiente tabla relaciona cada caso de uso con las tablas de la base de datos involucradas:

| Caso de Uso | Tablas Involucradas | Operación BD |
|-------------|--------------------|--------------| 
| CU-01 Registrar Obra | `obras`, `audit_logs` | INSERT obras; INSERT audit_logs |
| CU-02 Actualizar Avance | `obras`, `audit_logs` | UPDATE obras SET avance; INSERT audit_logs |
| CU-03 Registrar Gastos | `obras`, `audit_logs` | UPDATE obras SET gasto_*; INSERT audit_logs |
| CU-04 Consultar Obras | `obras` | SELECT * FROM obras |
| CU-05 Eliminar Obra | `obras`, `audit_logs` | DELETE obras; INSERT audit_logs |
| CU-06 Exportar Obras | `obras` | SELECT * FROM obras |
| CU-08 Registrar Equipo | `maquinaria`, `audit_logs` | INSERT maquinaria; INSERT audit_logs |
| CU-09 Asignar Equipo a Obra | `maquinaria`, `audit_logs` | UPDATE maquinaria SET obra_asignada; INSERT audit_logs |
| CU-11 Programar Mantenimiento | `maquinaria`, `audit_logs` | UPDATE maquinaria SET mantenimiento_proximo; INSERT audit_logs |
| CU-12 Ver Alertas | `maquinaria` | SELECT WHERE mantenimiento_proximo <= fecha+14 |
| CU-14 Registrar Empleado | `personal`, `audit_logs` | INSERT personal; INSERT audit_logs |
| CU-15 Actualizar Estado | `personal`, `audit_logs` | UPDATE personal SET estado; INSERT audit_logs |
| CU-20 Registrar Trabajo Forestal | `madera`, `audit_logs` | INSERT madera; INSERT audit_logs |
| CU-22 Asignar Personal | `madera_personal`, `madera`, `personal` | DELETE/INSERT madera_personal |
| CU-26 Alerta Permiso | `madera` | SELECT WHERE fecha_vencimiento_permiso <= fecha+30 |
| CU-27 Ver Totales Forestales | `madera` | SELECT SUM(volumen), COUNT(*), ... FROM madera |
| Login/Auth | `users` | SELECT WHERE usuario=? AND password=? |
| Auditoría automática | `audit_logs` | INSERT (trigger en cada PUT/POST/DELETE) |
| CU-Backup | Sistema de archivos | Descarga del archivo .db |
| Configuración | `config` | SELECT/INSERT ON CONFLICT UPDATE |

---

### 8.3 Diseño de Interfaces

El sistema implementa una interfaz web de página única (SPA — Single Page Application) con un diseño profesional en tema oscuro. A continuación se describen las pantallas principales implementadas:

---

**Pantalla 1 — Login**  
Formulario centralizado con logo ALISAR, campos de usuario y contraseña, y botón de ingreso. Fondo oscuro con acento en color amarillo (#FFD700). Validación con mensaje de error en caso de credenciales incorrectas.

---

**Pantalla 2 — Dashboard (Panel de Control)**  
- Barra lateral (sidebar) colapsable con navegación por módulos.
- 5 tarjetas de estadísticas en la parte superior: Obras Activas, Maquinaria, Personal, Contratos Madera (cantidad), Volumen Forestal (m³).
- Panel de alertas de mantenimiento (naranja/rojo) mostrando días restantes por equipo.
- Gráfico de barras: Presupuesto vs. Ejecutado por obra.
- Gráfico de dona: Estado de maquinaria.
- Gráfico de área: Volumen forestal extraído por mes (últimos 8 meses).
- Gráfico de barras horizontal: Personal por cargo.
- Gráfico de dona: Contratos forestales por estado.
- Listado de últimas obras con barra de progreso de avance.

---

**Pantalla 3 — Módulo de Obras**  
- Encabezado con contador de registros y botones PDF, Excel, Nueva Obra.
- Barra de búsqueda y filtro por tipo de obra.
- Barra de totales: Presupuesto Total, Ejecutado Total, Gastos Totales, Avance Promedio %.
- Tarjetas de obra con: nombre, badge de estado, badge de fase, borde lateral colorido según avance (verde/amarillo/naranja), métricas de presupuesto/ejecutado/gastos/fecha de entrega, barra de progreso de avance animada, botones ficha PDF / editar / eliminar.
- Modal de formulario con secciones: Información General, Ubicación, Equipo y Responsables, Finanzas y Presupuesto, Gastos Desglosados, Fechas de Ejecución.

---

**Pantalla 4 — Módulo de Maquinaria**  
- Tarjetas con ícono por tipo de equipo (emoji), badge de estado con color (verde=Operativo, naranja=Mantenimiento, rojo=Reparación), placa, obra asignada, operador, horas, litros diesel, indicador de mantenimiento próximo.
- Modal con secciones: Identificación, Asignación Operativa, Especificaciones Técnicas, Mantenimiento.

---

**Pantalla 5 — Módulo de Personal**  
- Tarjetas con avatar de iniciales (color único por nombre), badge de estado, cargo resaltado en amarillo, departamento, celular, email, salario.
- Barra de totales: Total registros, Activos, En licencia/vacaciones, Planilla Total Bs.
- Modal con secciones: Datos Personales, Información Laboral, Contacto de Emergencia, Notas.

---

**Pantalla 6 — Módulo de Control Forestal (Madera)**  
- Barra de totales: Volumen Total m³, Total Piezas, Contratos Activos, Permisos Vencidos.
- Tarjetas con: borde lateral verde (o rojo/naranja si hay alerta de permiso), banner de alerta de permiso vencido o por vencer, nombre del contrato, estado, especie, contratante, campamento, ingeniero forestal, volumen m³ y n° de piezas, botones ficha PDF / editar / eliminar.
- Modal de formulario en 6 secciones: Datos del Contrato (amarillo), Equipo y Campamento (azul), Personal del Campamento con checklist relacional (verde), Extracción Monte→Punto Medio (naranja), Clasificación en Punto Medio, Entrega al Aserradero (púrpura).

---

**Pantalla 7 — Historial de Cambios**  
- Barra de herramientas con búsqueda, filtros por tabla y por acción (Creado/Actualizado/Eliminado), botón de actualizar y botón de Backup BD.
- Timeline vertical colapsable: cada registro muestra usuario, acción (badge coloreado), módulo, ID, fecha/hora. Al expandir muestra JSON de valores anteriores vs. nuevos.
- Paginación de 25 registros por página.

---

**Pantalla 8 — Configuración**  
- Sección Datos de la Empresa: Razón Social, NIT, Teléfono, Email, Ubicación.
- Sección Preferencias: Moneda, Idioma, Tema.
- Vista previa del encabezado PDF en tiempo real.
- Información del Sistema: versión, entorno, motor de BD.

---

### 8.4 Diseño de Arquitectura

El sistema implementa una **arquitectura de tres capas** (Three-Tier Architecture):

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│                    (Frontend — React.js)                     │
│                                                              │
│   Dashboard │ Obras │ Maquinaria │ Personal │ Madera        │
│   ChangeHistory │ Settings │ Login                          │
│                                                              │
│   Tecnologías: React 18, React Router v6, Recharts,         │
│   Lucide Icons, jsPDF, html2canvas, XLSX, Context API       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           │ JWT Bearer Token
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE NEGOCIO                          │
│                  (Backend — Node.js + Express.js)            │
│                                                              │
│   /api/auth      │ /api/obras      │ /api/maquinaria        │
│   /api/personal  │ /api/madera     │ /api/audit             │
│   /api/config    │ /api/backup                              │
│                                                              │
│   Middleware: verifyToken (JWT), CORS, express.json()       │
│   Tecnologías: Node.js v18+, Express.js, jsonwebtoken,      │
│   bcrypt, sqlite3, sqlite                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL (sqlite)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE DATOS                            │
│                    (Base de Datos — SQLite3)                 │
│                                                              │
│   users │ obras │ maquinaria │ personal │ madera            │
│   madera_personal │ audit_logs │ config                     │
│                                                              │
│   Características: Transacciones ACID, archivo único .db,   │
│   migraciones automáticas via addCol(), backup por descarga │
└─────────────────────────────────────────────────────────────┘
```

**Identificación de Paquetes (Módulos del Sistema)**

```
alisar-gestion/
├── backend/
│   ├── db/
│   │   └── init.js          ← Inicialización BD + migraciones
│   ├── middleware/
│   │   └── auth.js          ← Verificación JWT
│   ├── routes/
│   │   ├── auth.js          ← Login y autenticación
│   │   ├── obras.js         ← CRUD Obras
│   │   ├── maquinaria.js    ← CRUD Maquinaria
│   │   ├── personal.js      ← CRUD Personal
│   │   ├── madera.js        ← CRUD Trabajos Forestales
│   │   ├── audit.js         ← Lectura de audit_logs
│   │   └── config.js        ← Configuración del sistema
│   └── server.js            ← Servidor principal + backup
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Dashboard.js         ← Panel de control
        │   ├── Obras.js             ← Módulo de obras
        │   ├── Maquinaria.js        ← Módulo de maquinaria
        │   ├── Personal.js          ← Módulo de personal
        │   ├── Madera.js            ← Módulo forestal
        │   ├── ChangeHistory.js     ← Auditoría
        │   ├── Settings.js          ← Configuración
        │   ├── common/
        │   │   ├── Modal.js         ← Modal reutilizable
        │   │   ├── SearchBar.js     ← Buscador con filtros
        │   │   └── LoadingSpinner.js
        │   └── forms/
        │       ├── FormObrasDetallado.js
        │       ├── FormMaquinariaDetallado.js
        │       ├── FormPersonalDetallado.js
        │       └── FormMaderaDetallado.js
        ├── context/
        │   ├── AuthContext.js       ← Gestión de sesión
        │   └── ToastContext.js      ← Notificaciones
        ├── hooks/
        │   └── useCRUD.js           ← Hook genérico CRUD
        ├── services/
        │   └── api.js               ← Llamadas HTTP a la API
        └── utils/
            └── reportGenerator.js   ← PDF, Excel, Fichas
```

---

## 9. Desarrollo (Codificación – Programación)

### 9.1 Herramientas Utilizadas

| Categoría | Herramienta | Versión | Uso |
|-----------|------------|---------|-----|
| **IDE** | Visual Studio Code | 1.90+ | Entorno de desarrollo principal |
| **Runtime** | Node.js | v18 LTS | Ejecución del servidor backend |
| **Gestor de paquetes** | npm | v9+ | Gestión de dependencias |
| **Framework Frontend** | React.js | 18.2 | Interfaz de usuario (SPA) |
| **Enrutamiento** | React Router DOM | v6 | Navegación entre módulos |
| **Framework Backend** | Express.js | 4.18 | API REST del servidor |
| **Base de Datos** | SQLite3 + sqlite | 5.x / 0.x | Motor de base de datos relacional |
| **Autenticación** | jsonwebtoken (JWT) | 9.x | Tokens de sesión seguros |
| **Encriptación** | bcrypt | 5.x | Hash de contraseñas |
| **Reportes PDF** | jsPDF | 2.x | Generación de documentos PDF |
| **Captura HTML** | html2canvas | 1.x | Conversión HTML a imagen para PDF |
| **Exportación Excel** | XLSX (SheetJS) | 0.18 | Generación de archivos Excel |
| **Gráficos** | Recharts | 2.x | Gráficos interactivos en Dashboard |
| **Iconografía** | Lucide React | 0.x | Íconos vectoriales en la interfaz |
| **Control de versiones** | Git | 2.x | Control de versiones del proyecto |
| **Plataforma Git** | GitHub | — | Repositorio remoto |
| **CORS** | cors (npm) | 2.x | Gestión de peticiones cross-origin |
| **Variables de entorno** | dotenv | 16.x | Configuración del entorno backend |

---

### 9.2 Codificación del Sistema

#### Creación de la Base de Datos — `backend/db/init.js`

El módulo de inicialización crea automáticamente todas las tablas al iniciar el servidor, y ejecuta migraciones seguras usando la función `addCol()` para agregar columnas sin perder datos existentes.

```javascript
// Función de migración segura — agrega columna solo si no existe
const addCol = async (table, col, type) => {
    try {
        await db.run(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
    } catch (e) {
        // La columna ya existe — se ignora el error
    }
};

// Función de auditoría — registra cada operación CRUD
const logAudit = async (usuario, accion, tabla, registro_id, 
                         valores_anteriores, valores_nuevos) => {
    await db.run(
        `INSERT INTO audit_logs 
         (usuario, accion, tabla, registro_id, valores_anteriores, valores_nuevos)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [usuario || 'sistema', accion, tabla, registro_id,
         JSON.stringify(valores_anteriores), 
         JSON.stringify(valores_nuevos)]
    );
};
```

---

#### Hook CRUD Genérico — `frontend/src/hooks/useCRUD.js`

Para evitar repetición de código, se implementó un hook personalizado de React que encapsula las operaciones CRUD (listar, crear, actualizar, eliminar) y es reutilizado por los cuatro módulos principales.

```javascript
export const useCRUD = (serviceGet, serviceCreate, serviceUpdate, serviceDelete) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await serviceGet();
      setData(response.data || []);
    } catch (err) {
      showError(err.response?.data?.msg || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const update = async (id, updatedItem) => {
    try {
      await serviceUpdate(id, updatedItem);
      await fetchData();
      showSuccess('Actualizado correctamente');
      return true;
    } catch (err) {
      showError(err.response?.data?.msg || 'Error al actualizar');
      return false;
    }
  };

  return { data, loading, editingId, setEditingId, 
           create, update, delete: delete_item, refresh: fetchData };
};
```

---

#### Ruta Backend — Control Forestal con relación N:M — `backend/routes/madera.js`

La implementación de la asignación de personal al campamento utiliza una tabla de unión con restricción UNIQUE para garantizar integridad referencial.

```javascript
// Función auxiliar: sincroniza el personal asignado a un trabajo forestal
const savePersonal = async (maderaId, personalIds) => {
    // Primero elimina todas las asignaciones actuales
    await getDB().run('DELETE FROM madera_personal WHERE madera_id = ?', [maderaId]);
    
    if (!Array.isArray(personalIds) || personalIds.length === 0) return;
    
    // Inserta las nuevas asignaciones
    for (const pid of personalIds) {
        await getDB().run(
            'INSERT INTO madera_personal (madera_id, personal_id) VALUES (?, ?)',
            [maderaId, pid]
        );
    }
};

// GET /api/madera — incluye personal asignado en cada registro
router.get('/', verifyToken, async (req, res) => {
    const rows = await getDB().all('SELECT * FROM madera');
    for (const row of rows) {
        const asignados = await getDB().all(
            'SELECT personal_id FROM madera_personal WHERE madera_id = ?', [row.id]
        );
        row.personal_ids = asignados.map(r => r.personal_id);
    }
    res.json(rows);
});
```

---

#### Generación de Fichas PDF Individuales — `frontend/src/utils/reportGenerator.js`

El sistema genera fichas PDF individuales con todos los campos de cualquier registro mediante una función genérica que adapta los campos según el tipo de módulo.

```javascript
export const generateFichaIndividual = (tipo, registro) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const colorMap = { 
    obra: [74, 222, 128], personal: [167, 139, 250],
    madera: [249, 115, 22], maquinaria: [96, 165, 250] 
  };
  
  // Encabezado con color por módulo
  pdf.setFillColor(...(colorMap[tipo] || [255, 215, 0]));
  pdf.rect(0, 0, 210, 32, 'F');
  
  // Campos configurados por tipo de registro
  const campos = camposMap[tipo] || [];
  let y = 44;
  
  campos.forEach(([label, key], idx) => {
    const val = registro[key];
    if (!val && val !== 0) return;
    
    // Fila con fondo zebra para legibilidad
    if (idx % 2 === 0) {
      pdf.setFillColor(245, 247, 245);
      pdf.rect(15, y - 4, 180, 9, 'F');
    }
    
    pdf.setFont(undefined, 'bold');
    pdf.text(label, 20, y);
    pdf.setFont(undefined, 'normal');
    
    const lines = pdf.splitTextToSize(String(val), 115);
    pdf.text(lines, 80, y);
    y += Math.max(9, lines.length * 5 + 2);
  });
  
  pdf.save(`Ficha_${tipo}_${registro.nombre || registro.id}.pdf`);
};
```

---

#### Alerta de Permisos Forestales en Interfaz — `frontend/src/components/Madera.js`

El sistema detecta permisos vencidos o próximos a vencer directamente en la vista de lista y aplica estilos visuales diferenciados:

```javascript
// Evaluación de alerta de permiso por tarjeta
const hoy = new Date();
let permisoAlert = null;
if (m.fecha_vencimiento_permiso) {
    const venc = new Date(m.fecha_vencimiento_permiso);
    const dias = Math.ceil((venc - hoy) / 86400000);
    if (dias < 0)        
        permisoAlert = { color: C.red,    label: `Permiso VENCIDO (${Math.abs(dias)}d)` };
    else if (dias <= 30) 
        permisoAlert = { color: C.orange, label: `Permiso vence en ${dias}d` };
}

// En el JSX: borde de la tarjeta cambia de color según alerta
<div style={{
    border: `1px solid ${permisoAlert?.color === C.red ? `${C.red}44` : C.border}`,
    borderLeft: `4px solid ${permisoAlert ? permisoAlert.color : C.green}`,
}}>
    {permisoAlert && (
        <div style={{ color: permisoAlert.color, ... }}>
            <ShieldAlert size={13} /> {permisoAlert.label}
        </div>
    )}
</div>
```

---

#### Middleware de Autenticación JWT — `backend/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Token no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'alisar_secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token inválido o expirado' });
    }
};

module.exports = { verifyToken };
```

---

## 10. Pruebas

### Pruebas Unitarias — Validación de módulos individuales

| ID | Módulo | Caso de Prueba | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|----|--------|---------------|-----------------|--------------------|--------------------|--------|
| PU-01 | Login | Usuario y contraseña válidos | usuario: "admin", password: "1234" | Redirige al Dashboard con token JWT | Redirige correctamente al Dashboard | ✅ PASÓ |
| PU-02 | Login | Contraseña incorrecta | usuario: "admin", password: "xxxx" | Mensaje de error "Credenciales incorrectas" | Muestra mensaje de error en rojo | ✅ PASÓ |
| PU-03 | Obras | Crear obra sin nombre | nombre: "" | Error de validación "Nombre requerido" | Banner rojo con mensaje de error visible | ✅ PASÓ |
| PU-04 | Obras | Crear obra con avance > 100 | avance: 150 | Error "El avance debe ser entre 0 y 100" | Backend rechaza con status 400 | ✅ PASÓ |
| PU-05 | Maquinaria | Crear equipo con estado Operativo | estado: "Operativo" | Badge verde en la tarjeta | Badge verde muestra "Operativo" | ✅ PASÓ |
| PU-06 | Personal | Crear empleado sin nombre | nombre: "" | Error "Nombre requerido" | Error mostrado en formulario | ✅ PASÓ |
| PU-07 | Personal | Búsqueda por cargo | Buscar: "Operador" | Lista filtrada solo con operadores | Filtra correctamente por cargo | ✅ PASÓ |
| PU-08 | Madera | Crear rodeo con nombre | nombre: "Contrato Norte 01" | Registro creado exitosamente | Toast verde "Registrado correctamente" | ✅ PASÓ |
| PU-09 | Madera | Permiso vencido | fecha_vencimiento_permiso: "2024-01-01" | Banner rojo "Permiso VENCIDO" | Banner rojo visible en tarjeta | ✅ PASÓ |
| PU-10 | Madera | Permiso a 15 días | fecha_vencimiento_permiso: hoy + 15d | Banner naranja "Permiso vence en 15d" | Banner naranja visible | ✅ PASÓ |
| PU-11 | Config | Guardar nombre empresa | empresa_nombre: "ALISAR S.R.L." | Configuración guardada | Toast "Configuración guardada" | ✅ PASÓ |
| PU-12 | Backup | Descargar BD | Click en "Backup BD" | Descarga archivo .db | Archivo .db descargado correctamente | ✅ PASÓ |

---

### Pruebas de Integración — Verificación de interacción entre módulos

| ID | Flujo Integrado | Descripción | Resultado Esperado | Estado |
|----|-----------------|-------------|-------------------|--------|
| PI-01 | Login → Dashboard | Usuario inicia sesión y ve el Dashboard con datos reales | Dashboard carga con estadísticas de las 4 entidades | ✅ PASÓ |
| PI-02 | Crear Obra → Dashboard | Se crea una obra y el contador del Dashboard se actualiza | El número de obras en el stat card incrementa en 1 | ✅ PASÓ |
| PI-03 | Crear Personal → Asignar a Rodeo | Personal registrado aparece en la lista de selección del formulario forestal | El nuevo empleado aparece en el checklist del módulo Madera | ✅ PASÓ |
| PI-04 | Asignar Personal a Rodeo → Ver en Edición | Se asignan 2 personas a un trabajo forestal, se guarda y se reabre el registro | Los 2 empleados aparecen con badge "ASIGNADO" al editar | ✅ PASÓ |
| PI-05 | Crear Registro → Auditoría | Cualquier creación/edición/eliminación genera entrada en audit_logs | El historial de cambios muestra la operación con usuario y timestamp | ✅ PASÓ |
| PI-06 | Maquinaria → Alerta Dashboard | Se registra equipo con mantenimiento_proximo dentro de 10 días | El Dashboard muestra alerta naranja con el nombre del equipo y "10d" | ✅ PASÓ |
| PI-07 | Actualizar Obra → Barra Totales | Se actualiza presupuesto de una obra | La barra de totales de Obras recalcula el presupuesto total correctamente | ✅ PASÓ |
| PI-08 | Registrar Rodeo con Volumen → Dashboard | Se registra un rodeo con 50 m³ y fecha de inicio | El gráfico de volumen mensual del Dashboard refleja los 50 m³ en el mes correspondiente | ✅ PASÓ |

---

### Pruebas Funcionales — Validación de funcionalidades completas

| ID | Funcionalidad | Descripción del Escenario | Resultado Esperado | Estado |
|----|--------------|--------------------------|-------------------|--------|
| PF-01 | Flujo completo de obra | Crear → editar avance → registrar gastos → exportar PDF | PDF generado con todos los campos de la obra | ✅ PASÓ |
| PF-02 | Flujo completo forestal | Registrar contrato → asignar personal → registrar extracción → clasificación → entrega aserradero | Rodeo guardado con todas las etapas completas | ✅ PASÓ |
| PF-03 | Exportación Excel Madera | Click en "Excel" en módulo Madera | Archivo .xlsx descargado con 13 columnas: contrato, contratante, ing. forestal, campamento, especie, estado, permiso, zona, volumen, piezas, aserradero, precio | ✅ PASÓ |
| PF-04 | Exportación Excel Personal | Click en "Excel" en módulo Personal | Archivo .xlsx con 13 columnas incluyendo salario, contacto de emergencia y dirección | ✅ PASÓ |
| PF-05 | Ficha PDF individual Obra | Click en botón 🖨 en tarjeta de obra | PDF generado con todos los campos de esa obra, encabezado verde ALISAR | ✅ PASÓ |
| PF-06 | Ficha PDF individual Empleado | Click en botón 🖨 en tarjeta de empleado | PDF generado con datos personales, laborales y de emergencia | ✅ PASÓ |
| PF-07 | Historial con filtros | Filtrar historial por módulo "madera" y acción "DELETE" | Solo se muestran eliminaciones del módulo madera | ✅ PASÓ |
| PF-08 | Paginación en lista | Módulo Madera con más de 20 registros | Se muestran 20 por página con controles "Anterior / Siguiente" | ✅ PASÓ |
| PF-09 | Confirmación de eliminación | Click en eliminar cualquier registro | Aparece diálogo de confirmación; si cancela, no elimina | ✅ PASÓ |
| PF-10 | Dashboard Reporte General | Click en "Exportar Reporte" en Dashboard | PDF generado con estadísticas: obras, maquinaria, personal y m³ forestales | ✅ PASÓ |
| PF-11 | Barra totales Personal | Ver módulo Personal con empleados registrados | Muestra: total registros, activos, en licencia y suma de salarios Bs | ✅ PASÓ |
| PF-12 | Configuración empresa en PDF | Guardar nombre y NIT → generar cualquier PDF | El PDF muestra el nombre configurado en lugar del hardcodeado | ✅ PASÓ |

---

*Documento elaborado como Proyecto Final de la materia Análisis y Modelado de Sistemas (SIS-303)*  
*Universidad Tecnológica Privada de Santa Cruz — UTEPSA*  
*Santa Cruz de la Sierra, Bolivia — 2026*  
*Integrante: Armando Martin Cortez Uechi*
