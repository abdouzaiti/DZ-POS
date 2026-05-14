import React, { useState } from 'react';
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
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { MOCK_PRODUCTS } from '../mockData';
import { motion } from 'motion/react';

const data = [
  { name: '08:00', total: 12000 },
  { name: '10:00', total: 45000 },
  { name: '12:00', total: 85000 },
  { name: '14:00', total: 65000 },
  { name: '16:00', total: 95000 },
  { name: '18:00', total: 145000 },
  { name: '20:00', total: 82000 },
];

const bestSellers = [
  { name: 'Selecto 1.5L', sales: 120, value: 15600, color: '#2563eb' },
  { name: 'Eau Ifri 1.5L', sales: 95, value: 3800, color: '#3b82f6' },
  { name: 'Mama Couscous', sales: 78, value: 14040, color: '#60a5fa' },
  { name: 'Dates Deglet', sales: 45, value: 29250, color: '#93c5fd' },
];

export const DashboardView = () => {
  const { t, i18n } = useTranslation();
  
  const stats = [
    { label: t('sales_today'), value: '450,000 DZD', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t('transactions'), value: '1,240', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('low_stock'), value: '12', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: t('new_customers'), value: '24', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{t('day_overview')}</h2>
          <p className="text-slate-500 font-bold flex items-center gap-2">
            <Calendar size={16} />
            {t('last_update', { time: '20:45' })}
          </p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center gap-2">
          {t('generate_report')} <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:scale-[1.02] transition-transform">
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden h-96 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              {t('revenue_by_hour')}
            </h3>
            <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1 font-bold text-xs uppercase cursor-pointer">
              <option>{t('today')}</option>
              <option>{t('yesterday')}</option>
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
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
                  tickFormatter={(val) => `${val/1000}k`}
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm flex flex-col h-96">
          <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 mb-6">
            <ShoppingBag size={20} className="text-blue-600" />
            {t('top_products')}
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {bestSellers.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-bold text-sm truncate">{item.name}</span>
                    <span className="font-black text-xs text-blue-600">{item.sales} {t('items')}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.sales / 120) * 100}%` }}
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
          <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 mb-4 text-orange-600">
            <AlertTriangle size={20} />
            {t('low_stock_alerts')}
          </h3>
          <div className="space-y-2">
            {MOCK_PRODUCTS.slice(0, 4).map((p, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border-b dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{p.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-red-600">{p.stock} {t('items')}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t('reorder')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
          <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 mb-4">
            <Clock size={20} className="text-blue-600" />
            {t('recent_sales')}
          </h3>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((_, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 transition-colors rounded-lg cursor-pointer">
                <div>
                  <p className="font-bold text-sm">#TX-54{idx}32</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">20:4{4-idx} • Noureddine</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800 dark:text-white">{formatCurrency(450 * (idx + 1), i18n.language)}</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase">{t('paid')} • {t('cash')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
