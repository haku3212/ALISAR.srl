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

const PersonalSelector = ({ personalList = [], selectedIds = [], onChange, disabled }) => {
  const toggle = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  if (personalList.length === 0) {
    return <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>No hay personal registrado en el sistema.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {personalList.map(p => {
        const selected = selectedIds.includes(p.id);
        return (
          <div
            key={p.id}
            onClick={() => !disabled && toggle(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px', cursor: disabled ? 'default' : 'pointer',
              border: `1px solid ${selected ? C.green + '60' : C.border2}`,
              background: selected ? C.green + '10' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
              border: `2px solid ${selected ? C.green : C.border2}`,
              background: selected ? C.green : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selected && <span style={{ color: '#000', fontSize: '10px', fontWeight: '700', lineHeight: 1 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '13px', color: selected ? C.text : '#b0c0b0', fontWeight: selected ? '600' : '400' }}>{p.nombre}</p>
              {p.cargo && <p style={{ margin: 0, fontSize: '11px', color: C.muted }}>{p.cargo}</p>}
            </div>
            {selected && (
              <span style={{ fontSize: '10px', color: C.green, fontWeight: '700', letterSpacing: '0.5px' }}>ASIGNADO</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FormMaderaDetallado = ({ formData, onChange, errors = {}, submitting = false, personalList = [], selectedPersonal = [], onPersonalChange }) => {
  const set = (field) => (e) => onChange({ ...formData, [field]: e.target.value });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── 1. Contrato ───────────────────────────────────────────── */}
      <Section icon="📋" title="Datos del Contrato" color={C.yellow}>
        <Field label="Nombre / Referencia del Trabajo" required error={errors.nombre} span={2}>
          <Input value={formData.nombre} onChange={set('nombre')} placeholder="Ej: Extracción Forestal Zona Norte — Lote 12" disabled={submitting} error={errors.nombre} />
        </Field>
        <Field label="Contratante Principal" required error={errors.contratante}>
          <Input value={formData.contratante} onChange={set('contratante')} placeholder="Ej: Municipalidad de Riberalta" disabled={submitting} error={errors.contratante} />
        </Field>
        <Field label="Segunda Parte">
          <Input value={formData.segunda_parte} onChange={set('segunda_parte')} placeholder="Ej: Aserradero El Bosque S.R.L." disabled={submitting} />
        </Field>
        <Field label="N° Permiso Forestal" required error={errors.permiso_forestal}>
          <Input value={formData.permiso_forestal} onChange={set('permiso_forestal')} placeholder="Ej: PF-2025-00123" disabled={submitting} error={errors.permiso_forestal} />
        </Field>
        <Field label="Vencimiento del Permiso">
          <Input type="date" value={formData.fecha_vencimiento_permiso} onChange={set('fecha_vencimiento_permiso')} disabled={submitting} />
        </Field>
        <Field label="Fecha de Inicio del Contrato">
          <Input type="date" value={formData.fecha_recepcion} onChange={set('fecha_recepcion')} disabled={submitting} />
        </Field>
        <Field label="Estado">
          <Select value={formData.estado_contrato} onChange={set('estado_contrato')} disabled={submitting} options={[
            { value: 'en_curso',   label: 'En Curso' },
            { value: 'entregado',  label: 'Entregado al Aserradero' },
            { value: 'pausado',    label: 'Pausado' },
            { value: 'cancelado',  label: 'Cancelado' },
          ]} />
        </Field>
      </Section>

      {/* ── 2. Equipo y Campamento ────────────────────────────────── */}
      <Section icon="⛺" title="Equipo y Campamento" color={C.blue}>
        <Field label="Ing. Forestal a Cargo" required error={errors.ing_forestal}>
          <Input value={formData.ing_forestal} onChange={set('ing_forestal')} placeholder="Nombre del ingeniero forestal" disabled={submitting} error={errors.ing_forestal} />
        </Field>
        <Field label="Jefe de Campamento">
          <Input value={formData.jefe_campamento} onChange={set('jefe_campamento')} placeholder="Nombre del jefe de campamento" disabled={submitting} />
        </Field>
        <Field label="Ubicación del Campamento" span={2}>
          <Input value={formData.campamento} onChange={set('campamento')} placeholder="Ej: Comunidad San Miguel, km 45 carretera Riberalta" disabled={submitting} />
        </Field>
        <Field label="Personal Asignado (cant.)">
          <Input type="number" value={formData.personal_asignado} onChange={set('personal_asignado')} placeholder="Ej: 12" min="0" step="1" disabled={submitting} />
        </Field>
        <Field label="Maquinaria Asignada">
          <Input value={formData.maquinaria_asignada} onChange={set('maquinaria_asignada')} placeholder="Ej: Motoniveladora CAT 140H, Volquete #3" disabled={submitting} />
        </Field>
        <Field label="Observaciones del Campamento" span={2}>
          <Textarea value={formData.obs_campamento} onChange={set('obs_campamento')} placeholder="Condiciones del terreno, acceso, logística..." disabled={submitting} rows={2} />
        </Field>
      </Section>

      {/* ── 3. Personal del Campamento ───────────────────────────── */}
      <Section icon="👷" title="Personal en el Campamento" color={C.green}>
        <div style={{ gridColumn: '1 / -1' }}>
          <PersonalSelector
            personalList={personalList}
            selectedIds={selectedPersonal}
            onChange={onPersonalChange}
            disabled={submitting}
          />
          {selectedPersonal.length > 0 && (
            <p style={{ margin: '10px 0 0 0', color: C.green, fontSize: '12px', fontWeight: '600' }}>
              {selectedPersonal.length} persona{selectedPersonal.length > 1 ? 's' : ''} asignada{selectedPersonal.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </Section>

      {/* ── 4. Extracción ────────────────────────────────────────── */}
      <Section icon="🪓" title="Extracción — Monte al Punto Medio" color={C.orange}>
        <Field label="Zona de Extracción / Monte" span={2}>
          <Input value={formData.zona_extraccion} onChange={set('zona_extraccion')} placeholder="Ej: Zona norte sector B, comunidad Cachuela Esperanza" disabled={submitting} />
        </Field>
        <Field label="Ubicación del Punto Medio" span={2}>
          <Input value={formData.punto_medio} onChange={set('punto_medio')} placeholder="Ej: km 28 margen izquierda río Beni" disabled={submitting} />
        </Field>
        <Field label="Fecha de Inicio de Tumba">
          <Input type="date" value={formData.fecha_inicio_tumba} onChange={set('fecha_inicio_tumba')} disabled={submitting} />
        </Field>
        <Field label="Fecha de Llegada al Punto Medio">
          <Input type="date" value={formData.fecha_llegada_punto_medio} onChange={set('fecha_llegada_punto_medio')} disabled={submitting} />
        </Field>
        <Field label="Notas de Extracción" span={2}>
          <Textarea value={formData.obs_extraccion} onChange={set('obs_extraccion')} placeholder="Dificultades, condiciones del terreno, incidentes..." disabled={submitting} rows={2} />
        </Field>
      </Section>

      {/* ── 4. Clasificación en Punto Medio ──────────────────────── */}
      <Section icon="📏" title="Clasificación en Punto Medio" color={C.orange}>
        <Field label="Especie de Madera" required error={errors.especie}>
          <Select value={formData.especie} onChange={set('especie')} disabled={submitting} options={[
            { value: 'cedro',        label: 'Cedro' },
            { value: 'caoba',        label: 'Caoba' },
            { value: 'mara',         label: 'Mará' },
            { value: 'roble',        label: 'Roble' },
            { value: 'teca',         label: 'Teca' },
            { value: 'pino',         label: 'Pino' },
            { value: 'ocote',        label: 'Ocote' },
            { value: 'almendrillo',  label: 'Almendrillo' },
            { value: 'tajibo',       label: 'Tajibo' },
            { value: 'otra',         label: 'Otra' },
          ]} />
        </Field>
        <Field label="Nombre Común">
          <Input value={formData.nombre_comun} onChange={set('nombre_comun')} placeholder="Ej: Cedro Rojo" disabled={submitting} />
        </Field>
        <Field label="Clase / Calidad">
          <Select value={formData.grado_calidad} onChange={set('grado_calidad')} disabled={submitting} options={[
            { value: 'primera',    label: 'Primera' },
            { value: 'segunda',    label: 'Segunda' },
            { value: 'tercera',    label: 'Tercera' },
            { value: 'industrial', label: 'Industrial' },
          ]} />
        </Field>
        <Field label="Tipo de Corte">
          <Select value={formData.tipo_corte} onChange={set('tipo_corte')} disabled={submitting} options={[
            { value: 'rollizo',  label: 'Rollizo (tronco entero)' },
            { value: 'tabla',    label: 'Tabla' },
            { value: 'viga',     label: 'Viga' },
            { value: 'bloque',   label: 'Bloque' },
          ]} />
        </Field>
        <Field label="Volumen Total (m³)" required error={errors.volumen}>
          <Input type="number" value={formData.volumen} onChange={set('volumen')} placeholder="Ej: 45.5" min="0" step="0.1" disabled={submitting} error={errors.volumen} />
        </Field>
        <Field label="N° de Piezas / Trozas" required error={errors.num_piezas}>
          <Input type="number" value={formData.num_piezas} onChange={set('num_piezas')} placeholder="Ej: 80" min="0" step="1" disabled={submitting} error={errors.num_piezas} />
        </Field>
        <Field label="Observaciones de Clasificación" span={2}>
          <Textarea value={formData.obs_clasificacion} onChange={set('obs_clasificacion')} placeholder="Condición de la madera, defectos, humedad estimada..." disabled={submitting} rows={2} />
        </Field>
      </Section>

      {/* ── 5. Entrega al Aserradero ──────────────────────────────── */}
      <Section icon="🏭" title="Transporte y Entrega al Aserradero" color={C.purple}>
        <Field label="Aserradero de Destino" span={2}>
          <Input value={formData.aserradero_destino} onChange={set('aserradero_destino')} placeholder="Ej: Aserradero El Bosque, Riberalta" disabled={submitting} />
        </Field>
        <Field label="Fecha de Entrega">
          <Input type="date" value={formData.fecha_entrega_aserradero} onChange={set('fecha_entrega_aserradero')} disabled={submitting} />
        </Field>
        <Field label="Precio por m³ (Bs)">
          <Input type="number" value={formData.precio_unitario} onChange={set('precio_unitario')} placeholder="Ej: 850" min="0" step="50" disabled={submitting} />
        </Field>
        <Field label="Precio de Venta Total (Bs)">
          <Input type="number" value={formData.precio_venta} onChange={set('precio_venta')} placeholder="Ej: 38000" min="0" step="100" disabled={submitting} />
        </Field>
        <Field label="Responsable de Recepción">
          <Input value={formData.responsable_recepcion} onChange={set('responsable_recepcion')} placeholder="Nombre de quien recibe en el aserradero" disabled={submitting} />
        </Field>
        <Field label="Notas de Entrega" span={2}>
          <Textarea value={formData.obs_entrega} onChange={set('obs_entrega')} placeholder="Observaciones del transporte, condición al llegar, conformidad..." disabled={submitting} rows={2} />
        </Field>
      </Section>

    </div>
  );
};

export default FormMaderaDetallado;
