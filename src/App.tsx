import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/resumen" replace />} />
        <Route path="/resumen" element={<DashboardPage />} />
        <Route path="/bitacoras" element={<LogsPage />} />
        <Route
          path="/equipos"
          element={
            <div className="p-8 border border-[#162a4a] bg-[#0b172a] rounded-2xl text-slate-400 font-mono text-xs">
              [EQUIPOS] MÓDULO DE ACTIVOS Y FICHAS TÉCNICAS (CH-01, CH-02, BOMBAS, TORRES)
            </div>
          }
        />
        <Route
          path="/plantillas"
          element={
            <div className="p-8 border border-[#162a4a] bg-[#0b172a] rounded-2xl text-slate-400 font-mono text-xs">
              [PLANTILLAS] MOTOR DE FORMATOS DINÁMICOS (F-25 YORK 350 TR)
            </div>
          }
        />
      </Routes>
    </AppLayout>
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
