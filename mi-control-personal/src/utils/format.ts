import type { Settings } from '../../shared/types';

export function money(amount: number, currency = 'Bs'): string {
  const formatted = new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `${currency} ${formatted}`;
}

export function formatHours(h: number): string {
  return `${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(h)} h`;
}

export function formatDate(iso: string, settings?: Pick<Settings, 'date_format'>): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (settings?.date_format === 'YYYY-MM-DD') return iso;
  return `${d}/${m}/${y}`;
}

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export function weekdayName(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return WEEKDAYS[d.getDay()];
}

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex];
}

export function monthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
