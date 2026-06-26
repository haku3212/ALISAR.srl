import React from 'react';

const C = {
  surface: '#0f110f', border2: '#232a23', border: '#1c221c',
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

const Input = ({ value, onChange, placeholder, type = 'text', disabled, error }) => (
  <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} disabled={disabled}
    style={inputStyle(error)}
    onFocus={e => e.target.style.borderColor = C.yellow}
    onBlur={e => e.target.style.borderColor = error ? C.red : C.border2}
  />
);

const Select = ({ value, onChange, options, disabled }) => (
  <select value={value || ''} onChange={onChange} disabled={disabled}
    style={{ ...inputStyle(), cursor: 'pointer' }}
    onFocus={e => e.target.style.borderColor = C.yellow}
    onBlur={e => e.target.style.borderColor = C.border2}
  >
    <option value="">Seleccionar...</option>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Textarea = ({ value, onChange, placeholder, disabled }) => (
  <textarea value={value || ''} onChange={onChange} placeholder={placeholder} disabled={disabled} rows={3}
    style={{ ...inputStyle(), resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
    onFocus={e => e.target.style.borderColor = C.yellow}
    onBlur={e => e.target.style.borderColor = C.border2}
  />
);

const Section = ({ icon, title, color = C.yellow, children }) => (
  <div style={{ marginBottom: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color }}>{title}</h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>{children}</div>
  </div>
);

const FormPersonalDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  const set = (field) => (e) => onChange({ ...formData, [field]: e.target.value });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── 1. Datos Personales ──────────────────────────────────── */}
      <Section icon="👤" title="Datos Personales" color={C.yellow}>
        <Field label="Nombre Completo" required error={errors.nombre} span={2}>
          <Input value={formData.nombre} onChange={set('nombre')} placeholder="Ej: Carlos Mendoza Vaca" disabled={submitting} error={errors.nombre} />
        </Field>
        <Field label="Cédula de Identidad">
          <Input value={formData.cedula} onChange={set('cedula')} placeholder="Ej: 1234567" disabled={submitting} />
        </Field>
        <Field label="Género">
          <Select value={formData.genero} onChange={set('genero')} disabled={submitting} options={[
            { value: 'Masculino', label: 'Masculino' },
            { value: 'Femenino',  label: 'Femenino' },
            { value: 'Otro',      label: 'Otro' },
          ]} />
        </Field>
        <Field label="Fecha de Nacimiento">
          <Input type="date" value={formData.fecha_nacimiento} onChange={set('fecha_nacimiento')} disabled={submitting} />
        </Field>
        <Field label="Correo Electrónico">
          <Input type="email" value={formData.email} onChange={set('email')} placeholder="correo@ejemplo.com" disabled={submitting} />
        </Field>
        <Field label="Celular">
          <Input type="tel" value={formData.celular} onChange={set('celular')} placeholder="Ej: 78231456" disabled={submitting} />
        </Field>
        <Field label="Dirección">
          <Input value={formData.direccion} onChange={set('direccion')} placeholder="Ej: Barrio Independencia, Riberalta" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 2. Información Laboral ────────────────────────────────── */}
      <Section icon="💼" title="Información Laboral" color={C.blue}>
        <Field label="Cargo / Puesto" required error={errors.cargo}>
          <Input value={formData.cargo} onChange={set('cargo')} placeholder="Ej: Operador de Motoniveladora" disabled={submitting} error={errors.cargo} />
        </Field>
        <Field label="Departamento / Área">
          <Select value={formData.departamento} onChange={set('departamento')} disabled={submitting} options={[
            { value: 'Operaciones',    label: 'Operaciones' },
            { value: 'Maquinaria',     label: 'Maquinaria' },
            { value: 'Logistica',      label: 'Logística' },
            { value: 'Administracion', label: 'Administración' },
            { value: 'RRHH',           label: 'Recursos Humanos' },
            { value: 'Obras',          label: 'Obras' },
          ]} />
        </Field>
        <Field label="Fecha de Ingreso">
          <Input type="date" value={formData.fecha_ingreso} onChange={set('fecha_ingreso')} disabled={submitting} />
        </Field>
        <Field label="Tipo de Contrato">
          <Select value={formData.tipo_contrato} onChange={set('tipo_contrato')} disabled={submitting} options={[
            { value: 'Indefinido', label: 'Indefinido (Fijo)' },
            { value: 'Eventual',   label: 'Eventual / Temporal' },
            { value: 'Por_obra',   label: 'Por Obra' },
            { value: 'Consultor',  label: 'Consultor' },
          ]} />
        </Field>
        <Field label="Salario Mensual (Bs)">
          <Input type="number" value={formData.salario} onChange={set('salario')} placeholder="Ej: 3500" min="0" step="100" disabled={submitting} />
        </Field>
        <Field label="Estado">
          <Select value={formData.estado} onChange={set('estado')} disabled={submitting} options={[
            { value: 'Activo',     label: 'Activo' },
            { value: 'Inactivo',   label: 'Inactivo' },
            { value: 'Licencia',   label: 'En Licencia' },
            { value: 'Vacaciones', label: 'En Vacaciones' },
          ]} />
        </Field>
      </Section>

      {/* ── 3. Contacto de Emergencia ─────────────────────────────── */}
      <Section icon="🚨" title="Contacto de Emergencia" color={C.orange}>
        <Field label="Nombre Completo">
          <Input value={formData.contacto_emergencia_nombre} onChange={set('contacto_emergencia_nombre')} placeholder="Ej: María Mendoza" disabled={submitting} />
        </Field>
        <Field label="Relación">
          <Select value={formData.contacto_emergencia_relacion} onChange={set('contacto_emergencia_relacion')} disabled={submitting} options={[
            { value: 'Esposo/a',    label: 'Esposo/a' },
            { value: 'Padre/Madre', label: 'Padre / Madre' },
            { value: 'Hermano/a',   label: 'Hermano/a' },
            { value: 'Hijo/a',      label: 'Hijo/a' },
            { value: 'Otro',        label: 'Otro' },
          ]} />
        </Field>
        <Field label="Teléfono de Emergencia">
          <Input type="tel" value={formData.contacto_emergencia_tel} onChange={set('contacto_emergencia_tel')} placeholder="Ej: 72345678" disabled={submitting} />
        </Field>
      </Section>

      {/* ── 4. Notas ──────────────────────────────────────────────── */}
      <Section icon="📝" title="Notas y Observaciones" color={C.muted}>
        <Field label="Certificaciones / Licencias / Observaciones" span={2}>
          <Textarea value={formData.notas} onChange={set('notas')} placeholder="Ej: Licencia para maquinaria pesada Cat. C, certificación en seguridad vial..." disabled={submitting} />
        </Field>
      </Section>

    </div>
  );
};

export default FormPersonalDetallado;
