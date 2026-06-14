import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Tag, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Printer,
  Pause,
  XCircle,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  Monitor,
  Edit,
  ArrowLeftRight,
  History,
  TrendingDown,
  Users
} from 'lucide-react';
import { usePOS } from '../hooks/usePOS';
import { MOCK_CREDITS } from '../mockData';
import { useProducts } from '../contexts/ProductsContext';
import { Category, Product, Sale } from '../types';
import { cn, formatCurrency, formatNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { SalesHistoryModal } from './SalesHistoryModal';

export const SalesView = () => {
  const { t, i18n } = useTranslation();
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    tax, 
    total, 
    completeSale,
    sales
  } = usePOS();
  
  const { products } = useProducts();

  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  const [showSalesHistoryModal, setShowSalesHistoryModal] = useState(false);
  const [selectedProductForManual, setSelectedProductForManual] = useState<Product | null>(null);
  const [manualValue, setManualValue] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditCustomerName, setCreditCustomerName] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const amountPaidInputRef = useRef<HTMLInputElement>(null);

  const [checkoutStep, setCheckoutStep] = useState<'IDLE' | 'ENTER_PAID' | 'SHOW_CHANGE'>('IDLE');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [changeToReturn, setChangeToReturn] = useState<number | null>(null);

  const quickProducts = useMemo(() => products.filter(p => p.isQuick), [products]);
  const lastItem = cart.length > 0 ? cart[cart.length - 1] : null;

  const initiateCheckout = useCallback(() => {
    if (cart.length === 0) return;
    setCheckoutStep('ENTER_PAID');
    setAmountPaid('');
    setChangeToReturn(null);
    setTimeout(() => {
      amountPaidInputRef.current?.focus();
    }, 100);
  }, [cart]);

  const handleManualSubmit = useCallback(() => {
    if (selectedProductForManual && manualValue) {
      addToCart(selectedProductForManual, parseFloat(manualValue));
      setSelectedProductForManual(null);
      setManualValue('');
      // Focus back to barcode input after a short delay
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [selectedProductForManual, manualValue, addToCart]);

  const handleCompleteSale = useCallback((method: string, showModal: boolean = true) => {
    console.log("handleCompleteSale called", { method, showModal });
    const sale = completeSale(method);
    if (sale && showModal) {
      setShowReceipt(sale);
    }
  }, [completeSale]);

  const handleCreditSale = useCallback(() => {
    if (cart.length === 0) return;
    setShowCreditModal(true);
    setCreditCustomerName('');
  }, [cart]);

  const submitCreditSale = () => {
    if (!creditCustomerName.trim()) return;
    const sale = completeSale(`Credit - ${creditCustomerName.trim()}`);
    if (sale) {
      try {
        const stored = localStorage.getItem('propos_credits');
        let creditsList = [];
        if (stored) {
          creditsList = JSON.parse(stored);
        } else {
          creditsList = (MOCK_CREDITS as any[]).map((c: any) => ({ ...c, status: c.status || 'unpaid' }));
        }
        
        const newCredit = {
          id: 'cr_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          customerName: creditCustomerName.trim(),
          date: new Date().toISOString(),
          total: sale.total,
          sequentialId: creditsList.length + 101,
          ticketId: `TKT-${(creditsList.length + 101).toString().padStart(5, '0')}`,
          items: sale.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            barcode: item.barcode,
            category: item.category
          })),
          status: 'unpaid'
        };
        
        creditsList = [newCredit, ...creditsList];
        localStorage.setItem('propos_credits', JSON.stringify(creditsList));
      } catch (err) {
        console.error("Failed to save credit sale to localStorage:", err);
      }
      
      setShowReceipt(sale);
      setShowCreditModal(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Multi-step checkout states first!
      if (checkoutStep === 'ENTER_PAID') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const paidVal = amountPaid.trim() === '' ? total : parseFloat(amountPaid);
          if (!isNaN(paidVal)) {
            setChangeToReturn(paidVal - total);
            setCheckoutStep('SHOW_CHANGE');
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setCheckoutStep('IDLE');
          setAmountPaid('');
          setChangeToReturn(null);
          setTimeout(() => {
            barcodeInputRef.current?.focus();
          }, 100);
          return;
        }
        // Block other POS shortcuts during payment entry to avoid accidental actions
        if (e.key.startsWith('F') || (e.ctrlKey && ['s', 'S', 'r', 'R', 'k', 'K'].includes(e.key))) {
          e.preventDefault();
          return;
        }
      }

      if (checkoutStep === 'SHOW_CHANGE') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const paidVal = amountPaid.trim() === '' ? total : parseFloat(amountPaid);
          const sale = completeSale('Cash');
          if (sale) {
            const saleWithDetails = {
              ...sale,
              amountPaid: paidVal,
              changeToReturn: changeToReturn ?? 0
            };
            setShowReceipt(saleWithDetails);
          }
          setCheckoutStep('IDLE');
          setAmountPaid('');
          setChangeToReturn(null);
          setTimeout(() => {
            barcodeInputRef.current?.focus();
          }, 100);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setCheckoutStep('ENTER_PAID');
          setChangeToReturn(null);
          setTimeout(() => {
            amountPaidInputRef.current?.focus();
          }, 100);
          return;
        }
        // Block other keys
        if (e.key.startsWith('F') || (e.ctrlKey && ['s', 'S', 'r', 'R', 'k', 'K'].includes(e.key))) {
          e.preventDefault();
          return;
        }
      }

      // If manual entry modal is open
      if (selectedProductForManual) {
        if (/^[0-9.]$/.test(e.key)) {
          setManualValue(prev => prev + e.key);
          e.preventDefault();
        } else if (e.key === 'Backspace') {
          setManualValue(prev => prev.slice(0, -1));
          e.preventDefault();
        } else if (e.key === 'Enter') {
          handleManualSubmit();
          e.preventDefault();
        } else if (e.key === 'Escape') {
          setSelectedProductForManual(null);
          e.preventDefault();
        }
        return;
      }

      // Ctrl+S to cancel / clear cart
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        clearCart();
        return;
      }

      // Ctrl+R to recall / show history
      if (e.ctrlKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        setShowSalesHistoryModal(true);
        return;
      }

      // F10 to validate
      if (e.key === 'F10') {
        e.preventDefault();
        initiateCheckout();
        return;
      }

      // F4 to credit
      if (e.key === 'F4') {
        e.preventDefault();
        handleCreditSale();
        return;
      }

      // F5 to focus scanner input
      if (e.key === 'F5') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        return;
      }

      // Complete sale logic
      if (e.key === 'Enter') {
        const isInputFocused = document.activeElement instanceof HTMLInputElement;
        const isManualEntry = !!selectedProductForManual;
        const isCreditModal = showCreditModal;
        const isReceiptOpen = !!showReceipt;

        if (!isManualEntry && !isCreditModal && !isReceiptOpen) {
          if (isInputFocused) {
            const input = document.activeElement as HTMLInputElement;
            if (input.value === '' && cart.length > 0) {
              initiateCheckout();
              e.preventDefault();
            } else if (input.value !== '') {
              // Try to find product by barcode
              const product = products.find(p => p.barcode === input.value);
              if (product) {
                handleProductClick(product);
                setBarcodeValue('');
                e.preventDefault();
              }
            }
          } else if (cart.length > 0) {
            initiateCheckout();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, selectedProductForManual, manualValue, handleManualSubmit, handleCompleteSale, showCreditModal, showReceipt, clearCart, handleCreditSale, checkoutStep, amountPaid, changeToReturn, initiateCheckout, total, completeSale, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.barcode.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, products]);

  const handleProductClick = (product: Product) => {
    if (product.unit === 'kg' || product.unit === 'g') {
      setSelectedProductForManual(product);
      setManualValue('');
      // Blur any focused input to ensure keyboard redirected correctly
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } else {
      addToCart(product);
    }
  };

  const nmpadPress = (val: string) => {
    if (val === 'C') {
      setManualValue('');
    } else if (val === 'OK') {
      handleManualSubmit();
    } else {
      setManualValue(prev => prev + val);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] dark:bg-slate-900 overflow-hidden select-none transition-colors duration-300">
      {/* Receipt Modal (Unchanged) */}
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 rounded-none shadow-2xl w-full max-w-[400px] font-mono relative border dark:border-slate-800"
            >
              <button 
                onClick={() => setShowReceipt(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XCircle size={24} />
              </button>
              
              <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
                <h2 className="text-xl font-bold uppercase tracking-tight">{t('store_name')}</h2>
                <p className="text-xs">{t('address')}</p>
              </div>

              <div className="flex flex-col gap-1 text-[10px] mb-4 border-b border-slate-200 pb-2">
                <div className="flex justify-between">
                  <span className="font-bold">Bon N°: {showReceipt.sequentialId.toString().padStart(4, '0')}</span>
                  <span>#{showReceipt.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>{new Date(showReceipt.date).toLocaleDateString('fr-FR')}</span>
                  <span>{new Date(showReceipt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4 border-b-2 border-dashed border-slate-300 pb-4">
                {showReceipt.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="font-bold uppercase flex-1">{item.name}</span>
                    <span className="w-16 text-right font-digital">{item.quantity}</span>
                    <span className="w-24 text-right font-bold font-digital">{formatCurrency(item.price * item.quantity, i18n.language)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-2xl font-black pt-4 font-digital border-t-2 border-slate-900 mt-4 leading-none">
                <span>TOTAL</span>
                <span>{formatCurrency(showReceipt.total, i18n.language)}</span>
              </div>

              {(showReceipt as any).amountPaid !== undefined && (
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-800 font-digital mt-2 text-slate-700 dark:text-slate-300">
                  <span>{t('amount_paid').toUpperCase()}</span>
                  <span>{formatCurrency((showReceipt as any).amountPaid, i18n.language)}</span>
                </div>
              )}

              {(showReceipt as any).changeToReturn !== undefined && (
                <div className="flex justify-between text-sm font-black pt-1 font-digital text-blue-600 dark:text-blue-400">
                  <span>{t('change_to_return').toUpperCase()}</span>
                  <span>{formatCurrency((showReceipt as any).changeToReturn, i18n.language)}</span>
                </div>
              )}

              <div className="flex gap-2 mt-8">
                <button 
                  onClick={() => setShowReceipt(null)}
                  className="flex-1 py-3 bg-slate-800 text-white font-black text-xs rounded hover:bg-slate-700 active:scale-95 transition-all shadow-md uppercase"
                >
                  {t('close')}
                </button>
                <button 
                  onClick={() => { setShowReceipt(null); }}
                  className="flex-[2] py-3 bg-blue-600 text-white font-black text-xs rounded hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg uppercase"
                >
                  <Printer size={16} />
                  {t('print').toUpperCase()}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP DISPLAY AREA */}
      <div className="h-32 bg-white dark:bg-slate-900 border-b-4 border-slate-300 dark:border-slate-800 grid grid-cols-12 shrink-0 shadow-md transition-colors duration-300 relative">
        {checkoutStep === 'IDLE' ? (
          <>
            <div className="col-span-3 p-4 flex flex-col justify-between border-e-2 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-sm font-black text-blue-600 dark:text-blue-400 uppercase font-digital">
                <span>{t('ticket')}: {(sales.length + 1).toString().padStart(5, '0')}</span>
                <span>{t('pos_id')}: 01</span>
              </div>
              <div className="mt-2">
                <p className="text-[11px] font-black text-white px-2 py-0.5 bg-slate-500 dark:bg-slate-700 uppercase tracking-widest w-fit rounded mb-1">
                  {t('last_item')}
                </p>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase truncate tracking-tighter leading-tight">
                  {lastItem ? lastItem.name : "---"}
                </h2>
              </div>
            </div>

            <div className="col-span-9 p-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border-s-4 border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <div className="text-right w-full pr-8">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('total')}</span>
              </div>
              <div className="w-full flex items-center justify-center">
                 <span className="text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums font-digital leading-none">
                   {formatNumber(total)} <span className="text-2xl lg:text-3xl text-slate-400 dark:text-slate-600 uppercase ms-2 select-none tracking-normal font-sans">DA</span>
                 </span>
              </div>
            </div>
          </>
        ) : checkoutStep === 'ENTER_PAID' ? (
          <>
            <div className="col-span-3 p-4 flex flex-col justify-between border-e-2 border-slate-200 dark:border-slate-800 bg-amber-500/5 dark:bg-amber-500/5">
              <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('total').toUpperCase()}</div>
              <div className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white font-digital">
                {formatNumber(total)} <span className="text-xs text-slate-400">DA</span>
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase leading-tight animate-pulse">
                {t('payment').toUpperCase()}...
              </div>
            </div>

            <div className="col-span-9 p-3 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/40 relative">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {t('step_paid_desc')}
                </span>
                <div className="flex items-center gap-3">
                  <input
                    ref={amountPaidInputRef}
                    type="text"
                    value={amountPaid}
                    onChange={(e) => {
                      if (/^[0-9.]*$/.test(e.target.value)) {
                        setAmountPaid(e.target.value);
                      }
                    }}
                    placeholder={total.toString()}
                    className="bg-black text-green-400 text-5xl lg:text-6xl font-digital px-4 py-1.5 w-full max-w-[280px] outline-none border-2 border-slate-700 focus:border-green-500 rounded-xl shadow-inner transition-all uppercase tracking-wider"
                  />
                  <button
                    onClick={() => {
                      const paidVal = amountPaid.trim() === '' ? total : parseFloat(amountPaid);
                      if (!isNaN(paidVal)) {
                        setChangeToReturn(paidVal - total);
                        setCheckoutStep('SHOW_CHANGE');
                      }
                    }}
                    className="h-14 px-6 bg-green-600 hover:bg-green-500 text-white text-base font-black uppercase rounded-xl shadow-lg hover:shadow-green-500/10 active:scale-95 transition-all flex items-center justify-between gap-1.5 cursor-pointer"
                  >
                    <span>OK</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setCheckoutStep('IDLE');
                  setAmountPaid('');
                  setChangeToReturn(null);
                  setTimeout(() => barcodeInputRef.current?.focus(), 50);
                }}
                className="absolute top-2 right-2 text-[9px] font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-all uppercase flex items-center gap-1"
              >
                <XCircle size={10} /> {t('cancel')} (ESC)
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="col-span-3 p-3 flex flex-col justify-between border-e-2 border-slate-200 dark:border-slate-800 bg-green-500/5">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{t('total').toUpperCase()}</span>
                <div className="text-xl font-black text-slate-800 dark:text-slate-200 font-digital">{formatNumber(total)} DA</div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{t('amount_paid').toUpperCase()}</span>
                <div className="text-xl font-black text-slate-800 dark:text-slate-200 font-digital">
                  {formatNumber(amountPaid.trim() === '' ? total : parseFloat(amountPaid))} DA
                </div>
              </div>
            </div>

            <div className="col-span-9 p-2 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/40 relative">
              <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest animate-bounce">
                {t('change_to_return').toUpperCase()} (SARF)
              </span>
              <span className="text-6xl lg:text-7xl font-black text-green-500 tracking-tighter tabular-nums font-digital leading-none">
                {formatNumber(changeToReturn ?? 0)} <span className="text-xl text-green-600 dark:text-green-400 uppercase select-none font-sans font-black">DA</span>
              </span>
              <button
                onClick={() => {
                  const paidVal = amountPaid.trim() === '' ? total : parseFloat(amountPaid);
                  const sale = completeSale('Cash');
                  if (sale) {
                    const saleWithDetails = {
                      ...sale,
                      amountPaid: paidVal,
                      changeToReturn: changeToReturn ?? 0
                    };
                    setShowReceipt(saleWithDetails);
                  }
                  setCheckoutStep('IDLE');
                  setAmountPaid('');
                  setChangeToReturn(null);
                  setTimeout(() => barcodeInputRef.current?.focus(), 50);
                }}
                className="mt-1.5 px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer tracking-wider"
              >
                <span>{t('print_receipt')} (ENTER)</span>
                <ChevronRight size={12} />
              </button>

              <button
                onClick={() => {
                  setCheckoutStep('ENTER_PAID');
                  setChangeToReturn(null);
                  setTimeout(() => amountPaidInputRef.current?.focus(), 50);
                }}
                className="absolute top-2 right-2 text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded hover:bg-slate-300 transition-all uppercase flex items-center gap-1"
              >
                <ChevronRight size={10} className="rotate-180" /> {t('back')} (ESC)
              </button>
            </div>
          </>
        )}
      </div>

      {/* MIDDLE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ticket List (Left Side) - 40% */}
        <div className="w-[40%] flex flex-col border-e-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-10 transition-colors duration-300">
           {/* Mini Toolbar */}
           <div className="h-10 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 flex items-center px-1.5 gap-1 shadow-sm transition-colors duration-300">
              <button className="flex-1 h-7 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-[9px] font-black text-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all shadow-sm uppercase">QTY (F1)</button>
              <button className="flex-1 h-7 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-[9px] font-black text-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all shadow-sm uppercase">P.U (F2)</button>
              <button 
                onClick={clearCart}
                className="flex-1 h-7 bg-red-600 border-2 border-red-700 text-white text-[9px] font-black rounded hover:bg-red-700 active:scale-95 transition-all shadow-md uppercase"
              >
                {t('cancel')}
              </button>
              <button className="flex-1 h-7 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-[9px] font-black text-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all shadow-sm uppercase flex items-center justify-center gap-1">
                <Search size={10}/> 
                FIND
              </button>
           </div>

           <div className="flex-1 overflow-y-auto bg-slate-50/10 dark:bg-slate-950/20">
             <table className="w-full text-left border-collapse table-fixed">
               <thead className="bg-[#e2e8f0] dark:bg-slate-800 sticky top-0 z-10 border-b-2 border-slate-300 dark:border-slate-700 transition-colors duration-300">
                 <tr className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 h-9">
                   <th className="p-2 w-8 text-center">#</th>
                   <th className="p-2">{t('designation')}</th>
                   <th className="p-2 w-14 text-center">{t('qty')}</th>
                   <th className="p-2 w-20 text-end pe-4">{t('total')}</th>
                 </tr>
               </thead>
               <tbody className="text-sm font-black divide-y divide-slate-100 dark:divide-slate-800">
                 {cart.map((item, index) => (
                   <tr key={item.id} className={cn("transition-colors h-11 cursor-pointer border-s-4 group transition-colors duration-300", 
                     index % 2 !== 0 
                      ? "bg-white dark:bg-slate-900 border-s-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                      : "bg-slate-50/30 dark:bg-slate-800/30 border-s-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    )}>
                     <td className="p-2 text-center text-slate-400 dark:text-slate-600 font-mono text-[10px]">{index + 1}</td>
                     <td className="p-2">
                        <div className="flex flex-col">
                           <span className="uppercase truncate text-slate-800 dark:text-slate-200 tracking-tight text-[11px] leading-tight">{item.name}</span>
                           <span className="text-[9px] text-slate-400 dark:text-slate-500 font-digital">{formatCurrency(item.price, i18n.language)}</span>
                        </div>
                     </td>
                     <td className="p-2 text-center text-blue-700 dark:text-blue-400 font-digital text-base bg-blue-50/20 dark:bg-blue-900/10 transition-colors duration-300">{item.quantity}</td>
                     <td className="p-2 text-end font-digital pe-4 text-slate-900 dark:text-slate-100 text-lg tracking-tight bg-slate-100/10 dark:bg-slate-800/10 transition-colors duration-300">{ formatNumber(item.price * item.quantity) }</td>
                   </tr>
                 ))}
                 {Array.from({ length: Math.max(0, 15 - cart.length) }).map((_, i) => (
                   <tr key={`empty-${i}`} className="h-10 opacity-20">
                     <td className="p-2 text-center text-slate-200 text-[10px]">{cart.length + i + 1}</td>
                     <td colSpan={3}></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

           <div className="h-12 bg-slate-900 flex items-center px-4 justify-between border-t-2 border-blue-500 shadow-2xl">
             <div className="flex items-center gap-3">
               <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">{t('scanner')}:</span>
               <div className="relative">
                 <input 
                   type="text" 
                   ref={barcodeInputRef}
                   autoFocus
                   value={barcodeValue}
                   onChange={(e) => setBarcodeValue(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && barcodeValue === '' && cart.length > 0) {
                        initiateCheckout();
                     }
                   }}
                   placeholder={t('barcode_placeholder')} 
                   className="bg-black border-2 border-slate-700 text-green-400 text-sm px-3 py-1 w-40 font-mono outline-none focus:border-blue-500 transition-all rounded shadow-inner"
                 />
                 <div className="absolute top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-bold uppercase select-none ltr:right-2 rtl:left-2">F5</div>
               </div>
             </div>
             <div className="flex gap-4 text-xs font-black text-white uppercase tracking-tighter">
               <span className="flex items-center gap-1.5">{t('article_count')}: <span className="text-blue-400 text-lg font-digital">{cart.length}</span></span>
             </div>
           </div>
        </div>

         {/* Product Grid (Right Side) - 60% */}
        <div className="w-[60%] flex flex-col bg-slate-100 dark:bg-slate-900 shadow-inner overflow-hidden transition-colors duration-300">
          <div className="h-11 bg-slate-200 dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 transition-colors duration-300">
             <span className="text-sm font-black uppercase text-slate-800 dark:text-slate-100 tracking-wider">
               {t('quick_products')}
             </span>
             <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
               {quickProducts.length} {t('items')}
             </span>          </div>
          <div className="flex-1 p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 content-start gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
             {quickProducts.map(p => (
               <button 
                 key={p.id}
                 onClick={() => handleProductClick(p)}
                 className="aspect-square bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-xl transition-all flex flex-col p-1.5 active:scale-95 group relative overflow-hidden"
               >
                 <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-1 overflow-hidden border border-slate-100 dark:border-slate-700 flex items-center justify-center relative">
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-slate-50 dark:bg-slate-900/45">
                        {p.id.startsWith('m') && <span className="text-4xl">🥛</span>}
                        {p.id.startsWith('b') && <span className="text-4xl">🥖</span>}
                        {p.id.startsWith('e') && <span className="text-4xl">🥚</span>}
                        {p.id.startsWith('fv') && <span className="text-4xl">🥬</span>}
                        {p.id.startsWith('w') && <span className="text-4xl">💧</span>}
                        {p.id.startsWith('s') && <span className="text-4xl">🍬</span>}
                        {p.id.startsWith('o') && <span className="text-4xl">🛢️</span>}
                        {p.id.startsWith('h') && <span className="text-4xl">🍰</span>}
                        {p.id.startsWith('ch') && <span className="text-4xl">🧀</span>}
                        {!['m', 'b', 'e', 'fv', 'w', 's', 'o', 'h', 'ch'].some(prefix => p.id.startsWith(prefix)) && (
                          <span className="text-4xl">🛒</span>
                        )}
                      </div>
                    )}
                    
                    {p.unit && (
                      <div className="absolute bottom-1 right-1 bg-slate-800/80 dark:bg-slate-950/80 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase backdrop-blur-sm">
                        {p.unit}
                      </div>
                    )}
                 </div>
                 <div className="w-full shrink-0">
                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 h-6 leading-tight uppercase line-clamp-2 text-center tracking-tighter transition-colors duration-300 font-sans w-full block">
                       {p.name}
                    </span>
                 </div>
               </button>
             ))}
          </div>

          <div className="h-12 bg-slate-900 dark:bg-black flex items-center px-4 justify-between border-t-2 border-blue-500 shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-3">
               <span className="bg-blue-600 text-white px-4 py-1.5 font-digital text-lg font-black border-2 border-blue-500 rounded-lg shadow-lg shadow-blue-900/50 animate-pulse tracking-widest text-center min-w-[100px]">
                 {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
               </span>
               <div className="flex flex-col -space-y-1">
                 <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{t('server_loc')}</span>
                 <span className="text-[9px] text-green-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> {t('synchronized')}
                 </span>
               </div>
            </div>
            <div className="flex gap-2">
              <button className="px-5 py-1.5 bg-slate-800 dark:bg-slate-900 border-2 border-slate-700 dark:border-slate-800 text-white text-[10px] font-black uppercase rounded hover:bg-slate-700 dark:hover:bg-slate-800 transition-colors shadow-lg active:scale-95 border-b-4 border-slate-900 dark:border-black">{t('help')} (?)</button>
              <button className="px-5 py-1.5 bg-blue-600 border-2 border-blue-700 text-white text-[10px] font-black uppercase rounded hover:bg-blue-500 transition-colors shadow-lg active:scale-95 border-b-4 border-blue-800">{t('trace')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="h-20 shrink-0 bg-slate-200 dark:bg-slate-950 border-t-4 border-slate-400 dark:border-slate-800 p-1.5 grid grid-cols-6 gap-1.5 transition-colors duration-300">
        <ActionButton 
          color="bg-red-600" 
          label={t('cancel')} 
          sub="Ctrl+S" 
          icon={Trash2} 
          onClick={clearCart} 
          textColor="text-white" 
          className="border-red-700" 
        />
        <ActionButton color="bg-slate-300 dark:bg-slate-800" label={t('ticket_recall')} sub="Ctrl+R" icon={History} onClick={() => setShowSalesHistoryModal(true)} textColor="text-slate-800 dark:text-slate-200" />
        <ActionButton 
          color="bg-green-600" 
          label={`${t('validate')} (${t('print')})`} 
          sub="F10" 
          onClick={initiateCheckout}
          textColor="text-white" 
          className="col-span-1 shadow-md"
        />
        
        {/* Row 2 Extras */}
        <ActionButton color="bg-blue-400" label={t('cash_movement')} sub="Ctrl+K" icon={ArrowLeftRight} textColor="text-white" />
        <ActionButton color="bg-orange-500" label={t('credit')} sub="F4" icon={Users} onClick={handleCreditSale} textColor="text-white" />
        <ActionButton 
          color="bg-red-700" 
          label={t('close')} 
          sub="ESC" 
          onClick={() => {}} 
          textColor="text-white font-black" 
          className="border-red-900 shadow-xl"
        />
      </div>

      <AnimatePresence>
        {selectedProductForManual && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-sm overflow-hidden flex flex-col border-8 border-slate-900 dark:border-black transition-colors"
            >
              <div className="bg-slate-900 dark:bg-black p-4 text-white flex justify-between items-center border-b-2 border-blue-500 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-2xl shadow-lg shadow-blue-900/50">
                    ⚖️
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{t('manual_entry')}</span>
                    <span className="text-sm font-black uppercase leading-tight line-clamp-1">{selectedProductForManual.name}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProductForManual(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 transition-colors">
                <div className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-black rounded-2xl p-4 shadow-inner mb-6 flex flex-col items-center transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('weight')} / {t('quantity')}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black font-digital text-slate-900 dark:text-slate-100 tabular-nums transition-colors">
                      {manualValue || '0'}
                    </span>
                    <span className="text-2xl font-black text-slate-400 uppercase">{selectedProductForManual.unit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map(btn => (
                    <button
                      key={btn.toString()}
                      onClick={() => nmpadPress(btn.toString())}
                      className={cn(
                        "h-16 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg active:scale-95 transition-all border-b-4",
                        btn === 'C' ? "bg-red-500 border-red-700 text-white" : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white"
                      )}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleManualSubmit}
                  className="w-full mt-4 h-16 bg-blue-600 border-b-4 border-blue-800 rounded-2xl text-white text-xl font-black uppercase shadow-xl hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={24} />
                  {t('confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      <SalesHistoryModal
        isOpen={showSalesHistoryModal}
        onClose={() => setShowSalesHistoryModal(false)}
        sales={sales}
        onSelectSale={(sale) => setShowReceipt(sale)}
      />

      {/* Credit Modal */}
      <AnimatePresence>
        {showCreditModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-8 border-orange-500 transition-colors"
            >
              <div className="bg-orange-500 p-4 text-white flex justify-between items-center transition-colors">
                <div className="flex items-center gap-3">
                   <Users size={24} />
                   <span className="font-black uppercase tracking-widest">{t('credit')}</span>
                </div>
                <button onClick={() => setShowCreditModal(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('customer_name')}</label>
                  <input 
                    type="text" 
                    autoFocus
                    value={creditCustomerName}
                    onChange={(e) => setCreditCustomerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitCreditSale()}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-orange-500 transition-all font-sans"
                    placeholder="Ex: Mohamed Amine"
                  />
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-xl border border-orange-100 dark:border-orange-900 flex items-center justify-between transition-colors">
                   <span className="text-[10px] font-black text-orange-400 uppercase">Montant total</span>
                   <span className="text-xl font-black text-orange-700 dark:text-orange-400 font-digital">{formatCurrency(total, i18n.language)}</span>
                </div>
                <button 
                  onClick={submitCreditSale}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 uppercase text-lg tracking-tight"
                >
                  {t('validate')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButton = ({ 
  color, 
  label, 
  sub, 
  icon: Icon, 
  onClick, 
  className,
  textColor = "text-slate-800 dark:text-slate-100"
}: { 
  color: string, 
  label: string, 
  sub: string, 
  icon?: any, 
  onClick?: () => void, 
  className?: string,
  textColor?: string
}) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center border border-slate-500 dark:border-slate-600 hover:brightness-110 active:brightness-90 active:scale-95 transition-all shadow-sm rounded-sm p-1.5",
      color,
      className
    )}
  >
    <div className="flex items-center gap-2">
      {Icon && <Icon size={20} className={textColor} />}
      <span className={cn("text-sm font-black uppercase leading-[1.1] text-center px-0.5 tracking-tighter transition-colors", textColor)}>{label}</span>
    </div>
    <span className={cn("text-[11px] opacity-80 font-bold mt-0.5 transition-colors", textColor)}>{sub}</span>
  </button>
);
