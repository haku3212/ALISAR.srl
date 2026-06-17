const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const PHASES = [
  {
    nombre: 'ACTIVIDADES DE GESTIÓN DE PROYECTO',
    color: [255, 215, 0],
    tareas: [
      { nombre: 'Carta del proyecto', milestone: false },
      { nombre: 'Plan de Gestión de Proyectos', milestone: false },
      { nombre: 'Actividades de Monitoreo y Control', milestone: false },
      { nombre: 'Actividades de Gestión PU Completadas', milestone: true },
    ],
  },
  {
    nombre: 'INICIACIÓN / PLANIFICACIÓN',
    color: [96, 165, 250],
    tareas: [
      { nombre: 'Estudio de la Factibilidad', milestone: false },
      { nombre: 'Caso de Negocios', milestone: false },
      { nombre: 'Planificación de Proyectos', milestone: false },
      { nombre: 'Iniciación / Actividades de Planificación Completadas', milestone: true },
    ],
  },
  {
    nombre: 'ANÁLISIS DE REQUERIMIENTO',
    color: [167, 139, 250],
    tareas: [
      { nombre: 'Recopilación de Requisitos', milestone: false },
      { nombre: 'Planificación de seguridad', milestone: false },
      { nombre: 'Análisis de requisitos Completado', milestone: true },
    ],
  },
  {
    nombre: 'DISEÑO',
    color: [249, 115, 22],
    tareas: [
      { nombre: 'Diseño General', milestone: false },
      { nombre: 'Prueba de Conceptos', milestone: false },
      { nombre: 'Diseño Detallado', milestone: false },
      { nombre: 'Especificación Técnica', milestone: false },
      { nombre: 'Diseño Completado', milestone: true },
    ],
  },
  {
    nombre: 'DESARROLLO',
    color: [52, 211, 153],
    tareas: [
      { nombre: 'Implementación de Interfaces', milestone: false },
      { nombre: 'Programación de las Clases', milestone: false },
      { nombre: 'Implementación de BD', milestone: false },
      { nombre: 'Programación de Control', milestone: false },
    ],
  },
  {
    nombre: 'PRUEBAS DE CALIDAD',
    color: [248, 113, 113],
    tareas: [
      { nombre: 'Prueba de unidad', milestone: false },
      { nombre: 'Prueba de funcionamiento', milestone: false },
      { nombre: 'Examen de integración', milestone: false },
      { nombre: 'Prueba de Regresión', milestone: false },
      { nombre: 'Prueba del Sistema', milestone: false },
      { nombre: 'Prueba de aceptación usuario', milestone: false },
      { nombre: 'Prueba Completada', milestone: true },
    ],
  },
  {
    nombre: 'IMPLEMENTACIÓN',
    color: [251, 146, 60],
    tareas: [
      { nombre: 'Despliegue', milestone: false },
      { nombre: 'Formación / Capacitación', milestone: false },
      { nombre: 'Soporte', milestone: false },
      { nombre: 'Desarrollo / Implementación Completada', milestone: true },
    ],
  },
  {
    nombre: 'OPERACIONES Y MANTENIBILIDAD',
    color: [56, 189, 248],
    tareas: [
      { nombre: 'Actividades Operacionales', milestone: false },
      { nombre: 'Operaciones y Mantenimiento Completado', milestone: true },
    ],
  },
  {
    nombre: 'DISPOSICIÓN',
    color: [192, 132, 252],
    tareas: [
      { nombre: 'Archivo', milestone: false },
      { nombre: 'Disposición', milestone: false },
      { nombre: 'Proyecto Completado', milestone: true },
    ],
  },
];

