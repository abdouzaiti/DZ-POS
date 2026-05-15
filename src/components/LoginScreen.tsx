import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Lock, User } from 'lucide-react';

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const { settings } = useSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === settings.adminUsername && password === settings.adminPassword) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-[999]">
      <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl w-full max-w-md shadow-2xl border-4 border-blue-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/50">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            {settings.marketName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">
            Connexion au système
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom d'utilisateur</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-800 dark:text-white transition-colors"
                placeholder="Ex: admin"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-800 dark:text-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
              Identifiants incorrects
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl uppercase tracking-widest mt-6 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            Se Connecter
          </button>
        </form>
      </div>
    </div>
  );
};
