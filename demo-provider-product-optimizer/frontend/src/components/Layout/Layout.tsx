import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <h1>Product Optimizer</h1>
        </div>
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
