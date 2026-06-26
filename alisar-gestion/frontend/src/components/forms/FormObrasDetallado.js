import React from 'react';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0c0a', surface: '#0f110f', card: '#131513',
  border: '#1c221c', border2: '#232a23',
  yellow: '#FFD700', blue: '#60a5fa', purple: '#a78bfa',
  green: '#34d399', orange: '#f97316', red: '#f87171',
  text: '#e2e8e2', muted: '#6b7a6b', subtle: '#2a352a',
};

// ─── Primitivos reutilizables ─────────────────────────────────────────────────
const inputStyle = (err) => ({
  width: '100%', padding: '10px 13px', borderRadius: '8px',
  border: `1px solid ${err ? C.red : C.border2}`,
  background: C.surface, color: C.text, outline: 'none',
  fontSize: '13.5px', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
});

const Label = ({ children, required }) => (
  <label style={{
    display: 'block', marginBottom: '6px',
    color: '#a0b0a0', fontSize: '11.5px', fontWeight: '600', letterSpacing: '0.6px'
  }}>
    {children}{required && <span style={{ color: C.red, marginLeft: '3px' }}>*</span>}
  </label>
);

const Field = ({ label, required, error, children, span }) => (
  <div style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
    <Label required={required}>{label}</Label>
    {children}
    {error && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0 0' }}>{error}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', min, max, step, disabled, error }) => (
  <input
    type={type} value={value || ''} onChange={onChange}
    placeholder={placeholder} min={min} max={max} step={step} disabled={disabled}
    style={inputStyle(error)}
    onFocus={e => e.target.style.borderColor = C.yellow}
    onBlur={e => e.target.style.borderColor = error ? C.red : C.border2}
  />
);

