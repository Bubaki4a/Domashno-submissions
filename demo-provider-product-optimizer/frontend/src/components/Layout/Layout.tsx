import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const getCurrentHash = () => {
    return window.location.hash;
  };

  const isActive = (hash: string) => {
    const currentHash = getCurrentHash();
    if (hash === '#') {
      return currentHash === '' || currentHash === '#' || currentHash.startsWith('#edit/');
    }
    return currentHash === hash;
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <h1>Product Optimizer</h1>
        </div>
        <nav className="layout-nav">
          <a
            href="#"
            className={`nav-link ${isActive('#') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#';
            }}
          >
            Home
          </a>
          <a
            href="#submissions"
            className={`nav-link ${isActive('#submissions') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#submissions';
            }}
          >
            Submissions
          </a>
          <a
            href="#providers"
            className={`nav-link ${isActive('#providers') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#providers';
            }}
          >
            Providers
          </a>
        </nav>
      </header>
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <p>&copy; 2026 Product Optimizer. All rights reserved.</p>
      </footer>
    </div>
  );
};
