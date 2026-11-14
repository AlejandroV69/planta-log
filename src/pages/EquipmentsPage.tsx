import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Snowflake,
  Waves,
  Wind,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  MapPin,
  Cpu,
} from 'lucide-react';
import { useLogs } from '../context/LogsContext';
import type { Equipment } from '../types/domain';

type EquipmentStatus = Equipment['status'];

interface EquipmentFormState {
  tag: string;
  name: string;
  model: string;
  serialNumber: string;
  capacity: string;
  refrigerant: string;
  location: string;
  status: EquipmentStatus;
}

const EMPTY_FORM: EquipmentFormState = {
  tag: '',
  name: '',
  model: '',
  serialNumber: '',
  capacity: '',
  refrigerant: 'R-134a',
  location: '',
  status: 'operational',
};

const QUICK_TYPES = [
  {
    id: 'chiller',
    label: 'Chiller',
    prefix: 'CH-0',
    defaultRef: 'R-134a / R-410A',
    defaultCap: '350 TR',
    icon: Snowflake,
  },
  {
    id: 'bomba',
    label: 'Bomba Agua',
    prefix: 'BC-0',
    defaultRef: 'Agua Helada',
    defaultCap: '75 HP',
    icon: Waves,
  },
  {
    id: 'torre',
    label: 'Torre Enfr.',
    prefix: 'TE-0',
    defaultRef: 'Agua Condensación',
    defaultCap: '400 TR',
    icon: Wind,
  },
  {
    id: 'uma',
    label: 'UMA / Manejadora',
    prefix: 'UMA-0',
    defaultRef: 'Agua Helada',
    defaultCap: '25 TR',
    icon: Cpu,
  },
];

