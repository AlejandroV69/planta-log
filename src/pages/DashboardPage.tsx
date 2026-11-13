import React from 'react';
import { Calendar, ShieldAlert, Thermometer, Activity, Download, AlertTriangle, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Resumen y Tendencias Operativas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoreo técnico de chiller, cuartos de compresores y variables termodinámicas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#091526] border border-[#162a4a] text-xs font-mono text-slate-400 flex items-center gap-2">
            <span className="text-[#00a8ff]">⚡</span>
            <span>Última sincronización: 14:18 hrs</span>
          </div>

          <button
            onClick={() => alert('Generando reporte mensual oficial F-25 en Excel...')}
            className="px-4 py-2 rounded-xl bg-[#00a8ff] hover:bg-[#0096e6] text-[#050b14] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#00a8ff]/20 transition-all cursor-pointer font-sans"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Reporte Mensual</span>
          </button>
        </div>
      </div>

      {/* FILA DE 4 TARJETAS KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: RONDAS */}
        <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              RONDAS REGISTRADAS
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0e2445] text-[#00a8ff] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">142</span>
            <span className="text-xs text-slate-400 font-mono">/ 150 rondas</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
            <span>✓</span>
            <span>94.6% cumplimiento de turno</span>
          </div>
        </div>

        {/* KPI 2: DISPONIBILIDAD */}
        <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              DISPONIBILIDAD DEL EQUIPO
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            98.4%
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Máquinas en estado ON</span>
          </div>
        </div>

        {/* KPI 3: ALERTAS ACTIVAS */}
        <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
              ALERTAS ACTIVAS
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">2</span>
            <span className="text-xs text-slate-400">en revisión técnica</span>
          </div>
          <div className="text-[11px] font-mono text-amber-400/90 truncate pt-1">
            ΔP Filtro fuera de rango
          </div>
        </div>

        {/* KPI 4: PROMEDIO DELTA T */}
        <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              PROMEDIO ΔT AGUA
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0e2445] text-[#00a8ff] flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#00a8ff] font-mono">
            10.2 <span className="text-sm font-normal text-slate-300">°F</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 pt-1">
            Rango óptimo: 9.5 - 11.0 °F
          </div>
        </div>
      </div>

      {/* GRÁFICOS DE TELEMETRÍA (2 COLUMNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* GRÁFICO 1: TEMPERATURAS EWT VS LWT */}
        <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#00a8ff]">📈</span>
                <h3 className="font-bold text-sm text-white">
                  Temperaturas EWT vs LWT por Turno
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Agua Helada: Entrada (EWT) vs Salida Evaporador (LWT)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#00a8ff]/20 text-[#00a8ff] border border-[#00a8ff]/40 text-xs font-mono font-bold">
                CH-01
              </span>
              <span className="px-2 py-0.5 rounded bg-[#091526] text-slate-300 border border-[#162a4a] text-xs font-mono">
                Últimos 7 días
              </span>
            </div>
          </div>

          {/* LEYENDA TÉCNICA */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 border-t border-[#142642]">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-0.5 bg-[#38bdf8]" />
              <span>EWT Entrada (Prom: 54.4°F)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-0.5 bg-[#10b981]" />
              <span>LWT Salida (Prom: 44.2°F)</span>
            </div>
            <div className="text-[#00a8ff] font-bold">
              ΔT Prom = 10.2°F
            </div>
          </div>

          {/* SVG CHART SIMULADO CON ONDAS SUAVES */}
          <div className="h-48 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              {/* LÍNEAS DE GUÍA */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#142642" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#142642" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#142642" strokeDasharray="3 3" />

              <text x="0" y="25" fill="#64748b" fontSize="10" fontFamily="monospace">60°F</text>
              <text x="0" y="75" fill="#64748b" fontSize="10" fontFamily="monospace">52°F</text>
              <text x="0" y="125" fill="#64748b" fontSize="10" fontFamily="monospace">44°F</text>

              {/* ÁREA Y CURVA EWT (ENTRADA ~54°F) */}
              <path
                d="M 30,58 Q 110,50 180,55 T 320,52 T 480,56"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <circle cx="280" cy="52" r="4" fill="#38bdf8" stroke="#050b14" strokeWidth="2" />
              <text x="280" y="42" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">54.6°</text>

              {/* ÁREA Y CURVA LWT (SALIDA ~44°F) */}
              <path
                d="M 30,122 Q 110,126 180,120 T 320,124 T 480,121"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              <circle cx="280" cy="124" r="4" fill="#10b981" stroke="#050b14" strokeWidth="2" />
              <text x="280" y="142" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="middle">44.1°</text>
            </svg>

            {/* EJE X */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 px-2">
              <span>Lun T-1</span>
              <span>Lun T-2</span>
              <span>Mar T-1</span>
              <span>Mar T-2</span>
              <span>Mié T-1</span>
              <span>Mié T-2</span>
              <span>Hoy T-1</span>
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: % DE CARGA Y AMPERAJE */}
        <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#00a8ff]">⚡</span>
                <h3 className="font-bold text-sm text-white">
                  % de Carga y Amperaje Total
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Demanda eléctrica de compresores vs Capacidad de diseño
              </p>
            </div>

            <span className="px-2.5 py-0.5 rounded bg-[#091526] text-[#00a8ff] border border-[#162a4a] text-xs font-mono font-bold">
              FLA: 410A
            </span>
          </div>

          {/* LEYENDA TÉCNICA */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 border-t border-[#142642]">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-0.5 bg-[#f59e0b]" />
              <span>% Carga (Prom: 78.5%)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-0.5 bg-[#38bdf8]" />
              <span>Amperaje (Prom: 322 A)</span>
            </div>
            <div className="text-emerald-400 font-bold">
              Factor Potencia: 0.92
            </div>
          </div>

          {/* SVG CHART SIMULADO CON PICOS DE DEMANDA */}
          <div className="h-48 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              <line x1="0" y1="30" x2="500" y2="30" stroke="#142642" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#142642" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#142642" strokeDasharray="3 3" />

              <text x="0" y="25" fill="#64748b" fontSize="10" fontFamily="monospace">100%</text>
              <text x="0" y="75" fill="#64748b" fontSize="10" fontFamily="monospace">75%</text>
              <text x="0" y="125" fill="#64748b" fontSize="10" fontFamily="monospace">50%</text>

              {/* CURVA % CARGA (AMARILLO/NARANJA) */}
              <path
                d="M 30,90 Q 70,60 110,65 T 190,85 T 270,70 T 350,68 T 420,48 T 480,55"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
              <circle cx="420" cy="48" r="4" fill="#f59e0b" stroke="#050b14" strokeWidth="2" />
              <text x="420" y="38" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="middle">84% / 344A</text>

              {/* CURVA AMPERAJE (CIAN) */}
              <path
                d="M 30,96 Q 70,70 110,72 T 190,92 T 270,78 T 350,75 T 420,56 T 480,62"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            </svg>

            {/* EJE X */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 px-2">
              <span>Lun T-1</span>
              <span>Lun T-2</span>
              <span>Mar T-1</span>
              <span>Mar T-2</span>
              <span>Mié T-1</span>
              <span>Mié T-2</span>
              <span>Hoy T-1</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA: ÚLTIMAS NOVEDADES Y ALERTAS TÉCNICAS */}
      <div className="bg-[#0b172a] border border-[#152a48] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                Últimas Novedades y Alertas Técnicas
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Eventos detectados por algoritmos automáticos de tolerancia en bitácoras
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 rounded-lg bg-[#070e1c] border border-[#172b48] text-xs text-slate-300 flex items-center gap-1.5 hover:border-slate-600 transition-colors cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Solo No Resueltas</span>
            </button>

            <button
              onClick={() => navigate('/bitacoras')}
              className="text-xs font-semibold text-[#00a8ff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Todas en Bitácoras</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TABLA SCADA DE ALERTAS */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#142642] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Fecha y Turno</th>
                <th className="pb-3 font-semibold">Equipo</th>
                <th className="pb-3 font-semibold">Variable Afectada</th>
                <th className="pb-3 font-semibold">Lectura vs Límite</th>
                <th className="pb-3 font-semibold">Diagnóstico / Condición</th>
                <th className="pb-3 font-semibold">Operador</th>
                <th className="pb-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#13233a] text-slate-200">
              {/* FILA 1 */}
              <tr className="hover:bg-[#0e1d35]/50 transition-colors">
                <td className="py-3.5 font-mono text-slate-300">
                  12 Nov 2026 <span className="text-[#00a8ff]">T-1</span>
                </td>
                <td className="py-3.5 font-semibold text-white">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2" />
                  CH-01 (York 350 TR)
                </td>
                <td className="py-3.5 text-slate-300 font-mono">
                  ΔP Filtro Aceite
                </td>
                <td className="py-3.5 font-mono">
                  <span className="text-amber-400 font-bold">18.5 PSI</span>{' '}
                  <span className="text-slate-500 text-[10px]">{'(>15.0 max)'}</span>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-medium">
                    ⚠️ Limpieza requerida
                  </span>
                </td>
                <td className="py-3.5 text-slate-400 font-mono">C. Rivas</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate('/bitacoras')}
                    className="text-[#00a8ff] hover:underline font-semibold font-mono text-xs cursor-pointer"
                  >
                    Ver Bitácora
                  </button>
                </td>
              </tr>

              {/* FILA 2 */}
              <tr className="hover:bg-[#0e1d35]/50 transition-colors">
                <td className="py-3.5 font-mono text-slate-300">
                  11 Nov 2026 <span className="text-[#00a8ff]">T-2</span>
                </td>
                <td className="py-3.5 font-semibold text-white">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2" />
                  CH-02 (Trane 400 TR)
                </td>
                <td className="py-3.5 text-slate-300 font-mono">
                  ΔT Agua Helada
                </td>
                <td className="py-3.5 font-mono">
                  <span className="text-amber-400 font-bold">7.8 °F</span>{' '}
                  <span className="text-slate-500 text-[10px]">{'<9.0 min'}</span>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-medium">
                    ⚠️ Caudal excesivo / Bajo salto
                  </span>
                </td>
                <td className="py-3.5 text-slate-400 font-mono">M. Soto</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate('/bitacoras')}
                    className="text-[#00a8ff] hover:underline font-semibold font-mono text-xs cursor-pointer"
                  >
                    Ver Bitácora
                  </button>
                </td>
              </tr>

              {/* FILA 3 */}
              <tr className="hover:bg-[#0e1d35]/50 transition-colors">
                <td className="py-3.5 font-mono text-slate-300">
                  10 Nov 2026 <span className="text-[#00a8ff]">T-3</span>
                </td>
                <td className="py-3.5 font-semibold text-white">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                  BC-03 (Bomba Primaria)
                </td>
                <td className="py-3.5 text-slate-300 font-mono">
                  Amperaje Motor L1
                </td>
                <td className="py-3.5 font-mono">
                  <span className="text-emerald-400 font-bold">42.1 A</span>{' '}
                  <span className="text-slate-500 text-[10px]">(45.0 FLA)</span>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                    ✓ Normalizado
                  </span>
                </td>
                <td className="py-3.5 text-slate-400 font-mono">E. Valdés</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate('/bitacoras')}
                    className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
                  >
                    Detalle
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

