import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Lock, KeyRound, ChevronDown, IdCard, Fingerprint, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Shift, UserRoles } from '../types/domain';

export const LoginPage: React.FC = () => {
  const { loginAsDemo } = useAuth();
  const [selectedShift, setSelectedShift] = useState<Shift>('mañana');
  const [operatorId, setOperatorId] = useState('OP-7492');
  const [pin, setPin] = useState('••••••••');
  const [rememberDevice, setRememberDevice] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsDemo('operator');
  };

  const handleFastDemoLogin = (role: UserRoles) => {
    loginAsDemo(role);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#00a8ff] selection:text-black">
      {/* HEADER SUPERIOR SCADA */}
      <header className="border-b border-[#122035] bg-[#071120]/80 backdrop-blur px-6 py-3.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0c223f] border border-[#00a8ff]/40 flex items-center justify-center text-[#00a8ff]">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold tracking-wider text-sm">PlantaLog</span>
            <span className="text-[#64748b] text-[11px] uppercase tracking-wider font-semibold">
              CUARTOS DE MÁQUINAS & REFRIGERACIÓN
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-emerald-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Servidor SCADA / Planta Central: En línea (Latencia 4ms)</span>
        </div>
      </header>

      {/* CONTENEDOR CENTRAL */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-[480px] bg-[#0b1628] border border-[#172a45] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {/* ICONO Y TÍTULO */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#0e2341] border border-[#00a8ff]/30 flex items-center justify-center text-[#00a8ff] shadow-lg shadow-[#00a8ff]/10">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Acceso de Operador
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ingrese sus credenciales de técnico o clave de turno para registrar rondas de equipos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* PLANTA / SUBESTACIÓN */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Planta / Subestación</label>
              <div className="relative">
                <div className="w-full px-3.5 py-2.5 rounded-lg bg-[#070e1c] border border-[#192f50] text-slate-200 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400">🏢</span>
                    <span className="truncate">Planta Central — Edificio Corporativo & Chillers</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* TURNO A RECIBIR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium">Turno a Recibir</label>
                <span className="text-[#00a8ff] font-mono text-[11px]">🕒 Hora: 14:48 hrs</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* T-1 MAÑANA */}
                <button
                  type="button"
                  onClick={() => setSelectedShift('mañana')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedShift === 'mañana'
                      ? 'border-[#00a8ff] bg-[#0c2445] text-white shadow-sm shadow-[#00a8ff]/20'
                      : 'border-[#192f50] bg-[#070e1c] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`font-semibold ${selectedShift === 'mañana' ? 'text-[#00a8ff]' : ''}`}>
                    T-1 Mañana
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">07:00-15:00</div>
                </button>

                {/* T-2 TARDE */}
                <button
                  type="button"
                  onClick={() => setSelectedShift('tarde')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedShift === 'tarde'
                      ? 'border-[#00a8ff] bg-[#0c2445] text-white shadow-sm shadow-[#00a8ff]/20'
                      : 'border-[#192f50] bg-[#070e1c] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`font-semibold ${selectedShift === 'tarde' ? 'text-[#00a8ff]' : ''}`}>
                    T-2 Tarde
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">15:00-23:00</div>
                </button>

                {/* T-3 NOCHE */}
                <button
                  type="button"
                  onClick={() => setSelectedShift('noche')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedShift === 'noche'
                      ? 'border-[#00a8ff] bg-[#0c2445] text-white shadow-sm shadow-[#00a8ff]/20'
                      : 'border-[#192f50] bg-[#070e1c] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`font-semibold ${selectedShift === 'noche' ? 'text-[#00a8ff]' : ''}`}>
                    T-3 Noche
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">23:00-07:00</div>
                </button>
              </div>
            </div>

            {/* ID DE OPERADOR O CORREO */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">ID de Operador o Correo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IdCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#070e1c] border border-[#192f50] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00a8ff] transition-colors"
                  placeholder="OP-7492"
                />
              </div>
            </div>

            {/* CONTRASEÑA / PIN INDUSTRIAL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium">Contraseña / PIN Industrial</label>
                <button type="button" className="text-[#00a8ff] hover:underline text-[11px]">
                  ¿Olvidó su PIN?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#070e1c] border border-[#192f50] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00a8ff] transition-colors"
                />
              </div>
            </div>

            {/* RECORDAR DISPOSITIVO */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#070e1c] border-[#192f50] text-[#00a8ff] focus:ring-0 accent-[#00a8ff]"
                />
                <span>Recordar en esta tablet de cuarto</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">Tablet Rugged #04</span>
            </div>

            {/* BOTÓN PRIMARIO DE INICIO */}
            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-lg bg-[#00a8ff] hover:bg-[#0096e6] active:scale-[0.99] text-[#050b14] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00a8ff]/25 transition-all cursor-pointer font-sans"
            >
              <ArrowRight className="w-4 h-4 text-[#050b14]" />
              <span>Iniciar Sesión de Turno</span>
            </button>
          </form>

          {/* DIVISOR DE MÉTODOS */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#172a45] w-full" />
            <span className="bg-[#0b1628] px-3 text-[10px] uppercase font-mono tracking-wider text-slate-500 absolute">
              O Autenticar Con
            </span>
          </div>

          {/* BOTONES BIOMÉTRICOS / GAFETE */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleFastDemoLogin('operator')}
              className="p-2.5 rounded-lg border border-[#192f50] bg-[#070e1c] hover:bg-[#0c1a32] text-slate-300 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <IdCard className="w-4 h-4 text-[#00a8ff]" />
              <span>Escanear Gafete</span>
            </button>
            <button
              type="button"
              onClick={() => handleFastDemoLogin('supervisor')}
              className="p-2.5 rounded-lg border border-[#192f50] bg-[#070e1c] hover:bg-[#0c1a32] text-slate-300 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-[#00a8ff]" />
              <span>Lector Biométrico</span>
            </button>
          </div>

          {/* ADVERTENCIA DE SEGURIDAD INDUSTRIAL */}
          <div className="p-3 rounded-lg bg-[#070e1c] border border-amber-500/20 flex items-start gap-2.5 text-[11px] text-amber-300/80 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Uso restringido a personal técnico certificado en refrigeración y operación de maquinaria pesada.
            </span>
          </div>
        </div>
      </main>

      {/* FOOTER SCADA */}
      <footer className="border-t border-[#122035] bg-[#071120]/60 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2">
        <div>PlantaLog v3.4.2-Industrial • Base de Datos Operativa Conectada</div>
        <div className="flex items-center gap-4">
          <span>Soporte Cuarto de Control: Ext. 4021</span>
          <button
            onClick={() => handleFastDemoLogin('operator')}
            className="text-[#00a8ff] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Modo Demo Directo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
