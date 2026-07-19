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
  Users,
  Shield,
  LogOut,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, onTabChange, userEmail, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campos', label: 'Campos', icon: Shield },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
    { id: 'calendar', label: 'Agenda do Campo', icon: Calendar },
    { id: 'mensalistas', label: 'Mensalistas', icon: UserCheck },
    { id: 'diaristas', label: 'Diaristas', icon: Users },
    { id: 'eventos', label: 'Eventos', icon: Award },
    { id: 'payable', label: 'Contas a Pagar', icon: CreditCard },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800 flex flex-col items-center justify-center gap-2 bg-slate-900">
        <div className="relative w-20 h-20 flex items-center justify-center bg-white rounded-2xl p-1.5 border border-slate-800/40 shadow-inner">
          <img 
            src="/logo.png" 
            alt="Logo Gestão Arenas L.I" 
            className="w-full h-full object-contain object-center rounded-xl"
          />
        </div>
        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1">Painel Administrativo</span>
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
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
            {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Usuário Ativo</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail || 'admin@gestaoarenas.com'}</p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-rose-900/30 transition-all"
          >
            <LogOut size={14} />
            Sair da Conta
          </button>
        )}
      </div>
    </aside>
  );
}