// Descripciones de cada actividad
const DESCRIPCIONES = {
  'Carta del proyecto': 'Documento formal que autoriza el inicio del proyecto, define su alcance de alto nivel, objetivos, interesados principales y el director del proyecto asignado.',
  'Plan de Gestión de Proyectos': 'Documento consolidado que describe cómo se planificará, ejecutará, monitoreará, controlará y cerrará el proyecto. Incluye planes subsidiarios de alcance, tiempo, costo, calidad y comunicaciones.',
  'Actividades de Monitoreo y Control': 'Procesos continuos para seguir, revisar y regular el avance del proyecto frente a la línea base. Incluye control de cambios, informes de estado y métricas de rendimiento (CPI, SPI).',
  'Actividades de Gestión PU Completadas': '✔ HITO: Todos los procesos de gestión del proyecto han sido formalmente establecidos y aprobados.',

  'Estudio de la Factibilidad': 'Análisis técnico, económico y operacional que determina si el proyecto es viable. Evalúa costos, beneficios, riesgos y alternativas de solución.',
  'Caso de Negocios': 'Justificación formal del proyecto que cuantifica el valor que aportará a la organización, el ROI esperado y los criterios de éxito desde la perspectiva del negocio.',
  'Planificación de Proyectos': 'Elaboración del cronograma detallado (WBS, EDT), asignación de recursos, estimación de costos y definición de hitos. Produce la línea base del proyecto.',
  'Iniciación / Actividades de Planificación Completadas': '✔ HITO: El proyecto ha sido formalmente iniciado y el plan de gestión está aprobado por los interesados clave.',

  'Recopilación de Requisitos': 'Proceso de entrevistas, talleres y encuestas con los stakeholders para identificar, documentar y priorizar todas las necesidades funcionales y no funcionales del sistema.',
  'Planificación de seguridad': 'Identificación de activos de información, amenazas, vulnerabilidades y controles requeridos. Define la política de seguridad del sistema y cumplimiento normativo.',
  'Análisis de requisitos Completado': '✔ HITO: Los requisitos del sistema han sido validados, aprobados y están listos para la fase de diseño.',

  'Diseño General': 'Arquitectura de alto nivel del sistema: capas, módulos, tecnologías seleccionadas, patrones de diseño y decisiones arquitectónicas principales.',
  'Prueba de Conceptos': 'Prototipo mínimo para validar la viabilidad técnica de los componentes más riesgosos o innovadores antes del diseño detallado.',
  'Diseño Detallado': 'Especificación completa de cada módulo del sistema: clases, interfaces, esquema de base de datos, flujos de datos y diagramas de secuencia.',
  'Especificación Técnica': 'Documento técnico que detalla las tecnologías, versiones, APIs, protocolos de comunicación, estándares de codificación y restricciones del entorno.',
  'Diseño Completado': '✔ HITO: El diseño ha sido revisado, verificado contra los requisitos y aprobado por el equipo técnico.',

  'Implementación de Interfaces': 'Desarrollo de todas las pantallas y componentes de la interfaz de usuario conforme a los mockups y especificaciones de UX/UI aprobadas.',
  'Programación de las Clases': 'Codificación de la lógica de negocio, servicios, controladores y entidades del dominio según el diseño detallado.',
  'Implementación de BD': 'Creación del esquema de base de datos, migraciones, procedimientos almacenados, índices y datos iniciales (seeds).',
  'Programación de Control': 'Desarrollo de la capa de integración: APIs REST, middleware de autenticación, manejo de errores, logging y configuración de seguridad.',

  'Prueba de unidad': 'Verificación aislada de cada función, método o componente individual para confirmar que produce el resultado esperado con entradas válidas e inválidas.',
  'Prueba de funcionamiento': 'Validación de que cada funcionalidad del sistema opera correctamente según los casos de uso y requisitos funcionales definidos.',
  'Examen de integración': 'Pruebas que verifican la correcta comunicación e intercambio de datos entre módulos, servicios y componentes del sistema.',
  'Prueba de Regresión': 'Ejecución del conjunto completo de pruebas tras cada cambio para asegurar que las modificaciones no introdujeron defectos en funcionalidades existentes.',
  'Prueba del Sistema': 'Evaluación del sistema completo en un entorno similar a producción: rendimiento, seguridad, compatibilidad y comportamiento bajo carga.',
  'Prueba de aceptación usuario': 'Validación final por parte del cliente/usuario final para confirmar que el sistema cumple los criterios de aceptación y está listo para producción.',
  'Prueba Completada': '✔ HITO: Todas las pruebas han sido ejecutadas, los defectos críticos resueltos y el sistema ha obtenido la aprobación de calidad.',

  'Despliegue': 'Instalación y configuración del sistema en el entorno de producción. Incluye plan de rollback, scripts de migración y verificación post-despliegue.',
  'Formación / Capacitación': 'Entrenamiento de los usuarios finales y administradores del sistema. Entrega de manuales de usuario y documentación operativa.',
  'Soporte': 'Período de soporte post-implementación para resolver incidentes, responder consultas y estabilizar el sistema en producción.',
  'Desarrollo / Implementación Completada': '✔ HITO: El sistema está en producción, los usuarios capacitados y el soporte inicial finalizado.',

  'Actividades Operacionales': 'Operación rutinaria del sistema: monitoreo de disponibilidad, respaldo de datos, actualizaciones de seguridad y gestión de usuarios.',
  'Operaciones y Mantenimiento Completado': '✔ HITO: El sistema opera establemente y los procesos de mantenimiento están formalizados y en ejecución.',

  'Archivo': 'Preservación de todos los artefactos del proyecto (documentos, código fuente, datos de prueba, lecciones aprendidas) en repositorios seguros.',
  'Disposición': 'Cierre formal del proyecto: liberación de recursos, cierre de contratos, transferencia de responsabilidades y evaluación post-proyecto.',
  'Proyecto Completado': '✔ HITO FINAL: El proyecto ha sido formalmente cerrado, todos los entregables aceptados y las lecciones aprendidas documentadas.',
};

const outPath = path.join(__dirname, 'Checklist_ProyectoSW.pdf');
const doc = new PDFDocument({ margin: 45, size: 'A4' });
const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

