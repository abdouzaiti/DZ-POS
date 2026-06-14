import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Users, 
  ShoppingBag, 
  Calendar,
  ChevronRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { useProducts } from '../contexts/ProductsContext';
import { motion } from 'motion/react';

export const DashboardView = () => {
  const { t, i18n } = useTranslation();
  const { products } = useProducts();
  
  const lowStockCount = products.filter(p => p.stock < 10).length;
  
  // Read actual sales from localStorage
  const sales = useMemo(() => {
    const stored = localStorage.getItem('propos_sales');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  }, []);

  // Filter sales completed today
  const todaySales = useMemo(() => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    return sales.filter((s: any) => {
      const d = new Date(s.date);
      return d.getFullYear() === todayYear &&
             d.getMonth() === todayMonth &&
             d.getDate() === todayDate;
    });
  }, [sales]);

  // Compute stats today
  const totalSalesToday = useMemo(() => {
    return todaySales.reduce((sum: number, s: any) => sum + s.total, 0);
  }, [todaySales]);

  const totalTransactionsToday = todaySales.length;
  const totalCustomersToday = todaySales.length; // Each transaction on POS counts as one client checkout today

  const stats = [
    { label: t('sales_today'), value: formatCurrency(totalSalesToday, i18n.language), icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: t('transactions'), value: totalTransactionsToday.toString(), icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t('low_stock'), value: lowStockCount.toString(), icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: t('new_customers'), value: totalCustomersToday.toString(), icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  // Group today's sales into hourly ranges for chart
  const hourlyData = useMemo(() => {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const dataMap: Record<string, number> = {
      '08:00': 0,
      '10:00': 0,
      '12:00': 0,
      '14:00': 0,
      '16:00': 0,
      '18:00': 0,
      '20:00': 0,
    };

    todaySales.forEach((s: any) => {
      const d = new Date(s.date);
      const hour = d.getHours();
      
      if (hour < 9) {
        dataMap['08:00'] += s.total;
      } else if (hour < 11) {
        dataMap['10:00'] += s.total;
      } else if (hour < 13) {
        dataMap['12:00'] += s.total;
      } else if (hour < 15) {
        dataMap['14:00'] += s.total;
      } else if (hour < 17) {
        dataMap['16:00'] += s.total;
      } else if (hour < 19) {
        dataMap['18:00'] += s.total;
      } else {
        dataMap['20:00'] += s.total;
      }
    });

    return hours.map(h => ({
      name: h,
      total: dataMap[h] || 0
    }));
  }, [todaySales]);

  // Aggregate top products from completed sales
  const dynamicBestSellers = useMemo(() => {
    const counts: Record<string, { sales: number; value: number }> = {};
    
    sales.forEach((s: any) => {
      s.items?.forEach((item: any) => {
        if (!counts[item.name]) {
          counts[item.name] = { sales: 0, value: 0 };
        }
        counts[item.name].sales += item.quantity || 1;
        counts[item.name].value += (item.price * (item.quantity || 1));
      });
    });

    const sorted = Object.entries(counts)
      .map(([name, data]) => ({
        name,
        sales: Math.round(data.sales * 10) / 10,
        value: data.value,
        color: '#2563eb'
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);

    if (sorted.length === 0) {
      return [
        { name: 'Selecto 1.5L', sales: 0, value: 0, color: '#2563eb' },
        { name: 'Eau Ifri 1.5L', sales: 0, value: 0, color: '#3b82f6' },
      ];
    }
    return sorted;
  }, [sales]);

  const maxBestSellerQty = useMemo(() => {
    return Math.max(...dynamicBestSellers.map(i => i.sales), 1);
  }, [dynamicBestSellers]);

  const todayString = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString(i18n.language && i18n.language.startsWith('ar') ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });
  }, [i18n.language]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{t('day_overview')}</h2>
          <p className="text-slate-500 font-bold flex items-center gap-2">
            <Calendar size={16} />
            {t('last_update', { time: todayString })}
          </p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center gap-2">
          {t('generate_report')} <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:scale-[1.02] transition-transform">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-96 flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 dark:text-slate-100">
              <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
              {t('revenue_by_hour')}
            </h3>
            <select className="bg-slate-100 dark:bg-slate-800 dark:text-slate-200 border-none rounded-lg px-3 py-1 font-bold text-xs uppercase cursor-pointer">
              <option>{t('today')}</option>
              <option>{t('yesterday')}</option>
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-96 transition-colors duration-300">
          <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 mb-6 dark:text-slate-100">
            <ShoppingBag size={20} className="text-blue-600 dark:text-blue-400" />
            {t('top_products')}
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {dynamicBestSellers.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-bold text-sm dark:text-slate-300 truncate">{item.name}</span>
                    <span className="font-black text-xs text-blue-600 dark:text-blue-400">{item.sales} {t('items')}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.sales / maxBestSellerQty) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 border-2 border-slate-100 dark:border-slate-800 text-slate-500 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase text-xs">
            {t('view_all_products')}
          </button>
        </div>
      </div>

      {/* Recent Alerts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 mb-4 text-orange-600">
            <AlertTriangle size={20} />
            {t('low_stock_alerts')}
          </h3>
          <div className="space-y-2">
            {products.filter(p => p.stock < 10).slice(0, 4).length > 0 ? (
              products.filter(p => p.stock < 10).slice(0, 4).map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                      {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="text-slate-300" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-red-600">{p.stock} {t('items')}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t('reorder')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 font-medium italic text-sm">
                Tous les niveaux de stock sont normaux !
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 mb-4">
            <Clock size={20} className="text-blue-600" />
            {t('recent_sales')}
          </h3>
          <div className="space-y-2">
            {sales.slice(0, 4).length > 0 ? (
              sales.slice(0, 4).map((sale, idx) => (
                <div key={sale.id} className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors rounded-lg cursor-pointer">
                  <div>
                    <p className="font-bold text-sm dark:text-white">#{sale.id || sale.sequentialId}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {new Date(sale.date).toLocaleTimeString(i18n.language && i18n.language.startsWith('ar') ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })} • {sale.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 dark:text-white">{formatCurrency(sale.total, i18n.language)}</p>
                    <p className="text-[10px] text-green-600 font-bold uppercase">{t('paid')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 font-medium italic text-sm">
                Aucune vente récente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
