import React, { useState } from 'react';
import { useAuth, COMPANIES } from '../context/AuthContext';
import {
  Droplets,
  KeyRound,
  IdCard,
  ArrowRight,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { RegisterPage } from './RegisterPage';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [companyId, setCompanyId] = useState(COMPANIES[0].id);
  const [operatorId, setOperatorId] = useState('OP-7492');
  const [pin, setPin] = useState('••••••••');

  if (isRegistering) {
    return <RegisterPage onBackToLogin={() => setIsRegistering(false)} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('plantalog_selected_company', companyId);
    loginWithCredentials(operatorId, pin, companyId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between font-sans p-4 sm:p-6">
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
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* USUARIO */}
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
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  style={{ padding: '0.75rem 0.9rem 0.75rem 2.4rem' }}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  placeholder="OP-7492"
                />
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
                  onChange={(e) => setPin(e.target.value)}
                  style={{ padding: '0.75rem 0.9rem 0.75rem 2.4rem' }}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold text-xs focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                style={{ padding: '0.85rem 1.25rem' }}
                className="w-full rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                <span>Entrar</span>
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
