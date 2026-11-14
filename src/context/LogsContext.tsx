import React, { createContext, useContext, useState } from 'react';
import type { Equipment, InspectionTemplate, LogEntry } from '../types/domain';
import { SEED_EQUIPMENTS, SEED_LOG_ENTRIES, SEED_TEMPLATE_F25 } from '../mocks/seedData';
import { exportF25ToExcel } from '../utils/excelExport';

const STORAGE_KEY = 'plantalog_logs_data_v3';
const EQUIPMENTS_STORAGE_KEY = 'plantalog_equipments_v1';

interface LogsContextValue {
  logs: LogEntry[];
  equipments: Equipment[];
  template: InspectionTemplate;
  addLog: (entry: LogEntry) => void;
  deleteLog: (id: string) => void;
  addEquipment: (data: Omit<Equipment, 'id' | 'templateId'> & { templateId?: string }) => Equipment;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  exportExcel: () => Promise<void>;
}

const LogsContext = createContext<LogsContextValue | undefined>(undefined);

export const LogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback a seeds
      }
    }
    return SEED_LOG_ENTRIES;
  });

  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem(EQUIPMENTS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback a seeds
      }
    }
    return SEED_EQUIPMENTS;
  });

  const addLog = (newEntry: LogEntry) => {
    setLogs((prev) => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const addEquipment = (
    data: Omit<Equipment, 'id' | 'templateId'> & { templateId?: string }
  ): Equipment => {
    const cleanTag = data.tag.trim().toUpperCase();
    const newEquipment: Equipment = {
      id: `eq-${Date.now()}`,
      tag: cleanTag,
      name: data.name.trim(),
      model: data.model.trim(),
      serialNumber: data.serialNumber?.trim() || '',
      capacity: data.capacity?.trim() || '',
      refrigerant: data.refrigerant?.trim() || 'Agua Helada',
      location: data.location.trim(),
      templateId: data.templateId || 'tmpl-york-f25',
      status: data.status || 'operational',
    };

    setEquipments((prev) => {
      const updated = [...prev, newEquipment];
      localStorage.setItem(EQUIPMENTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newEquipment;
  };

  const updateEquipment = (id: string, data: Partial<Equipment>) => {
    setEquipments((prev) => {
      const updated = prev.map((eq) =>
        eq.id === id
          ? {
              ...eq,
              ...data,
              tag: data.tag !== undefined ? data.tag.trim().toUpperCase() : eq.tag,
            }
          : eq
      );
      localStorage.setItem(EQUIPMENTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteEquipment = (id: string) => {
    setEquipments((prev) => {
      const updated = prev.filter((eq) => eq.id !== id);
      localStorage.setItem(EQUIPMENTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const exportExcel = async () => {
    await exportF25ToExcel(logs, equipments);
  };

  return (
    <LogsContext.Provider
      value={{
        logs,
        equipments,
        template: SEED_TEMPLATE_F25,
        addLog,
        deleteLog,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        exportExcel,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
};

export const useLogs = (): LogsContextValue => {
  const ctx = useContext(LogsContext);
  if (!ctx) {
    throw new Error('useLogs debe usarse dentro de un LogsProvider');
  }
  return ctx;
};
