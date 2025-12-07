import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { Inventory } from './components/Inventory';
import { Activity } from './components/Activity';

export default function App() {
  // Simple hash-based routing state
  const [page, setPage] = useState('landing');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme from local storage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };
  
  // Handle initial hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setPage(hash);
    };

    handleHashChange(); // Check on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (newPage: string) => {
    window.location.hash = newPage;
    setPage(newPage);
  };

  // Styles for global animations
  const globalStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.5s ease-out forwards;
      opacity: 0; /* Start hidden */
    }
    .animate-fade-in-down {
      animation: fadeInDown 0.3s ease-out forwards;
    }
  `;

  return (
    <>
      <style>{globalStyles}</style>
      <div className="min-h-screen bg-background text-text-primary font-sans antialiased selection:bg-primary/20 selection:text-text-primary transition-colors duration-300">
        {page === 'landing' ? (
          <Landing onLogin={() => handleNavigate('dashboard')} />
        ) : (
          <div className="min-h-screen flex flex-col">
            <Navbar 
              currentPage={page} 
              onNavigate={handleNavigate} 
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
            <main className="flex-1 w-full animate-fade-in">
               {page === 'dashboard' && <Dashboard />}
               {page === 'equipment' && <Inventory />}
               {page === 'loans' && <Activity />}
            </main>
          </div>
        )}
      </div>
    </>
  );
}