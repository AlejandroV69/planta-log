import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Equipment, FieldAlert, InspectionTemplate, LogEntry, Shift } from '../types/domain';
import { SEED_TEMPLATE_F25 } from '../mocks/seedData';
import { exportF25ToExcel } from '../utils/excelExport';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DEFAULT_TEMPLATE_ID = SEED_TEMPLATE_F25.id;

export type EquipmentInput = Omit<Equipment, 'id' | 'templateId'> & { templateId?: string };

interface LogsContextValue {
  logs: LogEntry[];
  equipments: Equipment[];
  template: InspectionTemplate;
  loading: boolean;
  loadError: string | null;
  addLog: (entry: LogEntry) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  addEquipment: (data: EquipmentInput) => Promise<Equipment>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  exportExcel: () => Promise<void>;
}

const LogsContext = createContext<LogsContextValue | undefined>(undefined);

// ---------- Mapeos DB <-> dominio ----------
interface EquipmentRow {
  id: string;
  tag: string;
  name: string;
  model: string;
  serial_number: string | null;
  capacity: string | null;
  refrigerant: string | null;
  location: string;
  status: Equipment['status'];
}

interface AlertRow {
  field_id: string;
  field_label: string;
  value: number | null;
  severity: FieldAlert['severity'];
  message: string;
}

interface LogRow {
  id: string;
  equipment_id: string;
  technician_id: string | null;
  technician_name: string;
  log_date: string;
  shift: Shift;
  values: LogEntry['values'];
  has_alerts: boolean;
  observations: string | null;
  created_at: string;
  log_alerts: AlertRow[] | null;
}

const toEquipment = (r: EquipmentRow): Equipment => ({
  id: r.id,
  tag: r.tag,
  name: r.name,
  model: r.model,
  serialNumber: r.serial_number ?? '',
  capacity: r.capacity ?? '',
  refrigerant: r.refrigerant ?? '',
  location: r.location,
  templateId: DEFAULT_TEMPLATE_ID,
  status: r.status,
});

const toLog = (r: LogRow): LogEntry => ({
  id: r.id,
  equipmentId: r.equipment_id,
  templateId: DEFAULT_TEMPLATE_ID,
  date: r.log_date,
  shift: r.shift,
  technicianName: r.technician_name,
  technicianId: r.technician_id ?? undefined,
  values: r.values ?? {},
  alerts: (r.log_alerts ?? []).map((a) => ({
    fieldId: a.field_id,
    fieldLabel: a.field_label,
    value: Number(a.value ?? 0),
    severity: a.severity,
    message: a.message,
  })),
  hasAlerts: r.has_alerts,
  observations: r.observations ?? undefined,
  createdAt: r.created_at,
});

const EQUIPMENT_COLUMNS =
  'id, tag, name, model, serial_number, capacity, refrigerant, location, status';
const LOG_COLUMNS =
  'id, equipment_id, technician_id, technician_name, log_date, shift, values, has_alerts, observations, created_at, log_alerts(field_id, field_label, value, severity, message)';

const friendly = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes('row-level security') || m.includes('permission denied'))
    return 'No tienes permisos para realizar esta acción.';
  if (m.includes('duplicate key') && m.includes('tag'))
    return 'Ya existe un equipo con ese Tag.';
  if (m.includes('foreign key') || m.includes('violates'))
    return 'No se puede eliminar: el equipo tiene rondas registradas.';
  return message;
};

