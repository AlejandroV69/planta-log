import React, { useState } from 'react';
import { useAuth, COMPANIES } from '../context/AuthContext';
import {
  Droplets,
  User,
  Mail,
  IdCard,
  Building2,
  KeyRound,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { UserRoles } from '../types/domain';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToLogin }) => {
  const { registerUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [companyId, setCompanyId] = useState(COMPANIES[0].id);
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [role, setRole] = useState<UserRoles>('operator');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!badgeNumber.trim() && !email.trim()) {
      setError('Ingresa tu usuario/ID de operador o correo.');
      return;
    }
    if (!pin.trim()) {
      setError('Define un PIN de acceso.');
      return;
    }

    const selectedCompany = COMPANIES.find((c) => c.id === companyId);
    const finalCompanyName =
      companyId === 'otra'
        ? customCompanyName.trim() || 'Empresa Industrial'
        : selectedCompany?.name || COMPANIES[0].name;

    registerUser({
      name,
      email: email || `${badgeNumber.toLowerCase()}@planta.com`,
      badgeNumber: badgeNumber || 'OP-1001',
      companyId: companyId === 'otra' ? `comp-${Date.now()}` : companyId,
      companyName: finalCompanyName,
      roles: role,
      pin,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between font-sans p-4 sm:p-6">
      <div className="max-w-[420px] w-full mx-auto my-auto">
        <div
          style={{ padding: '2.25rem 2rem' }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6"
        >
          {/* CABECERA */}
          <div className="text-center space-y-2 relative">
            <button
              type="button"
              onClick={onBackToLogin}
              style={{ padding: '0.5rem' }}
              className="absolute left-0 top-0 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              title="Volver al login"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto mb-3">
              <Droplets className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Crear Cuenta
            </h1>
            <p className="text-xs text-slate-400">
              Registra tus datos de operador y la empresa a la que perteneces
            </p>
          </div>

          {error && (
            <div
              style={{ padding: '0.65rem 0.9rem' }}
              className="rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium text-center"
            >
              {error}
            </div>
          )}

          {/* FORMULARIO DE REGISTRO */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* NOMBRE COMPLETO */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold block">
                Nombre y Apellido
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  style={{ padding: '0.75rem 0.9rem 0.75rem 2.4rem' }}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </div>

            {/* COMPAÑÍA / EMPRESA */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold block">
                Compañía
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  style={{ padding: '0.75rem 2.25rem 0.75rem 2.4rem' }}
                  className="w-full appearance-none bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors cursor-pointer"
                >
                  {COMPANIES.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                  <option value="otra">+ Otra empresa...</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* CAMPO ADICIONAL SI ELIGE "OTRA EMPRESA" */}
            {companyId === 'otra' && (
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">
                  Nombre de tu Empresa
                </label>
                <input
                  type="text"
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  style={{ padding: '0.75rem 0.9rem' }}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  placeholder="Escribe el nombre de la empresa..."
                />
              </div>
            )}

            {/* USUARIO / ID Y CORREO (2 COLUMNAS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => {
                      setBadgeNumber(e.target.value);
                      setError(null);
                    }}
                    style={{ padding: '0.75rem 0.75rem 0.75rem 2.3rem' }}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                    placeholder="OP-4820"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">
                  Correo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ padding: '0.75rem 0.75rem 0.75rem 2.3rem' }}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                    placeholder="correo@planta.com"
                  />
                </div>
              </div>
            </div>

            {/* CARGO / ROL */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold block">
                Cargo en Planta
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('operator')}
                  style={{ padding: '0.65rem 0.75rem' }}
                  className={`rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    role === 'operator'
                      ? 'bg-sky-50 text-sky-600 border-sky-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200/70 hover:bg-slate-100'
                  }`}
                >
                  Operador Técnico
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supervisor')}
                  style={{ padding: '0.65rem 0.75rem' }}
                  className={`rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    role === 'supervisor'
                      ? 'bg-sky-50 text-sky-600 border-sky-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200/70 hover:bg-slate-100'
                  }`}
                >
                  Supervisor
                </button>
              </div>
            </div>

            {/* PIN DE ACCESO */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold block">
                PIN de Acceso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  style={{ padding: '0.75rem 0.9rem 0.75rem 2.4rem' }}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  placeholder="Crea tu PIN de 4 a 8 dígitos"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                style={{ padding: '0.85rem 1.25rem' }}
                className="w-full rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                <span>Registrarme</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* ENLACE PARA VOLVER AL LOGIN */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sky-600 hover:text-sky-700 font-bold cursor-pointer"
            >
              Inicia sesión
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 py-3">
        PlantaLog · Control Operativo F-25
      </footer>
    </div>
  );
};
