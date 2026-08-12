import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LogOut, Menu, Shield, User, Building2 } from 'lucide-react';

interface NavbarProps {
  onMenuToggle: () => void;
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, pageTitle }) => {
  const { user, logout, switchDemoRole } = useAuth();

  const roleColors: Record<UserRole, string> = {
    Admin: 'bg-purple-100 text-purple-800 border-purple-200',
    Sales: 'bg-blue-100 text-blue-800 border-blue-200',
    Warehouse: 'bg-amber-100 text-amber-800 border-amber-200',
    Accounts: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 flex items-center px-6 md:px-8 justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          id="mobile-hamburger-button"
          onClick={onMenuToggle}
          className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 uppercase tracking-widest">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick Switch Demo Role Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">Demo Role:</span>
          {(['Admin', 'Sales', 'Warehouse', 'Accounts'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => switchDemoRole(role)}
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                user?.role === role
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="hidden lg:block text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Logged in as
              </span>
              <span className="block text-xs font-bold text-blue-600 uppercase">
                {user.role} ({user.name.split(' ')[0]})
              </span>
            </div>
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center font-black text-xs text-slate-700 border-2 border-white ring-2 ring-blue-100 shadow-xs">
              {user.name.charAt(0)}
            </div>
            <button
              id="navbar-logout-button"
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
