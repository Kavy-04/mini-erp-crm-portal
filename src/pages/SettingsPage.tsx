import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import {
  Settings as SettingsIcon,
  Database,
  Shield,
  Key,
  Server,
  Download,
  RefreshCw,
  CheckCircle2,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'mock'>('connected');

  const handleTestDbConnection = async () => {
    setTestingDb(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.status === 'ok') {
        setDbStatus('connected');
        showToast('Backend REST API Health Check: OK (Connected to port 3000)', 'success');
      }
    } catch (err) {
      showToast('Backend REST API connection check failed', 'error');
    } finally {
      setTestingDb(false);
    }
  };

  const handleExportData = () => {
    showToast('Exporting JSON dataset snapshot...', 'info');
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600" />
          System Settings & Database Config
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">REST API status, MySQL schema setup guidelines, and role security matrix</p>
      </div>

      {/* Database Connection & Environment Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">REST API & Database Engine Status</h3>
              <p className="text-xs text-slate-500">Node.js Express REST Endpoints + MySQL Abstraction Layer</p>
            </div>
          </div>
          <button
            onClick={handleTestDbConnection}
            disabled={testingDb}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingDb ? 'animate-spin' : ''}`} />
            Test Health Endpoint
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Environment Backend URL</span>
            <span className="font-mono font-bold text-slate-900 block mt-1">http://localhost:3000/api</span>
            <div className="mt-2 flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Express REST APIs Operational
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Authentication Protocol</span>
            <span className="font-mono font-bold text-slate-900 block mt-1">JWT Bearer Token (24h expiry)</span>
            <div className="mt-2 text-slate-500 text-[11px]">
              Secret Key: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">JWT_SECRET</code> env variable
            </div>
          </div>
        </div>
      </div>

      {/* Role Access Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Role-Based Access Permission Matrix
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Module</th>
                <th className="py-2.5 px-3 text-center">Admin</th>
                <th className="py-2.5 px-3 text-center">Sales</th>
                <th className="py-2.5 px-3 text-center">Warehouse</th>
                <th className="py-2.5 px-3 text-center">Accounts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-900">Dashboard & Metrics</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-900">Customers CRM</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Hidden</td>
                <td className="py-2.5 px-3 text-center text-blue-600 font-bold">View Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-900">Products Catalog</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-blue-600 font-bold">View Only</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Hidden</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-900">Inventory & Movements</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Hidden</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Hidden</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-900">Sales Challans</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Create/Confirm</td>
                <td className="py-2.5 px-3 text-center text-blue-600 font-bold">View/Confirm</td>
                <td className="py-2.5 px-3 text-center text-blue-600 font-bold">View Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-900">User Management</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Hidden</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Hidden</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Hidden</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
