/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { SalesView } from './components/SalesView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { CreditView } from './components/CreditView';
import { SettingsView } from './components/SettingsView';
import { LoginScreen } from './components/LoginScreen';

import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

const AppContent = () => {
  const [activeView, setActiveView] = useState('sales');
  const { settings } = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(!settings.isLoginEnabled);

  // Re-check authentication if settings change to enable/disable login? 
  // It's generally better to just let it be until reload, or force authentication.
  // We will force login if enabled and not authenticated.
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'sales':
        return <SalesView />;
      case 'inventory':
        return <InventoryView />;
      case 'credits':
        return <CreditView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
            <h2 className="text-2xl font-black text-slate-400 uppercase italic">Module en développement</h2>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeView} setActiveTab={setActiveView} onLogout={() => setIsAuthenticated(false)}>
      {renderView()}
    </Layout>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SettingsProvider>
  );
}
