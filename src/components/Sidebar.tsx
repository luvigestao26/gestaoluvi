"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  Award,
  CreditCard,
  UserCheck,
  Package,
  ShoppingCart,
  BarChart3,
  Users
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
    { id: 'calendar', label: 'Agenda do Campo', icon: Calendar },
    { id: 'mensalistas', label: 'Mensalistas', icon: UserCheck },
    { id: 'diaristas', label: 'Diaristas', icon: Users },
    { id: 'eventos', label: 'Eventos', icon: Award },
    { id: 'payable', label: 'Contas a Pagar', icon: CreditCard },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-500 p-2 text-slate-950 font-bold text-lg">
          AG
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-none">ArenaGestão</h1>
          <span className="text-xs text-emerald-400 font-medium">Painel Administrativo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Administrador</p>
            <p className="text-[10px] text-slate-500 truncate">admin@arenagestao.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}