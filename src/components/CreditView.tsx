import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  User, 
  Calendar, 
  FileText, 
  Trash2, 
  ChevronRight,
  UserPlus,
  ArrowUpDown,
  History,
  CreditCard,
  Plus
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { MOCK_CREDITS } from '../mockData';
import { format } from 'date-fns';
import { fr, arDZ } from 'date-fns/locale';

export const CreditView = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);

  const filteredCredits = MOCK_CREDITS.filter(cr => 
    cr.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cr.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCredit = MOCK_CREDITS.find(cr => cr.id === selectedCreditId);

  return (
    <div className="flex h-full bg-slate-100 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Left List */}
      <div className="w-80 lg:w-96 border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 shadow-sm transition-colors duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter flex items-center gap-2 transition-colors">
               <History size={20} className="text-blue-600 dark:text-blue-400" />
               {t('credits')}
            </h2>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400 transition-colors">
              <UserPlus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('customer_name') + '...'}
              className="w-full pl-9 pr-4 py-2 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-0 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
          {filteredCredits.length > 0 ? (
            filteredCredits.map((cr) => (
              <button
                key={cr.id}
                onClick={() => setSelectedCreditId(cr.id)}
                className={cn(
                  "w-full p-4 flex flex-col gap-1 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 relative group",
                  selectedCreditId === cr.id && "bg-blue-50/50 dark:bg-blue-900/20 border-r-4 border-blue-600 shadow-[inset_0_0_10px_rgba(37,99,235,0.05)]"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{cr.customerName}</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-black font-mono transition-colors">#{cr.sequentialId}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <Calendar size={12} />
                      {format(new Date(cr.date), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                  <span className="text-sm font-black text-blue-700 dark:text-blue-400 font-digital transition-colors">{formatCurrency(cr.total, i18n.language)}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm font-medium italic">Aucun crédit trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        {selectedCredit ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter leading-none mb-2 transition-colors">
                  {selectedCredit.customerName}
                </h1>
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm w-fit transition-colors">
                   <div className="flex items-center gap-1.5 border-e border-slate-200 dark:border-slate-800 pe-4">
                     <FileText size={16} />
                     <span>{selectedCredit.ticketId}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                     <Calendar size={16} />
                     <span>{format(new Date(selectedCredit.date), 'PPPP', { locale: i18n.language === 'fr' ? fr : arDZ })}</span>
                   </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2 uppercase text-sm">
                  <Plus size={18} />
                  {t('partial_payment')}
                </button>
                <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 border border-transparent hover:border-red-100 dark:hover:border-red-900 rounded-lg transition-all">
                  <Trash2 size={22} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-32 relative overflow-hidden transition-colors">
                  <div className="absolute -right-4 -top-4 text-blue-50 dark:text-blue-900/20 opacity-50"><CreditCard size={100} /></div>
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('total_credit')}</span>
                  <p className="text-4xl font-black text-blue-700 dark:text-blue-400 font-digital leading-none tracking-tighter">
                    {formatCurrency(selectedCredit.total, i18n.language)}
                  </p>
               </div>
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-32 transition-colors">
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Articles</span>
                  <p className="text-4xl font-black text-slate-800 dark:text-slate-200 leading-none tracking-tighter">
                    {selectedCredit.items.length}
                  </p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-2 transition-colors">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
                <h3 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">Détails du ticket</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 transition-colors">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('designation')}</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">{t('qty')}</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-end">{t('pu')}</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-end">{t('total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                  {selectedCredit.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs">{item.name}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-black text-slate-600 dark:text-slate-400 font-mono italic">{item.quantity}</span>
                      </td>
                      <td className="p-4 text-end">
                        <span className="font-bold text-slate-500 dark:text-slate-500 font-digital">{formatCurrency(item.price, i18n.language)}</span>
                      </td>
                      <td className="p-4 text-end">
                        <span className="font-black text-slate-900 dark:text-slate-100 font-digital">{formatCurrency(item.price * item.quantity, i18n.language)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
             <User size={80} className="mb-4 opacity-20" />
             <p className="text-xl font-bold uppercase tracking-widest opacity-50 italic">Sélectionnez un client pour voir ses dettes</p>
          </div>
        )}
      </div>
    </div>
  );
};