export const EquipmentsPage: React.FC = () => {
  const { equipments, logs, addEquipment, updateEquipment, deleteEquipment } = useLogs();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EquipmentStatus>('all');

  // Estado del modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EquipmentFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // Confirmación de eliminación
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      if (statusFilter !== 'all' && eq.status !== statusFilter) return false;
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchTag = eq.tag.toLowerCase().includes(q);
        const matchName = eq.name.toLowerCase().includes(q);
        const matchModel = eq.model.toLowerCase().includes(q);
        const matchLoc = eq.location.toLowerCase().includes(q);
        if (!matchTag && !matchName && !matchModel && !matchLoc) return false;
      }
      return true;
    });
  }, [equipments, statusFilter, searchTerm]);

  const handleOpenCreate = () => {
    const nextNumber = equipments.length + 1;
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      tag: `CH-0${nextNumber}`,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    setFormData({
      tag: eq.tag,
      name: eq.name,
      model: eq.model,
      serialNumber: eq.serialNumber || '',
      capacity: eq.capacity || '',
      refrigerant: eq.refrigerant || 'Agua Helada',
      location: eq.location,
      status: eq.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleQuickTypeSelect = (preset: (typeof QUICK_TYPES)[number]) => {
    const nextNum = equipments.length + 1;
    setFormData((prev) => ({
      ...prev,
      tag: editingId ? prev.tag : `${preset.prefix}${nextNum}`,
      refrigerant: preset.defaultRef,
      capacity: prev.capacity || preset.defaultCap,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.tag.trim()) {
      setFormError('Ingresa el código o Tag del equipo (ej. CH-03).');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Ingresa el nombre o descripción del equipo.');
      return;
    }
    if (!formData.model.trim()) {
      setFormError('Ingresa el modelo del equipo.');
      return;
    }
    if (!formData.location.trim()) {
      setFormError('Ingresa el área o ubicación en planta.');
      return;
    }

    const duplicateTag = equipments.some(
      (eq) =>
        eq.id !== editingId &&
        eq.tag.trim().toLowerCase() === formData.tag.trim().toLowerCase()
    );
    if (duplicateTag) {
      setFormError(`Ya existe un equipo registrado con el Tag "${formData.tag.toUpperCase()}".`);
      return;
    }

    if (editingId) {
      updateEquipment(editingId, {
        tag: formData.tag,
        name: formData.name,
        model: formData.model,
        serialNumber: formData.serialNumber,
        capacity: formData.capacity,
        refrigerant: formData.refrigerant,
        location: formData.location,
        status: formData.status,
      });
    } else {
      addEquipment({
        tag: formData.tag,
        name: formData.name,
        model: formData.model,
        serialNumber: formData.serialNumber,
        capacity: formData.capacity,
        refrigerant: formData.refrigerant,
        location: formData.location,
        status: formData.status,
      });
    }

    setIsModalOpen(false);
  };

  const getEquipmentIcon = (tag: string) => {
    const upper = tag.toUpperCase();
    if (upper.startsWith('BC') || upper.startsWith('BP')) return Waves;
    if (upper.startsWith('TE') || upper.startsWith('CT')) return Wind;
    if (upper.startsWith('UMA') || upper.startsWith('AHU')) return Cpu;
    return Snowflake;
  };

  const getStatusBadge = (status: EquipmentStatus) => {
    if (status === 'operational') {
      return {
        label: 'En Línea',
        className: 'bg-emerald-50 text-emerald-600',
      };
    }
    if (status === 'maintenance') {
      return {
        label: 'Standby',
        className: 'bg-slate-100 text-slate-600',
      };
    }
    return {
      label: 'Fuera de Servicio',
      className: 'bg-red-50 text-red-600',
    };
  };

  return (
    <div className="space-y-6 pb-8">
      {/* CABECERA PRINCIPAL + BOTÓN NUEVO EQUIPO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Áreas y Máquinas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Registra, edita o administra los equipos de planta y toma rondas operativas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          style={{ padding: '0.7rem 1.2rem' }}
          className="rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Equipo</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTRO DE ESTADO */}
      <div
        style={{ padding: '1rem 1.25rem' }}
        className="bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Tag (CH-01), nombre, modelo o ubicación..."
            style={{ padding: '0.6rem 0.9rem 0.6rem 2.3rem' }}
            className="w-full rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'all', label: `Todos (${equipments.length})` },
              {
                id: 'operational',
                label: `En Línea (${equipments.filter((e) => e.status === 'operational').length})`,
              },
              {
                id: 'maintenance',
                label: `Standby (${equipments.filter((e) => e.status === 'maintenance').length})`,
              },
              {
                id: 'out_of_service',
                label: `Fuera Serv. (${equipments.filter((e) => e.status === 'out_of_service').length})`,
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              style={{ padding: '0.45rem 0.85rem' }}
              className={`rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE TARJETAS DE EQUIPOS */}
      {filteredEquipments.length === 0 ? (
        <div
          style={{ padding: '3rem 1.5rem' }}
          className="bg-white rounded-3xl border border-slate-100 text-center space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto">
            <Snowflake className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-800">
            No se encontraron equipos con ese filtro
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Puedes limpiar la búsqueda o registrar una nueva máquina en la planta.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{ padding: '0.6rem 1.1rem' }}
            className="rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Equipo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipments.map((eq) => {
            const eqLogs = logs.filter((l) => l.equipmentId === eq.id);
            const IconComponent = getEquipmentIcon(eq.tag);
            const badge = getStatusBadge(eq.status);
            const isConfirmingDelete = deletingId === eq.id;

            return (
              <div
                key={eq.id}
                style={{ padding: '1.5rem' }}
                className="rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Fila superior: Icono + Estado + Botones Editar/Eliminar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ padding: '0.2rem 0.65rem' }}
                        className={`rounded-full text-[11px] font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(eq)}
                        style={{ padding: '0.4rem' }}
                        className="rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                        title="Editar equipo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeletingId(isConfirmingDelete ? null : eq.id)
                        }
                        style={{ padding: '0.4rem' }}
                        className={`rounded-xl transition-colors cursor-pointer ${
                          isConfirmingDelete
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500'
                        }`}
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Confirmación rápida si presionó eliminar */}
                  {isConfirmingDelete && (
                    <div
                      style={{ padding: '0.65rem 0.85rem' }}
                      className="rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-semibold text-red-700">
                        ¿Eliminar {eq.tag}?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            deleteEquipment(eq.id);
                            setDeletingId(null);
                          }}
                          style={{ padding: '0.25rem 0.6rem' }}
                          className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Sí, borrar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          style={{ padding: '0.25rem 0.5rem' }}
                          className="rounded-lg bg-white text-slate-600 font-semibold text-[11px] cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nombre y ubicación */}
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {eq.tag} · {eq.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                      <span className="truncate">{eq.location}</span>
                    </div>
                  </div>

                  {/* Ficha técnica compacta */}
                  <div
                    style={{ padding: '0.9rem 1rem' }}
                    className="rounded-2xl bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Modelo</span>
                      <span className="font-semibold text-slate-700 text-right">
                        {eq.model}
                      </span>
                    </div>
                    {eq.serialNumber && (
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">N° Serie</span>
                        <span className="font-semibold text-slate-700 text-right">
                          {eq.serialNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Capacidad</span>
                      <span className="font-semibold text-slate-700 text-right">
                        {eq.capacity || '--'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Refrigerante / Fluido</span>
                      <span className="font-semibold text-slate-700 text-right">
                        {eq.refrigerant || 'Agua Helada'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Rondas registradas</span>
                      <span className="font-bold text-sky-600">{eqLogs.length}</span>
                    </div>
                  </div>
                </div>

                {/* Botón inferior de acción */}
                <button
                  type="button"
                  onClick={() => navigate(`/bitacoras?nueva=1&equipo=${eq.id}`)}
                  style={{ padding: '0.7rem 1rem' }}
                  className="w-full rounded-2xl bg-sky-50 hover:bg-sky-500 text-sky-600 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Tomar Ronda</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PARA CREAR O EDITAR EQUIPO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            style={{ padding: '1.75rem' }}
            className="w-full max-w-lg rounded-3xl bg-white border border-slate-100 shadow-2xl space-y-5 my-8"
          >
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Completa los datos técnicos de la máquina para habilitar sus rondas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '0.45rem' }}
                className="rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plantillas rápidas de tipo de equipo */}
            {!editingId && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tipo de máquina (Autocompletar)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_TYPES.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleQuickTypeSelect(preset)}
                        style={{ padding: '0.55rem 0.65rem' }}
                        className="rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-sky-50 hover:border-sky-200 text-slate-600 hover:text-sky-600 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div
                  style={{ padding: '0.7rem 0.9rem' }}
                  className="rounded-2xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600"
                >
                  {formError}
                </div>
              )}

              {/* Fila 1: Tag y Capacidad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tag / Código *
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({ ...formData, tag: e.target.value.toUpperCase() })
                    }
                    placeholder="Ej: CH-03"
                    style={{ padding: '0.65rem 0.85rem' }}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Chiller Carrier AquaForce 300 TR"
                    style={{ padding: '0.65rem 0.85rem' }}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Fila 2: Modelo y Serie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    placeholder="Ej: 30XA-302"
                    style={{ padding: '0.65rem 0.85rem' }}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Número de Serie (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    placeholder="Ej: SN-2025-9941"
                    style={{ padding: '0.65rem 0.85rem' }}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Fila 3: Capacidad y Refrigerante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Capacidad Nominal
                  </label>
                  <input
                    type="text"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="Ej: 350 TR o 75 HP"
                    style={{ padding: '0.65rem 0.85rem' }}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Refrigerante / Fluido
                  </label>
                  <input
                    type="text"
                    value={formData.refrigerant}
                    onChange={(e) =>
                      setFormData({ ...formData, refrigerant: e.target.value })
                    }
                    placeholder="Ej: R-134a, R-410A, Agua Helada"
                    style={{ padding: '0.65rem 0.85rem' }}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Fila 4: Ubicación */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ubicación / Área en Planta *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Ej: Cuarto de Máquinas / Azotea Central"
                  style={{ padding: '0.65rem 0.85rem' }}
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {/* Fila 5: Estado Operativo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estado Operativo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'operational', label: 'En Línea' },
                      { id: 'maintenance', label: 'Standby' },
                      { id: 'out_of_service', label: 'Fuera Serv.' },
                    ] as const
                  ).map((st) => {
                    const active = formData.status === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: st.id })}
                        style={{ padding: '0.6rem 0.5rem' }}
                        className={`rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                          active
                            ? st.id === 'operational'
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                              : st.id === 'maintenance'
                              ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                              : 'bg-red-500 text-white border-red-500 shadow-xs'
                            : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.65rem 1.1rem' }}
                  className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.3rem' }}
                  className="rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Guardar Cambios' : 'Registrar Equipo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
