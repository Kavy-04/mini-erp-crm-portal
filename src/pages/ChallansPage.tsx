import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api } from '../services/api';
import { SalesChallan } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  User,
  Printer,
  AlertTriangle
} from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // View Challan Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);

  const { hasRole } = useAuth();
  const { showToast } = useToast();

  const loadChallans = async () => {
    setLoading(true);
    try {
      const data = await api.getChallans(search, statusFilter);
      setChallans(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load sales challans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallans();
  }, [search, statusFilter]);

  const handleConfirmChallan = async (challan: SalesChallan) => {
    try {
      const res = await api.confirmChallan(challan.id);
      showToast(res.message, 'success');
      if (selectedChallan?.id === challan.id) {
        setSelectedChallan(res.challan);
      }
      loadChallans();
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm challan', 'error');
    }
  };

  const handleCancelChallan = async (challan: SalesChallan) => {
    try {
      const res = await api.cancelChallan(challan.id);
      showToast(res.message, 'success');
      if (selectedChallan?.id === challan.id) {
        setSelectedChallan(res.challan);
      }
      loadChallans();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel challan', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Sales Challans & Dispatch Documents
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Generate, confirm, and audit customer dispatch challans</p>
        </div>
        {hasRole(['Admin', 'Sales']) && (
          <Link
            to="/challans/new"
            id="create-challan-button"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Sales Challan
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="challan-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search challan number, customer business name, contact person..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="challan-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="All">All Challan Statuses</option>
            <option value="Draft">Draft (Awaiting Confirm)</option>
            <option value="Confirmed">Confirmed (Stock Reduced)</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Challan Number</th>
                <th className="py-3 px-4">Customer & Business</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Total Qty</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No sales challans found.
                  </td>
                </tr>
              ) : (
                challans.map(ch => (
                  <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{ch.challanNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{ch.customerBusiness}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{ch.customerName}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{ch.items.length} line items</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{ch.totalQuantity} units</td>
                    <td className="py-3 px-4 font-bold text-blue-700">₹{ch.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          ch.status === 'Confirmed'
                            ? 'emerald'
                            : ch.status === 'Draft'
                            ? 'amber'
                            : 'rose'
                        }
                      >
                        {ch.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedChallan(ch);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View / Print Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {ch.status === 'Draft' && hasRole(['Admin', 'Sales', 'Warehouse']) && (
                          <button
                            onClick={() => handleConfirmChallan(ch)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Confirm Challan (Deduct Stock)"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {ch.status !== 'Cancelled' && hasRole(['Admin', 'Sales']) && (
                          <button
                            onClick={() => handleCancelChallan(ch)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Challan"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Printable Challan Modal */}
      {selectedChallan && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Sales Challan #${selectedChallan.challanNumber}`}
          subtitle={`Issued for ${selectedChallan.customerBusiness}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Document Status:</span>
                <Badge
                  variant={
                    selectedChallan.status === 'Confirmed'
                      ? 'emerald'
                      : selectedChallan.status === 'Draft'
                      ? 'amber'
                      : 'rose'
                  }
                >
                  {selectedChallan.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Export
                </button>

                {selectedChallan.status === 'Draft' && hasRole(['Admin', 'Sales', 'Warehouse']) && (
                  <button
                    onClick={() => handleConfirmChallan(selectedChallan)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Challan (Deduct Stock)
                  </button>
                )}
              </div>
            </div>

            {/* Printable Document Box */}
            <div className="bg-white border border-slate-300 p-8 rounded-xl shadow-xs space-y-6 text-slate-800 print:border-none print:shadow-none">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <span>Mini ERP Wholesale Distribution Portal</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Plot 108, Logistics Hub, Central Industrial Corridor</p>
                  <p className="text-xs text-slate-500">GSTIN: 27AABCM8899K1ZV | Contact: +91 22 6677 8899</p>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-extrabold text-blue-900 uppercase tracking-tight">SALES CHALLAN</h3>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedChallan.challanNumber}</p>
                  <p className="text-xs text-slate-500">
                    Date: {new Date(selectedChallan.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">CUSTOMER / RECIPIENT</p>
                  <p className="text-sm font-bold text-slate-900">{selectedChallan.customerBusiness}</p>
                  <p className="text-slate-700 mt-0.5">Contact Person: {selectedChallan.customerName}</p>
                  <p className="text-slate-500 mt-0.5">Account ID: {selectedChallan.customerId}</p>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">DISPATCH & CREATOR INFO</p>
                  <p className="font-semibold text-slate-800">Issued By: {selectedChallan.createdByName}</p>
                  {selectedChallan.confirmedAt && (
                    <p className="text-emerald-700 font-semibold mt-1">
                      Confirmed At: {new Date(selectedChallan.confirmedAt).toLocaleString()}
                    </p>
                  )}
                  {selectedChallan.notes && (
                    <p className="text-slate-500 italic mt-1">Notes: {selectedChallan.notes}</p>
                  )}
                </div>
              </div>

              {/* Items Table (Product Snapshot Data) */}
              <div>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Product Snapshot</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">SKU Code</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {selectedChallan.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                          {item.productName}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-600">{item.sku}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₹{item.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-right border-r border-slate-200 uppercase tracking-wider text-slate-600">
                        Total Dispatch Quantity & Amount:
                      </td>
                      <td className="py-3 px-3 text-center border-r border-slate-200 text-blue-900 text-sm">
                        {selectedChallan.totalQuantity} units
                      </td>
                      <td className="py-3 px-3 text-right text-blue-900 text-base">
                        ₹{selectedChallan.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
