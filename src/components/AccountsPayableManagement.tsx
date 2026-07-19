"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Tag, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { getBrasiliaDate } from "@/utils/date";

interface AccountsPayableManagementProps {
  accountsPayable: any[];
  onAddAccount: (account: any) => void;
  onDeleteAccount: (id: string) => void;
  onTogglePaidStatus: (id: string) => void;
}

export default function AccountsPayableManagement({ 
  accountsPayable, 
  onAddAccount, 
  onDeleteAccount, 
  onTogglePaidStatus 
}: AccountsPayableManagementProps) {
  const todayStr = getBrasiliaDate();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayStr);
  const [category, setCategory] = useState("Energia / Água");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !dueDate) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newAccount = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      dueDate,
      category,
      status: 'pending'
    };

    onAddAccount(newAccount);
    showSuccess("Conta a pagar cadastrada com sucesso!");

    // Reset
    setDescription("");
    setAmount("");
    setIsOpen(false);
  };

  const totalPending = accountsPayable
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPaid = accountsPayable
    .filter(a => a.status === 'paid')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendente (A Pagar)</CardTitle>
            <div className="rounded-full bg-rose-100 p-2 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">R$ {totalPending.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Contas aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pago</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <Check className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ {totalPaid.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Contas liquidadas este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Contas a Pagar</h2>
          <p className="text-sm text-slate-500">Controle as despesas fixas e variáveis da sua arena</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Nova Conta
        </Button>
      </div>

      {/* Accounts Table */}
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {accountsPayable.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{acc.description}</td>
                    <td className="p-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        <Tag size={12} />
                        {acc.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{acc.dueDate.split('-').reverse().join('/')}</td>
                    <td className="p-4">
                      <button
                        onClick={() => onTogglePaidStatus(acc.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all ${
                          acc.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {acc.status === 'paid' ? 'Pago' : 'Pendente'}
                      </button>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-800">
                      R$ {acc.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm("Deseja realmente excluir esta conta?")) {
                            onDeleteAccount(acc.id);
                            showSuccess("Conta excluída!");
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {accountsPayable.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhuma conta a pagar registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-rose-600 to-red-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Nova Conta a Pagar</h3>
                <p className="text-xs text-rose-100 mt-1">Registre uma despesa ou conta futura</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="accDesc" className="text-slate-700 font-semibold">Descrição *</Label>
                <Input
                  id="accDesc"
                  placeholder="Ex: Conta de Energia Elétrica"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="accAmount" className="text-slate-700 font-semibold">Valor (R$) *</Label>
                  <Input
                    id="accAmount"
                    type="number"
                    placeholder="Ex: 350.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Energia / Água">Energia / Água 💧⚡</SelectItem>
                      <SelectItem value="Manutenção">Manutenção 🛠️</SelectItem>
                      <SelectItem value="Funcionários">Funcionários 👥</SelectItem>
                      <SelectItem value="Marketing">Marketing 📣</SelectItem>
                      <SelectItem value="Outros">Outros 📦</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="accDueDate" className="text-slate-700 font-semibold">Data de Vencimento *</Label>
                <Input
                  id="accDueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
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
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                >
                  Salvar Conta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}