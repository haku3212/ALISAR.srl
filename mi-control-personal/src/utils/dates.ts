export function todayISO(): string {
  return toISO(new Date());
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function daysBetween(fromISO: string, toISOStr: string): number {
  const a = new Date(fromISO + 'T00:00:00').getTime();
  const b = new Date(toISOStr + 'T00:00:00').getTime();
  return Math.round((b - a) / 86400000);
}

/** Primer día (ISO) de la semana que contiene la fecha dada. */
export function startOfWeek(iso: string, weekStart: 'lunes' | 'domingo'): string {
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDay(); // 0 = domingo
  const offset = weekStart === 'lunes' ? (day === 0 ? 6 : day - 1) : day;
  d.setDate(d.getDate() - offset);
  return toISO(d);
}

export function startOfMonth(iso: string): string {
  return iso.slice(0, 7) + '-01';
}

export function yearMonth(iso: string): string {
  return iso.slice(0, 7);
}

export function daysInMonth(yearMonthStr: string): number {
  const [y, m] = yearMonthStr.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}
