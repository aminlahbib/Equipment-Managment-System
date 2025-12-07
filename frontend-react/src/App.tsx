import { useState, useEffect, lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { lazy, Suspense } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Activity } from './pages/Activity';

// Lazy load admin dashboard for code splitting
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

function AppContent() {
  const [page, setPage] = useState('landing');
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setPage(hash);
      } else {
        setPage('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  // Public pages
  if (page === 'landing' || page === 'login' || page === 'register' || page === 'forgot-password') {
    if (page === 'landing') {
      return <Landing onLogin={() => setPage('login')} />;
    }
    if (page === 'login') {
      return <Login onNavigate={(p) => setPage(p)} />;
    }
    if (page === 'register') {
      return <Register onNavigate={(p) => setPage(p)} />;
    }
    if (page === 'forgot-password') {
      return <ForgotPassword onNavigate={(p) => setPage(p)} />;
    }
  }

  // Protected pages - require authentication
  if (!isAuthenticated) {
    setPage('login');
    return <Login onNavigate={(p) => setPage(p)} />;
  }

  // Authenticated pages with navbar
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans antialiased selection:bg-primary/20 selection:text-text-primary transition-colors duration-300">
      <Navbar currentPage={page} onNavigate={(p) => setPage(p)} />
      <main className="pt-20">
        {page === 'dashboard' && <Dashboard />}
        {page === 'equipment' && (
          <div className="p-6">
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-text-secondary mt-2">Equipment inventory coming soon...</p>
          </div>
        )}
        {page === 'loans' && <Activity />}
        {page === 'admin' && (
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading admin dashboard...</p>
              </div>
            </div>
          }>
            <AdminDashboard />
          </Suspense>
        )}
        {!['dashboard', 'equipment', 'loans', 'admin'].includes(page) && (
          <div className="p-6">
            <h1 className="text-3xl font-bold">Page Not Found</h1>
            <p className="text-text-secondary mt-2">The page you're looking for doesn't exist.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

