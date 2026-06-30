import React from 'react';

const C = {
  bg: '#0a0c0a', surface: '#0f110f', card: '#131513',
  border: '#1c221c', border2: '#232a23',
  yellow: '#FFD700', blue: '#60a5fa', purple: '#a78bfa',
  green: '#34d399', orange: '#f97316', red: '#f87171',
  text: '#e2e8e2', muted: '#6b7a6b',
};

const inputStyle = (err) => ({
  width: '100%', padding: '10px 13px', borderRadius: '8px',
  border: `1px solid ${err ? C.red : C.border2}`,
  background: C.surface, color: C.text, outline: 'none',
  fontSize: '13.5px', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
});

const Label = ({ children, required }) => (
  <label style={{ display: 'block', marginBottom: '6px', color: '#a0b0a0', fontSize: '11.5px', fontWeight: '600', letterSpacing: '0.6px' }}>
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
    style={{ ...inputStyle(), cursor: 'pointer' }}
    onFocus={e => e.target.style.borderColor = C.yellow}
    onBlur={e => e.target.style.borderColor = C.border2}
  >
    <option value="">Seleccionar...</option>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Textarea = ({ value, onChange, placeholder, disabled, rows = 4 }) => (
  <textarea
    value={value || ''} onChange={onChange} placeholder={placeholder}
    disabled={disabled} rows={rows}
    style={{ ...inputStyle(), resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
    onFocus={e => e.target.style.borderColor = C.yellow}
    onBlur={e => e.target.style.borderColor = C.border2}
  />
);

const Section = ({ icon, title, color = C.yellow, children }) => (
  <div style={{ marginBottom: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color, letterSpacing: '0.3px' }}>{title}</h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
      {children}
    </div>
  </div>
);

const FormMaquinariaDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  const set = (field) => (e) => onChange({ ...formData, [field]: e.target.value });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── 1. Identificación ──────────────────────────────────────── */}
      <Section icon="🏗️" title="Identificación del Equipo" color={C.yellow}>
        <Field label="Nombre / Descripción" required error={errors.nombre} span={2}>
          <Input value={formData.nombre} onChange={set('nombre')} placeholder="Ej: Motoniveladora CAT 140H" disabled={submitting} error={errors.nombre} />
        </Field>
        <Field label="Tipo de Maquinaria" required error={errors.tipo}>
          <Select value={formData.tipo} onChange={set('tipo')} disabled={submitting} options={[
            { value: 'motoniveladora',  label: 'Motoniveladora' },
            { value: 'topadora',        label: 'Topadora / Bulldozer' },
            { value: 'excavadora',      label: 'Excavadora' },
            { value: 'retroexcavadora', label: 'Retroexcavadora' },
            { value: 'cargadora',       label: 'Cargadora Frontal' },
            { value: 'rodillo',         label: 'Rodillo Compactador' },
            { value: 'volquete',        label: 'Volquete' },
            { value: 'grua',            label: 'Grúa' },
            { value: 'hormigonera',     label: 'Hormigonera' },
            { value: 'aserrador',       label: 'Aserrador / Sierra' },
            { value: 'otra',            label: 'Otra' },
          ]} />
        </Field>
        <Field label="Estado Actual">
          <Select value={formData.estado} onChange={set('estado')} disabled={submitting} options={[
            { value: 'Operativo',     label: 'Operativo' },
            { value: 'Mantenimiento', label: 'En Mantenimiento' },
            { value: 'Reparacion',    label: 'En Reparación' },
            { value: 'Inactivo',      label: 'Inactivo' },
            { value: 'Desmantelado',  label: 'Desmantelado' },
          ]} />
        </Field>
        <Field label="Modelo">
          <Input value={formData.modelo} onChange={set('modelo')} placeholder="Ej: CAT 140H, JCB 3CX" disabled={submitting} />
        </Field>
        <Field label="Año de Fabricación">
          <Input type="number" value={formData.anio} onChange={set('anio')} placeholder="Ej: 2018" min="1950" max={new Date().getFullYear()} disabled={submitting} />
        </Field>
        <Field label="N° de Serie">
          <Input value={formData.numero_serie} onChange={set('numero_serie')} placeholder="Ej: SN-12345-AB" disabled={submitting} />
        </Field>
        <Field label="Placa de Registro">
          <Input value={formData.placa} onChange={set('placa')} placeholder="Ej: 1234-BEN" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 2. Asignación Operativa ────────────────────────────────── */}
      <Section icon="📍" title="Asignación Operativa" color={C.blue}>
        <Field label="Obra Asignada Actualmente" span={2}>
          <Input value={formData.obra_asignada} onChange={set('obra_asignada')} placeholder="Ej: Tramo Vial Riberalta–Guayaramerín" disabled={submitting} />
        </Field>
        <Field label="Fecha de Traslado a Obra">
          <Input type="date" value={formData.fecha_traslado} onChange={set('fecha_traslado')} disabled={submitting} />
        </Field>
        <Field label="Operador Asignado">
          <Input value={formData.operador_asignado} onChange={set('operador_asignado')} placeholder="Nombre del operador" disabled={submitting} />
        </Field>
        <Field label="Horas de Operación Totales">
          <Input type="number" value={formData.horas_operacion} onChange={set('horas_operacion')} placeholder="Ej: 5000" min="0" step="50" disabled={submitting} />
        </Field>
        <Field label="Litros de Diesel Cargados (total)">
          <Input type="number" value={formData.litros_diesel_total} onChange={set('litros_diesel_total')} placeholder="Ej: 1500" min="0" step="10" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 3. Especificaciones Técnicas ───────────────────────────── */}
      <Section icon="⚙️" title="Especificaciones Técnicas" color={C.green}>
        <Field label="Potencia (HP)">
          <Input type="number" value={formData.potencia} onChange={set('potencia')} placeholder="Ej: 150" min="0" step="10" disabled={submitting} />
        </Field>
        <Field label="Capacidad de Carga (ton)">
          <Input type="number" value={formData.capacidad_carga} onChange={set('capacidad_carga')} placeholder="Ej: 5" min="0" step="0.5" disabled={submitting} />
        </Field>
        <Field label="Consumo de Combustible (L/h)">
          <Input type="number" value={formData.consumo_combustible} onChange={set('consumo_combustible')} placeholder="Ej: 25.5" min="0" step="0.5" disabled={submitting} />
        </Field>
        <Field label="Tipo de Combustible">
          <Select value={formData.tipo_combustible} onChange={set('tipo_combustible')} disabled={submitting} options={[
            { value: 'diesel',   label: 'Diesel' },
            { value: 'gasolina', label: 'Gasolina' },
            { value: 'gas',      label: 'Gas' },
            { value: 'electrico',label: 'Eléctrico' },
          ]} />
        </Field>
        <Field label="Ancho de Trabajo (m)">
          <Input type="number" value={formData.ancho_trabajo} onChange={set('ancho_trabajo')} placeholder="Ej: 3.5" min="0" step="0.1" disabled={submitting} />
        </Field>
        <Field label="Profundidad Máxima (m)">
          <Input type="number" value={formData.profundidad_maxima} onChange={set('profundidad_maxima')} placeholder="Ej: 2.5" min="0" step="0.1" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 4. Mantenimiento ──────────────────────────────────────── */}
      <Section icon="🔧" title="Mantenimiento" color={C.orange}>
        <Field label="Última Revisión Técnica">
          <Input type="date" value={formData.ultima_revision} onChange={set('ultima_revision')} disabled={submitting} />
        </Field>
        <Field label="Próximo Mantenimiento">
          <Input type="date" value={formData.mantenimiento_proximo} onChange={set('mantenimiento_proximo')} disabled={submitting} />
        </Field>
        <Field label="Costo Mantenimiento Anual (Bs)">
          <Input type="number" value={formData.costo_mantenimiento_anual} onChange={set('costo_mantenimiento_anual')} placeholder="Ej: 5000" min="0" step="100" disabled={submitting} />
        </Field>
        <Field label="N° de Garantía">
          <Input value={formData.numero_garantia} onChange={set('numero_garantia')} placeholder="Ej: GAR-2024-12345" disabled={submitting} />
        </Field>
        <Field label="Vencimiento de Garantía">
          <Input type="date" value={formData.fecha_vencimiento_garantia} onChange={set('fecha_vencimiento_garantia')} disabled={submitting} />
        </Field>
        <Field label="Documento de Adquisición">
          <Input value={formData.documento_adquisicion} onChange={set('documento_adquisicion')} placeholder="Ej: Factura #001234" disabled={submitting} />
        </Field>
        <Field label="Historial de Fallas / Reparaciones" span={2}>
          <Textarea
            value={formData.historial_fallas} onChange={set('historial_fallas')} disabled={submitting}
            placeholder="Ej: 15/03/2025 — Cambio filtro de aceite. 02/05/2025 — Falla sistema hidráulico, reparado en taller..."
            rows={5}
          />
        </Field>
        <Field label="Notas / Observaciones" span={2}>
          <Textarea value={formData.notas} onChange={set('notas')} placeholder="Información adicional relevante..." disabled={submitting} />
        </Field>
      </Section>

    </div>
  );
};

export default FormMaquinariaDetallado;
