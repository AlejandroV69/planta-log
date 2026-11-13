import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Cpu, FileSpreadsheet, Bot, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex font-sans selection:bg-[#00a8ff] selection:text-black">
      {/* SIDEBAR FIJO IZQUIERDO (SCADA INDUSTRIAL SUITE) */}
      <aside className="w-64 shrink-0 bg-[#070e1c] border-r border-[#13233a] flex flex-col justify-between hidden md:flex min-h-screen p-4 sticky top-0">
        <div className="space-y-5">
          {/* LOGO EMPRESARIAL */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-9 h-9 rounded-xl bg-[#0c223f] border border-[#00a8ff]/40 flex items-center justify-center text-[#00a8ff] shadow-sm shadow-[#00a8ff]/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold tracking-tight text-base leading-tight">
                PlantaLog
              </div>
              <div className="text-[#00a8ff] text-[10px] font-mono tracking-widest uppercase font-semibold">
                INDUSTRIAL SUITE
              </div>
            </div>
          </div>

          {/* TARJETA TURNO ACTIVO */}
          <div className="p-3 rounded-xl bg-[#0b162a] border border-[#172b48] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Turno Activo:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                T-1 Mañana
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              🕒 07:00 - 15:00 hrs
            </div>
          </div>

          {/* NAVEGACIÓN PRINCIPAL */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {/* RESUMEN */}
            <NavLink
              to="/resumen"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00a8ff] text-[#050b14] font-bold shadow-lg shadow-[#00a8ff]/25'
                    : 'text-slate-400 hover:text-white hover:bg-[#0c1a30]'
                }`
              }
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Resumen</span>
            </NavLink>

            {/* BITÁCORAS CON BADGE */}
            <NavLink
              to="/bitacoras"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00a8ff] text-[#050b14] font-bold shadow-lg shadow-[#00a8ff]/25'
                    : 'text-slate-400 hover:text-white hover:bg-[#0c1a30]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4" />
                <span>Bitácoras</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold">
                2
              </span>
            </NavLink>

            {/* EQUIPOS */}
            <NavLink
              to="/equipos"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00a8ff] text-[#050b14] font-bold shadow-lg shadow-[#00a8ff]/25'
                    : 'text-slate-400 hover:text-white hover:bg-[#0c1a30]'
                }`
              }
            >
              <Cpu className="w-4 h-4" />
              <span>Equipos</span>
            </NavLink>

            {/* PLANTILLAS */}
            <NavLink
              to="/plantillas"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00a8ff] text-[#050b14] font-bold shadow-lg shadow-[#00a8ff]/25'
                    : 'text-slate-400 hover:text-white hover:bg-[#0c1a30]'
                }`
              }
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Plantillas</span>
            </NavLink>
          </nav>
        </div>

        {/* USUARIO FOOTER DEL SIDEBAR */}
        <div className="p-3 rounded-xl bg-[#0b162a] border border-[#172b48] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0e274a] border border-[#00a8ff]/40 text-[#00a8ff] font-bold text-xs flex items-center justify-center shrink-0">
              CR
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate leading-tight">
                {user?.name || 'Carlos Rivas'}
              </div>
              <div className="text-slate-400 text-[10px] truncate leading-tight mt-0.5 font-mono">
                Técnico Chiller Lead
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#12233f] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER MÓVIL (para pantallas pequeñas) */}
        <header className="md:hidden bg-[#070e1c] border-b border-[#13233a] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0c223f] border border-[#00a8ff]/40 flex items-center justify-center text-[#00a8ff]">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">PlantaLog</span>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* BOTTOM NAV MÓVIL */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070e1c]/95 backdrop-blur-xl border-t border-[#13233a] py-2 px-6 flex justify-around md:hidden text-[10px] font-semibold">
        <NavLink
          to="/resumen"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${
              isActive ? 'text-[#00a8ff]' : 'text-slate-400'
            }`
          }
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Resumen</span>
        </NavLink>
        <NavLink
          to="/bitacoras"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${
              isActive ? 'text-[#00a8ff]' : 'text-slate-400'
            }`
          }
        >
          <ClipboardList className="w-4 h-4" />
          <span>Bitácoras</span>
        </NavLink>
        <NavLink
          to="/equipos"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${
              isActive ? 'text-[#00a8ff]' : 'text-slate-400'
            }`
          }
        >
          <Cpu className="w-4 h-4" />
          <span>Equipos</span>
        </NavLink>
        <NavLink
          to="/plantillas"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${
              isActive ? 'text-[#00a8ff]' : 'text-slate-400'
            }`
          }
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Plantillas</span>
        </NavLink>
      </nav>
    </div>
  );
};
