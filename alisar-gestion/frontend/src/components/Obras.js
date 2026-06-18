import React, { useState, useMemo } from 'react';
import { HardHat, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import SearchBar from './common/SearchBar';
import { generateObrasReport, generateExcelReport } from '../utils/reportGenerator';

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid #252a25', background: '#131613', color: '#e0e0e0',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
};
const lbl = {
  display: 'block', fontSize: '11px', fontWeight: '600', color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
};
const errTxt = { color: '#f87171', fontSize: '11px', margin: '4px 0 0 0' };
const EMPTY = {
  nombre: '', tipo: '', cliente: '', avance: 0, presupuesto: '',
  responsable_tecnico: '', inicio_planeado: '', fin_planeado: '',
  descripcion: '', observaciones: ''
};

const Obras = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getObras, dataService.createObra, dataService.updateObra, dataService.deleteObra
  );
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const filterConfigs = useMemo(() => [
    { id: 'avance', label: 'Avance Mínimo', type: 'range', min: 0, max: 100 }
  ], []);

  const filtered = useMemo(() => {
    let r = data.filter(o =>
      o.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      o.presupuesto?.toString().toLowerCase().includes(search.toLowerCase()) ||
      o.tipo?.toLowerCase().includes(search.toLowerCase())
    );
    if (filters.avance) r = r.filter(o => o.avance >= parseInt(filters.avance));
    return r;
  }, [data, search, filters]);

  const validate = () => {
    const e = {};
    if (!formData.nombre?.trim()) e.nombre = 'Campo requerido';
    if (!formData.presupuesto?.toString().trim()) e.presupuesto = 'Campo requerido';
    const av = Number(formData.avance);
    if (isNaN(av) || av < 0 || av > 100) e.avance = 'Debe ser 0–100';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const payload = { ...formData, avance: Number(formData.avance) };
      editingId ? await update(editingId, payload) : await create(payload);
      setFormData(EMPTY);
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (obra) => { setFormData({ ...EMPTY, ...obra }); setFormErrors({}); setEditingId(obra.id); setShowModal(true); };
  const handleNew = () => { setFormData(EMPTY); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingId(null); };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: '700' }}>Control de Obras</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0 0 0' }}>Seguimiento de ejecución y presupuestos</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateObrasReport(data)} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #2a2f2a', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <FileText size={15} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre' }, { label: 'Tipo', key: 'tipo' },
            { label: 'Presupuesto', key: 'presupuesto' }, { label: 'Avance', key: 'avance' }
          ], 'Obras')} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #2a2f2a', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <Download size={15} /> Excel
          </button>
          <button onClick={handleNew} style={{ background: '#FFD700', color: '#000', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px' }}>
            <Plus size={16} /> Nueva Obra
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}
      <SearchBar placeholder="Buscar por nombre, tipo o presupuesto..." onSearch={setSearch} onFilterChange={setFilters} filters={filterConfigs} />

      <div style={{ display: 'grid', gap: '14px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: '#555' }}>
            {search ? 'Sin resultados para la búsqueda' : 'No hay obras registradas'}
          </div>
        ) : filtered.map(obra => (
          <div key={obra.id} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <HardHat size={17} color="#FFD700" />
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '600' }}>{obra.nombre}</h3>
                  {obra.tipo && <span style={{ background: '#1a2a1a', color: '#FFD700', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{obra.tipo}</span>}
                </div>
                {obra.cliente && <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>Cliente: {obra.cliente}</p>}
                {obra.responsable_tecnico && <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Responsable: {obra.responsable_tecnico}</p>}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                <button onClick={() => handleEdit(obra)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '4px' }}><Edit2 size={17} /></button>
                <button onClick={() => deleteItem(obra.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}><Trash2 size={17} /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
              <div>
                <p style={{ color: '#555', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Presupuesto</p>
                <p style={{ color: '#fff', fontSize: '17px', fontWeight: '700', margin: '4px 0 0 0' }}>{obra.presupuesto}</p>
              </div>
              <div>
                <p style={{ color: '#555', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Avance</p>
                <p style={{ color: '#FFD700', fontSize: '17px', fontWeight: '700', margin: '4px 0 0 0' }}>{obra.avance}%</p>
              </div>
            </div>
            <div style={{ background: '#1a1f1a', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ background: obra.avance >= 75 ? '#FFD700' : obra.avance >= 50 ? '#60a5fa' : '#f97316', width: `${Math.min(obra.avance, 100)}%`, height: '100%', transition: 'width 0.3s', borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={handleClose} title={editingId ? 'Editar Obra' : 'Nueva Obra'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Nombre <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.nombre ? '#f87171' : '#252a25'}` }} value={formData.nombre} onChange={set('nombre')} placeholder="Ej: Mantenimiento Tramo Vial Riberalta" disabled={submitting} />
              {formErrors.nombre && <p style={errTxt}>{formErrors.nombre}</p>}
            </div>
            <div>
              <label style={lbl}>Tipo de Obra</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={formData.tipo} onChange={set('tipo')} disabled={submitting}>
                <option value="">Seleccionar...</option>
                <option value="vial">Vial / Camino</option>
                <option value="edificacion">Edificación</option>
                <option value="saneamiento">Saneamiento</option>
                <option value="electrificacion">Electrificación</option>
                <option value="forestal">Forestal / Reforestación</option>
                <option value="otra">Otra</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Cliente / Solicitante</label>
              <input style={inp} value={formData.cliente} onChange={set('cliente')} placeholder="Ej: Municipalidad de Riberalta" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Avance (%) <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.avance ? '#f87171' : '#252a25'}` }} type="number" min="0" max="100" value={formData.avance} onChange={set('avance')} placeholder="0 – 100" disabled={submitting} />
              {formErrors.avance && <p style={errTxt}>{formErrors.avance}</p>}
            </div>
            <div>
              <label style={lbl}>Presupuesto <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.presupuesto ? '#f87171' : '#252a25'}` }} value={formData.presupuesto} onChange={set('presupuesto')} placeholder="Ej: 150,000 Bs" disabled={submitting} />
              {formErrors.presupuesto && <p style={errTxt}>{formErrors.presupuesto}</p>}
            </div>
            <div>
              <label style={lbl}>Responsable Técnico</label>
              <input style={inp} value={formData.responsable_tecnico} onChange={set('responsable_tecnico')} placeholder="Ej: Ing. Carlos López" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Inicio Planeado</label>
              <input style={inp} type="date" value={formData.inicio_planeado} onChange={set('inicio_planeado')} disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Fin Planeado</label>
              <input style={inp} type="date" value={formData.fin_planeado} onChange={set('fin_planeado')} disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Descripción</label>
              <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical', lineHeight: '1.5' }} value={formData.descripcion} onChange={set('descripcion')} placeholder="Descripción del proyecto..." disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Observaciones</label>
              <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical', lineHeight: '1.5' }} value={formData.observaciones} onChange={set('observaciones')} placeholder="Cambios, retrasos, notas..." disabled={submitting} />
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, fontSize: '14px' }}>
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Obra' : 'Crear Obra'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Obras;
