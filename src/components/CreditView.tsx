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
    <div className="flex h-full bg-slate-100 overflow-hidden">
      {/* Left List */}
      <div className="w-80 lg:w-96 border-e border-slate-200 bg-white flex flex-col shrink-0 shadow-sm">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
               <History size={20} className="text-blue-600" />
               {t('credits')}
            </h2>
            <button className="p-2 hover:bg-slate-100 rounded-full text-blue-600 transition-colors">
              <UserPlus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('customer_name') + '...'}
              className="w-full pl-9 pr-4 py-2 border-2 border-slate-100 rounded-lg text-sm focus:border-blue-500 focus:ring-0 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredCredits.length > 0 ? (
            filteredCredits.map((cr) => (
              <button
                key={cr.id}
                onClick={() => setSelectedCreditId(cr.id)}
                className={cn(
                  "w-full p-4 flex flex-col gap-1 text-left transition-all hover:bg-slate-50 relative group",
                  selectedCreditId === cr.id && "bg-blue-50/50 border-r-4 border-blue-600 shadow-[inset_0_0_10px_rgba(37,99,235,0.05)]"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{cr.customerName}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black font-mono">#{cr.sequentialId}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Calendar size={12} />
                      {format(new Date(cr.date), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                  <span className="text-sm font-black text-blue-700 font-digital">{formatCurrency(cr.total, i18n.language)}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm font-medium italic italic">Aucun crédit trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#f8fafc]">
        {selectedCredit ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
                  {selectedCredit.customerName}
                </h1>
                <div className="flex items-center gap-4 text-slate-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm w-fit">
                   <div className="flex items-center gap-1.5 border-e border-slate-200 pe-4">
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
                <button className="p-2 hover:bg-red-50 text-red-500 border border-transparent hover:border-red-100 rounded-lg transition-all">
                  <Trash2 size={22} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-32 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-blue-50 opacity-50"><CreditCard size={100} /></div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('total_credit')}</span>
                  <p className="text-4xl font-black text-blue-700 font-digital leading-none tracking-tighter">
                    {formatCurrency(selectedCredit.total, i18n.language)}
                  </p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-32">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Articles</span>
                  <p className="text-4xl font-black text-slate-800 leading-none tracking-tighter">
                    {selectedCredit.items.length}
                  </p>
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-2">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Détails du ticket</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('designation')}</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('qty')}</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-end">{t('pu')}</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-end">{t('total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedCredit.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-700 uppercase text-xs">{item.name}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-black text-slate-600 font-mono italic">{item.quantity}</span>
                      </td>
                      <td className="p-4 text-end">
                        <span className="font-bold text-slate-500 font-digital">{formatCurrency(item.price, i18n.language)}</span>
                      </td>
                      <td className="p-4 text-end">
                        <span className="font-black text-slate-900 font-digital">{formatCurrency(item.price * item.quantity, i18n.language)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
             <User size={80} className="mb-4 opacity-20" />
             <p className="text-xl font-bold uppercase tracking-widest opacity-50 italic">Sélectionnez un client pour voir ses dettes</p>
          </div>
        )}
      </div>
    </div>
  );
};
