import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Colores ALISAR
export const COLORS = {
  primary: '#4ade80',
  secondary: '#60a5fa',
  accent: '#f97316',
  danger: '#f87171',
  dark: '#111411',
  text: '#e0e0e0',
  textLight: '#999'
};

/**
 * Genera un PDF de un elemento HTML
 */
export const generatePDFFromHTML = async (element, filename) => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0c0a',
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};

const addHeader = (pdf, title, color) => {
  const W = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(...color);
  pdf.rect(0, 0, W, 28, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, W / 2, 16, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  pdf.text(
    `Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`,
    W / 2, 24, { align: 'center' }
  );
};

const addFooter = (pdf, count, label) => {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Total ${label}: ${count}`, 20, H - 10);
  pdf.text('© 2026 ALISAR S.R.L. — Sistema de Gestión', W - 20, H - 10, { align: 'right' });
};

const addTableHeader = (pdf, yPos, cols, colX, pageWidth) => {
  pdf.setFillColor(230, 230, 230);
  pdf.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(40, 40, 40);
  cols.forEach((h, i) => pdf.text(h, colX[i], yPos));
  return yPos + 14;
};

/**
 * Reporte de Obras
 */
export const generateObrasReport = (obras) => {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  addHeader(pdf, 'REPORTE DE OBRAS — ALISAR S.R.L.', [74, 222, 128]);

  let y = 40;
  const colX = [15, 70, 115, 145, 175, 225];
  const headers = ['Obra', 'Responsable', 'Presupuesto', 'Avance', 'Estado', 'Observaciones'];

  pdf.setFontSize(10);
  y = addTableHeader(pdf, y, headers, colX, W);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  obras.forEach(obra => {
    if (y > H - 20) { pdf.addPage(); y = 20; }
    pdf.setTextColor(0, 0, 0);
    pdf.text((obra.nombre || '').slice(0, 22), colX[0], y);
    pdf.text((obra.responsable_tecnico || '—').slice(0, 20), colX[1], y);
    pdf.text(String(obra.presupuesto || '—').slice(0, 14), colX[2], y);

    const av = Number(obra.avance) || 0;
    if (av >= 75) pdf.setTextColor(74, 222, 128);
    else if (av >= 40) pdf.setTextColor(250, 204, 21);
    else pdf.setTextColor(249, 115, 22);
    pdf.text(`${av}%`, colX[3], y);
    pdf.setTextColor(0, 0, 0);

    const estado = obra.estado || (av >= 100 ? 'Terminado' : 'En Ejecución');
    pdf.text(estado.slice(0, 18), colX[4], y);
    pdf.text((obra.observaciones || '').slice(0, 30), colX[5], y);
    y += 10;
  });

  addFooter(pdf, obras.length, 'obras');
  pdf.save(`Reporte_Obras_${Date.now()}.pdf`);
};

/**
 * Reporte de Personal
 */
export const generatePersonalReport = (personal) => {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  addHeader(pdf, 'REPORTE DE PERSONAL — ALISAR S.R.L.', [167, 139, 250]);

  let y = 40;
  const colX = [15, 65, 110, 150, 185, 225, 260];
  const headers = ['Nombre', 'Cargo', 'Departamento', 'Celular', 'Estado', 'Salario', 'Email'];

  pdf.setFontSize(10);
  y = addTableHeader(pdf, y, headers, colX, W);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  personal.forEach(p => {
    if (y > H - 20) { pdf.addPage(); y = 20; }
    pdf.setTextColor(0, 0, 0);
    pdf.text((p.nombre || '').slice(0, 20), colX[0], y);
    pdf.text((p.cargo || '—').slice(0, 18), colX[1], y);
    pdf.text((p.departamento || '—').slice(0, 18), colX[2], y);
    pdf.text((p.celular || '—').slice(0, 14), colX[3], y);

    const estado = p.estado || 'Activo';
    if (estado === 'Activo') pdf.setTextColor(74, 222, 128);
    else if (estado === 'Licencia') pdf.setTextColor(249, 115, 22);
    else pdf.setTextColor(150, 150, 150);
    pdf.text(estado, colX[4], y);
    pdf.setTextColor(0, 0, 0);

    pdf.text(p.salario ? `Bs ${Number(p.salario).toLocaleString('es-BO')}` : '—', colX[5], y);
    pdf.text((p.email || '').slice(0, 28), colX[6], y);
    y += 10;
  });

  const activos = personal.filter(p => (p.estado || 'Activo') === 'Activo').length;
  addFooter(pdf, personal.length, 'empleados');
  const H2 = pdf.internal.pageSize.getHeight();
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text(`Activos: ${activos}  |  Inactivos: ${personal.length - activos}`, W / 2, H2 - 10, { align: 'center' });
  pdf.save(`Reporte_Personal_${Date.now()}.pdf`);
};

/**
 * Reporte de Maquinaria
 */
export const generateMaquinariaReport = (maquinaria) => {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  addHeader(pdf, 'REPORTE DE MAQUINARIA — ALISAR S.R.L.', [96, 165, 250]);

  let y = 40;
  const colX = [15, 65, 100, 130, 165, 200, 240];
  const headers = ['Equipo', 'Tipo', 'Placa', 'Estado', 'Obra Asignada', 'Últ. Revisión', 'Próx. Mant.'];

  pdf.setFontSize(10);
  y = addTableHeader(pdf, y, headers, colX, W);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  maquinaria.forEach(maq => {
    if (y > H - 20) { pdf.addPage(); y = 20; }
    pdf.setTextColor(0, 0, 0);
    pdf.text((maq.nombre || '').slice(0, 20), colX[0], y);
    pdf.text((maq.tipo || '—').slice(0, 16), colX[1], y);
    pdf.text((maq.placa || '—').slice(0, 12), colX[2], y);

    const estado = maq.estado || '—';
    if (estado === 'Operativo') pdf.setTextColor(74, 222, 128);
    else if (estado === 'Mantenimiento') pdf.setTextColor(249, 115, 22);
    else if (estado === 'Reparacion') pdf.setTextColor(248, 113, 113);
    else pdf.setTextColor(150, 150, 150);
    pdf.text(estado, colX[3], y);
    pdf.setTextColor(0, 0, 0);

    pdf.text((maq.obra_asignada || '—').slice(0, 22), colX[4], y);

    const ultimaRev = maq.ultima_revision || maq.ultimaRevision || '';
    pdf.text(ultimaRev ? new Date(ultimaRev).toLocaleDateString('es-ES') : 'N/A', colX[5], y);

    // Use stored field if available, else calculate +90 days from last revision
    if (maq.mantenimiento_proximo) {
      const proxDate = new Date(maq.mantenimiento_proximo);
      const hoy = new Date();
      const dias = Math.ceil((proxDate - hoy) / 86400000);
      if (dias <= 14) pdf.setTextColor(248, 113, 113);
      else if (dias <= 30) pdf.setTextColor(249, 115, 22);
      pdf.text(proxDate.toLocaleDateString('es-ES'), colX[6], y);
      pdf.setTextColor(0, 0, 0);
    } else if (ultimaRev) {
      const next = new Date(new Date(ultimaRev).getTime() + 90 * 86400000);
      pdf.text(next.toLocaleDateString('es-ES'), colX[6], y);
    } else {
      pdf.text('Pendiente', colX[6], y);
    }
    y += 10;
  });

  const operativos = maquinaria.filter(m => m.estado === 'Operativo').length;
  addFooter(pdf, maquinaria.length, 'equipos');
  const H2 = pdf.internal.pageSize.getHeight();
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Operativos: ${operativos}  |  En mantenimiento/reparación: ${maquinaria.length - operativos}`, W / 2, H2 - 10, { align: 'center' });
  pdf.save(`Reporte_Maquinaria_${Date.now()}.pdf`);
};