const W = doc.page.width - 90;
const GOLD = [255, 215, 0];
const DARK = [20, 22, 20];
const GRAY = [100, 100, 100];
const WHITE = [240, 240, 240];

// ── PORTADA ──────────────────────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK);

doc.rect(0, 0, doc.page.width, 8).fill(GOLD);
doc.rect(0, doc.page.height - 8, doc.page.width, 8).fill(GOLD);

doc.fillColor(GOLD).fontSize(28).font('Helvetica-Bold')
   .text('PROYECTO DESARROLLO SW', 45, 160, { align: 'center', width: W });

doc.fillColor(WHITE).fontSize(14).font('Helvetica')
   .text('Checklist de Actividades del Ciclo de Vida', 45, 205, { align: 'center', width: W });

doc.moveDown(2);
doc.fillColor(GRAY).fontSize(10)
   .text(`Documento generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center', width: W });

const totalTasks = PHASES.flatMap(p => p.tareas).length;
doc.moveDown(4);
doc.fillColor(GOLD).fontSize(12)
   .text(`${PHASES.length} Fases  ·  ${totalTasks} Actividades`, 45, doc.y, { align: 'center', width: W });

doc.addPage();

// ── ÍNDICE ────────────────────────────────────────────────────────────────
doc.fillColor(DARK).fontSize(16).font('Helvetica-Bold').text('ÍNDICE DE FASES', 45, 45);
doc.moveTo(45, doc.y + 4).lineTo(45 + W, doc.y + 4).strokeColor(GOLD).lineWidth(1.5).stroke();
doc.moveDown(0.8);

PHASES.forEach((phase, i) => {
  doc.fillColor([60, 60, 60]).fontSize(10).font('Helvetica')
     .text(`${i + 1}.  ${phase.nombre}`, 60, doc.y, { width: W - 20 });
  doc.moveDown(0.4);
});

doc.addPage();

// ── CONTENIDO POR FASE ───────────────────────────────────────────────────
PHASES.forEach((phase, phaseIdx) => {
  const [r, g, b] = phase.color;

  // Barra de color de fase
  doc.rect(45, doc.y, 4, 22).fill([r, g, b]);

  // Fondo gris del encabezado
  doc.rect(52, doc.y, W - 4, 22).fill([230, 230, 230]);

  const headerY = doc.y + 6;
  doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold')
     .text(`${phaseIdx + 1}.  ${phase.nombre}`, 58, headerY, { width: W - 12 });

  doc.moveDown(0.2);
  doc.y += 12;

  phase.tareas.forEach((tarea) => {
    if (doc.y > doc.page.height - 130) doc.addPage();

    const desc = DESCRIPCIONES[tarea.nombre] || '';
    const isMilestone = tarea.milestone;

    if (isMilestone) {
      // Fondo amarillo suave para milestones
      const blockH = desc ? 42 : 24;
      doc.rect(52, doc.y, W - 4, blockH).fill([255, 248, 200]);
      doc.rect(52, doc.y, 3, blockH).fill([r, g, b]);
    }

    const taskY = doc.y + 5;
    const bullet = isMilestone ? '⚑' : '○';

    doc.fillColor(isMilestone ? [80, 60, 0] : [30, 30, 30])
       .fontSize(isMilestone ? 10 : 10)
       .font(isMilestone ? 'Helvetica-Bold' : 'Helvetica-Bold')
       .text(`${bullet}  ${tarea.nombre}`, 60, taskY, { width: W - 20 });

    if (desc) {
      doc.moveDown(0.2);
      doc.fillColor([80, 80, 80]).fontSize(8.5).font('Helvetica')
         .text(desc, 68, doc.y, { width: W - 30 });
    }

    doc.moveDown(isMilestone ? 0.8 : 0.6);
    if (!isMilestone) {
      doc.y += 2;
    }
  });

  doc.moveDown(0.6);
  doc.moveTo(45, doc.y).lineTo(45 + W, doc.y).strokeColor([210, 210, 210]).lineWidth(0.5).stroke();
  doc.moveDown(0.8);

  if (phaseIdx < PHASES.length - 1 && doc.y > doc.page.height - 160) {
    doc.addPage();
  }
});

// ── PIE DE PÁGINA en cada página ─────────────────────────────────────────
const totalPages = doc.bufferedPageRange().count + 1;
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.rect(0, doc.page.height - 30, doc.page.width, 30).fill([245, 245, 245]);
  doc.fillColor(GRAY).fontSize(7).font('Helvetica')
     .text('© ALISAR — Sistema de Gestión  |  Proyecto Desarrollo SW', 45, doc.page.height - 18, { align: 'left', width: W / 2 });
  doc.fillColor(GRAY).fontSize(7)
     .text(`Página ${i + 1}`, 45, doc.page.height - 18, { align: 'right', width: W });
}

doc.end();

stream.on('finish', () => {
  console.log('PDF generado:', outPath);
});
