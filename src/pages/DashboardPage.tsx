import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../services/api';
import { DashboardStats, SalesChallan, Product } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  Users,
  Package,
  Boxes,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Plus,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<
    (DashboardStats & { recentChallans: SalesChallan[]; lowStockProducts: Product[]; recentFollowUps: any[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Operational Intelligence...</p>
        </div>
      </div>
    );
  }

  const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Operations Overview</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Real-time metric monitoring, stock alerts, and recent sales activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            to="/challans/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-blue-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Sales Challan
          </Link>
        </div>
      </div>

      {/* 5 Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          subtext="Active CRM accounts"
          icon={Users}
          variant="blue"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtext="Catalog items"
          icon={Package}
          variant="emerald"
        />
        <StatCard
          title="Total Stock"
          value={stats.totalStock.toLocaleString()}
          subtext="Units across warehouses"
          icon={Boxes}
          variant="slate"
        />
        <StatCard
          title="Pending Challans"
          value={stats.pendingChallans}
          subtext="Draft sales orders"
          icon={FileSpreadsheet}
          variant="amber"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          subtext="Needs reorder alert"
          icon={AlertTriangle}
          variant="rose"
        />
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Monthly Revenue & Sales Volume
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1">Dispatched sales challan values (in ₹)</p>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200">
              +18.4% YoY
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Sales Volume']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Stock Distribution Pie / Dark Criticality Panel */}
        <div className="bg-[#1E293B] rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">
              Stock Category Share
            </h3>
            <p className="text-xs font-semibold text-slate-400">Unit breakdown by product category</p>
            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryStock}
                    dataKey="stock"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {stats.categoryStock.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} units`, 'Stock']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-700">
            {stats.categoryStock.slice(0, 3).map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300 font-bold">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  {cat.category}
                </span>
                <span className="font-black text-white">{cat.stock} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Challans & Low Stock Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Challans Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Recent Sales Challans</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Latest customer dispatch orders</p>
            </div>
            <Link
              to="/challans"
              className="text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Challan No</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats.recentChallans.map(ch => (
                  <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-blue-600">{ch.challanNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{ch.customerBusiness}</div>
                      <div className="text-[10px] font-semibold text-slate-400">{ch.customerName}</div>
                    </td>
                    <td className="py-3 px-3 font-black text-slate-800">₹{ch.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          ch.status === 'Confirmed' ? 'emerald' : ch.status === 'Draft' ? 'amber' : 'rose'
                        }
                      >
                        {ch.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products Warning Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Low Stock Alert Items
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Products below minimum alert threshold</p>
            </div>
            <Link
              to="/products?lowStockOnly=true"
              className="text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Manage Stock <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50 text-rose-900 font-black uppercase text-[10px] tracking-wider border-y border-rose-100">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Min Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats.lowStockProducts.map(p => (
                  <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] font-bold">{p.sku}</td>
                    <td className="py-3 px-3">
                      <span className="font-black text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded text-[10px] uppercase">
                        {p.currentStock} units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-bold">{p.minStockAlert} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Follow-ups Timeline Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              Recent CRM Customer Follow-Ups
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Logs recorded by sales team</p>
          </div>
          <Link to="/customers" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Open CRM Module
          </Link>
        </div>

        <div className="space-y-3">
          {stats.recentFollowUps.map(fu => (
            <div
              key={fu.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{fu.businessName}</span>
                  <span className="text-[11px] text-slate-500">({fu.customerName})</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 font-medium">{fu.note}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(fu.createdAt).toLocaleDateString()}</span>
                <span>• {fu.createdBy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
