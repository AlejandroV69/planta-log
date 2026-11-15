import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Cpu,
  Plus,
  LogOut,
  Droplets,
  Download,
  Moon,
  Sun,
  User,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLogs } from '../../context/LogsContext';
import { useTheme } from '../../context/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { logs, exportExcel } = useLogs();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  const roleLabel =
    user?.roles === 'admin'
      ? 'Administrador'
      : user?.roles === 'supervisor'
      ? 'Supervisor'
      : 'Operador Técnico';

  const activeAlertsCount = logs.filter((l) => l.hasAlerts).length;

  const navItems = [
    {
      to: '/resumen',
      label: 'Inicio',
      icon: Home,
    },
    {
      to: '/bitacoras',
      label: 'Bitácoras',
      icon: ClipboardList,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
    },
    {
      to: '/equipos',
      label: 'Máquinas',
      icon: Cpu,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* NAVEGACIÓN LATERAL MINIMALISTA EN BLANCO (ESCRITORIO) */}
      <aside
        style={{ padding: '1.5rem 1.25rem' }}
        className="w-64 shrink-0 bg-white border-r border-slate-100 hidden md:flex flex-col justify-between min-h-screen sticky top-0 select-none"
      >
        <div className="space-y-7">
          {/* LOGO ESTILO SMART APP + MODO NOCHE */}
          <div
            style={{ padding: '0.25rem 0.5rem' }}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-slate-900 font-bold tracking-tight text-base leading-tight">
                PlantaLog
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
              style={{ padding: '0.5rem' }}
              className="rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-sky-600 transition-colors cursor-pointer shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* BOTÓN TÁCTIL PRINCIPAL */}
          <div>
            <button
              type="button"
              onClick={() => navigate('/bitacoras?nueva=1')}
              style={{ padding: '0.8rem 1rem' }}
              className="w-full rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nueva Ronda</span>
            </button>
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{ padding: '0.75rem 1rem' }}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-50 text-sky-600 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? 'text-sky-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          style={{ padding: '0.15rem 0.55rem' }}
                          className="rounded-full bg-amber-100 text-amber-700 text-xs font-semibold"
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* EXPORTACIÓN RÁPIDA EXCEL */}
          <div
            style={{ padding: '1rem' }}
            className="rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5"
          >
            <div className="text-xs font-semibold text-slate-700">
              Reporte Oficial Excel
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Descarga las lecturas del turno en la plantilla oficial F-25.
            </p>
            <button
              type="button"
              onClick={exportExcel}
              style={{ padding: '0.55rem 0.85rem' }}
              className="w-full rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Exportar F-25 (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* PERFIL DEL OPERADOR */}
        <div
          style={{ padding: '0.75rem' }}
          className="rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
              {(user?.name || 'Carlos Rivas')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-slate-900 text-xs font-semibold truncate">
                {user?.name || 'Carlos Rivas'}
              </div>
              <div className="text-slate-400 text-[11px] truncate">
                {user?.companyName ? user.companyName.split('—')[0].trim() : user?.badgeNumber || 'OP-402'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            style={{ padding: '0.45rem' }}
            className="text-slate-400 hover:text-rose-500 rounded-xl hover:bg-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* CONTENEDOR ESTILO APP (CENTRADO CON AIRE EN ESCRITORIO) */}
      <div className="flex-1 flex flex-col min-w-0">
        <main
          style={{ padding: '1.25rem 1rem 6rem 1rem' }}
          className="flex-1 w-full max-w-5xl mx-auto sm:px-6 md:py-8 md:pb-12"
        >
          {children}
        </main>
      </div>

      {/* HOJA DE PERFIL MÓVIL (MODO NOCHE, REPORTE Y CERRAR SESIÓN) */}
      {isMobileProfileOpen && (
        <div
          onClick={() => setIsMobileProfileOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center p-3 md:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '1.5rem' }}
            className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {(user?.name || 'Carlos Rivas')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-slate-900 font-bold text-sm truncate">
                    {user?.name || 'Carlos Rivas'}
                  </div>
                  <div className="text-xs text-sky-600 font-semibold">
                    {roleLabel}
                    {user?.badgeNumber ? ` · ${user.badgeNumber}` : ''}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileProfileOpen(false)}
                style={{ padding: '0.45rem' }}
                className="rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {user?.companyName && (
              <div
                style={{ padding: '0.75rem 1rem' }}
                className="rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600"
              >
                <Building2 className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="font-medium truncate">{user.companyName}</span>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Switch Modo Noche / Día */}
              <button
                type="button"
                onClick={toggleTheme}
                style={{ padding: '0.85rem 1rem' }}
                className="w-full rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-sky-500" />
                  )}
                  <span>{theme === 'dark' ? 'Cambiar a Modo Día' : 'Activar Modo Noche'}</span>
                </span>
                <span
                  style={{ padding: '0.2rem 0.6rem' }}
                  className={`rounded-full text-[11px] font-bold ${
                    theme === 'dark'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {theme === 'dark' ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Exportar Excel F-25 */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  void exportExcel();
                }}
                style={{ padding: '0.85rem 1rem' }}
                className="w-full rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>Exportar Reporte F-25 (.xlsx)</span>
              </button>

              {/* Cerrar Sesión */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  void logout();
                }}
                style={{ padding: '0.85rem 1rem' }}
                className="w-full rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-100 flex items-center justify-center gap-2 text-xs font-bold text-rose-600 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR ESTILO APP MÓVIL */}
      <nav
        style={{ padding: '0.6rem 1rem' }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around md:hidden shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{ padding: '0.35rem 0.75rem' }}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
                  isActive ? 'text-sky-600 font-semibold' : 'text-slate-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setIsMobileProfileOpen(true)}
          style={{ padding: '0.35rem 0.75rem' }}
          className={`flex flex-col items-center gap-1 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
            isMobileProfileOpen ? 'text-sky-600 font-semibold' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  );
};
