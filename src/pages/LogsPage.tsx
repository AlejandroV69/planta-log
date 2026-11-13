import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, Eye, Edit3, Trash2, List, Wand2, Check } from 'lucide-react';
import { SEED_LOG_ENTRIES } from '../mocks/seedData';
import { DynamicLogWizard } from '../components/logs/DynamicLogWizard';
import type { LogEntry } from '../types/domain';

const STORAGE_KEY = 'plantalog_logs_data_v1';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_LOG_ENTRIES;
      }
    }
    return SEED_LOG_ENTRIES;
  });

  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveNewEntry = (newEntry: LogEntry) => {
    setLogs((prev) => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setToastMessage(`¡Ronda de ${newEntry.shift} registrada exitosamente!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDeleteEntry = (id: string) => {
    setLogs((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // SI EL WIZARD ESTÁ ABIERTO, MOSTRAR LA VISTA COMPLETA DE INSPECCIÓN
  if (isWizardOpen) {
    return (
      <DynamicLogWizard
        onClose={() => setIsWizardOpen(false)}
        onSave={handleSaveNewEntry}
      />
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (filterAlertsOnly && !log.hasAlerts) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchOperator = (log.technicianName || '').toLowerCase().includes(term);
      const matchShift = (log.shift || '').toLowerCase().includes(term);
      const matchDate = (log.date || '').includes(term);
      const matchEquip = (log.equipmentId || '').toLowerCase().includes(term);
      return matchOperator || matchShift || matchDate || matchEquip;
    }
    return true;
  });

  const totalAlertsCount = logs.filter((l) => l.hasAlerts).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* TOAST DE CONFIRMACIÓN */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[10000] bg-emerald-500 text-black px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-2xl">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Bitácoras de Operación
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">
            Registro técnico de rondas por turno y levantamiento de lecturas por formato.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="hidden sm:flex px-3.5 py-2 rounded-xl bg-[#091526] border border-[#162a4a] text-xs font-semibold text-slate-300 items-center gap-2 hover:border-slate-600 transition-colors cursor-pointer">
            <List className="w-4 h-4 text-[#00a8ff]" />
            <span>Historial</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-[#00a8ff] hover:bg-[#0096e6] text-[#050b14] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00a8ff]/20 transition-all cursor-pointer font-sans active:scale-95"
          >
            <Wand2 className="w-4 h-4" />
            <span>+ Nueva Ronda (Wizard)</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* BUSCADOR */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por equipo (CH-01), operador..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#070e1c] border border-[#172b48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00a8ff] transition-colors font-sans"
          />
        </div>

        {/* BOTONES DE FILTRO Y ACCIÓN */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => setFilterAlertsOnly(!filterAlertsOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              filterAlertsOnly
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/20'
                : 'bg-[#070e1c] border-amber-500/30 text-amber-400/90 hover:border-amber-500/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Solo Alertas</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-[#050b14] font-bold text-[10px] font-mono">
              {totalAlertsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#00a8ff] hover:bg-[#0096e6] text-[#050b14] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00a8ff]/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Bitácora</span>
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE BITÁCORAS (CON SCROLL HORIZONTAL RESPONSIVO) */}
      <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[700px]">
            <thead>
              <tr className="border-b border-[#142642] bg-[#091526]/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Fecha y Turno</th>
                <th className="py-3.5 px-4 font-semibold">Equipo</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold">ΔT Agua (°F)</th>
                <th className="py-3.5 px-4 font-semibold">ΔP Filtro (PSI)</th>
                <th className="py-3.5 px-4 font-semibold">Diagnóstico</th>
                <th className="py-3.5 px-4 font-semibold">Operador</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#13233a] text-slate-200">
              {filteredLogs.map((log) => {
                const deltaT = log.values?.delta_t_agua;
                const deltaP = log.values?.delta_p_filtro;
                const estado = log.values?.estado_equipo || 'ON';
                const isWarning = log.hasAlerts;

                return (
                  <tr key={log.id} className="hover:bg-[#0e1d35]/60 transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium">{log.date}</div>
                      <div className="text-slate-400 text-[11px]">
                        Turno {(log.shift || 'Mañana').charAt(0).toUpperCase() + (log.shift || 'Mañana').slice(1)}{' '}
                        {log.values?.hora ? `(${log.values.hora})` : ''}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-white font-bold font-mono">
                        {log.equipmentId === 'eq-ch-01' ? 'CH-01' : log.equipmentId === 'eq-ch-02' ? 'CH-02' : 'BC-01'}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[140px]">
                        {log.equipmentId === 'eq-ch-01'
                          ? 'York YK 350 TR'
                          : log.equipmentId === 'eq-ch-02'
                          ? 'Trane RTAC 400 TR'
                          : 'Bomba Primaria Agua Helada'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {estado === 'ON' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-mono font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          {estado}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {deltaT !== undefined ? (
                        <>
                          <div className={`font-bold text-sm ${Number(deltaT) < 8 || Number(deltaT) > 12 ? 'text-amber-400' : 'text-[#00a8ff]'}`}>
                            {deltaT}
                          </div>
                          <div className="text-slate-500 text-[10px]">°F</div>
                        </>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {deltaP !== undefined ? (
                        <>
                          <div className={`font-bold text-sm ${Number(deltaP) > 10 ? 'text-amber-400' : 'text-[#00a8ff]'}`}>
                            {deltaP}
                          </div>
                          <div className="text-slate-500 text-[10px]">PSI</div>
                        </>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isWarning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          {log.alerts?.[0]?.fieldLabel?.includes('Filtro') ? 'Alerta Filtro' : 'Revisión Req.'}
                        </span>
                      ) : estado === 'ON' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                          ✓ Normal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 text-[11px] font-medium">
                          Standby
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-mono">
                      {log.technicianName}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          title="Ver lectura completa"
                          onClick={() => alert(`Lecturas registradas (${log.equipmentId}):\n\n` + Object.entries(log.values || {}).map(([k, v]) => `${k}: ${v}`).join('\n'))}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#00a8ff] hover:bg-[#0c1e38] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Editar registro"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-[#0c1e38] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => handleDeleteEntry(log.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#0c1e38] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
