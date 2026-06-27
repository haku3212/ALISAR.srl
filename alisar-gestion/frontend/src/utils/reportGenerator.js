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
