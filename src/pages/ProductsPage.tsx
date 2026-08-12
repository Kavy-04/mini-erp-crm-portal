import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  AlertTriangle,
  Boxes,
  Tag,
  MapPin,
  IndianRupee,
  Layers,
  CheckCircle2,
  Eye
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Peripherals',
    unitPrice: 1000,
    currentStock: 50,
    minStockAlert: 10,
    warehouseLocation: 'Warehouse 1 - Rack A1'
  });

  const { hasRole } = useAuth();
  const { showToast } = useToast();

  const categories = ['All', 'Computers', 'Peripherals', 'Printers', 'Monitors', 'Accessories', 'Power Supply', 'Networking'];

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts(search, categoryFilter, lowStockOnly);
      setProducts(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter, lowStockOnly]);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Peripherals',
      unitPrice: 1000,
      currentStock: 50,
      minStockAlert: 10,
      warehouseLocation: 'Warehouse 1 - Rack A1'
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setSelectedProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unitPrice: prod.unitPrice,
      currentStock: prod.currentStock,
      minStockAlert: prod.minStockAlert,
      warehouseLocation: prod.warehouseLocation
    });
    setIsAddEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.category) {
      showToast('Product Name, SKU, and Category are required.', 'error');
      return;
    }

    try {
      if (selectedProduct) {
        await api.updateProduct(selectedProduct.id, formData);
        showToast('Product updated successfully', 'success');
      } else {
        await api.createProduct(formData);
        showToast('Product created successfully', 'success');
      }
      setIsAddEditOpen(false);
      loadProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Catalog & Inventory Items
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage stock items, minimum alert levels, and pricing</p>
        </div>
        {hasRole(['Admin', 'Warehouse']) && (
          <button
            id="add-product-button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="product-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by name, SKU, category, or location..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="product-category-filter"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Computers">Computers</option>
              <option value="Peripherals">Peripherals</option>
              <option value="Printers">Printers</option>
              <option value="Monitors">Monitors</option>
              <option value="Accessories">Accessories</option>
              <option value="Power Supply">Power Supply</option>
              <option value="Networking">Networking</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={e => setLowStockOnly(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span>Low Stock Alert Only</span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Warehouse Bin</th>
                <th className="py-3 px-4">Status Alert</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                products.map(p => {
                  const isLowStock = p.currentStock <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{p.sku}</td>
                      <td className="py-3 px-4">
                        <Badge variant="indigo">{p.category}</Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{p.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-lg ${
                            isLowStock
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {p.currentStock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{p.warehouseLocation}</td>
                      <td className="py-3 px-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Low Stock (≤{p.minStockAlert})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Sufficient Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setDetailProduct(p);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Product Spec"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasRole(['Admin', 'Warehouse']) && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedProduct ? 'Edit Product Specification' : 'Add New Catalog Product'}
        subtitle="Manage product info, SKU identification, pricing, and stock alerts"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dell Inspiron Laptop 15"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                SKU / Code *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. LAP-DELL-15I"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Computers, Peripherals"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Stock Alert Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockAlert}
                onChange={e => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Warehouse Location / Rack Bin
            </label>
            <input
              type="text"
              value={formData.warehouseLocation}
              onChange={e => setFormData({ ...formData, warehouseLocation: e.target.value })}
              placeholder="e.g. Rack A1 - Warehouse 1"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30"
            >
              {selectedProduct ? 'Update Product' : 'Save Product Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Specification Detail Modal */}
      {detailProduct && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={detailProduct.name}
          subtitle={`SKU Code: ${detailProduct.sku}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block font-medium">Category</span>
                <span className="font-bold text-slate-900">{detailProduct.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Unit Price</span>
                <span className="font-bold text-blue-600 text-sm">₹{detailProduct.unitPrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Current Stock</span>
                <span className="font-bold text-slate-900">{detailProduct.currentStock} units</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Alert Level</span>
                <span className="font-bold text-slate-900">{detailProduct.minStockAlert} units</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Location</span>
                <span className="font-medium text-slate-800">{detailProduct.warehouseLocation}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Last Updated</span>
                <span className="font-medium text-slate-800">{new Date(detailProduct.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
