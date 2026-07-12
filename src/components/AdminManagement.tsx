"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Shield, User, Mail, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

interface AdminManagementProps {
  admins: any[];
  onAddAdmin: (admin: any) => void;
  onDeleteAdmin: (id: string) => void;
}

export default function AdminManagement({ admins, onAddAdmin, onDeleteAdmin }: AdminManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newAdmin = {
      id: Date.now().toString(),
      name,
      email,
      role
    };

    onAddAdmin(newAdmin);
    showSuccess("Administrador cadastrado com sucesso!");

    // Reset
    setName("");
    setEmail("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gerenciamento de Administradores</h2>
          <p className="text-sm text-slate-500">Cadastre e gerencie as contas de acesso ao painel administrativo</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Novo Administrador
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {admins.map((adm) => (
          <Card key={adm.id} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-emerald-600" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                    <Shield size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">{adm.name}</CardTitle>
                    <CardDescription>{adm.email}</CardDescription>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  adm.role === 'master' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {adm.role === 'master' ? 'Master' : 'Gerente'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <span>Acesso habilitado</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                {adm.role !== 'master' ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Deseja realmente remover o acesso de "${adm.name}"?`)) {
                        onDeleteAdmin(adm.id);
                        showSuccess("Acesso removido com sucesso!");
                      }
                    }}
                    className="w-full rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Remover Acesso
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400 italic text-center w-full py-2">
                    Administrador Master não pode ser removido
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Novo Administrador</h3>
                <p className="text-xs text-emerald-100 mt-1">Cadastre uma nova conta de acesso</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="admName" className="text-slate-700 font-semibold">Nome Completo *</Label>
                <Input
                  id="admName"
                  placeholder="Ex: André Souza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="admEmail" className="text-slate-700 font-semibold">E-mail de Acesso *</Label>
                <Input
                  id="admEmail"
                  type="email"
                  placeholder="Ex: andre@arena.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-700 font-semibold">Nível de Permissão</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Gerente (Acesso padrão)</SelectItem>
                    <SelectItem value="master">Master (Acesso total)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Criar Conta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}