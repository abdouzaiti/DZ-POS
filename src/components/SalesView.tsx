import React, { useState, useMemo } from 'react';
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
import { MOCK_PRODUCTS } from '../mockData';
import { Category, Product } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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

  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  const [selectedProductForManual, setSelectedProductForManual] = useState<Product | null>(null);
  const [manualValue, setManualValue] = useState('');

  const quickProducts = useMemo(() => MOCK_PRODUCTS.filter(p => p.isQuick), []);
  const lastItem = cart.length > 0 ? cart[cart.length - 1] : null;

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.barcode.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleProductClick = (product: Product) => {
    if (product.unit === 'kg' || product.unit === 'g') {
      setSelectedProductForManual(product);
      setManualValue('');
    } else {
      addToCart(product);
    }
  };

  const handleManualSubmit = () => {
    if (selectedProductForManual && manualValue) {
      addToCart(selectedProductForManual, parseFloat(manualValue));
      setSelectedProductForManual(null);
      setManualValue('');
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

  const handleCompleteSale = (method: string) => {
    const sale = completeSale(method);
    if (sale) {
      setShowReceipt(sale);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] overflow-hidden select-none">
      {/* Receipt Modal (Unchanged) */}
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-900 p-8 rounded-none shadow-2xl w-full max-w-[400px] font-mono relative"
            >
              <button 
                onClick={() => setShowReceipt(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"
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
                <span>{showReceipt.total.toFixed(0)} DA</span>
              </div>

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
      <div className="h-32 bg-white border-b-4 border-slate-300 grid grid-cols-12 shrink-0 shadow-md">
        <div className="col-span-3 p-3 flex flex-col justify-between border-e-2 border-slate-200">
          <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase font-digital">
            <span>{t('ticket')}: {(sales.length + 1).toString().padStart(5, '0')}</span>
            <span>{t('pos_id')}: 01</span>
          </div>
          <div className="mt-1">
            <p className="text-[9px] font-black text-white px-1.5 py-0.5 bg-slate-500 uppercase tracking-widest w-fit rounded">
              {t('last_item')}
            </p>
            <h2 className="text-xs font-black text-slate-800 uppercase truncate tracking-tighter mt-0.5">
              {lastItem ? lastItem.name : "---"}
            </h2>
          </div>
        </div>

        <div className="col-span-6 p-1 flex flex-col items-center justify-center bg-white border-x-4 border-slate-200">
          <div className="text-right w-full pr-8">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('total')}</span>
          </div>
          <div className="w-full flex items-center justify-center">
             <span className="text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter tabular-nums font-digital leading-none">
               {total.toFixed(0)} <span className="text-2xl lg:text-3xl text-slate-400 uppercase ms-2 select-none tracking-normal font-sans">DA</span>
             </span>
          </div>
        </div>

        <div className="col-span-3 p-2 flex flex-col justify-between bg-slate-50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black w-24 text-slate-600 uppercase">{t('client')}:</span>
              <input type="text" value={t('guest_customer')} readOnly className="flex-1 bg-white border-2 border-slate-200 px-2 py-0.5 text-xs font-bold shadow-inner" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black w-24 text-slate-600 uppercase">{t('balance')} / R:</span>
              <input type="text" value={`0 DA`} readOnly className="flex-1 bg-white border-2 border-slate-200 px-2 py-0.5 text-xs font-bold text-blue-600 shadow-inner" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black w-24 text-slate-600 uppercase">{t('points')}:</span>
              <input type="text" value="1 450.00" readOnly className="flex-1 bg-white border-2 border-slate-200 px-2 py-0.5 text-xs font-bold shadow-inner" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-white hover:bg-blue-50 text-[10px] font-black py-2 border-2 border-slate-200 rounded shadow-sm transition-colors text-blue-700 uppercase">{t('partial_payment')}</button>
            <button className="flex-1 bg-white hover:bg-blue-50 text-[10px] font-black py-2 border-2 border-slate-200 rounded shadow-sm transition-colors text-blue-700 uppercase">{t('discount')} (Ctrl+R)</button>
          </div>
        </div>
      </div>

      {/* MIDDLE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ticket List (Left Side) - 40% */}
        <div className="w-[40%] flex flex-col border-e-4 border-slate-200 bg-white shadow-lg z-10">
           {/* Mini Toolbar */}
           <div className="h-10 bg-slate-100 border-b-2 border-slate-200 flex items-center px-1.5 gap-1 shadow-sm">
              <button className="flex-1 h-7 bg-white border-2 border-slate-300 text-[9px] font-black text-slate-700 rounded hover:bg-slate-50 active:scale-95 transition-all shadow-sm uppercase">QTY (F1)</button>
              <button className="flex-1 h-7 bg-white border-2 border-slate-300 text-[9px] font-black text-slate-700 rounded hover:bg-slate-50 active:scale-95 transition-all shadow-sm uppercase">P.U (F2)</button>
              <button className="flex-1 h-7 bg-red-600 border-2 border-red-700 text-white text-[9px] font-black rounded hover:bg-red-700 active:scale-95 transition-all shadow-md uppercase">{t('cancel')}</button>
              <button className="flex-1 h-7 bg-white border-2 border-slate-300 text-[9px] font-black text-slate-700 rounded hover:bg-slate-50 active:scale-95 transition-all shadow-sm uppercase flex items-center justify-center gap-1">
                <Search size={10}/> 
                FIND
              </button>
           </div>

           <div className="flex-1 overflow-y-auto bg-slate-50/10">
             <table className="w-full text-left border-collapse table-fixed">
               <thead className="bg-[#e2e8f0] sticky top-0 z-10 border-b-2 border-slate-300">
                 <tr className="text-[10px] font-black uppercase text-slate-700 h-9">
                   <th className="p-2 w-8 text-center">#</th>
                   <th className="p-2">{t('designation')}</th>
                   <th className="p-2 w-14 text-center">{t('qty')}</th>
                   <th className="p-2 w-20 text-end pe-4">{t('total')}</th>
                 </tr>
               </thead>
               <tbody className="text-sm font-black divide-y divide-slate-100">
                 {cart.map((item, index) => (
                   <tr key={item.id} className={cn("hover:bg-blue-50 transition-colors h-11 cursor-pointer border-s-4 group", index % 2 !== 0 ? "bg-white border-s-transparent" : "bg-slate-50/30 border-s-blue-500")}>
                     <td className="p-2 text-center text-slate-400 font-mono text-[10px]">{index + 1}</td>
                     <td className="p-2">
                        <div className="flex flex-col">
                           <span className="uppercase truncate text-slate-800 tracking-tight text-[11px] leading-tight">{item.name}</span>
                           <span className="text-[9px] text-slate-400 font-digital">{item.price} DA</span>
                        </div>
                     </td>
                     <td className="p-2 text-center text-blue-700 font-digital text-base bg-blue-50/20">{item.quantity}</td>
                     <td className="p-2 text-end font-digital pe-4 text-slate-900 text-lg tracking-tight bg-slate-100/10">{ (item.price * item.quantity).toFixed(0) }</td>
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
                   autoFocus
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

        {/* Quick Access (Middle) - 15% */}
        <div className="w-[15%] bg-slate-200 border-e-2 border-slate-300 overflow-y-auto p-1.5 flex flex-col gap-1.5 shadow-inner scrollbar-none">
           <h3 className="text-[9px] font-black uppercase text-slate-600 text-center mb-0.5 bg-slate-300 py-1 rounded shadow-sm sticky top-0 z-10">{t('quick_products')}</h3>
           <div className="grid grid-cols-1 gap-1.5">
             {quickProducts.map(p => (
               <button 
                 key={p.id}
                 onClick={() => handleProductClick(p)}
                 className="w-full aspect-square bg-white border-2 border-slate-300 rounded-lg shadow-sm flex flex-col items-center justify-center p-1.5 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all group"
               >
                 <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center mb-1 group-hover:bg-blue-50 transition-colors shadow-inner border border-slate-100">
                    {p.id.startsWith('m') && <span className="text-2xl">🥛</span>}
                    {p.id.startsWith('b') && <span className="text-2xl">🥖</span>}
                    {p.id.startsWith('e') && <span className="text-2xl">🥚</span>}
                    {p.id.startsWith('fv') && <span className="text-2xl">🥬</span>}
                    {p.id.startsWith('w') && <span className="text-2xl">💧</span>}
                    {p.id.startsWith('s') && <span className="text-2xl">🍬</span>}
                    {p.id.startsWith('o') && <span className="text-2xl">🛢️</span>}
                    {p.id.startsWith('h') && <span className="text-2xl">🍰</span>}
                    {p.id.startsWith('ch') && <span className="text-2xl">🧀</span>}
                 </div>
                 <span className="text-[8px] font-black text-center leading-[0.8rem] uppercase line-clamp-2 w-full text-slate-700 h-6 overflow-hidden">{p.name}</span>
                 <div className="text-[11px] font-black text-blue-700 mt-0.5 font-digital bg-blue-50 px-2 rounded-full border border-blue-100">{p.price}</div>
               </button>
             ))}
           </div>
        </div>

        {/* Product Grid (Right Side) - 45% */}
        <div className="w-[45%] flex flex-col bg-slate-100 shadow-inner overflow-hidden">
          <div className="h-11 bg-slate-200 border-b border-slate-300 flex overflow-x-auto scrollbar-none items-center px-2 gap-1 shrink-0">
             {['All', ...Object.values(Category)].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat as Category | 'All')}
                  className={cn(
                    "px-4 h-7 text-[10px] font-black uppercase rounded-full border-2 transition-all shrink-0 shadow-sm",
                    activeCategory === cat 
                      ? "bg-blue-600 border-blue-700 text-white shadow-blue-200" 
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                  )}
                >
                  {t(cat)}
                </button>
             ))}
          </div>
          <div className="flex-1 p-2 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-start gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
             {filteredProducts.map(p => (
               <button 
                 key={p.id}
                 onClick={() => handleProductClick(p)}
                 className="aspect-[4/5] bg-white border-2 border-slate-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-xl transition-all flex flex-col p-2 active:scale-95 group relative overflow-hidden"
               >
                 <div className="flex-1 w-full bg-slate-50 rounded-md mb-1.5 overflow-hidden border border-slate-100 flex items-center justify-center relative">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="text-4xl filter grayscale opacity-20 group-hover:opacity-40 transition-opacity">🛒</div>
                    )}
                    {p.unit && (
                      <div className="absolute bottom-1 right-1 bg-slate-800/80 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase backdrop-blur-sm">
                        {p.unit}
                      </div>
                    )}
                 </div>
                 <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-[9px] font-black text-slate-800 h-6 leading-tight uppercase line-clamp-2 text-center tracking-tighter">
                       {p.name}
                    </span>
                    <div className="w-full bg-slate-900 text-yellow-500 text-[13px] font-black rounded py-0.5 font-digital text-center border-t border-slate-700">
                      {p.price}
                    </div>
                 </div>
               </button>
             ))}
          </div>
          
          <div className="h-12 bg-slate-900 flex items-center px-4 justify-between border-t-2 border-blue-500 shrink-0">
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
              <button className="px-5 py-1.5 bg-slate-800 border-2 border-slate-700 text-white text-[10px] font-black uppercase rounded hover:bg-slate-700 transition-colors shadow-lg active:scale-95 border-b-4 border-slate-900">{t('help')} (?)</button>
              <button className="px-5 py-1.5 bg-blue-600 border-2 border-blue-700 text-white text-[10px] font-black uppercase rounded hover:bg-blue-500 transition-colors shadow-lg active:scale-95 border-b-4 border-blue-800">{t('trace')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="h-20 shrink-0 bg-slate-200 border-t-4 border-slate-400 p-1.5 grid grid-cols-8 gap-1.5">
        <ActionButton color="bg-blue-200" label={t('inventory')} sub="F2" icon={Plus} />
        <ActionButton color="bg-red-600" label={t('cancel')} sub="Ctrl+S" icon={Trash2} textColor="text-white" className="border-red-700" />
        <ActionButton color="bg-slate-300" label="Rappel Ticket" sub="Ctrl+R" icon={History} />
        <ActionButton 
          color="bg-green-700" 
          label={`${t('validate')} (${t('without_ticket')})`} 
          sub="F11" 
          onClick={() => handleCompleteSale('Cash')}
          textColor="text-white" 
          className="col-span-1 border-green-800 shadow-[inset_0_4px_10px_rgba(255,255,255,0.3)] ring-4 ring-green-600/30 ring-offset-2"
        />
        
        {/* Row 2 Extras */}
        <ActionButton color="bg-blue-400" label="Mouvement Caisse" sub="Ctrl+K" icon={ArrowLeftRight} textColor="text-white" />
        <ActionButton color="bg-slate-400" label="Entrée" sub="Ctrl+E" icon={ChevronRight} textColor="text-white" />
        <ActionButton color="bg-blue-300" label={t('wait')} sub="F9" icon={Pause} />
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
              className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-sm overflow-hidden flex flex-col border-8 border-slate-900"
            >
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center border-b-2 border-blue-500">
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

              <div className="p-6 bg-slate-50">
                <div className="bg-white border-4 border-slate-900 rounded-2xl p-4 shadow-inner mb-6 flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('weight')} / {t('quantity')}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black font-digital text-slate-900 tabular-nums">
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
                        btn === 'C' ? "bg-red-500 border-red-700 text-white" : "bg-white border-slate-300 text-slate-800"
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
  textColor = "text-slate-800"
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
      "flex flex-col items-center justify-center border border-slate-500 hover:brightness-110 active:brightness-90 active:scale-95 transition-all shadow-sm rounded-sm p-1",
      color,
      className
    )}
  >
    <div className="flex items-center gap-1">
      {Icon && <Icon size={14} className={textColor} />}
      <span className={cn("text-[9px] font-black uppercase leading-tight text-center", textColor)}>{label}</span>
    </div>
    <span className={cn("text-[8px] opacity-70 font-bold", textColor)}>{sub}</span>
  </button>
);
