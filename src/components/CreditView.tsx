import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  User, 
  Calendar, 
  FileText, 
  Trash2, 
  History, 
  CreditCard,
  Printer,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { MOCK_CREDITS } from '../mockData';
import { format } from 'date-fns';
import { fr, arDZ } from 'date-fns/locale';

export const CreditView = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  // Initialize credits state with localStorage or defaults
  const [credits, setCredits] = useState<any[]>(() => {
    const stored = localStorage.getItem('propos_credits');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    const initial = (MOCK_CREDITS as any[]).map(c => ({ ...c, status: c.status || 'unpaid' }));
    localStorage.setItem('propos_credits', JSON.stringify(initial));
    return initial;
  });

  const saveCredits = (updatedList: any[]) => {
    setCredits(updatedList);
    localStorage.setItem('propos_credits', JSON.stringify(updatedList));
  };

  // Group unique customers
  const customersGrouped = useMemo(() => {
    const map: { [name: string]: { name: string; totalUnpaid: number; totalPaidCount: number; totalUnpaidCount: number; latestDate: string } } = {};
    
    credits.forEach(c => {
      const name = c.customerName.trim();
      const key = name.toLowerCase();
      if (!map[key]) {
        map[key] = {
          name,
          totalUnpaid: 0,
          totalPaidCount: 0,
          totalUnpaidCount: 0,
          latestDate: c.date
        };
      }
      
      if (c.status === 'paid') {
        map[key].totalPaidCount += 1;
      } else {
        map[key].totalUnpaid += c.total;
        map[key].totalUnpaidCount += 1;
      }
      
      if (new Date(c.date) > new Date(map[key].latestDate)) {
        map[key].latestDate = c.date;
      }
    });
    
    return Object.values(map);
  }, [credits]);

  const filteredCustomers = useMemo(() => {
    return customersGrouped.filter(cust => 
      cust.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customersGrouped, searchTerm]);

  // Find tickets for currently selected customer
  const customerTickets = useMemo(() => {
    if (!selectedCustomerName) return [];
    return credits.filter(c => c.customerName.toLowerCase() === selectedCustomerName.toLowerCase())
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [credits, selectedCustomerName]);

  // Overall info for selected customer
  const selectedCustomerInfo = useMemo(() => {
    if (!selectedCustomerName) return null;
    return customersGrouped.find(c => c.name.toLowerCase() === selectedCustomerName.toLowerCase());
  }, [customersGrouped, selectedCustomerName]);

  // Handle pay/unpay toggle
  const toggleTicketStatus = (ticketId: string) => {
    const updated = credits.map(c => {
      if (c.id === ticketId) {
        return { ...c, status: c.status === 'paid' ? 'unpaid' : 'paid' };
      }
      return c;
    });
    saveCredits(updated);
  };

  // Handle single ticket deletion
  const deleteTicket = (ticketId: string, ticketNum: string) => {
    const confirmDelete = window.confirm(
      i18n.language === 'ar' 
        ? `هل تريد حذف تذكرة ${ticketNum} نهائياً؟` 
        : `Voulez-vous supprimer définitivement le ticket ${ticketNum} ?`
    );
    if (!confirmDelete) return;

    const updated = credits.filter(c => c.id !== ticketId);
    saveCredits(updated);

    // If no more tickets exist for this customer, deselect customer
    const activeRemaining = updated.some(c => c.customerName.toLowerCase() === selectedCustomerName?.toLowerCase());
    if (!activeRemaining) {
      setSelectedCustomerName(null);
    }
  };

  // Handle full customer deletion
  const deleteCustomerHistory = (custName: string) => {
    const confirmDelete = window.confirm(
      i18n.language === 'ar' 
        ? `هل تريد حذف الزبون "${custName}" وجميع فواتيره بالكامل؟` 
        : `Voulez-vous supprimer complètement le client "${custName}" et tout son historique ?`
    );
    if (!confirmDelete) return;

    const updated = credits.filter(c => c.customerName.toLowerCase() !== custName.toLowerCase());
    saveCredits(updated);
    setSelectedCustomerName(null);
  };

  // Printing engine
  const handlePrintTicket = (ticket: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(
        i18n.language === 'ar'
          ? "الرجاء السماح بنوافذ منبثقة لطباعة الفواتير."
          : "Veuillez autoriser les popups pour imprimer les tickets de caisse."
      );
      return;
    }
    
    const isRtl = i18n.language && i18n.language.startsWith('ar');
    const dir = isRtl ? 'rtl' : 'ltr';
    
    // Retrieve store name dynamically
    let storeNameStr = 'SUPERMARKET EL BARAKA';
    const marketNameFromStorage = localStorage.getItem('propos_market_name');
    if (marketNameFromStorage) {
      storeNameStr = marketNameFromStorage;
    } else {
      try {
        const savedSettings = localStorage.getItem('propos_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed && parsed.marketName) {
            storeNameStr = parsed.marketName;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    const itemsHtml = ticket.items.map((item: any) => `
      <div style="margin-bottom: 6px; page-break-inside: avoid;">
        <div style="font-weight: bold; text-transform: uppercase; font-size: 12px; margin-bottom: 2px;">${item.name}</div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>${item.quantity} x ${item.price.toFixed(2)} DA</span>
          <span style="font-weight: bold;">${(item.price * item.quantity).toFixed(2)} DA</span>
        </div>
      </div>
    `).join('');

    const statusLabel = ticket.status === 'paid' 
      ? (isRtl ? 'خالص / مدفوع' : 'PAYÉ (KHALES)') 
      : (isRtl ? 'غير مدفوع / دين' : 'NON PAYÉ (MAZAL)');

    const statusBanner = ticket.status === 'paid'
      ? (isRtl ? '*** تذكرة خالصة (مدفوعة) ***' : '*** TICKET PAYÉ (KHALES) ***')
      : (isRtl ? '!!! تذكرة غير مدفوعة (دين) !!!' : '!!! TICKET NON PAYÉ (MAZAL) !!!');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${dir === 'rtl' ? 'ar' : 'fr'}" dir="${dir}">
        <head>
          <meta charset="UTF-8">
          <title>Ticket ${ticket.ticketId}</title>
          <style>
            @media print {
              body {
                width: 72mm;
                margin: 0;
                padding: 0;
              }
              /* Eliminate default browser headers/footers */
              @page {
                size: 80mm auto;
                margin: 0;
              }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 72mm;
              margin: 0 auto;
              padding: 10px 4px;
              color: #000;
              background-color: #fff;
              font-size: 11px;
              line-height: 1.3;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .center { text-align: center; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .double-divider { border-bottom: 3px double #000; margin: 8px 0; }
            .store-title {
              font-size: 16px;
              font-weight: 1000;
              text-align: center;
              margin: 0 0 2px 0;
              text-transform: uppercase;
            }
            .store-subtitle {
              font-size: 9px;
              text-align: center;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .ticket-info {
              font-size: 10px;
              margin: 2px 0;
              display: flex;
              justify-content: space-between;
            }
            .status-box {
              border: 1.5px solid #000;
              padding: 5px;
              margin: 10px 0;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
            }
            .total-box {
              display: flex;
              justify-content: space-between;
              font-size: 15px;
              font-weight: bold;
              margin: 6px 0;
            }
          </style>
        </head>
        <body>
          <h1 class="store-title">${storeNameStr}</h1>
          <div class="store-subtitle">${isRtl ? 'محطة نقطة البيع 01' : 'TERMINAL DE CAISSE 01'}</div>
          
          <div class="divider"></div>
          
          <div class="ticket-info">
            <span><b>${isRtl ? 'تذكرة:' : 'TKT:'}</b> #${ticket.sequentialId.toString().padStart(4, '0')}</span>
            <span>ID: ${ticket.ticketId}</span>
          </div>
          <div class="ticket-info">
            <span><b>${isRtl ? 'التاريخ:' : 'Date:'}</b></span>
            <span>${new Date(ticket.date).toLocaleString(isRtl ? 'ar-DZ' : 'fr-FR')}</span>
          </div>
          <div class="ticket-info">
            <span><b>${isRtl ? 'الزبون:' : 'Client:'}</b></span>
            <span style="font-weight: bold; text-transform: uppercase;">${ticket.customerName}</span>
          </div>
          
          <div class="divider"></div>
          
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">
            <span>${isRtl ? 'المادة والكمية' : 'Désignation & Qté'}</span>
            <span>${isRtl ? 'المجموع' : 'Total'}</span>
          </div>
          
          <div class="divider"></div>
          
          <div style="margin: 6px 0;">
            ${itemsHtml}
          </div>
          
          <div class="divider"></div>
          
          <div class="total-box">
            <span>${isRtl ? 'إجمالي الدين:' : 'TOTAL DETTE:'}</span>
            <span>${ticket.total.toFixed(2)} DA</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="status-box" style="border-style: ${ticket.status === 'paid' ? 'solid' : 'dashed'};">
            ${statusBanner}
          </div>
          
          <div class="center" style="font-size: 9px; font-weight: bold; margin-top: 15px; text-transform: uppercase;">
            ${isRtl ? 'شكراً لثقتكم وزيارتكم!' : 'Merci pour votre confiance !'}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex h-full bg-slate-100 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Left List - Unique Customers only */}
      <div className="w-80 lg:w-96 border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 shadow-sm transition-colors duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter flex items-center gap-2 transition-colors">
               <History size={20} className="text-blue-600 dark:text-blue-400" />
               {t('credits')}
            </h2>
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
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((cust) => {
              const isActive = selectedCustomerName?.toLowerCase() === cust.name.toLowerCase();
              return (
                <button
                  key={cust.name}
                  onClick={() => setSelectedCustomerName(cust.name)}
                  className={cn(
                    "w-full p-4 flex flex-col gap-1 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 relative group",
                    isActive && "bg-blue-50/50 dark:bg-blue-900/20 border-r-4 border-blue-600 shadow-[inset_0_0_10px_rgba(37,99,235,0.05)]"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                      {cust.name}
                    </span>
                    {cust.totalUnpaidCount > 0 ? (
                      <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 px-2 py-0.5 rounded font-black font-mono">
                        {cust.totalUnpaidCount} {t('credit')}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-green-100 dark:bg-green-950/40 text-green-600 px-2 py-0.5 rounded font-black font-sans">
                        {t('paid_credit')}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {t('articles')}: {cust.totalPaidCount + cust.totalUnpaidCount}
                    </span>
                    <span className={cn(
                      "text-sm font-black font-inter text-blue-700 dark:text-blue-400 font-digital transition-colors",
                      cust.totalUnpaid > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-500"
                    )}>
                      {formatCurrency(cust.totalUnpaid, i18n.language)}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm font-medium italic">{t('no_credits_found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Detail Area - Shows Tickets for the Selected Customer */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        {selectedCustomerName && selectedCustomerInfo ? (
          <>
            {/* Top Customer Header */}
            <div className="flex justify-between items-start bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <div className="space-y-2 font-sans">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <User size={24} />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter leading-none transition-colors">
                    {selectedCustomerInfo.name}
                  </h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{t('total_credit')}:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {selectedCustomerInfo.totalPaidCount + selectedCustomerInfo.totalUnpaidCount}
                    </span>
                  </div>
                  <span className="opacity-30">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{t('status_credit')}:</span>
                    <span className={cn(
                      "font-bold",
                      selectedCustomerInfo.totalUnpaid > 0 ? "text-red-400" : "text-green-500"
                    )}>
                      {selectedCustomerInfo.totalUnpaid > 0 ? `${t('unpaid_credit')}` : `${t('paid_credit')}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Delete Entire Customer History */}
                <button
                  onClick={() => deleteCustomerHistory(selectedCustomerInfo.name)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-150 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/40 rounded-xl transition-all flex items-center gap-2 uppercase text-xs cursor-pointer"
                >
                  <Trash2 size={16} />
                  {t('delete_customer')}
                </button>
              </div>
            </div>

            {/* Quick stats totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('active_debt')}</span>
                  <p className="text-3xl font-black text-red-600 dark:text-red-400 font-digital mt-1">
                    {formatCurrency(selectedCustomerInfo.totalUnpaid, i18n.language)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
                  <CreditCard size={24} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('status_credit')}</span>
                  <div className="mt-1.5">
                    {selectedCustomerInfo.totalUnpaid > 0 ? (
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-lg text-sm font-black uppercase">
                        {t('unpaid_credit')}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-950/40 text-green-600 rounded-lg text-sm font-black uppercase">
                        {t('paid_credit')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-500 rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>

            {/* list of tickets de caisse */}
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight text-base mt-2 flex items-center gap-2">
                <FileText size={18} className="text-slate-400" />
                {t('all_customer_tickets', 'Tickets du client')} ({customerTickets.length})
              </h3>
              
              {customerTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={cn(
                    "bg-white dark:bg-slate-900 rounded-3xl border shadow-sm overflow-hidden flex flex-col md:flex-row transition-all",
                    ticket.status === 'paid' 
                      ? "border-green-200 dark:border-green-900/20 opacity-80" 
                      : "border-slate-200 dark:border-slate-800 ring-1 ring-red-500/5"
                  )}
                >
                  {/* Left Ticket Part representing receipt design on screen */}
                  <div className="p-6 flex-1 flex flex-col border-b md:border-b-0 md:border-e border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-700 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
                            Ticket #{ticket.ticketId}
                          </span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                            #{ticket.sequentialId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                          <Calendar size={13} />
                          <span>{format(new Date(ticket.date), 'Pp', { locale: i18n.language && i18n.language.startsWith('fr') ? fr : arDZ })}</span>
                        </div>
                      </div>

                      {/* Ticket Status Badge */}
                      <span className={cn(
                        "text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider",
                        ticket.status === 'paid'
                          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-500"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-500"
                      )}>
                        {ticket.status === 'paid' ? t('paid_credit').toUpperCase() : t('unpaid_credit').toUpperCase()}
                      </span>
                    </div>

                    {/* Table of items inside the receipt */}
                    <div className="flex-1 py-4 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase pb-1">
                            <th className="pb-2 text-[10px] tracking-widest">{t('designation')}</th>
                            <th className="pb-2 text-[10px] tracking-widest text-center">{t('qty')}</th>
                            <th className="pb-2 text-[10px] tracking-widest text-end">{t('pu')}</th>
                            <th className="pb-2 text-[10px] tracking-widest text-end">{t('total')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                          {ticket.items.map((item: any, idx: number) => (
                            <tr key={idx} className="text-slate-700 dark:text-slate-300">
                              <td className="py-2.5 font-bold uppercase">{item.name}</td>
                              <td className="py-2.5 text-center font-black font-mono text-slate-500">{item.quantity}</td>
                              <td className="py-2.5 text-end font-medium text-slate-500">{formatCurrency(item.price, i18n.language)}</td>
                              <td className="py-2.5 text-end font-bold font-digital text-slate-900 dark:text-white">{formatCurrency(item.price * item.quantity, i18n.language)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center bg-slate-50/20 dark:bg-slate-900/10 px-2 rounded-xl">
                      <span className="text-xs font-black text-slate-400 uppercase">{t('total').toUpperCase()}</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white font-digital">
                        {formatCurrency(ticket.total, i18n.language)}
                      </span>
                    </div>
                  </div>

                  {/* Right Action panel for individual tickets */}
                  <div className="p-6 shrink-0 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between gap-4 md:w-56">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('status_credit').toUpperCase()}</span>
                      
                      {/* Mark as paid/unpaid action buttons */}
                      {ticket.status === 'paid' ? (
                        <button
                          onClick={() => toggleTicketStatus(ticket.id)}
                          className="w-full py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-955/20 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                        >
                          <XCircle size={14} />
                          {t('mark_as_unpaid')}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleTicketStatus(ticket.id)}
                          className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl text-xs shadow-md shadow-green-600/15 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                        >
                          <CheckCircle2 size={14} />
                          {t('mark_as_paid')}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {/* Imprimer / Print Receipt */}
                      <button
                        onClick={() => handlePrintTicket(ticket)}
                        className="w-full py-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                      >
                        <Printer size={14} className="text-blue-500" />
                        {t('print_receipt')}
                      </button>

                      {/* Supprimer le ticket */}
                      <button
                        onClick={() => deleteTicket(ticket.id, ticket.ticketId)}
                        className="w-full py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        {t('delete_ticket')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
             <User size={80} className="mb-4 opacity-20" />
             <p className="text-xl font-bold uppercase tracking-widest opacity-50 italic text-center">
               {t('select_customer_to_view_credit')}
             </p>
             <p className="text-xs text-slate-400 mt-2 max-w-xs text-center leading-relaxed">
               {i18n.language === 'ar' 
                 ? "اختر زبوناً من القائمة الجانبية لتصفح فواتيره وطباعتها وتأكيد دفعه أو حذفه بالكامل." 
                 : "Sélectionnez un client de la liste de gauche pour consulter ses tickets, les imprimer, confirmer ses paiements ou le supprimer."}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
