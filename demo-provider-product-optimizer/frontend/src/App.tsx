import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage/HomePage';
import { SubmissionsPage } from './pages/SubmissionsPage/SubmissionsPage';
import { ProvidersPage } from './pages/ProvidersPage/ProvidersPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'submissions' | 'providers'>('home');

  useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#submissions') {
        setCurrentPage('submissions');
      } else if (hash === '#providers') {
        setCurrentPage('providers');
      } else if (hash.startsWith('#edit/')) {
        setCurrentPage('home');
      } else {
        setCurrentPage('home');
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <Layout>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'submissions' && <SubmissionsPage />}
      {currentPage === 'providers' && <ProvidersPage />}
    </Layout>
  );
}

export default App;
