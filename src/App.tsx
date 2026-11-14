import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogsProvider, useLogs } from './context/LogsContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { EquipmentsPage } from './pages/EquipmentsPage';
import { LoginPage } from './pages/LoginPage';
import { Sliders } from 'lucide-react';

function TemplatesView() {
  const { template } = useLogs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Formato {template.code} — {template.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Parámetros de control, rangos ideales y cálculos automáticos de la plantilla.
          </p>
        </div>
        <span
          style={{ padding: '0.35rem 0.85rem' }}
          className="rounded-full bg-sky-50 text-sky-600 text-xs font-bold self-start sm:self-auto"
        >
          Versión {template.version}.0 · 6 pasos
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {template.sections.map((sec) => (
          <div
            key={sec.id}
            style={{ padding: '1.5rem' }}
            className="rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {sec.fields.length} variables
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {sec.fields.map((f) => (
                <div
                  key={f.id}
                  style={{ padding: '0.55rem 0' }}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-slate-700 font-medium">
                    {f.label}
                    {f.isCalculated && (
                      <span
                        style={{ padding: '0.1rem 0.45rem' }}
                        className="ml-2 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold"
                      >
                        Auto
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400 font-semibold">
                    {f.minNormal !== undefined || f.maxNormal !== undefined
                      ? `${f.minNormal ?? 0} – ${f.maxNormal ?? '∞'} ${f.unit || ''}`
                      : f.unit || f.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <LogsProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/resumen" replace />} />
          <Route path="/resumen" element={<DashboardPage />} />
          <Route path="/bitacoras" element={<LogsPage />} />
          <Route path="/equipos" element={<EquipmentsPage />} />
          <Route path="/plantillas" element={<TemplatesView />} />
        </Routes>
      </AppLayout>
    </LogsProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
