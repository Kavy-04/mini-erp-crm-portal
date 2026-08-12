import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
  onClick
}) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-600',
      valColor: 'text-slate-800',
      cardBorder: 'border-slate-100',
      subColor: 'text-blue-500 font-bold'
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      valColor: 'text-slate-800',
      cardBorder: 'border-slate-100',
      subColor: 'text-emerald-500 font-bold'
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      valColor: 'text-amber-500',
      cardBorder: 'border-slate-100 border-l-4 border-l-amber-400',
      subColor: 'text-amber-600 font-bold uppercase underline'
    },
    rose: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      valColor: 'text-rose-600',
      cardBorder: 'border-slate-100 border-l-4 border-l-rose-500',
      subColor: 'text-rose-600 font-bold uppercase underline'
    },
    slate: {
      bg: 'bg-slate-100/80',
      text: 'text-slate-600',
      valColor: 'text-slate-800',
      cardBorder: 'border-slate-100',
      subColor: 'text-slate-400 font-bold'
    }
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border shadow-xs hover:shadow-md transition-all duration-200 flex items-start justify-between ${colors.cardBorder} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className={`text-4xl font-black mt-1 ${colors.valColor}`}>{value}</h3>
        {subtext && <p className={`text-xs mt-2 ${colors.subColor}`}>{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
