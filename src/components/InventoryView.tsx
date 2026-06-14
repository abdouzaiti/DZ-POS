import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Package,
  X,
  RefreshCw,
  Coins,
  Percent
} from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import { Category, Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';

export const InventoryView = () => {
  const { t, i18n } = useTranslation();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const isRtl = i18n.language && i18n.language.startsWith('ar');

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<Category>(Category.GROCERY);
  const [price, setPrice] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [unit, setUnit] = useState<"unit" | "kg" | "g" | "plate">('unit');
  const [isQuick, setIsQuick] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const query = search.toLowerCase();
      return p.name.toLowerCase().includes(query) || 
             (p.barcode && p.barcode.includes(query)) || 
             t(p.category).toLowerCase().includes(query);
    });
  }, [search, products, t]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, startIndex]);

  const paginationStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const paginationEnd = Math.min(filteredProducts.length, startIndex + ITEMS_PER_PAGE);

  // Open modal in "Add" mode
  const handleAddClick = () => {
    setEditingProduct(null);
    setName('');
    setBarcode('');
    setCategory(Category.GROCERY);
    setPrice('');
    setPurchasePrice('');
    setStock('');
    setUnit('unit');
    setIsQuick(false);
    setIsModalOpen(true);
  };

  // Open modal in "Edit" mode
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBarcode(product.barcode || '');
    setCategory(product.category);
    setPrice(product.price.toString());
    setPurchasePrice(product.purchasePrice ? product.purchasePrice.toString() : '');
    setStock(product.stock.toString());
    setUnit(product.unit || 'unit');
    setIsQuick(!!product.isQuick);
    setIsModalOpen(true);
  };

  // Handle Barcode Generation
  const handleGenerateBarcode = () => {
    const prefix = '613'; // Standard Algerian barcode start just for display
    const rand = Math.floor(1000000 + Math.random() * 9000000).toString();
    setBarcode(prefix + rand);
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = parseFloat(price) || 0;
    const parsedPurchasePrice = parseFloat(purchasePrice) || 0;
    const parsedStock = parseFloat(stock) || 0;

    const imgFallback = category === Category.DRINKS ? '/drink.png' :
                        category === Category.DAIRY ? '/milk.png' :
                        category === Category.BAKERY ? '/baguette.png' :
                        '/package.png';

    const productData = {
      name: name.trim(),
      barcode: barcode.trim(),
      category,
      price: parsedPrice,
      purchasePrice: parsedPurchasePrice,
      stock: parsedStock,
      unit,
      isQuick,
      image: editingProduct?.image || imgFallback
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteProduct(id);
    setDeletingId(null);
  };

  return (
    <div className="p-6 flex flex-col h-full gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-3">
          <Package className="text-blue-600 animate-pulse" size={32} />
          {isRtl ? 'إدارة المخزون والسلع' : t('inventory_management')}
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleAddClick}
            className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase text-sm cursor-pointer border-2 border-blue-600 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} /> {isRtl ? 'إضافة منتج جديد' : t('add_product')}
          </button>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex gap-3 shrink-0">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={isRtl ? 'ابحث باسم المنتج، الكودبار أو الفئة...' : t('search_placeholder_inventory')}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/45 focus:outline-none font-bold placeholder:text-slate-400 dark:text-white transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-300">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-6">{isRtl ? 'المنتج' : t('product')}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isRtl ? 'الفئة' : t('category')}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">{isRtl ? 'سعر الشراء' : 'P. Achat'}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">{isRtl ? 'سعر البيع' : 'P. Vente'}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">{isRtl ? 'الفائدة' : 'Marge'}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">{isRtl ? 'المخزون' : t('stock')}</th>
                <th className="p-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">{isRtl ? 'العمليات' : t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {paginatedProducts.map((product) => {
                const marginVal = product.price - (product.purchasePrice || 0);
                const isMarginLow = marginVal <= 0;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                          {product.image ? (
                            <img src={product.image} className="w-full h-full object-cover" onError={(e) => {
                              (e.target as HTMLImageElement).src = '/package.png';
                            }} />
                          ) : (
                            <Package className="text-slate-400" size={18} />
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden max-w-[200px] sm:max-w-none">
                          <span className="text-sm text-slate-800 dark:text-slate-200 truncate">{product.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-tighter uppercase font-mono">{product.barcode || (isRtl ? 'لا يوجد كودبار' : 'Sans Codebarre')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] uppercase font-black">
                        {t(product.category)}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                      {formatCurrency(product.purchasePrice || 0, i18n.language)}
                    </td>
                    <td className="p-4 text-right font-mono text-sm text-slate-800 dark:text-slate-200 font-black">
                      {formatCurrency(product.price, i18n.language)}
                    </td>
                    <td className={cn(
                      "p-4 text-right font-mono text-xs",
                      isMarginLow ? "text-red-500" : "text-green-600 dark:text-green-400"
                    )}>
                      {formatCurrency(marginVal, i18n.language)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "text-xs font-black",
                          product.stock < 10 ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-slate-200"
                        )}>
                          {product.stock} <span className="text-[10px] font-bold text-slate-400">({product.unit || 'unit'})</span>
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
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all cursor-pointer"
                          title={isRtl ? 'تعديل' : 'Modifier'}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingId(product.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all cursor-pointer"
                          title={isRtl ? 'حذف' : 'Supprimer'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4 mt-2">
        <p className="text-xs font-bold text-slate-500 uppercase">
          {t('showing_pagination', { start: paginationStart, end: paginationEnd, total: filteredProducts.length })}
        </p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 border-2 border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-45 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none py-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all font-black text-xs cursor-pointer",
                    currentPage === pageNum 
                      ? "bg-blue-600 text-white shadow" 
                      : "border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
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
            className="p-2 border-2 border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-45 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 transition-all flex flex-col my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-150 dark:border-slate-800 shrink-0">
              <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Package className="text-blue-500" size={20} />
                {editingProduct 
                  ? (isRtl ? 'تعديل بيانات منتج' : 'Modifier Produit') 
                  : (isRtl ? 'إضافة منتج جديد للمحل' : 'Ajouter Nouveau Produit')
                }
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  {isRtl ? 'اسم المنتج / التسمية' : 'Nom de l\'article'} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder={isRtl ? 'مثال: قهوة بونال 250غ' : 'Ex: Café Bonal 250g'}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-blue-500 focus:outline-none dark:text-white font-bold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Barcode & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex justify-between">
                    <span>{isRtl ? 'الكود بار (الرمز الشريطي)' : 'Code à barres'}</span>
                    <button 
                      type="button" 
                      onClick={handleGenerateBarcode}
                      className="text-blue-600 dark:text-blue-400 font-extrabold text-[10px] hover:underline flex items-center gap-0.5 cursor-pointer tab-index-[-1]"
                    >
                      <RefreshCw size={10} /> {isRtl ? 'توليد تلقائي' : 'Générer'}
                    </button>
                  </label>
                  <input 
                    type="text" 
                    placeholder={isRtl ? 'مسح أو كتابة الكود بار' : 'Scanner ou saisir'}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-blue-500 focus:outline-none dark:text-white font-mono font-bold text-xs"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isRtl ? 'الفئة / نوع السلعة' : 'Catégorie'}
                  </label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                  >
                    {Object.values(Category).map((cat) => (
                      <option key={cat} value={cat}>{t(cat)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purchase Price & Selling Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <Coins size={12} />
                    {isRtl ? 'سعر الشراء (DZD)' : 'Prix d\'achat (DA)'}
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-blue-500 focus:outline-none dark:text-white font-mono font-black"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                    <Percent size={12} />
                    {isRtl ? 'سعر البيع (DZD)' : 'Prix de vente (DA)'}
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-blue-500 focus:outline-none dark:text-white font-mono font-black"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Stock Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isRtl ? 'الكمية الأولية بالمخزون' : 'Quantité de départ'}
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-blue-500 focus:outline-none dark:text-white font-mono font-bold"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isRtl ? 'وحدة القياس' : 'Unité de mesure'}
                  </label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                  >
                    <option value="unit">{isRtl ? 'بالوحدة (Unité)' : 'Unité (Pièce)'}</option>
                    <option value="kg">{isRtl ? 'الكيلوغرام (Kg)' : 'Kilogramme (Kg)'}</option>
                    <option value="g">{isRtl ? 'الغرام (G)' : 'Gramme (g)'}</option>
                    <option value="plate">{isRtl ? 'صفيحة (Plateau)' : 'Plateau (Plate)'}</option>
                  </select>
                </div>
              </div>

              {/* Is Quick Selling / Fast Select */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl transition-all">
                <input 
                  type="checkbox" 
                  id="isQuickFlag"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  checked={isQuick}
                  onChange={(e) => setIsQuick(e.target.checked)}
                />
                <label htmlFor="isQuickFlag" className="text-xs font-black text-slate-700 dark:text-slate-350 select-none cursor-pointer">
                  {isRtl 
                    ? 'إضافة للبيع السريع بالكيبورد والشاشة (Produit rapide)' 
                    : 'Garder dans la section de ventes rapides (Clavier/Mosaïque)'
                  }
                </label>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border-2 border-slate-150 dark:border-slate-800 text-slate-500 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 transition-all uppercase text-xs cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md transition-all uppercase text-xs cursor-pointer scale-100 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isRtl ? 'حفظ التغييرات' : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-sm">
            <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2 uppercase tracking-wide">
              {isRtl ? 'تأكيد حذف السلعة؟' : 'Confirmer la suppression'}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-6">
              {isRtl 
                ? 'هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من قاعدة بيانات المحل؟' 
                : 'Êtes-vous sûr de vouloir supprimer définitivement cet article du stock ? Cette action est irréversible.'
              }
            </p>
            <div className="flex justify-end gap-2.5">
              <button 
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors cursor-pointer"
              >
                {isRtl ? 'تراجع' : 'Annuler'}
              </button>
              <button 
                onClick={() => handleDeleteConfirm(deletingId)}
                className="px-4 py-2 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 text-xs transition-colors cursor-pointer"
              >
                {isRtl ? 'نعم، احذف' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
