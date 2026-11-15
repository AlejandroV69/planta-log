import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  KeyRound,
  Mail,
  ArrowRight,
  Building2,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { RegisterPage } from './RegisterPage';

export const LoginPage: React.FC = () => {
  const { signIn, companies } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isRegistering, setIsRegistering] = useState(false);
  const [companyId, setCompanyId] = useState(
    () => localStorage.getItem('plantalog_selected_company') || ''
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isRegistering) {
    return <RegisterPage onBackToLogin={() => setIsRegistering(false)} />;
  }

  const selectedCompanyId = companies.some((c) => c.id === companyId)
    ? companyId
    : companies[0]?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedCompanyId) {
      setError('Selecciona una compañía.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setSubmitting(true);
    try {
      localStorage.setItem('plantalog_selected_company', selectedCompanyId);
      await signIn(email, password, selectedCompanyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between font-sans p-4 sm:p-6 relative">
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
        style={{ padding: '0.6rem' }}
        className="fixed top-4 right-4 z-30 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      <div className="max-w-[380px] w-full mx-auto my-auto">
        <div
          style={{ padding: '2.25rem 2rem' }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6"
        >
          {/* CABECERA LIMPIA E INTEGRADA */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto mb-3">
              <Droplets className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              PlantaLog
            </h1>
            <p className="text-xs text-slate-400">
              Ingresa tus credenciales operativas para continuar
            </p>
          </div>

          {/* FORMULARIO DIRECTO */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* SELECTOR DE COMPAÑÍA */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold block">
                Compañía
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  style={{ padding: '0.75rem 2.25rem 0.75rem 2.4rem' }}
                  className="w-full appearance-none bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors cursor-pointer"
                >
                  {companies.length === 0 && <option value="">Cargando empresas...</option>}
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* CORREO */}
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
                  autoComplete="email"
                  style={{ padding: '0.75rem 0.9rem 0.75rem 2.4rem' }}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  placeholder="correo@planta.com"
                />
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold block">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ padding: '0.75rem 0.9rem 0.75rem 2.4rem' }}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div
                style={{ padding: '0.65rem 0.9rem' }}
                className="rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium text-center"
              >
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '0.85rem 1.25rem' }}
                className="w-full rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                <span>{submitting ? 'Entrando...' : 'Entrar'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* ENLACE A VENTANA DE REGISTRO */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className="text-sky-600 hover:text-sky-700 font-bold cursor-pointer"
            >
              Regístrate aquí
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
