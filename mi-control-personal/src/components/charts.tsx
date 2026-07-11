import { useState } from 'react';

interface TooltipState {
  x: number;
  y: number;
  lines: string[];
}

function useTooltip() {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const show = (e: React.MouseEvent, lines: string[]) => setTip({ x: e.clientX, y: e.clientY, lines });
  const hide = () => setTip(null);
  const node = tip ? (
    <div className="chart-tooltip" style={{ left: tip.x, top: tip.y }}>
      {tip.lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  ) : null;
  return { show, hide, node };
}

/** Barras verticales agrupadas: dos series (p. ej. ingresos vs gastos por mes). Una sola escala. */
export function GroupedBars({
  labels, series, format
}: {
  labels: string[];
  series: Array<{ name: string; color: string; values: number[] }>;
  format: (n: number) => string;
}) {
  const tooltip = useTooltip();
  const W = 640;
  const H = 240;
  const padL = 8;
  const padB = 24;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const groupW = (W - padL) / labels.length;
  const barW = Math.min(26, (groupW - 14) / series.length);

  return (
    <div>
      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.name} className="key">
            <span className="swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padL}
            x2={W}
            y1={H - padB - f * (H - padB - 10)}
            y2={H - padB - f * (H - padB - 10)}
            stroke="var(--grid)"
            strokeWidth="1"
          />
        ))}
        <line x1={padL} x2={W} y1={H - padB} y2={H - padB} stroke="var(--baseline)" strokeWidth="1" />
        {labels.map((label, i) => {
          const cx = padL + i * groupW + groupW / 2;
          const totalBars = series.length * barW + (series.length - 1) * 2;
          return (
            <g key={label}>
              {series.map((s, j) => {
                const v = s.values[i];
                const h = (v / max) * (H - padB - 10);
                const x = cx - totalBars / 2 + j * (barW + 2);
                return (
                  <rect
                    key={s.name}
                    x={x}
                    y={H - padB - h}
                    width={barW}
                    height={Math.max(h, v > 0 ? 2 : 0)}
                    rx="4"
                    fill={s.color}
                    onMouseMove={(e) => tooltip.show(e, [`${label}`, `${s.name}: ${format(v)}`])}
                    onMouseLeave={tooltip.hide}
                  />
                );
              })}
              <text
                x={cx}
                y={H - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--muted)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      {tooltip.node}
    </div>
  );
}

/** Barras horizontales por categoría con etiqueta directa del valor. */
export function CategoryBars({
  items, format
}: {
  items: Array<{ label: string; value: number; color: string }>;
  format: (n: number) => string;
}) {
  const tooltip = useTooltip();
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div>
      {items.map((item) => (
        <div key={item.label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="swatch" style={{ background: item.color, width: 10, height: 10, borderRadius: 3, display: 'inline-block' }} />
              {item.label}
            </span>
            <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {format(item.value)}
            </span>
          </div>
          <div
            className="progress-track"
            style={{ height: 10 }}
            onMouseMove={(e) => tooltip.show(e, [`${item.label}: ${format(item.value)}`])}
            onMouseLeave={tooltip.hide}
          >
            <div className="progress-fill" style={{ width: `${(item.value / max) * 100}%`, background: item.color }} />
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="empty">Sin datos todavía</div>}
      {tooltip.node}
    </div>
  );
}

/** Línea simple de evolución (p. ej. ahorro acumulado). */
export function LineChart({
  points, color, format
}: {
  points: Array<{ label: string; value: number }>;
  color: string;
  format: (n: number) => string;
}) {
  const tooltip = useTooltip();
  const W = 640;
  const H = 200;
  const padB = 24;
  if (points.length === 0) return <div className="empty">Sin datos todavía</div>;
  const values = points.map((p) => p.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;
  const stepX = points.length > 1 ? W / (points.length - 1) : 0;
  const toY = (v: number) => H - padB - ((v - min) / range) * (H - padB - 10);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${toY(p.value)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img">
        <line x1={0} x2={W} y1={toY(0)} y2={toY(0)} stroke="var(--baseline)" strokeWidth="1" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={i * stepX}
              cy={toY(p.value)}
              r="4"
              fill={color}
              stroke="var(--surface)"
              strokeWidth="2"
              onMouseMove={(e) => tooltip.show(e, [p.label, format(p.value)])}
              onMouseLeave={tooltip.hide}
            />
            <text x={i * stepX} y={H - 6} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} fontSize="11" fill="var(--muted)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      {tooltip.node}
    </div>
  );
}

export const SERIES_COLORS = [
  'var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)',
  'var(--series-5)', 'var(--series-6)', 'var(--series-7)', 'var(--series-8)'
];
