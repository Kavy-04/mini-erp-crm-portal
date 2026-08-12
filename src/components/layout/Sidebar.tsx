import React from 'react';
import { NavLink } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileSpreadsheet,
  UserCheck,
  Settings,
  LogOut,
  Building2,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      visible: true
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: Users,
      visible: hasRole(['Admin', 'Sales', 'Accounts'])
    },
    {
      name: 'Products',
      path: '/products',
      icon: Package,
      visible: hasRole(['Admin', 'Sales', 'Warehouse'])
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: Boxes,
      visible: hasRole(['Admin', 'Warehouse'])
    },
    {
      name: 'Sales Challans',
      path: '/challans',
      icon: FileSpreadsheet,
      visible: hasRole(['Admin', 'Sales', 'Warehouse', 'Accounts'])
    },
    {
      name: 'Users',
      path: '/users',
      icon: UserCheck,
      visible: hasRole(['Admin'])
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      visible: true
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#1E293B] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:z-20 border-r border-slate-700 shadow-xl md:shadow-none`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-xl text-white shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight leading-tight">MINI ERP</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operations Command</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="py-6 px-4 space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Main Menu</p>
            {navItems
              .filter(item => item.visible)
              .map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold tracking-wide'
                        : 'text-slate-400 font-medium hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/60">
          {user && (
            <div className="flex items-center justify-between">
              <div className="overflow-hidden pr-2">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">{user.role} Access</p>
              </div>
              <button
                id="sidebar-logout-button"
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