/**
 * Reporte de Madera / Trabajos Forestales
 */
export const generateMaderaReport = (madera) => {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  addHeader(pdf, 'REPORTE DE TRABAJOS FORESTALES — ALISAR S.R.L.', [249, 115, 22]);

  let y = 40;
  const colX = [15, 65, 110, 150, 185, 215, 250];
  const headers = ['Contrato', 'Contratante', 'Ing. Forestal', 'Campamento', 'Estado', 'Volumen m³', 'Piezas'];

  pdf.setFontSize(10);
  y = addTableHeader(pdf, y, headers, colX, W);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  let totalVolumen = 0;
  let totalPiezas = 0;

  madera.forEach(item => {
    if (y > H - 20) { pdf.addPage(); y = 20; }
    pdf.setTextColor(0, 0, 0);
    pdf.text((item.nombre || item.especie || '—').slice(0, 22), colX[0], y);
    pdf.text((item.contratante || '—').slice(0, 22), colX[1], y);
    pdf.text((item.ing_forestal || '—').slice(0, 20), colX[2], y);
    pdf.text((item.campamento || '—').slice(0, 18), colX[3], y);

    const estado = item.estado_contrato || '—';
    if (estado === 'Activo') pdf.setTextColor(74, 222, 128);
    else if (estado === 'En Negociación') pdf.setTextColor(250, 204, 21);
    else if (estado === 'Finalizado') pdf.setTextColor(150, 150, 150);
    else pdf.setTextColor(0, 0, 0);
    pdf.text(estado.slice(0, 16), colX[4], y);
    pdf.setTextColor(0, 0, 0);

    const vol = parseFloat(item.volumen) || 0;
    const piezas = parseInt(item.num_piezas || item.piezas) || 0;
    pdf.text(vol > 0 ? vol.toFixed(2) : '—', colX[5], y);
    pdf.text(piezas > 0 ? String(piezas) : '—', colX[6], y);

    totalVolumen += vol;
    totalPiezas += piezas;
    y += 10;
  });

  // Totals row
  y += 4;
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('TOTALES', colX[0], y);
  pdf.text(totalVolumen.toFixed(2), colX[5], y);
  pdf.text(String(totalPiezas), colX[6], y);

  addFooter(pdf, madera.length, 'trabajos forestales');
  pdf.save(`Reporte_Madera_${Date.now()}.pdf`);
};

