"use client";

import React, { useState } from 'react';
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
  Settings,
  Layers,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSuperAdminUnlocked: boolean;
  onUnlockSuperAdmin: () => void;
  onLockSuperAdmin: () => void;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  isSuperAdminUnlocked, 
  onUnlockSuperAdmin, 
  onLockSuperAdmin 
}: SidebarProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

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

  // Only show Super Admin tab if unlocked
  if (isSuperAdminUnlocked) {
    menuItems.push({ id: 'superadmin', label: 'Super Admin SaaS', icon: Layers });
  }

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha master padrão para você e seu sócio
    if (passwordInput === "admin123") {
      onUnlockSuperAdmin();
      showSuccess("Painel Super Admin SaaS desbloqueado!");
      setIsPasswordModalOpen(false);
      setPasswordInput("");
      onTabChange('superadmin');
    } else {
      showError("Senha incorreta! Acesso negado.");
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="rounded-xl bg-blue-600 p-2 text-white font-bold text-lg">
          GA
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-none">Gestão Arenas</h1>
          <span className="text-xs text-blue-400 font-medium">Painel Administrativo</span>
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
                  ? item.id === 'superadmin' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <Icon size={18} className={item.id === 'superadmin' && !isActive ? 'text-purple-400' : ''} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer & SaaS Lock/Unlock */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {isSuperAdminUnlocked ? (
          <button
            onClick={() => {
              onLockSuperAdmin();
              showSuccess("Painel Super Admin SaaS bloqueado e ocultado.");
              if (activeTab === 'superadmin') {
                onTabChange('dashboard');
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-purple-950/40 border border-purple-900 text-purple-400 hover:bg-purple-900 hover:text-white transition-all"
          >
            <Unlock size={14} />
            Bloquear Área SaaS
          </button>
        ) : (
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Lock size={14} />
            Área do Proprietário (SaaS)
          </button>
        )}

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Administrador</p>
            <p className="text-[10px] text-slate-500 truncate">admin@gestaoarenas.com</p>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-purple-950 to-slate-900 p-5 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-purple-400" />
                <h3 className="font-bold text-base">Acesso Restrito SaaS</h3>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(false)} 
                className="p-1 rounded-full bg-white/10 hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleVerifyPassword} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="saasPassword" className="text-slate-300 text-xs font-semibold">Digite a Senha Master do SaaS</Label>
                <Input
                  id="saasPassword"
                  type="password"
                  placeholder="Senha de acesso"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white text-sm"
                  autoFocus
                  required
                />
                <p className="text-[10px] text-slate-500">Dica: A senha padrão de desenvolvimento é <code className="text-purple-400 font-bold">admin123</code></p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 rounded-xl border-slate-800 bg-slate-950 text-white text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  Desbloquear
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}