import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../services/api';
import { Customer, Product } from '../types';
import { useToast } from '../components/common/Toast';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Save,
  ArrowLeft,
  Building2,
  Package
} from 'lucide-react';

interface SelectedItemRow {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export const CreateChallanPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');

  const [rows, setRows] = useState<SelectedItemRow[]>([
    { productId: '', quantity: 1, unitPrice: 0 }
  ]);

  const [savingDraft, setSavingDraft] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [cList, pList] = await Promise.all([
          api.getCustomers(),
          api.getProducts()
        ]);
        setCustomers(cList);
        setProducts(pList);

        if (cList.length > 0) {
          setSelectedCustomerId(cList[0].id);
        }

        if (pList.length > 0) {
          setRows([{ productId: pList[0].id, quantity: 1, unitPrice: pList[0].unitPrice }]);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to initialize form data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProductChange = (index: number, pId: string) => {
    const prod = products.find(p => p.id === pId);
    setRows(prev => {
      const updated = [...prev];
      updated[index] = {
        productId: pId,
        quantity: updated[index]?.quantity || 1,
        unitPrice: prod ? prod.unitPrice : 0
      };
      return updated;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index].quantity = Math.max(1, qty);
      return updated;
    });
  };

  const handlePriceChange = (index: number, price: number) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index].unitPrice = Math.max(0, price);
      return updated;
    });
  };

  const handleAddRow = () => {
    const defaultProd = products[0];
    setRows(prev => [
      ...prev,
      { productId: defaultProd ? defaultProd.id : '', quantity: 1, unitPrice: defaultProd ? defaultProd.unitPrice : 0 }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) {
      showToast('A sales challan must contain at least 1 product item.', 'error');
      return;
    }
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (confirmImmediately: boolean) => {
    if (!selectedCustomerId) {
      showToast('Please select a customer for this sales challan.', 'error');
      return;
    }

    if (rows.some(r => !r.productId || r.quantity <= 0)) {
      showToast('Please select a product and enter a valid quantity for all rows.', 'error');
      return;
    }

    // FRONTEND PRE-CHECK STOCK WARNING
    if (confirmImmediately) {
      for (const r of rows) {
        const prod = products.find(p => p.id === r.productId);
        if (prod && prod.currentStock < r.quantity) {
          showToast(
            `Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, Requested: ${r.quantity}`,
            'error'
          );
          return;
        }
      }
    }

    if (confirmImmediately) setConfirming(true);
    else setSavingDraft(true);

    try {
      const payload = {
        customerId: selectedCustomerId,
        items: rows.map(r => ({
          productId: r.productId,
          quantity: r.quantity,
          unitPrice: r.unitPrice
        })),
        notes: notes.trim(),
        confirmImmediately
      };

      const res = await api.createChallan(payload);
      showToast(res.message, 'success');
      navigate('/challans');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit sales challan', 'error');
    } finally {
      setSavingDraft(false);
      setConfirming(false);
    }
  };

  // Calculations
  const calculateTotalQty = () => rows.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const calculateTotalAmount = () => rows.reduce((sum, r) => sum + (r.quantity || 0) * (r.unitPrice || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/challans')}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Create Sales Dispatch Challan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Draft dispatch order or confirm immediately with auto-stock deduction</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
        {/* Customer & Notes Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Select Customer Account *
            </label>
            <select
              id="challan-customer-select"
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.businessName} — ({c.name}, {c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Order Dispatch Notes / Reference
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. PO #99102, Dispatched via BlueDart Express..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>

        {/* Product Items Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-600" />
              Product Dispatch Items List
            </h3>
            <button
              id="add-challan-item-row"
              type="button"
              onClick={handleAddRow}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product Line Item
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-center">Available Stock</th>
                  <th className="py-2.5 px-3 text-center">Dispatch Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
                  <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                  <th className="py-2.5 px-3 text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rows.map((row, index) => {
                  const prod = products.find(p => p.id === row.productId);
                  const isInsufficient = prod ? prod.currentStock < row.quantity : false;
                  const lineTotal = (row.quantity || 0) * (row.unitPrice || 0);

                  return (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 min-w-[200px]">
                        <select
                          value={row.productId}
                          onChange={e => handleProductChange(index, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {prod ? prod.sku : 'N/A'}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {prod ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isInsufficient
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {prod.currentStock} units
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center max-w-[100px]">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={e => handleQuantityChange(index, Number(e.target.value))}
                          className={`w-20 px-2 py-1 text-center text-xs font-bold border rounded-lg focus:outline-none focus:ring-1 ${
                            isInsufficient
                              ? 'bg-rose-50 border-rose-400 text-rose-800'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right max-w-[120px]">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.unitPrice}
                          onChange={e => handlePriceChange(index, Number(e.target.value))}
                          className="w-24 px-2 py-1 text-right text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{lineTotal.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Totals & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 text-xs flex items-center gap-6">
            <div>
              <span className="text-slate-500 font-medium block">Total Quantity:</span>
              <span className="font-bold text-blue-900 text-sm">{calculateTotalQty()} units</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Total Challan Amount:</span>
              <span className="font-bold text-blue-900 text-base">₹{calculateTotalAmount().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="save-draft-challan-button"
              type="button"
              disabled={savingDraft || confirming}
              onClick={() => handleSubmit(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-500" />
              Save as Draft
            </button>

            <button
              id="confirm-challan-button"
              type="button"
              disabled={savingDraft || confirming}
              onClick={() => handleSubmit(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Challan (Reduce Stock)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
