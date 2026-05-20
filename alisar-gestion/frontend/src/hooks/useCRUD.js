import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export const useCRUD = (serviceGet, serviceCreate, serviceUpdate, serviceDelete) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await serviceGet();
      setData(response.data || []);
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al cargar datos';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const create = async (newItem) => {
    try {
      await serviceCreate(newItem);
      await fetchData();
      showSuccess('Registrado correctamente');
      return true;
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al crear';
      showError(msg);
      return false;
    }
  };

  const update = async (id, updatedItem) => {
    try {
      await serviceUpdate(id, updatedItem);
      await fetchData();
      showSuccess('Actualizado correctamente');
      setEditingId(null);
      return true;
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al actualizar';
      showError(msg);
      return false;
    }
  };

  const delete_item = async (id) => {
    if (!window.confirm('¿Deseas eliminar este registro?')) return false;
    try {
      await serviceDelete(id);
      await fetchData();
      showSuccess('Eliminado correctamente');
      return true;
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al eliminar';
      showError(msg);
      return false;
    }
  };

  return {
    data,
    setData,
    loading,
    error,
    editingId,
    setEditingId,
    create,
    update,
    delete: delete_item,
    refresh: fetchData
  };
};
