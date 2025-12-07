import { useState, useEffect } from 'react';

function App() {
  const [page, setPage] = useState('landing');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans antialiased">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Equipment Management System</h1>
          <p className="text-text-secondary">React + TypeScript + Tailwind CSS</p>
          <p className="text-text-tertiary mt-2">Current page: {page || 'landing'}</p>
        </div>
      </div>
    </div>
  );
}

export default App;

