import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

export const useCRUD = (serviceGet, serviceCreate, serviceUpdate, serviceDelete) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchData = useCallback(async () => {
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
  }, [serviceGet, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const requestDelete = useCallback((id) => {
    setPendingDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return;
    try {
      await serviceDelete(pendingDeleteId);
      showSuccess('Eliminado correctamente');
      await fetchData();
    } catch (err) {
      showError(err.response?.data?.msg || err.response?.data?.error || 'Error al eliminar');
    } finally {
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, serviceDelete, showSuccess, showError, fetchData]);

  const cancelDelete = useCallback(() => setPendingDeleteId(null), []);

  return {
    data,
    setData,
    loading,
    error,
    editingId,
    setEditingId,
    create,
    update,
    requestDelete,
    confirmDelete,
    cancelDelete,
    pendingDeleteId,
    refresh: fetchData
  };
};
