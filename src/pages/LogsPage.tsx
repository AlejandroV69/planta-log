import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  Trash2,
  Check,
  Download,
  Snowflake,
  Waves,
  Thermometer,
  Gauge,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DynamicLogWizard } from '../components/logs/DynamicLogWizard';
import { useLogs } from '../context/LogsContext';
import type { LogEntry, Shift } from '../types/domain';

export const LogsPage: React.FC = () => {
  const { logs, equipments, addLog, deleteLog, exportExcel } = useLogs();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardInitialEquipmentId, setWizardInitialEquipmentId] = useState<string | null>(
    null
  );
  const [wizardInitialShift, setWizardInitialShift] = useState<Shift | undefined>(
    undefined
  );
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('nueva') === '1') {
      const eqParam = searchParams.get('equipo');
      const shiftParam = searchParams.get('turno') as Shift | null;
      if (eqParam) setWizardInitialEquipmentId(eqParam);
      if (shiftParam) setWizardInitialShift(shiftParam);
      setIsWizardOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSaveNewEntry = (newEntry: LogEntry) => {
    addLog(newEntry);
    setToastMessage(`Ronda de ${newEntry.shift} guardada con éxito.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  if (isWizardOpen) {
    const initialEquip =
      equipments.find((e) => e.id === wizardInitialEquipmentId) || equipments[0];
    return (
      <DynamicLogWizard
        equipment={initialEquip}
        initialShift={wizardInitialShift}
        onClose={() => {
          setIsWizardOpen(false);
          setWizardInitialEquipmentId(null);
          setWizardInitialShift(undefined);
        }}
        onSave={handleSaveNewEntry}
      />
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (filterAlertsOnly && !log.hasAlerts) return false;
    if (selectedEquipmentFilter !== 'ALL' && log.equipmentId !== selectedEquipmentFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const eq = equipments.find((e) => e.id === log.equipmentId);
      const matchOperator = (log.technicianName || '').toLowerCase().includes(term);
      const matchShift = (log.shift || '').toLowerCase().includes(term);
      const matchDate = (log.date || '').includes(term);
      const matchEquip = (eq?.tag || log.equipmentId || '').toLowerCase().includes(term);
      return matchOperator || matchShift || matchDate || matchEquip;
    }
    return true;
  });

  const totalAlertsCount = logs.filter((l) => l.hasAlerts).length;

  return (
    <div className="space-y-6">
      {/* NOTIFICACIÓN FLOTANTE */}
      {toastMessage && (
        <div
          style={{ padding: '0.75rem 1.25rem' }}
          className="fixed top-5 right-5 z-50 bg-slate-900 text-white rounded-2xl font-semibold text-xs flex items-center gap-2.5 shadow-xl"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CABECERA ESTILO APP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rondas y Bitácoras
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Toca cualquier tarjeta para desplegar las lecturas completas del formato F-25.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={exportExcel}
            style={{ padding: '0.6rem 1rem' }}
            className="rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            style={{ padding: '0.6rem 1.1rem' }}
            className="rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Ronda</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS TÁCTILES Y BUSCADOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedEquipmentFilter('ALL')}
            style={{ padding: '0.45rem 0.9rem' }}
            className={`rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              selectedEquipmentFilter === 'ALL'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'bg-white text-slate-600 border border-slate-100 hover:border-sky-100'
            }`}
          >
            Todas ({logs.length})
          </button>

          {equipments.map((eq) => {
            const count = logs.filter((l) => l.equipmentId === eq.id).length;
            return (
              <button
                key={eq.id}
                type="button"
                onClick={() => setSelectedEquipmentFilter(eq.id)}
                style={{ padding: '0.45rem 0.9rem' }}
                className={`rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedEquipmentFilter === eq.id
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                    : 'bg-white text-slate-600 border border-slate-100 hover:border-sky-100'
                }`}
              >
                {eq.tag} ({count})
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setFilterAlertsOnly(!filterAlertsOnly)}
            style={{ padding: '0.45rem 0.9rem' }}
            className={`rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterAlertsOnly
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'bg-white text-amber-600 border border-amber-100 hover:bg-amber-50/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertas ({totalAlertsCount})</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por equipo, operador o fecha..."
            style={{ padding: '0.55rem 0.9rem 0.55rem 2.3rem' }}
            className="w-full rounded-2xl bg-white border border-slate-100 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>
      </div>

      {/* LISTA DE TARJETAS DE RONDAS (SIN TABLAS DENSAS) */}
      <div className="space-y-3.5">
        {filteredLogs.map((log) => {
          const eq = equipments.find((e) => e.id === log.equipmentId);
          const v = log.values || {};
          const estado = v.estado_equipo || 'ON';
          const isOnline = estado === 'ON';
          const isPump = eq?.tag.startsWith('BC');
          const isExpanded = expandedLogId === log.id;

          return (
            <div
              key={log.id}
              style={{ padding: '1.25rem 1.5rem' }}
              className="rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Fila principal de la tarjeta */}
              <div
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    {isPump ? (
                      <Waves className="w-6 h-6" />
                    ) : (
                      <Snowflake className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        {eq?.tag || log.equipmentId}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {eq?.name}
                      </span>
                      {log.hasAlerts ? (
                        <span
                          style={{ padding: '0.15rem 0.55rem' }}
                          className="rounded-full bg-amber-50 text-amber-600 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Alerta Filtro
                        </span>
                      ) : isOnline ? (
                        <span
                          style={{ padding: '0.15rem 0.55rem' }}
                          className="rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold"
                        >
                          Operación Normal
                        </span>
                      ) : (
                        <span
                          style={{ padding: '0.15rem 0.55rem' }}
                          className="rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold"
                        >
                          Standby
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {log.date} · Turno {v.turno || log.shift}{' '}
                      {v.hora ? `(${v.hora} hrs)` : ''} · {log.technicianName}
                    </div>
                  </div>
                </div>

                {/* Indicadores compactos a la derecha */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                  {isOnline && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Thermometer className="w-4 h-4 text-sky-500" />
                        <div>
                          <div className="font-bold text-slate-900">
                            {v.delta_t_agua ?? '--'} °F
                          </div>
                          <div className="text-[10px] text-slate-400">Dif. Agua</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <Gauge
                          className={`w-4 h-4 ${
                            Number(v.delta_p_filtro) > 10
                              ? 'text-amber-500'
                              : 'text-sky-500'
                          }`}
                        />
                        <div>
                          <div
                            className={`font-bold ${
                              Number(v.delta_p_filtro) > 10
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {v.delta_p_filtro ?? '--'} PSI
                          </div>
                          <div className="text-[10px] text-slate-400">Dif. Filtro</div>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-1.5 text-xs">
                        <Zap className="w-4 h-4 text-sky-500" />
                        <div>
                          <div className="font-bold text-slate-900">
                            {v.carga_porcentaje ?? '--'}%
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {v.amperaje_total ?? '--'} A
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLog(log.id);
                      }}
                      style={{ padding: '0.45rem' }}
                      className="rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div
                      style={{ padding: '0.45rem' }}
                      className="rounded-xl bg-slate-50 text-slate-500"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista desplegable de lecturas completas */}
              {isExpanded && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div
                      style={{ padding: '0.75rem' }}
                      className="rounded-2xl bg-slate-50 space-y-1"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        Agua EWT / LWT
                      </div>
                      <div className="font-bold text-slate-900">
                        {v.ewt_temp ?? '--'}° / {v.lwt_temp ?? '--'}°F
                      </div>
                    </div>

                    <div
                      style={{ padding: '0.75rem' }}
                      className="rounded-2xl bg-slate-50 space-y-1"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        Setpoint / Amb.
                      </div>
                      <div className="font-bold text-slate-900">
                        {v.setpoint_agua ?? '--'}° / {v.temp_ambiente ?? '--'}°F
                      </div>
                    </div>

                    <div
                      style={{ padding: '0.75rem' }}
                      className="rounded-2xl bg-slate-50 space-y-1"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        Compresor C1
                      </div>
                      <div className="font-bold text-slate-900">
                        {v.c1_pres_succion ?? '--'} / {v.c1_pres_descarga ?? '--'} PSI
                      </div>
                    </div>

                    <div
                      style={{ padding: '0.75rem' }}
                      className="rounded-2xl bg-slate-50 space-y-1"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        Compresor C2
                      </div>
                      <div className="font-bold text-slate-900">
                        {v.c2_pres_succion ?? '--'} / {v.c2_pres_descarga ?? '--'} PSI
                      </div>
                    </div>

                    <div
                      style={{ padding: '0.75rem' }}
                      className="rounded-2xl bg-slate-50 space-y-1"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        Eléctrico
                      </div>
                      <div className="font-bold text-slate-900">
                        {v.voltaje_prom ?? '--'} V · {v.amperaje_total ?? '--'} A
                      </div>
                    </div>

                    <div
                      style={{ padding: '0.75rem' }}
                      className="rounded-2xl bg-slate-50 space-y-1"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        Nivel Aceite C1/C2
                      </div>
                      <div className="font-bold text-emerald-600">
                        {v.c1_nivel_aceite ?? 'OK'} / {v.c2_nivel_aceite ?? 'OK'}
                      </div>
                    </div>
                  </div>

                  {log.observations && (
                    <div
                      style={{ padding: '0.75rem 1rem' }}
                      className="rounded-2xl bg-sky-50/50 text-xs text-slate-600"
                    >
                      <strong className="text-slate-800">Nota del operador: </strong>
                      {log.observations}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