/**
 * Reporte de Rodeos (legacy — kept for compatibility)
 */
export const generateRodeoReport = (rodeos) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  addHeader(pdf, 'REPORTE DE RODEOS FORESTALES', [255, 215, 0]);
  pdf.setTextColor(0, 0, 0); // override white on yellow

  let y = 40;
  const colX = [20, 55, 85, 120, 155];
  const headers = ['Fecha', 'Volumen (m³)', 'Especie', 'Procedencia', 'Responsable'];

  pdf.setFontSize(10);
  y = addTableHeader(pdf, y, headers, colX, W);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  let totalVolumen = 0;

  rodeos.forEach(item => {
    if (y > H - 30) { pdf.addPage(); y = 20; }
    pdf.setTextColor(0, 0, 0);
    const fecha = item.fecha_rodeo ? new Date(item.fecha_rodeo).toLocaleDateString('es-ES') : '';
    pdf.text(fecha, colX[0], y);
    pdf.text((item.volumen_total || 0).toString(), colX[1], y);
    pdf.text(item.especie_principal || '', colX[2], y);
    pdf.text(item.procedencia || '', colX[3], y);
    pdf.text(item.responsable_rodeo || '', colX[4], y);
    totalVolumen += parseFloat(item.volumen_total) || 0;
    y += 10;
  });

  y += 10;
  pdf.setFont(undefined, 'bold');
  pdf.text(`Volumen Total Extraído: ${totalVolumen.toFixed(2)} m³`, 20, y);

  addFooter(pdf, rodeos.length, 'rodeos');
  pdf.save(`Reporte_Rodeos_${Date.now()}.pdf`);
};

/**
 * Genera una ficha PDF individual para un registro
 */
