import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  marketName: string;
  isLoginEnabled: boolean;
  adminUsername: string;
  adminPassword: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  marketName: 'SUPERMARKET EL BARAKA',
  isLoginEnabled: false,
  adminUsername: 'admin',
  adminPassword: 'password123',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('propos_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI) {
        try {
          const electronSettings = await window.electronAPI.getSettings();
          if (electronSettings && Object.keys(electronSettings).length > 0) {
            setSettings(prev => ({ ...prev, ...electronSettings }));
          }
        } catch (e) {
          console.error("Electron failed loading settings:", e);
        }
      }
    };
    loadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('propos_settings', JSON.stringify(updated));
      if (window.electronAPI) {
        window.electronAPI.saveSettings(updated).catch(e => console.error("Electron failed saving settings:", e));
      }
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
