import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  ShieldCheck,
  Save,
  Thermometer,
  Gauge,
  Zap,
  Snowflake,
  ClipboardCheck,
} from 'lucide-react';
import type {
  InspectionTemplate,
  Equipment,
  LogEntry,
  Shift,
  TemplateField,
} from '../../types/domain';
import { SEED_TEMPLATE_F25, SEED_EQUIPMENTS } from '../../mocks/seedData';
import { evaluateLogValues } from '../../utils/logEvaluator';
import { useAuth } from '../../context/AuthContext';
import { useLogs } from '../../context/LogsContext';

interface DynamicLogWizardProps {
  onClose: () => void;
  onSave: (newEntry: LogEntry) => void;
  equipment?: Equipment;
  template?: InspectionTemplate;
  initialShift?: Shift;
}

export const DynamicLogWizard: React.FC<DynamicLogWizardProps> = ({
  onClose,
  onSave,
  equipment: initialEquipment,
  template = SEED_TEMPLATE_F25,
  initialShift,
}) => {
  const { user } = useAuth();
  const { equipments } = useLogs();
  const defaultEq = initialEquipment || equipments[0] || SEED_EQUIPMENTS[0];
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(defaultEq.id);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const stepCardRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef(true);

  const equipment =
    equipments.find((e) => e.id === selectedEquipmentId) || defaultEq;

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    stepCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStepIndex]);

  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().slice(0, 10);

    let defaultShift: Shift = initialShift || 'mañana';
    if (!initialShift) {
      const hour = now.getHours();
      if (hour >= 7 && hour < 15) defaultShift = 'mañana';
      else if (hour >= 15 && hour < 23) defaultShift = 'tarde';
      else defaultShift = 'noche';
    }

    return {
      fecha: currentDate,
      hora: currentTime,
      turno:
        defaultShift === 'mañana'
          ? 'Mañana'
          : defaultShift === 'tarde'
          ? 'Tarde'
          : 'Noche',
      estado_equipo: 'ON',
      setpoint_agua: '',
      ewt_temp: '',
      lwt_temp: '',
      temp_ambiente: '',
      carga_porcentaje: '',
      c1_pres_succion: '',
      c1_pres_descarga: '',
      c1_sobrecalent: '',
      c1_nivel_aceite: 'OK',
      c2_pres_succion: '',
      c2_pres_descarga: '',
      c2_sobrecalent: '',
      c2_nivel_aceite: 'OK',
      voltaje_prom: '',
      desbalance_voltaje: '',
      amperaje_total: '',
      pres_agua_entrada: '',
      pres_agua_salida: '',
      ventiladores_cond: '',
      alarmas_observaciones: '',
    };
  });

  const evaluation = useMemo(() => {
    return evaluateLogValues(formValues, template);
  }, [template, formValues]);

  const sections = template.sections;
  const totalSteps = sections.length;
  const safeIndex = Math.min(Math.max(currentStepIndex, 0), totalSteps - 1);
  const currentSection = sections[safeIndex];
  const isLastStep = safeIndex === totalSteps - 1;

  const handleInputChange = (fieldId: string, rawVal: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: rawVal,
    }));
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    const shiftRaw = String(formValues.turno || 'Mañana').toLowerCase();
    const shiftNormalized: Shift = shiftRaw.includes('tarde')
      ? 'tarde'
      : shiftRaw.includes('noche')
      ? 'noche'
      : 'mañana';

    const newEntry: LogEntry = {
      id: `log-${Date.now()}`,
      equipmentId: equipment.id,
      templateId: template.id,
      date: String(formValues.fecha || new Date().toISOString().slice(0, 10)),
      shift: shiftNormalized,
      technicianName: user?.name || 'Carlos Rivas',
      technicianId: user?.id || 'usr-op-01',
      values: evaluation.values,
      alerts: evaluation.alerts,
      hasAlerts: evaluation.hasAlerts,
      observations: String(formValues.alarmas_observaciones || ''),
      createdAt: new Date().toISOString(),
    };

    onSave(newEntry);
    onClose();
  };

  // Valores para los diales tipo Smart Home
  const hasDeltaT = evaluation.values.delta_t_agua !== undefined;
  const hasDeltaP = evaluation.values.delta_p_filtro !== undefined;
  const hasLoad =
    formValues.carga_porcentaje !== '' && formValues.carga_porcentaje !== undefined;

  const liveDeltaT = hasDeltaT ? Number(evaluation.values.delta_t_agua) : 0;
  const liveDeltaP = hasDeltaP ? Number(evaluation.values.delta_p_filtro) : 0;
  const liveLoad = hasLoad ? Number(formValues.carga_porcentaje) : 0;

  const deltaTNormalized = Math.min(1, Math.max(0, liveDeltaT / 16));
  const loadNormalized = Math.min(1, Math.max(0, liveLoad / 100));

  // Longitud del arco semicircular (radio = 52 -> circunferencia media = pi * 52 ≈ 163.36)
  const arcLength = 163.36;
  const deltaTDashOffset = arcLength * (1 - deltaTNormalized);
  const loadDashOffset = arcLength * (1 - loadNormalized);

  const isDeltaTAlert = hasDeltaT && (liveDeltaT < 8 || liveDeltaT > 12);

  const renderCalculatedWidget = (field: TemplateField, calcVal: any) => {
    const isDeltaT = field.id === 'delta_t_agua';
    const isDeltaP = field.id === 'delta_p_filtro';
    const hasValue = calcVal !== undefined && calcVal !== '';

    let formulaBreakdown = '';
    let statusBadgeText = 'Pendiente de lectura';
    let isAlert = false;

    if (isDeltaT) {
      const ewt = formValues.ewt_temp !== '' ? formValues.ewt_temp : '--';
      const lwt = formValues.lwt_temp !== '' ? formValues.lwt_temp : '--';
      formulaBreakdown = `Entrada ${ewt}°F − Salida ${lwt}°F`;
      if (hasValue) {
        const num = Number(calcVal);
        if (num < 8 || num > 12) {
          isAlert = true;
          statusBadgeText = 'Fuera de rango (8–12 °F)';
        } else {
          statusBadgeText = 'Salto óptimo (8–12 °F)';
        }
      }
    } else if (isDeltaP) {
      const pin = formValues.pres_agua_entrada !== '' ? formValues.pres_agua_entrada : '--';
      const pout = formValues.pres_agua_salida !== '' ? formValues.pres_agua_salida : '--';
      formulaBreakdown = `Entrada ${pin} PSI − Salida ${pout} PSI`;
      if (hasValue) {
        const num = Number(calcVal);
        if (num > 10) {
          isAlert = true;
          statusBadgeText = 'Limpiar filtro (> 10 PSI)';
        } else {
          statusBadgeText = 'Filtro limpio (≤ 10 PSI)';
        }
      }
    }

    return (
      <div
        style={{ padding: '1.25rem 1.5rem' }}
        className={`sm:col-span-2 rounded-3xl border transition-all ${
          isAlert
            ? 'bg-amber-50/70 border-amber-200'
            : 'bg-sky-50/60 border-sky-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {field.label}
              </span>
              <span
                style={{ padding: '0.15rem 0.5rem' }}
                className="rounded-full bg-white text-sky-600 text-[10px] font-bold shadow-2xs"
              >
                Cálculo Automático
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">{formulaBreakdown}</div>
          </div>

          <div className="flex items-center gap-4">
            <span
              style={{ padding: '0.3rem 0.75rem' }}
              className={`rounded-full text-xs font-semibold ${
                !hasValue
                  ? 'bg-white text-slate-400'
                  : isAlert
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {statusBadgeText}
            </span>

            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  !hasValue
                    ? 'text-slate-300'
                    : isAlert
                    ? 'text-amber-600'
                    : 'text-sky-600'
                }`}
              >
                {hasValue ? calcVal : '--'}
              </span>
              <span className="text-xs font-bold text-slate-400">{field.unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* CABECERA LIMPIA DE TOMA DE RONDA */}
      <div
        style={{ padding: '1.25rem 1.5rem' }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '0.6rem' }}
            className="rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Toma de Ronda · {equipment.tag}
              </h2>
              <span
                style={{ padding: '0.15rem 0.6rem' }}
                className="rounded-full bg-sky-50 text-sky-600 text-xs font-bold"
              >
                Formato {template.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {equipment.name} · {equipment.location}
            </p>
          </div>
        </div>

        {/* Selector táctil de equipo + botón guardar */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl flex-wrap">
            {equipments.map((eq) => (
              <button
                key={eq.id}
                type="button"
                onClick={() => setSelectedEquipmentId(eq.id)}
                style={{ padding: '0.35rem 0.7rem' }}
                className={`rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedEquipmentId === eq.id
                    ? 'bg-white text-sky-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {eq.tag}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleFinish}
            style={{ padding: '0.55rem 1rem' }}
            className="rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* PANEL DE DIALES TIPO SMART HOME (ARCO / GAUGE VISUAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* DIAL 1: DIFERENCIAL AGUA HELADA */}
        <div
          style={{ padding: '1.25rem 1.5rem' }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
        >
          <div className="space-y-1.5">
            <span
              style={{ padding: '0.2rem 0.6rem' }}
              className={`inline-block rounded-full text-[11px] font-bold ${
                !hasDeltaT
                  ? 'bg-slate-100 text-slate-500'
                  : isDeltaTAlert
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-sky-50 text-sky-600'
              }`}
            >
              {!hasDeltaT
                ? 'Pendiente de lectura'
                : isDeltaTAlert
                ? 'Revisar Salto'
                : 'Termodinámica OK'}
            </span>
            <div className="text-sm font-bold text-slate-900">
              Diferencial de Agua
            </div>
            <div className="text-xs text-slate-400">
              EWT {formValues.ewt_temp || '--'}°F → LWT {formValues.lwt_temp || '--'}°F
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Diseño óptimo: 8.0 – 12.0 °F
            </div>
          </div>

          {/* Arco SVG estilo Termostato Smart Home */}
          <div
            style={{ width: '8rem', height: '5rem' }}
            className="relative flex items-end justify-center shrink-0"
          >
            <svg
              width={128}
              height={80}
              className="overflow-visible"
              viewBox="0 0 120 70"
            >
              <path
                d="M 8 62 A 52 52 0 0 1 112 62"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {hasDeltaT && (
                <path
                  d="M 8 62 A 52 52 0 0 1 112 62"
                  fill="none"
                  stroke={isDeltaTAlert ? '#F59E0B' : '#0284C7'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={arcLength}
                  strokeDashoffset={deltaTDashOffset}
                />
              )}
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center whitespace-nowrap">
              <span
                className={`text-xl font-extrabold ${
                  hasDeltaT ? 'text-slate-900' : 'text-slate-300'
                }`}
              >
                {hasDeltaT ? liveDeltaT.toFixed(1) : '--'}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-0.5">°F</span>
            </div>
          </div>
        </div>

        {/* DIAL 2: % DE CARGA Y FILTRO */}
        <div
          style={{ padding: '1.25rem 1.5rem' }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
        >
          <div className="space-y-1.5">
            <span
              style={{ padding: '0.2rem 0.6rem' }}
              className={`inline-block rounded-full text-[11px] font-bold ${
                !hasDeltaP
                  ? 'bg-slate-100 text-slate-500'
                  : liveDeltaP > 10
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              Dif. Filtro: {hasDeltaP ? `${liveDeltaP.toFixed(1)} PSI` : '-- PSI'}
            </span>
            <div className="text-sm font-bold text-slate-900">
              Capacidad y Demanda
            </div>
            <div className="text-xs text-slate-400">
              Consumo: {formValues.amperaje_total || '--'} A · {formValues.voltaje_prom || '--'} V
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Ventiladores: {formValues.ventiladores_cond || '--'}
            </div>
          </div>

          {/* Arco SVG de % Carga */}
          <div
            style={{ width: '8rem', height: '5rem' }}
            className="relative flex items-end justify-center shrink-0"
          >
            <svg
              width={128}
              height={80}
              className="overflow-visible"
              viewBox="0 0 120 70"
            >
              <path
                d="M 8 62 A 52 52 0 0 1 112 62"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {hasLoad && (
                <path
                  d="M 8 62 A 52 52 0 0 1 112 62"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={arcLength}
                  strokeDashoffset={loadDashOffset}
                />
              )}
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center whitespace-nowrap">
              <span
                className={`text-xl font-extrabold ${
                  hasLoad ? 'text-slate-900' : 'text-slate-300'
                }`}
              >
                {hasLoad ? liveLoad : '--'}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-0.5">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* SELECTOR DE PASOS TÁCTIL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {sections.map((sec, idx) => {
          const isCurrent = idx === safeIndex;
          const isDone = idx < safeIndex;
          const shortTitle = sec.title.replace(/^\d+\.\s*/, '');

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              style={{ padding: '0.75rem 0.85rem' }}
              className={`rounded-2xl text-left transition-all cursor-pointer border ${
                isCurrent
                  ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20'
                  : isDone
                  ? 'bg-white text-slate-700 border-sky-100'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                <span>Paso {idx + 1}</span>
                {isDone && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      isCurrent ? 'text-white' : 'text-emerald-500'
                    }`}
                  />
                )}
              </div>
              <div className="text-xs font-semibold truncate mt-1">
                {shortTitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* TARJETA BLANCA PRINCIPAL DE CAMPOS DEL PASO */}
      <div
        ref={stepCardRef}
        style={{ padding: '1.75rem' }}
        className="scroll-mt-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              {safeIndex === 1 ? (
                <Thermometer className="w-5 h-5" />
              ) : safeIndex === 2 || safeIndex === 3 ? (
                <Gauge className="w-5 h-5" />
              ) : safeIndex === 4 ? (
                <Zap className="w-5 h-5" />
              ) : safeIndex === 5 ? (
                <ClipboardCheck className="w-5 h-5" />
              ) : (
                <Snowflake className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentSection.title}
              </h3>
              {currentSection.description && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentSection.description}
                </p>
              )}
            </div>
          </div>

          <span
            style={{ padding: '0.25rem 0.7rem' }}
            className="hidden sm:inline-block rounded-full bg-slate-100 text-slate-500 text-xs font-semibold"
          >
            {safeIndex + 1} de {totalSteps}
          </span>
        </div>

        {/* CUADRÍCULA DE CONTROLES TÁCTILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentSection.fields.map((field) => {
            const isCalculated = field.isCalculated;
            const currentValue = isCalculated
              ? evaluation.values[field.id]
              : formValues[field.id] ?? '';

            if (isCalculated) {
              return (
                <React.Fragment key={field.id}>
                  {renderCalculatedWidget(field, currentValue)}
                </React.Fragment>
              );
            }

            return (
              <div
                key={field.id}
                style={{ padding: '1.1rem 1.25rem' }}
                className="rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-sky-100 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    {field.label}
                  </label>
                  {field.unit && (
                    <span
                      style={{ padding: '0.15rem 0.5rem' }}
                      className="rounded-lg bg-white border border-slate-200/70 text-slate-500 text-[11px] font-bold"
                    >
                      {field.unit}
                    </span>
                  )}
                </div>

                {/* BOTONES GRANDES TÁCTILES PARA ESTADOS (OK, BAJO, CRÍTICO / ON, OFF / TURNOS) */}
                {field.type === 'select' && field.options ? (
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {field.options.map((opt) => {
                      const isSelected = String(currentValue) === opt;

                      let activeClasses =
                        'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-500/25';
                      if (opt === 'OK' || opt === 'ON') {
                        activeClasses =
                          'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/25';
                      } else if (opt === 'BAJO' || opt === 'MANTENIMIENTO') {
                        activeClasses =
                          'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25';
                      } else if (opt === 'CRÍTICO' || opt === 'OFF') {
                        activeClasses =
                          'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/25';
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange(field.id, opt)}
                          style={{ padding: '0.6rem 0.5rem' }}
                          className={`rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? activeClasses
                              : 'bg-white text-slate-600 border-slate-200/80 hover:border-sky-200'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    step={field.step || 'any'}
                    placeholder={field.placeholder}
                    value={currentValue}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    style={{ padding: '0.65rem 0.9rem' }}
                    className="w-full rounded-xl bg-white border border-slate-200/80 text-slate-900 text-sm font-semibold focus:outline-none focus:border-sky-500 transition-colors"
                  />
                )}

                {(field.minNormal !== undefined || field.maxNormal !== undefined) && (
                  <div className="text-[11px] font-medium text-slate-400">
                    Rango ideal: {field.minNormal} – {field.maxNormal} {field.unit}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AVISO AMIGABLE DE ALERTAS */}
        {evaluation.hasAlerts && (
          <div
            style={{ padding: '1rem 1.25rem' }}
            className="rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1.5"
          >
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Atención en parámetros del equipo:</span>
            </div>
            <ul className="space-y-1 text-xs text-amber-700/90 pl-6 list-disc">
              {evaluation.alerts.map((alert, i) => (
                <li key={i}>{alert.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* NAVEGACIÓN INFERIOR LIMPIA */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIndex === 0}
            style={{ padding: '0.65rem 1.1rem' }}
            className={`rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              safeIndex === 0
                ? 'opacity-40 border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Anterior</span>
          </button>

          <div className="text-xs font-semibold text-slate-400 whitespace-nowrap shrink-0 text-center">
            <span className="sm:hidden">
              {safeIndex + 1} / {totalSteps}
            </span>
            <span className="hidden sm:inline">
              Paso {safeIndex + 1} de {totalSteps}
            </span>
          </div>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinish}
              style={{ padding: '0.65rem 1.15rem' }}
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-md shadow-emerald-500/25 transition-all cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Confirmar y Guardar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              style={{ padding: '0.65rem 1.15rem' }}
              className="rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-md shadow-sky-500/25 transition-all cursor-pointer shrink-0"
            >
              <span className="whitespace-nowrap">Siguiente</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
