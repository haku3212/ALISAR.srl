import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../context/ToastContext';

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

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
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

/**
 * Genera un PDF con formato profesional para reportes de Obras
 */
export const generateObrasReport = (obras) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  pdf.setFillColor(74, 222, 128);
  pdf.rect(0, 0, pageWidth, 25, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('REPORTE DE OBRAS', pageWidth / 2, 12, { align: 'center' });

  // Fecha
  pdf.setFontSize(10);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 20, { align: 'center' });

  // Contenido
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');

  yPos = 40;
  const colX = [20, 70, 120, 170];
  const headers = ['Obra', 'Presupuesto', 'Avance', 'Estado'];

  // Encabezados
  pdf.setFillColor(230, 230, 230);
  pdf.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  pdf.setFont(undefined, 'bold');
  headers.forEach((header, i) => {
    pdf.text(header, colX[i], yPos);
  });

  yPos += 15;
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);

  // Datos
  obras.forEach((obra) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.text(obra.nombre, colX[0], yPos);
    pdf.text(obra.presupuesto, colX[1], yPos);
    pdf.text(`${obra.avance}%`, colX[2], yPos);

    // Color de estado según avance
    if (obra.avance >= 75) {
      pdf.setTextColor(74, 222, 128); // Verde
    } else if (obra.avance >= 50) {
      pdf.setTextColor(96, 165, 250); // Azul
    } else {
      pdf.setTextColor(249, 115, 22); // Naranja
    }
    pdf.text('Activa', colX[3], yPos);
    pdf.setTextColor(0, 0, 0);

    yPos += 10;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Total de obras: ${obras.length}`, 20, pageHeight - 10);
  pdf.text(`© 2026 ALISAR - Sistema de Gestión`, pageWidth - 60, pageHeight - 10);

  pdf.save(`Reporte_Obras_${new Date().getTime()}.pdf`);
};

/**
 * Genera un PDF con formato profesional para reportes de Personal
 */
export const generatePersonalReport = (personal) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  pdf.setFillColor(167, 139, 250);
  pdf.rect(0, 0, pageWidth, 25, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('REPORTE DE PERSONAL', pageWidth / 2, 12, { align: 'center' });

  // Fecha
  pdf.setFontSize(10);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 20, { align: 'center' });

  // Contenido
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  yPos = 40;
  const colX = [20, 80, 140];
  const headers = ['Nombre', 'Cargo', 'Celular'];

  // Encabezados
  pdf.setFillColor(230, 230, 230);
  pdf.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  pdf.setFont(undefined, 'bold');
  headers.forEach((header, i) => {
    pdf.text(header, colX[i], yPos);
  });

  yPos += 15;
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);

  // Datos
  personal.forEach((person) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.text(person.nombre || '', colX[0], yPos);
    pdf.text(person.cargo || '', colX[1], yPos);
    pdf.text(person.celular || '', colX[2], yPos);

    yPos += 10;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Total de personal: ${personal.length}`, 20, pageHeight - 10);
  pdf.text(`© 2026 ALISAR - Sistema de Gestión`, pageWidth - 60, pageHeight - 10);

  pdf.save(`Reporte_Personal_${new Date().getTime()}.pdf`);
};

/**
 * Genera un PDF con formato profesional para reportes de Maquinaria
 */
export const generateMaquinariaReport = (maquinaria) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  pdf.setFillColor(96, 165, 250);
  pdf.rect(0, 0, pageWidth, 25, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('REPORTE DE MAQUINARIA', pageWidth / 2, 12, { align: 'center' });

  // Fecha
  pdf.setFontSize(10);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 20, { align: 'center' });

  // Contenido
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  yPos = 40;
  const colX = [20, 100, 160, 220, 270];
  const headers = ['Equipo', 'Tipo', 'Estado', 'Última Revisión', 'Próx. Mant.'];

  // Encabezados
  pdf.setFillColor(230, 230, 230);
  pdf.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  pdf.setFont(undefined, 'bold');
  headers.forEach((header, i) => {
    pdf.text(header, colX[i], yPos);
  });

  yPos += 15;
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  // Datos
  maquinaria.forEach((maq) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.text(maq.nombre || '', colX[0], yPos);
    pdf.text(maq.tipo || '', colX[1], yPos);

    // Color de estado
    if (maq.estado === 'Operativo') {
      pdf.setTextColor(74, 222, 128);
    } else if (maq.estado === 'Mantenimiento') {
      pdf.setTextColor(249, 115, 22);
    } else {
      pdf.setTextColor(248, 113, 113);
    }
    pdf.text(maq.estado || '', colX[2], yPos);
    pdf.setTextColor(0, 0, 0);

    pdf.text(maq.ultimaRevision || 'N/A', colX[3], yPos);

    // Calcular próximo mantenimiento
    if (maq.ultimaRevision) {
      const lastDate = new Date(maq.ultimaRevision);
      const nextDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      pdf.text(nextDate.toLocaleDateString('es-ES'), colX[4], yPos);
    } else {
      pdf.text('Pendiente', colX[4], yPos);
    }

    yPos += 10;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Total de equipos: ${maquinaria.length}`, 20, pageHeight - 10);
  pdf.text(`© 2026 ALISAR - Sistema de Gestión`, pageWidth - 60, pageHeight - 10);

  pdf.save(`Reporte_Maquinaria_${new Date().getTime()}.pdf`);
};

/**
 * Genera un PDF con formato profesional para reportes de Madera
 */
export const generateMaderaReport = (madera) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  pdf.setFillColor(249, 115, 22);
  pdf.rect(0, 0, pageWidth, 25, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('REPORTE DE MADERA / RODEOS', pageWidth / 2, 12, { align: 'center' });

  // Fecha
  pdf.setFontSize(10);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 20, { align: 'center' });

  // Contenido
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  yPos = 40;
  const colX = [20, 80, 130, 170];
  const headers = ['Especie', 'Piezas', 'Volumen', 'Campamento'];

  // Encabezados
  pdf.setFillColor(230, 230, 230);
  pdf.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  pdf.setFont(undefined, 'bold');
  headers.forEach((header, i) => {
    pdf.text(header, colX[i], yPos);
  });

  yPos += 15;
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);

  let totalPiezas = 0;

  // Datos
  madera.forEach((item) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.text(item.especie || '', colX[0], yPos);
    pdf.text((item.piezas || 0).toString(), colX[1], yPos);
    pdf.text(item.volumen || '', colX[2], yPos);
    pdf.text(item.campamento || '', colX[3], yPos);

    totalPiezas += item.piezas || 0;
    yPos += 10;
  });

  // Resumen
  yPos += 10;
  pdf.setFont(undefined, 'bold');
  pdf.text(`Total de piezas: ${totalPiezas}`, 20, yPos);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Total de rodeos: ${madera.length}`, 20, pageHeight - 10);
  pdf.text(`© 2026 ALISAR - Sistema de Gestión`, pageWidth - 60, pageHeight - 10);

  pdf.save(`Reporte_Madera_${new Date().getTime()}.pdf`);
};

/**
 * Genera un Excel profesional para una tabla genérica
 */
export const generateExcelReport = async (data, columns, filename) => {
  try {
    const XLSX = await import('xlsx');

    // Preparar datos
    const rows = data.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.label] = item[col.key] || '';
      });
      return row;
    });

    // Crear workbook
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    // Estilos básicos
    ws['!cols'] = columns.map(col => ({ wch: col.width || 20 }));

    // Guardar
    XLSX.writeFile(wb, `${filename}_${new Date().getTime()}.xlsx`);
  } catch (error) {
    console.error('Error generando Excel:', error);
    throw error;
  }
};
