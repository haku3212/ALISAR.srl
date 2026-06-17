import React, { useState } from 'react';
import { CheckSquare, Square, Flag, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const PHASES = [
  {
    id: 'gestion',
    nombre: 'Actividades de Gestión de Proyecto',
    color: '#FFD700',
    tareas: [
      { id: 'carta',        nombre: 'Carta del proyecto' },
      { id: 'plan_gestion', nombre: 'Plan de Gestión de Proyectos' },
      { id: 'monitoreo',    nombre: 'Actividades de Monitoreo y Control' },
      { id: 'gestion_done', nombre: 'Actividades de Gestión PU Completadas', milestone: true },
    ],
  },
  {
    id: 'iniciacion',
    nombre: 'Iniciación / Planificación',
    color: '#60a5fa',
    tareas: [
      { id: 'factibilidad',   nombre: 'Estudio de la Factibilidad' },
      { id: 'caso_negocios',  nombre: 'Caso de Negocios' },
      { id: 'planificacion',  nombre: 'Planificación de Proyectos' },
      { id: 'iniciacion_done', nombre: 'Iniciación / Actividades de Planificación Completadas', milestone: true },
    ],
  },
  {
    id: 'analisis',
    nombre: 'Análisis de Requerimiento',
    color: '#a78bfa',
    tareas: [
      { id: 'recopilacion',  nombre: 'Recopilación de Requisitos' },
      { id: 'seguridad',     nombre: 'Planificación de seguridad' },
      { id: 'analisis_done', nombre: 'Análisis de requisitos Completado', milestone: true },
    ],
  },
  {
    id: 'diseno',
    nombre: 'Diseño',
    color: '#f97316',
    tareas: [
      { id: 'diseno_general',   nombre: 'Diseño General' },
      { id: 'poc',              nombre: 'Prueba de Conceptos' },
      { id: 'diseno_detallado', nombre: 'Diseño Detallado' },
      { id: 'especificacion',   nombre: 'Especificación Técnica' },
      { id: 'diseno_done',      nombre: 'Diseño Completado', milestone: true },
    ],
  },
  {
    id: 'desarrollo',
    nombre: 'Desarrollo',
    color: '#34d399',
    tareas: [
      { id: 'interfaces', nombre: 'Implementación de Interfaces' },
      { id: 'clases',     nombre: 'Programación de las Clases' },
      { id: 'bd',         nombre: 'Implementación de BD' },
      { id: 'control',    nombre: 'Programación de Control' },
    ],
  },
  {
    id: 'pruebas',
    nombre: 'Pruebas de Calidad',
    color: '#f87171',
    tareas: [
      { id: 'prueba_unidad', nombre: 'Prueba de unidad' },
      { id: 'prueba_func',   nombre: 'Prueba de funcionamiento' },
      { id: 'integracion',   nombre: 'Examen de integración' },
      { id: 'regresion',     nombre: 'Prueba de Regresión' },
      { id: 'sistema',       nombre: 'Prueba del Sistema' },
      { id: 'aceptacion',    nombre: 'Prueba de aceptación usuario' },
      { id: 'pruebas_done',  nombre: 'Prueba Completada', milestone: true },
    ],
  },
  {
    id: 'implementacion',
    nombre: 'Implementación',
    color: '#fb923c',
    tareas: [
      { id: 'despliegue',   nombre: 'Despliegue' },
      { id: 'capacitacion', nombre: 'Formación / Capacitación' },
      { id: 'soporte',      nombre: 'Soporte' },
      { id: 'impl_done',    nombre: 'Desarrollo / Implementación Completada', milestone: true },
    ],
  },
  {
    id: 'operaciones',
    nombre: 'Operaciones y Mantenibilidad',
    color: '#38bdf8',
    tareas: [
      { id: 'ops',      nombre: 'Actividades Operacionales' },
      { id: 'ops_done', nombre: 'Operaciones y Mantenimiento Completado', milestone: true },
    ],
  },
  {
    id: 'disposicion',
    nombre: 'Disposición',
    color: '#c084fc',
    tareas: [
      { id: 'archivo',        nombre: 'Archivo' },
      { id: 'disposicion_t',  nombre: 'Disposición' },
      { id: 'proyecto_done',  nombre: 'Proyecto Completado', milestone: true },
    ],
  },
];

const STORAGE_KEY = 'alisar_project_checklist';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const ProjectChecklist = () => {
  const [checked, setChecked] = useState(loadState);

  const toggle = (id) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const allTasks   = PHASES.flatMap(p => p.tareas);
  const totalAll   = allTasks.length;
  const doneAll    = allTasks.filter(t => checked[t.id]).length;
  const pctAll     = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;

  const phaseProgress = (phase) => {
    const total = phase.tareas.length;
    const done  = phase.tareas.filter(t => checked[t.id]).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const exportPDF = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let y = 0;

    const checkPage = (needed = 8) => {
      if (y + needed > pageH - 20) { pdf.addPage(); y = 20; }
    };

    // Cabecera
    pdf.setFillColor(255, 215, 0);
    pdf.rect(0, 0, pageW, 28, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('PROYECTO DESARROLLO SW', pageW / 2, 12, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text('Checklist de Actividades del Ciclo de Vida', pageW / 2, 20, { align: 'center' });
    pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageW / 2, 26, { align: 'center' });

    y = 38;

    // Resumen global
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('RESUMEN GENERAL', margin, y);
    y += 7;
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Progreso total: ${pctAll}%  (${doneAll} de ${totalAll} actividades completadas)`, margin, y);
    y += 10;

    // Línea separadora
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, y, pageW - margin, y);
    y += 8;

    PHASES.forEach((phase) => {
      const { total, done, pct } = phaseProgress(phase);

      checkPage(14);

      // Título de fase
      pdf.setFillColor(240, 240, 240);
      pdf.roundedRect(margin, y - 5, pageW - margin * 2, 10, 2, 2, 'F');
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text(phase.nombre.toUpperCase(), margin + 3, y + 1);
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      pdf.text(`${done}/${total}  (${pct}%)`, pageW - margin - 3, y + 1, { align: 'right' });
      y += 10;

      phase.tareas.forEach((tarea) => {
        checkPage(7);
        const isChecked = !!checked[tarea.id];

        pdf.setTextColor(isChecked ? 100 : 30, isChecked ? 100 : 30, isChecked ? 100 : 30);
        pdf.setFontSize(9);
        pdf.setFont(undefined, tarea.milestone ? 'bolditalic' : 'normal');

        const mark = tarea.milestone ? (isChecked ? '[✓ COMPLETADO]' : '[  COMPLETADO]') : (isChecked ? '[✓]' : '[  ]');
        const indent = tarea.milestone ? margin + 3 : margin + 6;
        pdf.text(`${mark}  ${tarea.nombre}`, indent, y);
        y += 6;
      });

      y += 4;
    });

    // Pie
    pdf.setFontSize(7);
    pdf.setTextColor(160, 160, 160);
    pdf.text('© ALISAR — Sistema de Gestión', pageW / 2, pageH - 8, { align: 'center' });

    pdf.save(`Checklist_ProyectoSW_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: '0 0 6px 0' }}>Checklist Proyecto SW</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Seguimiento de actividades del ciclo de vida del proyecto
          </p>
        </div>
        <button
          onClick={exportPDF}
          style={{
            background: '#f97316',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={16} /> Exportar PDF
        </button>
      </div>

      {/* Progreso global */}
      <div style={{
        background: '#111411',
        border: '1px solid #1f241f',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: '600', color: '#fff', fontSize: '15px' }}>Progreso Total</span>
          <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '18px' }}>{pctAll}%</span>
        </div>
        <div style={{ background: '#1f241f', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
          <div style={{
            width: `${pctAll}%`,
            height: '100%',
            background: pctAll === 100 ? '#34d399' : '#FFD700',
            borderRadius: '6px',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ color: '#666', fontSize: '13px', marginTop: '8px' }}>
          {doneAll} de {totalAll} actividades completadas
        </div>
      </div>

      {/* Fases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {PHASES.map(phase => {
          const { total, done, pct } = phaseProgress(phase);
          const phaseComplete = pct === 100;

          return (
            <div key={phase.id} style={{
              background: '#111411',
              border: `1px solid ${phaseComplete ? phase.color + '55' : '#1f241f'}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* Cabecera de fase */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #1f241f',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: phaseComplete ? phase.color + '12' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '4px',
                    height: '20px',
                    borderRadius: '2px',
                    background: phase.color,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: phaseComplete ? phase.color : '#e0e0e0',
                  }}>
                    {phase.nombre}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Mini barra */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '80px', background: '#1f241f', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: phase.color,
                        borderRadius: '4px',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <span style={{ color: '#888', fontSize: '12px', minWidth: '42px', textAlign: 'right' }}>
                      {done}/{total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de tareas */}
              <div style={{ padding: '8px 0' }}>
                {phase.tareas.map(tarea => {
                  const done = !!checked[tarea.id];
                  return (
                    <div
                      key={tarea.id}
                      onClick={() => toggle(tarea.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        background: done && tarea.milestone ? phase.color + '10' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1d1a'}
                      onMouseLeave={e => e.currentTarget.style.background = done && tarea.milestone ? phase.color + '10' : 'transparent'}
                    >
                      {tarea.milestone ? (
                        <Flag
                          size={17}
                          color={done ? phase.color : '#444'}
                          fill={done ? phase.color : 'none'}
                          style={{ flexShrink: 0 }}
                        />
                      ) : done ? (
                        <CheckSquare size={17} color={phase.color} style={{ flexShrink: 0 }} />
                      ) : (
                        <Square size={17} color="#444" style={{ flexShrink: 0 }} />
                      )}
                      <span style={{
                        fontSize: '13px',
                        color: done ? (tarea.milestone ? phase.color : '#aaa') : '#ccc',
                        textDecoration: done && !tarea.milestone ? 'line-through' : 'none',
                        fontWeight: tarea.milestone ? '600' : '400',
                        fontStyle: tarea.milestone ? 'italic' : 'normal',
                      }}>
                        {tarea.nombre}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectChecklist;
