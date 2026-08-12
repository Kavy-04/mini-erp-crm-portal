import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  PhoneCall,
  Mail,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Send
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    mobile: '',
    email: '',
    gstNumber: '',
    type: 'Wholesale' as CustomerType,
    status: 'Active' as CustomerStatus,
    address: '',
    followUpDate: '',
    notes: ''
  });

  const [followUpNoteText, setFollowUpNoteText] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  const { hasRole } = useAuth();
  const { showToast } = useToast();

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers(search, statusFilter, typeFilter);
      setCustomers(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter, typeFilter]);

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setFormData({
      name: '',
      businessName: '',
      mobile: '',
      email: '',
      gstNumber: '',
      type: 'Wholesale',
      status: 'Active',
      address: '',
      followUpDate: '',
      notes: ''
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      businessName: customer.businessName,
      mobile: customer.mobile,
      email: customer.email,
      gstNumber: customer.gstNumber || '',
      type: customer.type,
      status: customer.status,
      address: customer.address || '',
      followUpDate: customer.followUpDate || '',
      notes: customer.notes || ''
    });
    setIsAddEditOpen(true);
  };

  const handleOpenDetail = async (customer: Customer) => {
    try {
      const full = await api.getCustomerById(customer.id);
      setDetailCustomer(full);
      setNextFollowUpDate(full.followUpDate || '');
      setIsDetailOpen(true);
    } catch (err: any) {
      showToast('Failed to load customer details', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.businessName || !formData.mobile || !formData.email) {
      showToast('Name, Business Name, Mobile, and Email are required.', 'error');
      return;
    }

    try {
      if (selectedCustomer) {
        await api.updateCustomer(selectedCustomer.id, formData);
        showToast('Customer updated successfully', 'success');
      } else {
        await api.createCustomer(formData);
        showToast('Customer added successfully', 'success');
      }
      setIsAddEditOpen(false);
      loadCustomers();
    } catch (err: any) {
      showToast(err.message || 'Error saving customer', 'error');
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await api.deleteCustomer(customerToDelete.id);
      showToast('Customer deleted successfully', 'success');
      setIsDeleteOpen(false);
      loadCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer', 'error');
    }
  };

  const handleAddFollowUpNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailCustomer || !followUpNoteText.trim()) return;

    try {
      await api.addCustomerFollowUp(detailCustomer.id, followUpNoteText.trim(), nextFollowUpDate);
      showToast('Follow-up note recorded successfully', 'success');
      setFollowUpNoteText('');
      const updated = await api.getCustomerById(detailCustomer.id);
      setDetailCustomer(updated);
      loadCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to add follow-up note', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Customer CRM Directory
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Manage accounts, client follow-ups, and lead status</p>
        </div>
        {hasRole(['Admin', 'Sales']) && (
          <button
            id="add-customer-button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Customer
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="customer-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer name, business, GST, email, or mobile..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="customer-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            id="customer-type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="All">All Types</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Retail">Retail</option>
            <option value="Distributor">Distributor</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer / Contact</th>
                <th className="py-3 px-4">Business Name</th>
                <th className="py-3 px-4">Mobile & GST</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Follow-Up</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No matching customer records found.
                  </td>
                </tr>
              ) : (
                customers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{cust.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{cust.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{cust.businessName}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{cust.mobile}</div>
                      {cust.gstNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">GST: {cust.gstNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="blue">{cust.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          cust.status === 'Active'
                            ? 'emerald'
                            : cust.status === 'Lead'
                            ? 'amber'
                            : 'slate'
                        }
                      >
                        {cust.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {cust.followUpDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          {cust.followUpDate}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetail(cust)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details & Notes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasRole(['Admin', 'Sales']) && (
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasRole(['Admin']) && (
                          <button
                            onClick={() => {
                              setCustomerToDelete(cust);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedCustomer ? 'Edit Customer Details' : 'Add New Customer'}
        subtitle="Maintain account details and client communication details"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Business / Company Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. ABC Distributors"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@business.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                GST Number (Optional)
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="27AABCU9603R1ZM"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Type *
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as CustomerType })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Wholesale">Wholesale</option>
                <option value="Retail">Retail</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Account Status *
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Lead">Lead</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Follow-Up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Business Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full office or warehouse address"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Initial Notes / Instructions
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Prefers email invoices, bulk payment terms, primary buyer contacts..."
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
              {selectedCustomer ? 'Update Customer' : 'Save Customer Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail & Follow-up History Modal */}
      {detailCustomer && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={detailCustomer.businessName}
          subtitle={`Account Detail: ${detailCustomer.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer Name</span>
                <span className="font-bold text-slate-900">{detailCustomer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Business Name</span>
                <span className="font-bold text-slate-900">{detailCustomer.businessName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Customer Type</span>
                <Badge variant="blue">{detailCustomer.type}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Mobile</span>
                <span className="font-semibold text-slate-900">{detailCustomer.mobile}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email</span>
                <span className="font-semibold text-slate-900 truncate block">{detailCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">GST Number</span>
                <span className="font-mono font-semibold text-slate-900">{detailCustomer.gstNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Follow Up Notes Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Follow-Up History & Activity Log
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto mb-4 pr-1">
                {detailCustomer.followUpHistory && detailCustomer.followUpHistory.length > 0 ? (
                  detailCustomer.followUpHistory.map(note => (
                    <div key={note.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                      <p className="font-medium text-slate-800">{note.note}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                        <span>Recorded by: {note.createdBy}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                    No recorded follow-up notes yet.
                  </p>
                )}
              </div>

              {/* Add New Follow up form */}
              {hasRole(['Admin', 'Sales']) && (
                <form onSubmit={handleAddFollowUpNote} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <h5 className="text-xs font-bold text-slate-900">Record New Follow-up</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={followUpNoteText}
                        onChange={e => setFollowUpNoteText(e.target.value)}
                        placeholder="e.g. Call completed. Customer requested quote for 30x Monitors..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={nextFollowUpDate}
                        onChange={e => setNextFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Add Note
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Customer Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-600">
            Are you sure you want to delete customer record for{' '}
            <strong className="text-slate-900">{customerToDelete?.businessName}</strong>? This operation cannot be undone.
          </p>
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
