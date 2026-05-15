import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Search, XCircle, History, Receipt } from 'lucide-react';
import { Sale } from '../types';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: Sale[];
  onSelectSale: (sale: Sale) => void;
}

export function SalesHistoryModal({ isOpen, onClose, sales, onSelectSale }: SalesHistoryModalProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredSales = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return sales.filter(sale => {
      const timeStr = format(new Date(sale.date), `HH:mm`, { locale: fr });
      const matchId = sale.sequentialId.toString().includes(query) || sale.id.toLowerCase().includes(query);
      const matchItems = sale.items.some(item => item.name.toLowerCase().includes(query));
      const matchTime = timeStr.includes(query);
      return matchId || matchItems || matchTime;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[85vh] border-4 border-slate-900 dark:border-black transition-colors duration-300"
      >
        <div className="bg-slate-900 dark:bg-black p-4 text-white border-b-4 border-blue-500 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
              <History size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-black uppercase tracking-widest">{t('sales_history')}</span>
               <span className="text-xs text-blue-300 font-bold tracking-tighter">{t('today_sales', { count: sales.length })}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 dark:bg-slate-900 hover:bg-red-600 dark:hover:bg-red-600 rounded-lg transition-colors border-b-4 border-slate-950 dark:border-black active:border-b-0 active:translate-y-1"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center gap-3 shrink-0 transition-colors">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_history_placeholder')}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/20 flex flex-col gap-3 transition-colors">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
              <Receipt size={48} className="opacity-20 mb-4" />
              <p className="text-lg font-bold">{t('no_sales_found')}</p>
            </div>
          ) : (
            filteredSales.map(sale => (
              <button
                key={sale.id}
                onClick={() => {
                  onSelectSale(sale);
                  onClose();
                }}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all text-left active:scale-[0.99] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 min-w-[70px] text-center border border-slate-200 dark:border-slate-700 transition-colors">
                    <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">{t('ticket')}</div>
                    <div className="text-lg font-black font-digital text-blue-600 dark:text-blue-400">
                      {sale.sequentialId.toString().padStart(4, '0')}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 transition-colors">
                      {format(new Date(sale.date), `dd/MM/yyyy HH:mm`, { locale: fr })}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-sm font-medium mt-0.5">
                      {sale.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-digital text-slate-900 dark:text-slate-100 tracking-tighter transition-colors">
                    {formatCurrency(sale.total, i18n.language)}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    {sale.paymentMethod}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
