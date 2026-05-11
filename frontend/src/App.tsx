import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { HomePage } from './pages/HomePage/HomePage';
import { SubmissionsPage } from './pages/SubmissionsPage/SubmissionsPage';
import { ProvidersPage } from './pages/ProvidersPage/ProvidersPage';
import { ProductsPage } from './pages/ProductsPage/ProductsPage';
import { ProductEditPage } from './pages/ProductEditPage/ProductEditPage';
import { UsersPage } from './pages/UsersPage/UsersPage';
import { JobsPage } from './pages/JobsPage/JobsPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'submissions' | 'providers' | 'products' | 'product-edit' | 'users' | 'jobs' | 'profile'>('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const role = user?.role;
      if (hash === '#users' && role !== 'administrator') {
        window.location.hash = '#';
        setCurrentPage('home');
        return;
      }
      if (hash === '#jobs' && role !== 'administrator') {
        window.location.hash = '#';
        setCurrentPage('home');
        return;
      }
      if (hash === '#providers' && role === 'operator') {
        window.location.hash = '#';
        setCurrentPage('home');
        return;
      }
      if (hash === '#submissions') setCurrentPage('submissions');
      else if (hash === '#providers') setCurrentPage('providers');
      else if (hash === '#products') setCurrentPage('products');
      else if (hash.startsWith('#products/edit/')) setCurrentPage('product-edit');
      else if (hash === '#users') setCurrentPage('users');
      else if (hash === '#jobs') setCurrentPage('jobs');
      else if (hash === '#profile') setCurrentPage('profile');
      else if (hash.startsWith('#edit/')) setCurrentPage('home');
      else setCurrentPage('home');
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user?.role]);

  if (loading) {
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'submissions' && <SubmissionsPage />}
      {currentPage === 'providers' && <ProvidersPage />}
      {currentPage === 'products' && <ProductsPage />}
      {currentPage === 'product-edit' && <ProductEditPage />}
      {currentPage === 'users' && <UsersPage />}
      {currentPage === 'jobs' && <JobsPage />}
      {currentPage === 'profile' && <ProfilePage />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
