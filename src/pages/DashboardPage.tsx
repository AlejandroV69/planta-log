import React, { useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Thermometer,
  Gauge,
  Plus,
  Snowflake,
  Waves,
  ChevronRight,
  Download,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogs } from '../context/LogsContext';
import type { Shift } from '../types/domain';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logs, equipments, exportExcel } = useLogs();
  const [selectedShift, setSelectedShift] = useState<Shift>('mañana');

  // Métricas en vivo para la Hero Card flotante
  const activeLogs = logs.filter((l) => l.values?.estado_equipo === 'ON');

  const avgDeltaT =
    activeLogs.length > 0
      ? (
          activeLogs.reduce((acc, l) => acc + Number(l.values?.delta_t_agua || 0), 0) /
          activeLogs.length
        ).toFixed(1)
      : '9.6';

  const maxDeltaP =
    activeLogs.length > 0
      ? Math.max(...activeLogs.map((l) => Number(l.values?.delta_p_filtro || 0))).toFixed(1)
      : '18.5';

  const equipmentsOnCount = equipments.filter((eq) => {
    const latest = logs.find((l) => l.equipmentId === eq.id);
    return (latest?.values?.estado_equipo ?? 'ON') === 'ON';
  }).length;

  const activeAlertsCount = logs.filter((l) => l.hasAlerts).length;

  const shifts: {
    id: Shift;
    label: string;
    hours: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'mañana', label: 'Mañana', hours: '07:00 – 15:00', icon: Sun },
    { id: 'tarde', label: 'Tarde', hours: '15:00 – 23:00', icon: Sunset },
    { id: 'noche', label: 'Noche', hours: '23:00 – 07:00', icon: Moon },
  ];

  const shiftLogs = logs.filter((l) => l.shift === selectedShift);

  return (
    <div className="space-y-8">
      {/* 1. CABECERA CON TARJETA RESUMEN FLOTANTE (HERO CARD) */}
      <div className="relative">
        {/* Bloque superior con degradado suave en azul industrial */}
        <div
          style={{ padding: '2rem 1.75rem 4.25rem 1.75rem' }}
          className="rounded-3xl bg-gradient-to-br from-sky-600 via-sky-600 to-blue-700 text-white shadow-md shadow-sky-600/15"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sky-100 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{user?.companyName || 'Planta Central'} · Formato Oficial F-25</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Hola, {user?.name || 'Carlos Rivas'}
              </h1>
              <p className="text-sky-100/90 text-xs sm:text-sm">
                Turno {selectedShift.charAt(0).toUpperCase() + selectedShift.slice(1)} activo · Cuarto de Chillers en operación
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={exportExcel}
                style={{ padding: '0.6rem 1rem' }}
                className="rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Reporte F-25</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/bitacoras?nueva=1&turno=${selectedShift}`)}
                style={{ padding: '0.6rem 1.1rem' }}
                className="rounded-2xl bg-white hover:bg-sky-50 text-sky-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tomar Ronda</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta blanca flotante superpuesta (2x2 en móvil, 4 cols en PC) */}
        <div
          style={{ padding: '1.25rem 1.5rem' }}
          className="relative z-10 -mt-10 mx-3 sm:mx-6 bg-white rounded-3xl shadow-lg shadow-slate-200/70 border border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {avgDeltaT} <span className="text-base font-semibold text-slate-400">°F</span>
            </div>
            <div className="text-xs font-medium text-slate-400">Temp. Promedio</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {maxDeltaP}{' '}
              <span className="text-base font-semibold text-slate-400">PSI</span>
            </div>
            <div className="text-xs font-medium text-slate-400">Presión Máx</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {equipmentsOnCount}{' '}
              <span className="text-lg font-semibold text-slate-300">/</span>{' '}
              {equipments.length}
            </div>
            <div className="text-xs font-medium text-slate-400">Equipos ON</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                  activeAlertsCount > 0 ? 'text-amber-500' : 'text-slate-900'
                }`}
              >
                {activeAlertsCount}
              </span>
              {activeAlertsCount > 0 && (
                <span
                  style={{ padding: '0.15rem 0.5rem' }}
                  className="rounded-full bg-amber-50 text-amber-600 text-[11px] font-semibold"
                >
                  Revisión
                </span>
              )}
            </div>
            <div className="text-xs font-medium text-slate-400">Alertas</div>
          </div>
        </div>
      </div>

      {/* 2. SELECTOR DE TURNOS ("Turnos / Rondas") */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900">Turnos / Rondas</h2>
          <span className="text-xs font-medium text-slate-400">
            {shiftLogs.length}{' '}
            {shiftLogs.length === 1 ? 'lectura en turno' : 'lecturas en turno'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
          {shifts.map((shift) => {
            const Icon = shift.icon;
            const isSelected = selectedShift === shift.id;

            return (
              <button
                key={shift.id}
                type="button"
                onClick={() => setSelectedShift(shift.id)}
                style={{ padding: '1.25rem 1rem' }}
                className={`rounded-3xl flex flex-col items-center justify-center gap-2.5 text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-[1.01]'
                    : 'bg-white text-slate-700 border border-slate-100 shadow-xs hover:border-sky-100 hover:bg-sky-50/30'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">{shift.label}</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      isSelected ? 'text-sky-100' : 'text-slate-400'
                    }`}
                  >
                    {shift.hours}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. TARJETAS DE EQUIPOS ("Áreas y Máquinas") */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900">Áreas y Máquinas</h2>
          <button
            type="button"
            onClick={() => navigate('/equipos')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equipments.map((eq) => {
            const latestLog = logs.find((l) => l.equipmentId === eq.id);
            const v = latestLog?.values || {};
            const isOnline = (v.estado_equipo ?? 'OFF') === 'ON';
            const hasAlert = latestLog?.hasAlerts ?? false;
            const isPump = eq.tag.startsWith('BC');

            return (
              <div
                key={eq.id}
                onClick={() => navigate(`/bitacoras?nueva=1&equipo=${eq.id}`)}
                style={{ padding: '1.25rem' }}
                className="rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-100 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Icono cuadrado con fondo suave a la izquierda */}
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      {isPump ? (
                        <Waves className="w-6 h-6" />
                      ) : (
                        <Snowflake className="w-6 h-6" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {eq.tag} · {eq.name.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {eq.name}
                      </div>
                    </div>
                  </div>

                  {/* Pill discreto de estado o alerta */}
                  {hasAlert ? (
                    <span
                      style={{ padding: '0.2rem 0.55rem' }}
                      className="rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 text-[11px] font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Alerta
                    </span>
                  ) : isOnline ? (
                    <span
                      style={{ padding: '0.2rem 0.55rem' }}
                      className="rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      ON
                    </span>
                  ) : (
                    <span
                      style={{ padding: '0.2rem 0.55rem' }}
                      className="rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium shrink-0"
                    >
                      Standby
                    </span>
                  )}
                </div>

                {/* 2 indicadores compactos con mini-iconos (Temperatura EWT/LWT y Presión Filtro) */}
                <div
                  style={{ padding: '0.75rem 0.9rem' }}
                  className="rounded-xl bg-slate-50/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 text-slate-600">
                    <Thermometer className="w-4 h-4 text-sky-500 shrink-0" />
                    {isOnline && v.ewt_temp !== undefined ? (
                      <span>
                        <strong className="text-slate-900 font-semibold">
                          {v.ewt_temp}° / {v.lwt_temp}°F
                        </strong>{' '}
                        <span className="text-slate-400 text-[11px]">
                          (Dif. {v.delta_t_agua}°)
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Sin flujo térmico</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Gauge
                      className={`w-4 h-4 shrink-0 ${
                        Number(v.delta_p_filtro) > 10
                          ? 'text-amber-500'
                          : 'text-sky-500'
                      }`}
                    />
                    {isOnline && v.delta_p_filtro !== undefined ? (
                      <strong
                        className={`font-semibold ${
                          Number(v.delta_p_filtro) > 10
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {v.delta_p_filtro} PSI
                      </strong>
                    ) : (
                      <span className="text-slate-400">-- PSI</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. RESUMEN DE RONDAS DEL TURNO SELECCIONADO */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900">
            Rondas Registradas — Turno{' '}
            {selectedShift.charAt(0).toUpperCase() + selectedShift.slice(1)}
          </h2>
          <button
            type="button"
            onClick={() => navigate('/bitacoras')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Historial completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {(shiftLogs.length > 0 ? shiftLogs : logs.slice(0, 2)).map((log) => {
            const eq = equipments.find((e) => e.id === log.equipmentId);
            const v = log.values || {};

            return (
              <div
                key={log.id}
                onClick={() => navigate('/bitacoras')}
                style={{ padding: '1.1rem 1.25rem' }}
                className="rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {eq?.tag || log.equipmentId}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-medium text-slate-500">
                      {log.date} ({v.hora || '--'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {log.observations || 'Lectura operativa dentro de parámetros.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {v.delta_t_agua !== undefined && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-sky-600">
                        {v.delta_t_agua} °F
                      </div>
                      <div className="text-[10px] text-slate-400">Dif. Agua</div>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
