import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Store, Shield, Languages, Moon, Sun } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

export const SettingsView = () => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();

  const [marketName, setMarketName] = useState(settings.marketName);
  const [isLoginEnabled, setIsLoginEnabled] = useState(settings.isLoginEnabled);
  const [adminUsername, setAdminUsername] = useState(settings.adminUsername);
  const [adminPassword, setAdminPassword] = useState(settings.adminPassword);
  
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSave = () => {
    updateSettings({
      marketName,
      isLoginEnabled,
      adminUsername,
      adminPassword,
    });
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            {t('settings')}
          </h2>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 uppercase text-sm"
          >
            <Save size={18} />
            {t('save', 'Save')}
          </button>
        </div>

        {showSavedMsg && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg font-bold flex items-center justify-center">
            Paramètres enregistrés avec succès
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black text-lg uppercase flex items-center gap-2 dark:text-slate-100">
              <Store className="text-blue-600" />
              Général
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom du magasin (Market Name)</label>
              <input
                type="text"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none font-bold"
              />
            </div>

            <div className="pt-4 space-y-4 border-t dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                  <Languages size={20} className="text-blue-600" />
                  <span>Langue ({i18n.language === 'fr' ? 'Français' : 'العربية'})</span>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase text-sm dark:text-slate-200"
                >
                  Changer
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                  {theme === 'light' ? <Sun size={20} className="text-orange-500"/> : <Moon size={20} className="text-blue-400"/>}
                  <span>Mode (Light/Dark)</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase text-sm dark:text-slate-200"
                >
                  Changer
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black text-lg uppercase flex items-center gap-2 dark:text-slate-100">
              <Shield className="text-blue-600" />
              Sécurité / Connexion
            </h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isLoginEnabled}
                  onChange={(e) => setIsLoginEnabled(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${isLoginEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isLoginEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Activer l'écran de connexion</span>
            </label>

            {isLoginEnabled && (
              <div className="space-y-4 pt-4 border-t dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mot de passe</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none font-bold"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
