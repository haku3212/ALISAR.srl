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

const Textarea = ({ value, onChange, placeholder, disabled, rows = 3 }) => (
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

const FormMaderaDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  const set = (field) => (e) => onChange({ ...formData, [field]: e.target.value });

  const valorTotal = (Number(formData.volumen) || 0) * (Number(formData.precio_unitario) || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── 1. Especie e Identificación ──────────────────────────── */}
      <Section icon="🌳" title="Especie e Identificación" color={C.yellow}>
        <Field label="Nombre Común" required error={errors.nombre_comun}>
          <Input value={formData.nombre_comun} onChange={set('nombre_comun')} placeholder="Ej: Cedro Rojo" disabled={submitting} error={errors.nombre_comun} />
        </Field>
        <Field label="Nombre Científico">
          <Input value={formData.nombre_cientifico} onChange={set('nombre_cientifico')} placeholder="Ej: Cedrela odorata" disabled={submitting} />
        </Field>
        <Field label="Especie">
          <Select value={formData.especie} onChange={set('especie')} disabled={submitting} options={[
            { value: 'cedro',   label: 'Cedro' },
            { value: 'caoba',   label: 'Caoba' },
            { value: 'mara',    label: 'Mará' },
            { value: 'roble',   label: 'Roble' },
            { value: 'teca',    label: 'Teca' },
            { value: 'pino',    label: 'Pino' },
            { value: 'ocote',   label: 'Ocote' },
            { value: 'otra',    label: 'Otra' },
          ]} />
        </Field>
        <Field label="Tipo de Corte">
          <Select value={formData.tipo_corte} onChange={set('tipo_corte')} disabled={submitting} options={[
            { value: 'tabla',    label: 'Tabla' },
            { value: 'viga',     label: 'Viga' },
            { value: 'bloque',   label: 'Bloque' },
            { value: 'rollizo',  label: 'Rollizo' },
            { value: 'aserrado', label: 'Aserrado' },
          ]} />
        </Field>
      </Section>

      {/* ── 2. Origen y Destino ───────────────────────────────────── */}
      <Section icon="📍" title="Origen y Destino" color={C.blue}>
        <Field label="Procedencia / Origen">
          <Input value={formData.procedencia} onChange={set('procedencia')} placeholder="Ej: Comunidad San Miguel" disabled={submitting} />
        </Field>
        <Field label="Destino de la Madera">
          <Select value={formData.destino} onChange={set('destino')} disabled={submitting} options={[
            { value: 'construccion',  label: 'Construcción' },
            { value: 'muebles',       label: 'Muebles' },
            { value: 'ebanisteria',   label: 'Ebanistería' },
            { value: 'revestimiento', label: 'Revestimiento' },
            { value: 'energia',       label: 'Energía / Combustible' },
            { value: 'pulpa',         label: 'Pulpa / Papel' },
            { value: 'otro',          label: 'Otro' },
          ]} />
        </Field>
        <Field label="Campamento / Depósito">
          <Input value={formData.campamento} onChange={set('campamento')} placeholder="Ej: Depósito Central" disabled={submitting} />
        </Field>
        <Field label="Ubicación Exacta">
          <Input value={formData.ubicacion_exacta} onChange={set('ubicacion_exacta')} placeholder="Ej: Fila 3, Pila 5" disabled={submitting} />
        </Field>
        <Field label="Obra Asociada">
          <Input value={formData.obra_asociada} onChange={set('obra_asociada')} placeholder="Ej: Tramo Vial Riberalta–Guayaramerín" disabled={submitting} />
        </Field>
        <Field label="Responsable">
          <Input value={formData.responsable} onChange={set('responsable')} placeholder="Nombre del responsable" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 3. Dimensiones ───────────────────────────────────────── */}
      <Section icon="📏" title="Dimensiones y Medidas" color={C.green}>
        <Field label="Largo (m)">
          <Input type="number" value={formData.largo} onChange={set('largo')} placeholder="Ej: 4.5" min="0" step="0.1" disabled={submitting} />
        </Field>
        <Field label="Ancho (cm)">
          <Input type="number" value={formData.ancho} onChange={set('ancho')} placeholder="Ej: 25" min="0" step="0.5" disabled={submitting} />
        </Field>
        <Field label="Espesor (cm)">
          <Input type="number" value={formData.espesor} onChange={set('espesor')} placeholder="Ej: 5" min="0" step="0.5" disabled={submitting} />
        </Field>
        <Field label="Volumen Total (m³)" required error={errors.volumen}>
          <Input type="number" value={formData.volumen} onChange={set('volumen')} placeholder="Ej: 2.5" min="0" step="0.1" disabled={submitting} error={errors.volumen} />
        </Field>
        <Field label="Cantidad de Piezas" required error={errors.cantidad}>
          <Input type="number" value={formData.cantidad} onChange={set('cantidad')} placeholder="Ej: 50" min="0" step="1" disabled={submitting} error={errors.cantidad} />
        </Field>
        <Field label="Peso Estimado (ton)">
          <Input type="number" value={formData.peso_estimado} onChange={set('peso_estimado')} placeholder="Ej: 3.2" min="0" step="0.1" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 4. Calidad ───────────────────────────────────────────── */}
      <Section icon="⭐" title="Calidad y Condición" color={C.orange}>
        <Field label="Grado de Calidad">
          <Select value={formData.grado_calidad} onChange={set('grado_calidad')} disabled={submitting} options={[
            { value: 'premium',   label: 'Premium (Exportación)' },
            { value: 'primera',   label: 'Primera Calidad' },
            { value: 'segunda',   label: 'Segunda Calidad' },
            { value: 'tercera',   label: 'Tercera Calidad' },
            { value: 'industrial',label: 'Industrial' },
          ]} />
        </Field>
        <Field label="Estado de Conservación">
          <Select value={formData.estado_conservacion} onChange={set('estado_conservacion')} disabled={submitting} options={[
            { value: 'excelente', label: 'Excelente' },
            { value: 'bueno',     label: 'Bueno' },
            { value: 'regular',   label: 'Regular' },
            { value: 'deficiente',label: 'Deficiente' },
          ]} />
        </Field>
        <Field label="Humedad (%)">
          <Input type="number" value={formData.humedad} onChange={set('humedad')} placeholder="Ej: 18" min="0" max="100" step="1" disabled={submitting} />
        </Field>
        <Field label="Defectos Presentes">
          <Textarea value={formData.defectos} onChange={set('defectos')} placeholder="Ej: grietas, nudos, alabeo..." disabled={submitting} rows={2} />
        </Field>
      </Section>

      {/* ── 5. Documentación y Comercialización ──────────────────── */}
      <Section icon="📄" title="Documentación y Comercialización" color={C.purple}>
        <Field label="N° Permiso Forestal">
          <Input value={formData.permiso_forestal} onChange={set('permiso_forestal')} placeholder="Ej: PF-2025-00123" disabled={submitting} />
        </Field>
        <Field label="Vencimiento del Permiso">
          <Input type="date" value={formData.fecha_vencimiento_permiso} onChange={set('fecha_vencimiento_permiso')} disabled={submitting} />
        </Field>
        <Field label="Fecha de Recepción">
          <Input type="date" value={formData.fecha_recepcion} onChange={set('fecha_recepcion')} disabled={submitting} />
        </Field>
        <Field label="Fecha de Aserrado">
          <Input type="date" value={formData.fecha_aserrado} onChange={set('fecha_aserrado')} disabled={submitting} />
        </Field>
        <Field label="Precio Unitario (Bs/m³)">
          <Input type="number" value={formData.precio_unitario} onChange={set('precio_unitario')} placeholder="Ej: 800" min="0" step="50" disabled={submitting} />
        </Field>
        <Field label="Comprador">
          <Input value={formData.comprador} onChange={set('comprador')} placeholder="Ej: Aserradero El Bosque" disabled={submitting} />
        </Field>
        <Field label="Precio de Venta (Bs)">
          <Input type="number" value={formData.precio_venta} onChange={set('precio_venta')} placeholder="Ej: 2500" min="0" step="100" disabled={submitting} />
        </Field>

        {/* Valor total calculado */}
        {valorTotal > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: `${C.purple}12`, border: `1px solid ${C.purple}30`, borderRadius: '8px' }}>
            <div>
              <p style={{ margin: 0, color: C.muted, fontSize: '11px', fontWeight: '600', letterSpacing: '0.6px' }}>VALOR TOTAL (vol × precio)</p>
              <p style={{ margin: '4px 0 0 0', color: C.purple, fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>
                Bs {valorTotal.toLocaleString('es-BO')}
              </p>
            </div>
          </div>
        )}

        <Field label="Notas / Observaciones" span={2}>
          <Textarea value={formData.notas} onChange={set('notas')} placeholder="Información adicional relevante..." disabled={submitting} />
        </Field>
      </Section>

    </div>
  );
};

export default FormMaderaDetallado;
