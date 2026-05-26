import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api'; // Добави този импорт
import type { UserRole } from '../../domain/entities/User/User';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

// ... canAccess функцията си остава същата ...
function canAccess(role: UserRole, menu: 'home' | 'submissions' | 'providers' | 'products' | 'users' | 'jobs' | 'profile'): boolean {
  if (menu === 'profile') return true;
  switch (role) {
    case 'administrator': return true;
    case 'manager': return menu !== 'users' && menu !== 'jobs';
    case 'operator': return menu === 'home' || menu === 'submissions' || menu === 'products';
    default: return false;
  }
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const role = user?.role ?? 'operator';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ФУНКЦИЯ ЗА РЕГЕНЕРИРАНЕ НА ТОКЕН
  const handleRegenerateToken = async () => {
  try {
    const newToken = await apiService.refreshToken();
    
    // ПРЕЗАПИСВАМЕ ТОКЕНА В STORAGE
    localStorage.setItem('product_optimizer_token', newToken);
    
    alert('Your session has been refreshed with a new token!');
    setDropdownOpen(false);
  } catch (err) {
    alert('Could not refresh token. Please login again.');
  }
};

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const isActive = (hash: string) => {
    const currentHash = window.location.hash;
    if (hash === '#') return currentHash === '' || currentHash === '#' || currentHash.startsWith('#edit/');
    if (hash === '#products') return currentHash === '#products' || currentHash.startsWith('#products/edit/');
    return currentHash === hash;
  };

  const nav = (hash: string, label: string, menu: 'home' | 'submissions' | 'providers' | 'products' | 'users' | 'jobs' | 'profile') => {
    if (!canAccess(role, menu)) return null;
    return (
      <a
        href={hash}
        className={`nav-link ${isActive(hash) ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          window.location.hash = hash;
        }}
      >
        {label}
      </a>
    );
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <h1>Product Optimizer</h1>
          <div className="header-user-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="header-user-trigger"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <span className="header-user-email">{user?.email}</span>
              <span className={`header-user-chevron ${dropdownOpen ? 'open' : ''}`}>▼</span>
            </button>
            {dropdownOpen && (
              <div className="header-user-menu">
                <a
                  href="#profile"
                  className="header-user-menu-item"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = '#profile';
                    setDropdownOpen(false);
                  }}
                >
                  Edit profile
                </a>

                {/* НОВИЯТ БУТОН ТУК */}
                <button 
                  type="button" 
                  className="header-user-menu-item" 
                  onClick={handleRegenerateToken}
                >
                  Regenerate token
                </button>

                <button 
                  type="button" 
                  className="header-user-menu-item header-user-menu-item-logout" 
                  onClick={() => { setDropdownOpen(false); logout(); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <nav className="layout-nav">
          {nav('#', 'Home', 'home')}
          {nav('#submissions', 'Submissions', 'submissions')}
          {nav('#providers', 'Providers', 'providers')}
          {nav('#products', 'Products', 'products')}
          {nav('#users', 'Users', 'users')}
          {nav('#jobs', 'Pipeline Jobs', 'jobs')}
        </nav>
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <p>&copy; 2026 Product Optimizer. All rights reserved.</p>
      </footer>
    </div>
  );
};