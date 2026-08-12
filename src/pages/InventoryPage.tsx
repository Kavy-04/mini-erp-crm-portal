import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StockMovement, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Plus,
  Minus,
  Clock,
  User,
  AlertTriangle,
  History
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('All');
  const [movementTypeFilter, setMovementTypeFilter] = useState('All');

  // Manual Stock Modal
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({
    productId: '',
    quantity: 10,
    movementType: 'IN' as 'IN' | 'OUT',
    reason: 'Routine Warehouse Restock'
  });

  const { hasRole } = useAuth();
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [movesData, prodsData] = await Promise.all([
        api.getStockMovements(search, selectedProductFilter, movementTypeFilter),
        api.getProducts()
      ]);
      setMovements(movesData);
      setProducts(prodsData);

      if (prodsData.length > 0 && !adjForm.productId) {
        setAdjForm(prev => ({ ...prev, productId: prodsData[0].id }));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedProductFilter, movementTypeFilter]);

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adjForm.productId || !adjForm.quantity || !adjForm.reason) {
      showToast('Product, Quantity, and Reason are required.', 'error');
      return;
    }

    try {
      await api.createStockMovement({
        productId: adjForm.productId,
        quantity: Number(adjForm.quantity),
        movementType: adjForm.movementType,
        reason: adjForm.reason.trim()
      });
      showToast('Stock movement logged & product inventory updated successfully', 'success');
      setIsAdjustmentModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to log stock movement', 'error');
    }
  };

  const totalStockCount = products.reduce((sum, p) => sum + p.currentStock, 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.minStockAlert).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Stock Inventory & Movements Audit Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Track warehouse stock inward/outward history and manual adjustments</p>
        </div>
        {hasRole(['Admin', 'Warehouse']) && (
          <button
            id="log-stock-movement-button"
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Manual Stock Adjustment
          </button>
        )}
      </div>

      {/* Top Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warehouse Stock</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalStockCount.toLocaleString()} units</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{lowStockCount} products</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Log Audit Entries</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{movements.length} records</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="inventory-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search movement log by product, SKU, reason, or staff member..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="inventory-product-filter"
            value={selectedProductFilter}
            onChange={e => setSelectedProductFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium max-w-[180px] truncate"
          >
            <option value="All">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            id="inventory-type-filter"
            value={movementTypeFilter}
            onChange={e => setMovementTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="All">All Movements (IN/OUT)</option>
            <option value="IN">IN (Stock Added)</option>
            <option value="OUT">OUT (Stock Reduced)</option>
          </select>
        </div>
      </div>

      {/* Stock Movements History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Qty Changed</th>
                <th className="py-3 px-4">Reason / Reference</th>
                <th className="py-3 px-4">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading stock movements audit log...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No stock movements recorded.
                  </td>
                </tr>
              ) : (
                movements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(m.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.productName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{m.productSku}</td>
                    <td className="py-3 px-4">
                      {m.movementType === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <ArrowUpRight className="w-3.5 h-3.5" /> OUT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.quantityChanged} units</td>
                    <td className="py-3 px-4 text-slate-700">{m.reason}</td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">{m.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Record Stock Adjustment Movement"
        subtitle="Log inward stock receiving or outward stock reduction"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAdjustment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Product *
            </label>
            <select
              value={adjForm.productId}
              onChange={e => setAdjForm({ ...adjForm, productId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Movement Type *
              </label>
              <select
                value={adjForm.movementType}
                onChange={e => setAdjForm({ ...adjForm, movementType: e.target.value as 'IN' | 'OUT' })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="IN">IN (Stock Added)</option>
                <option value="OUT">OUT (Stock Reduced)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={adjForm.quantity}
                onChange={e => setAdjForm({ ...adjForm, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Explanation *
            </label>
            <input
              type="text"
              value={adjForm.reason}
              onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })}
              placeholder="e.g. Factory shipment receipt, damaged goods removal..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdjustmentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30"
            >
              Submit Movement Log
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
