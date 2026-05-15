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

import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [activeView, setActiveView] = useState('sales');

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
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
            <h2 className="text-2xl font-black text-slate-400 uppercase italic">Module en développement</h2>
          </div>
        );
    }
  };

  return (
    <ThemeProvider>
      <Layout activeTab={activeView} setActiveTab={setActiveView}>
        {renderView()}
      </Layout>
    </ThemeProvider>
  );
}
