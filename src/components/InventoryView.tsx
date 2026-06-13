import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Box,
  Package
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import { formatCurrency, cn } from '../lib/utils';

export const InventoryView = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const query = search.toLowerCase();
      return p.name.toLowerCase().includes(query) || 
             p.barcode.includes(query) || 
             t(p.category).toLowerCase().includes(query);
    });
  }, [search, t]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, startIndex]);

  const paginationStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const paginationEnd = Math.min(filteredProducts.length, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="p-6 flex flex-col h-full gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-3">
          <Package size={32} className="text-blue-600" />
          {t('inventory_management')}
        </h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors uppercase text-sm">
            <Download size={18} /> {t('export')}
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg border-2 border-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2 uppercase text-sm">
            <Plus size={18} /> {t('add_product')}
          </button>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex gap-4 shrink-0">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18} />
          <input 
            type="text" 
            placeholder={t('search_placeholder_inventory')}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-4 py-3 bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-xl flex items-center gap-2 text-slate-600 font-bold hover:border-slate-300 transition-all uppercase text-xs">
          <Filter size={18} /> {t('filter')}
        </button>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border-2 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-10">{t('product')}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('category')}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">{t('price')} ({t('dzd')})</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">{t('stock')}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('status')}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 font-bold">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 pl-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border dark:border-slate-700">
                        <img src={product.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-800 dark:text-slate-200">{product.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-tighter uppercase">{product.barcode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs uppercase font-extrabold">
                      {t(product.category)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-black text-slate-700 dark:text-slate-300">
                      {formatCurrency(product.price, i18n.language)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "text-sm font-black",
                        product.stock < 10 ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-slate-200"
                      )}>
                        {product.stock}
                      </span>
                      <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            product.stock < 10 ? "bg-red-500" : "bg-blue-500"
                          )} 
                          style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs uppercase font-black">
                    {product.stock < 10 ? (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <TrendingDown size={14} /> {t('low')}
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <TrendingUp size={14} /> {t('normal')}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center shrink-0">
        <p className="text-sm font-bold text-slate-500 uppercase">
          {t('showing_pagination', { start: paginationStart, end: paginationEnd, total: filteredProducts.length })}
        </p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 border-2 dark:border-slate-800 rounded-xl disabled:opacity-45 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-10 h-10 border-2 rounded-xl transition-all font-black text-sm cursor-pointer",
                    currentPage === pageNum 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg" 
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border-2 dark:border-slate-800 rounded-xl disabled:opacity-45 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
