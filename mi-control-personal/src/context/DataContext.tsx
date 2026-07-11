import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ApiResult, AppData } from '../../shared/types';
import { api } from '../api';

interface Toast {
  id: number;
  text: string;
  error: boolean;
}

interface DataContextValue {
  data: AppData | null;
  refresh: () => Promise<void>;
  /** Ejecuta una llamada a la API, refresca los datos y muestra errores como toast. Devuelve true si tuvo éxito. */
  call: <T>(promise: Promise<ApiResult<T>>, successMessage?: string) => Promise<boolean>;
  notify: (text: string, error?: boolean) => void;
  toasts: Toast[];
}

const DataContext = createContext<DataContextValue>(null as any);

let toastId = 0;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((text: string, error = false) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, error }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), error ? 6000 : 3000);
  }, []);

  const refresh = useCallback(async () => {
    const result = await api.getAll();
    if (result.ok) {
      setData(result.data);
      document.documentElement.dataset.theme = result.data.settings.theme;
    } else {
      notify(result.error, true);
    }
  }, [notify]);

  const call = useCallback(
    async <T,>(promise: Promise<ApiResult<T>>, successMessage?: string): Promise<boolean> => {
      const result = await promise;
      if (!result.ok) {
        notify(result.error, true);
        return false;
      }
      await refresh();
      if (successMessage) notify(successMessage);
      return true;
    },
    [notify, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ data, refresh, call, notify, toasts }), [data, refresh, call, notify, toasts]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue & { data: AppData } {
  return useContext(DataContext) as any;
}