export const LogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const userId = user?.id;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const [eqRes, logRes] = await Promise.all([
      supabase.from('equipments').select(EQUIPMENT_COLUMNS).order('tag'),
      supabase
        .from('logs')
        .select(LOG_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    if (eqRes.error || logRes.error) {
      setLoadError(friendly((eqRes.error || logRes.error)!.message));
    } else {
      setEquipments((eqRes.data as unknown as EquipmentRow[]).map(toEquipment));
      setLogs((logRes.data as unknown as LogRow[]).map(toLog));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, [userId, loadAll]);

  // ---------- Bitácoras ----------
  const addLog = async (entry: LogEntry) => {
    if (!companyId || !userId) throw new Error('Sesión no válida.');

    const hora = typeof entry.values.hora === 'string' ? entry.values.hora : null;
    const { data, error } = await supabase
      .from('logs')
      .insert({
        company_id: companyId,
        equipment_id: entry.equipmentId,
        technician_id: userId,
        technician_name: entry.technicianName,
        log_date: entry.date,
        log_time: hora,
        shift: entry.shift,
        values: entry.values,
        has_alerts: entry.alerts.length > 0,
        observations: entry.observations ?? null,
      })
      .select('id, created_at')
      .single();
    if (error) throw new Error(friendly(error.message));

    if (entry.alerts.length > 0) {
      const { error: alertErr } = await supabase.from('log_alerts').insert(
        entry.alerts.map((a) => ({
          company_id: companyId,
          log_id: data.id,
          equipment_id: entry.equipmentId,
          field_id: a.fieldId,
          field_label: a.fieldLabel,
          value: a.value,
          severity: a.severity === 'critical' ? 'critical' : 'warning',
          message: a.message,
        }))
      );
      if (alertErr) throw new Error(friendly(alertErr.message));
    }

    const saved: LogEntry = {
      ...entry,
      id: data.id,
      technicianId: userId,
      hasAlerts: entry.alerts.length > 0,
      createdAt: data.created_at,
    };
    setLogs((prev) => [saved, ...prev]);
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (error) throw new Error(friendly(error.message));
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // ---------- Equipos ----------
  const addEquipment = async (data: EquipmentInput): Promise<Equipment> => {
    if (!companyId) throw new Error('Sesión no válida.');
    const { data: row, error } = await supabase
      .from('equipments')
      .insert({
        company_id: companyId,
        tag: data.tag.trim().toUpperCase(),
        name: data.name.trim(),
        model: data.model.trim(),
        serial_number: data.serialNumber?.trim() || null,
        capacity: data.capacity?.trim() || null,
        refrigerant: data.refrigerant?.trim() || null,
        location: data.location.trim(),
        status: data.status || 'operational',
      })
      .select(EQUIPMENT_COLUMNS)
      .single();
    if (error) throw new Error(friendly(error.message));

    const created = toEquipment(row as unknown as EquipmentRow);
    setEquipments((prev) => [...prev, created].sort((a, b) => a.tag.localeCompare(b.tag)));
    return created;
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    const patch: Record<string, unknown> = {};
    if (data.tag !== undefined) patch.tag = data.tag.trim().toUpperCase();
    if (data.name !== undefined) patch.name = data.name.trim();
    if (data.model !== undefined) patch.model = data.model.trim();
    if (data.serialNumber !== undefined) patch.serial_number = data.serialNumber.trim() || null;
    if (data.capacity !== undefined) patch.capacity = data.capacity.trim() || null;
    if (data.refrigerant !== undefined) patch.refrigerant = data.refrigerant.trim() || null;
    if (data.location !== undefined) patch.location = data.location.trim();
    if (data.status !== undefined) patch.status = data.status;

    const { data: row, error } = await supabase
      .from('equipments')
      .update(patch)
      .eq('id', id)
      .select(EQUIPMENT_COLUMNS)
      .single();
    if (error) throw new Error(friendly(error.message));

    const updated = toEquipment(row as unknown as EquipmentRow);
    setEquipments((prev) => prev.map((eq) => (eq.id === id ? updated : eq)));
  };

  const deleteEquipment = async (id: string) => {
    const { error } = await supabase.from('equipments').delete().eq('id', id);
    if (error) throw new Error(friendly(error.message));
    setEquipments((prev) => prev.filter((eq) => eq.id !== id));
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
        loading,
        loadError,
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