export const generateFichaIndividual = (tipo, registro) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const colorMap = { obra: [74, 222, 128], personal: [167, 139, 250], madera: [249, 115, 22], maquinaria: [96, 165, 250] };
  const col = colorMap[tipo] || [255, 215, 0];

  // Header
  pdf.setFillColor(...col);
  pdf.rect(0, 0, W, 32, 'F');
  pdf.setTextColor(tipo === 'madera' || tipo === 'obra' ? 255 : 255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  pdf.text('ALISAR S.R.L. — FICHA INDIVIDUAL', W / 2, 10, { align: 'center' });
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  const tituloMap = { obra: 'FICHA DE OBRA', personal: 'FICHA DE PERSONAL', madera: 'FICHA FORESTAL', maquinaria: 'FICHA DE EQUIPO' };
  pdf.text(tituloMap[tipo] || 'FICHA', W / 2, 22, { align: 'center' });
  pdf.setFontSize(8);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, W / 2, 29, { align: 'center' });

  // Determinar campos a mostrar según tipo
  const camposMap = {
    obra: [
      ['Nombre', 'nombre'], ['Código', 'codigo'], ['Cliente', 'cliente'], ['Tipo', 'tipo'],
      ['Estado', 'estado'], ['Fase Actual', 'fase_actual'], ['Avance (%)', 'avance'],
      ['Responsable Técnico', 'responsable_tecnico'], ['Supervisor', 'supervisor'],
      ['Contratista', 'contratista'], ['Presupuesto', 'presupuesto'],
      ['Monto Ejecutado', 'monto_ejecutado'], ['Inicio Planeado', 'inicio_planeado'],
      ['Fin Planeado', 'fin_planeado'], ['Inicio Real', 'inicio_real'], ['Fin Real', 'fin_real'],
      ['Provincia', 'provincia'], ['Municipio', 'municipio'], ['Localidad', 'localidad'],
      ['Dirección', 'direccion_exacta'], ['Personal Asignado', 'personal_asignado'],
      ['Gasto Diesel', 'gasto_diesel'], ['Gasto Materiales', 'gasto_materiales'],
      ['Gasto Mano Obra', 'gasto_mano_obra'], ['Observaciones', 'observaciones'],
    ],
    personal: [
      ['Nombre', 'nombre'], ['Cédula', 'cedula'], ['Cargo', 'cargo'], ['Departamento', 'departamento'],
      ['Estado', 'estado'], ['Tipo Contrato', 'tipo_contrato'], ['Fecha Ingreso', 'fecha_ingreso'],
      ['Salario', 'salario'], ['Celular', 'celular'], ['Email', 'email'],
      ['Fecha Nacimiento', 'fecha_nacimiento'], ['Género', 'genero'], ['Dirección', 'direccion'],
      ['Contacto Emergencia', 'contacto_emergencia_nombre'], ['Tel. Emergencia', 'contacto_emergencia_tel'],
      ['Relación', 'contacto_emergencia_relacion'], ['Notas', 'notas'],
    ],
    madera: [
      ['Nombre Contrato', 'nombre'], ['Contratante', 'contratante'], ['Segunda Parte', 'segunda_parte'],
      ['Estado Contrato', 'estado_contrato'], ['Permiso Forestal', 'permiso_forestal'],
      ['Venc. Permiso', 'fecha_vencimiento_permiso'], ['Ing. Forestal', 'ing_forestal'],
      ['Jefe Campamento', 'jefe_campamento'], ['Campamento', 'campamento'],
      ['Zona Extracción', 'zona_extraccion'], ['Punto Medio', 'punto_medio'],
      ['Fecha Inicio Tumba', 'fecha_inicio_tumba'], ['Fecha Llegada P.M.', 'fecha_llegada_punto_medio'],
      ['Especie', 'especie'], ['Nombre Común', 'nombre_comun'], ['Tipo Corte', 'tipo_corte'],
      ['Grado Calidad', 'grado_calidad'], ['Volumen (m³)', 'volumen'], ['N° Piezas', 'num_piezas'],
      ['Aserradero Destino', 'aserradero_destino'], ['Fecha Entrega', 'fecha_entrega_aserradero'],
      ['Responsable Recepción', 'responsable_recepcion'], ['Precio Unitario', 'precio_unitario'],
      ['Precio Venta', 'precio_venta'],
    ],
    maquinaria: [
      ['Nombre', 'nombre'], ['Tipo', 'tipo'], ['Marca', 'marca'], ['Modelo', 'modelo'],
      ['Placa', 'placa'], ['Año', 'anio'], ['Estado', 'estado'],
      ['Obra Asignada', 'obra_asignada'], ['Operador', 'operador'],
      ['Horas Operación', 'horas_operacion'], ['Litros Diesel Total', 'litros_diesel_total'],
      ['Última Revisión', 'ultima_revision'], ['Próx. Mantenimiento', 'mantenimiento_proximo'],
      ['Observaciones', 'observaciones'],
    ],
  };

  const campos = camposMap[tipo] || [];
  let y = 44;
  const col1x = 20, col2x = 80;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);

  campos.forEach(([ label, key ], idx) => {
    const val = registro[key];
    if (!val && val !== 0) return;
    if (y > H - 20) { pdf.addPage(); y = 20; }

    // Fila zebra
    if (idx % 2 === 0) {
      pdf.setFillColor(245, 247, 245);
      pdf.rect(15, y - 4, W - 30, 9, 'F');
    }

    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(80, 80, 80);
    pdf.text(label, col1x, y);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);

    const strVal = String(val);
    const lines = pdf.splitTextToSize(strVal, W - col2x - 15);
    pdf.text(lines, col2x, y);
    y += Math.max(9, lines.length * 5 + 2);
  });

  // Footer
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text('© 2026 ALISAR S.R.L. — Sistema de Gestión', W / 2, H - 8, { align: 'center' });

  const nombre = registro.nombre || registro.especie || `id_${registro.id}`;
  pdf.save(`Ficha_${tipo}_${nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

/**
 * Genera un Excel profesional para una tabla genérica
 */
export const generateExcelReport = async (data, columns, filename) => {
  try {
    const XLSX = await import('xlsx');

    const rows = data.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.label] = item[col.key] || '';
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    ws['!cols'] = columns.map(col => ({ wch: col.width || 20 }));

    XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
  } catch (error) {
    console.error('Error generando Excel:', error);
    throw error;
  }
};
