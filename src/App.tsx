import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogsProvider } from './context/LogsContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { EquipmentsPage } from './pages/EquipmentsPage';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm text-slate-400">
        Cargando PlantaLog...
      </div>
    );
  }

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
          <Route path="*" element={<Navigate to="/resumen" replace />} />
        </Routes>
      </AppLayout>
    </LogsProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