const Select = ({ value, onChange, options, disabled }) => (
  <select
    value={value || ''} onChange={onChange} disabled={disabled}
    style={{ ...inputStyle(), cursor: 'pointer', appearance: 'none' }}
    onFocus={e => e.target.style.borderColor = C.yellow}
    onBlur={e => e.target.style.borderColor = C.border2}
  >
    <option value="">Seleccionar...</option>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Textarea = ({ value, onChange, placeholder, disabled, rows = 3 }) => (
  <textarea
    value={value || ''} onChange={onChange} placeholder={placeholder}
    disabled={disabled} rows={rows}
    style={{ ...inputStyle(), resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
    onFocus={e => e.target.style.borderColor = C.yellow}
    onBlur={e => e.target.style.borderColor = C.border2}
  />
);

// ─── Separador de sección ─────────────────────────────────────────────────────
const Section = ({ icon, title, color = C.yellow, children }) => (
  <div style={{ marginBottom: '4px' }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      marginBottom: '14px', paddingBottom: '10px',
      borderBottom: `1px solid ${C.border}`
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '7px',
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', flexShrink: 0
      }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color, letterSpacing: '0.3px' }}>
        {title}
      </h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
      {children}
    </div>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
const FormObrasDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  const set = (field) => (e) => onChange({ ...formData, [field]: e.target.value });

  const gasTotal = (
    (Number(formData.gasto_diesel)       || 0) +
    (Number(formData.gasto_mantenimiento)|| 0) +
    (Number(formData.gasto_materiales)   || 0) +
    (Number(formData.gasto_mano_obra)    || 0) +
    (Number(formData.gasto_otros)        || 0)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── 1. Identificación ─────────────────────────────────────── */}
      <Section icon="📋" title="Identificación del Proyecto" color={C.yellow}>
        <Field label="Nombre de la Obra" required error={errors.nombre} span={2}>
          <Input value={formData.nombre} onChange={set('nombre')} placeholder="Ej: Pavimentación Av. Principal" disabled={submitting} error={errors.nombre} />
        </Field>

        <Field label="Código de Referencia">
          <Input value={formData.codigo} onChange={set('codigo')} placeholder="Ej: OBR-2026-001" disabled={submitting} />
        </Field>

        <Field label="Tipo de Obra">
          <Select value={formData.tipo} onChange={set('tipo')} disabled={submitting} options={[
            { value: 'vial',          label: 'Vial / Camino' },
            { value: 'edificacion',   label: 'Edificación' },
            { value: 'saneamiento',   label: 'Saneamiento' },
            { value: 'electrificacion', label: 'Electrificación' },
            { value: 'forestal',      label: 'Forestal / Reforestación' },
            { value: 'otra',          label: 'Otra' },
          ]} />
        </Field>

        <Field label="Cliente / Solicitante">
          <Input value={formData.cliente} onChange={set('cliente')} placeholder="Ej: Municipalidad de Riberalta" disabled={submitting} />
        </Field>

        <Field label="Estado de la Obra">
          <Select value={formData.estado} onChange={set('estado')} disabled={submitting} options={[
            { value: 'Planificacion', label: 'En Planificación' },
            { value: 'Ejecucion',     label: 'En Ejecución' },
            { value: 'Paralizada',    label: 'Paralizada' },
            { value: 'Terminada',     label: 'Terminada' },
          ]} />
        </Field>

        <Field label="Descripción" span={2}>
          <Textarea value={formData.descripcion} onChange={set('descripcion')} placeholder="Descripción del alcance y objetivos del proyecto..." disabled={submitting} />
        </Field>
      </Section>

      {/* ── 2. Ubicación ──────────────────────────────────────────── */}
      <Section icon="📍" title="Ubicación" color={C.blue}>
        <Field label="Provincia">
          <Input value={formData.provincia} onChange={set('provincia')} placeholder="Ej: Beni" disabled={submitting} />
        </Field>
        <Field label="Municipio">
          <Input value={formData.municipio} onChange={set('municipio')} placeholder="Ej: Riberalta" disabled={submitting} />
        </Field>
        <Field label="Comunidad / Localidad">
          <Input value={formData.localidad} onChange={set('localidad')} placeholder="Ej: Comunidad San Miguel" disabled={submitting} />
        </Field>
        <Field label="Dirección / Referencia">
          <Input value={formData.direccion_exacta} onChange={set('direccion_exacta')} placeholder="Ej: Av. Cívica km 3" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 3. Ejecución y Avance ────────────────────────────────── */}
      <Section icon="⚙️" title="Ejecución y Avance" color={C.green}>
        <Field label="Fase Actual">
          <Select value={formData.fase_actual} onChange={set('fase_actual')} disabled={submitting} options={[
            { value: 'planificacion', label: 'Planificación' },
            { value: 'diseño',        label: 'Diseño / Proyecto' },
            { value: 'preparacion',   label: 'Preparación del Terreno' },
            { value: 'ejecucion',     label: 'Ejecución' },
            { value: 'acabados',      label: 'Acabados' },
            { value: 'cierre',        label: 'Cierre / Entrega' },
            { value: 'terminada',     label: 'Terminada' },
          ]} />
        </Field>

        <Field label="Avance (%)" required error={errors.avance}>
          <div style={{ position: 'relative' }}>
            <Input
              type="number" value={formData.avance} onChange={set('avance')}
              placeholder="0 – 100" min="0" max="100" step="5"
              disabled={submitting} error={errors.avance}
            />
            {/* Mini barra de avance */}
            {Number(formData.avance) > 0 && (
              <div style={{ marginTop: '6px', background: C.border, borderRadius: '4px', height: '4px' }}>
                <div style={{
                  width: `${Math.min(Number(formData.avance), 100)}%`,
                  height: '100%', borderRadius: '4px',
                  background: Number(formData.avance) >= 75 ? C.green : Number(formData.avance) >= 40 ? C.yellow : C.orange,
                  transition: 'width 0.3s'
                }} />
              </div>
            )}
          </div>
        </Field>

        <Field label="Responsable Técnico">
          <Input value={formData.responsable_tecnico} onChange={set('responsable_tecnico')} placeholder="Ing. Nombre Apellido" disabled={submitting} />
        </Field>
        <Field label="Supervisor de Obra">
          <Input value={formData.supervisor} onChange={set('supervisor')} placeholder="Técnico Nombre Apellido" disabled={submitting} />
        </Field>
        <Field label="Contratista">
          <Input value={formData.contratista} onChange={set('contratista')} placeholder="Ej: Constructora ABC S.R.L." disabled={submitting} />
        </Field>
        <Field label="Personal Asignado (cant.)">
          <Input type="number" value={formData.personal_asignado} onChange={set('personal_asignado')} placeholder="Ej: 15" min="0" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 4. Presupuesto y Fechas ──────────────────────────────── */}
      <Section icon="💰" title="Presupuesto y Cronograma" color={C.orange}>
        <Field label="Presupuesto Aprobado (Bs)" required error={errors.presupuesto}>
          <Input type="number" value={formData.presupuesto} onChange={set('presupuesto')} placeholder="Ej: 500000" min="0" step="1000" disabled={submitting} error={errors.presupuesto} />
        </Field>
        <Field label="Monto Ejecutado (Bs)">
          <Input type="number" value={formData.monto_ejecutado} onChange={set('monto_ejecutado')} placeholder="Ej: 225000" min="0" step="1000" disabled={submitting} />
        </Field>
        <Field label="Inicio Planeado">
          <Input type="date" value={formData.inicio_planeado} onChange={set('inicio_planeado')} disabled={submitting} />
        </Field>
        <Field label="Fin Planeado">
          <Input type="date" value={formData.fin_planeado} onChange={set('fin_planeado')} disabled={submitting} />
        </Field>
        <Field label="Inicio Real">
          <Input type="date" value={formData.inicio_real} onChange={set('inicio_real')} disabled={submitting} />
        </Field>
        <Field label="Fin Real / Estimado">
          <Input type="date" value={formData.fin_real} onChange={set('fin_real')} disabled={submitting} />
        </Field>
        <Field label="Observaciones" span={2}>
          <Textarea value={formData.observaciones} onChange={set('observaciones')} placeholder="Problemas encontrados, cambios, retrasos..." disabled={submitting} />
        </Field>
      </Section>

      {/* ── 5. Gastos por Categoría ──────────────────────────────── */}
      <Section icon="⛽" title="Registro de Gastos por Categoría" color={C.purple}>
        <Field label="Diesel / Combustible (Bs)">
          <Input type="number" value={formData.gasto_diesel} onChange={set('gasto_diesel')} placeholder="Ej: 8500" min="0" step="100" disabled={submitting} />
        </Field>
        <Field label="Mantenimiento de Maquinaria (Bs)">
          <Input type="number" value={formData.gasto_mantenimiento} onChange={set('gasto_mantenimiento')} placeholder="Ej: 3200" min="0" step="100" disabled={submitting} />
        </Field>
        <Field label="Materiales (Bs)">
          <Input type="number" value={formData.gasto_materiales} onChange={set('gasto_materiales')} placeholder="Ej: 12000" min="0" step="100" disabled={submitting} />
        </Field>
        <Field label="Mano de Obra (Bs)">
          <Input type="number" value={formData.gasto_mano_obra} onChange={set('gasto_mano_obra')} placeholder="Ej: 15000" min="0" step="100" disabled={submitting} />
        </Field>
        <Field label="Otros Gastos (Bs)">
          <Input type="number" value={formData.gasto_otros} onChange={set('gasto_otros')} placeholder="Ej: 500" min="0" step="100" disabled={submitting} />
        </Field>

        {/* Total calculado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: `${C.purple}12`, border: `1px solid ${C.purple}30`, borderRadius: '8px' }}>
          <div>
            <p style={{ margin: 0, color: C.muted, fontSize: '11px', fontWeight: '600', letterSpacing: '0.6px' }}>TOTAL GASTOS</p>
            <p style={{ margin: '4px 0 0 0', color: C.purple, fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>
              {gasTotal > 0 ? `Bs ${gasTotal.toLocaleString('es-BO')}` : '—'}
            </p>
          </div>
        </div>
      </Section>

    </div>
  );
};

export default FormObrasDetallado;
