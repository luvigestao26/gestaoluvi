"use client";

import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, DollarSign, Trash2, Tag, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { getBrasiliaDate } from "@/utils/date";

interface FinancialManagementProps {
  transactions: any[];
  onAddTransaction: (transaction: any) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function FinancialManagement({ transactions, onAddTransaction, onDeleteTransaction }: FinancialManagementProps) {
  const todayStr = getBrasiliaDate();
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);

  // Form states
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("Aluguel de Quadra");
  const [date, setDate] = useState(todayStr);

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date
    };

    onAddTransaction(newTransaction);
    showSuccess("Transação registrada com sucesso!");

    // Reset form
    setDescription("");
    setAmount("");
    setIsNewTransactionOpen(false);
  };

  const categories = type === 'income' 
    ? ["Aluguel de Quadra", "Escolinha", "Bar / Lanchonete", "Eventos", "Outros"]
    : ["Manutenção", "Energia / Água", "Funcionários", "Marketing", "Outros"];

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas (Entradas)</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ {totalIncome.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Total acumulado de entradas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas (Saídas)</CardTitle>
            <div className="rounded-full bg-rose-100 p-2 text-rose-600">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">R$ {totalExpense.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Total acumulado de saídas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo de Caixa</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              R$ {balance.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Saldo líquido atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Fluxo de Caixa</h2>
            <p className="text-sm text-slate-500">Acompanhe todas as movimentações financeiras da arena</p>
          </div>
          <Button 
            onClick={() => {
              setDescription("");
              setAmount("");
              setIsNewTransactionOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={18} />
            Nova Transação
          </Button>
        </div>

        {/* Transactions Table */}
        <Card className="border-none shadow-md bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4 text-right">Valor</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{t.description}</td>
                      <td className="p-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          <Tag size={12} />
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{t.date.split('-').reverse().join('/')}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          t.type === 'income' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {t.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-bold ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm("Deseja realmente excluir esta transação?")) {
                              onDeleteTransaction(t.id);
                              showSuccess("Transação excluída!");
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Nenhuma transação financeira registrada ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Transaction Modal */}
      {isNewTransactionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Nova Transação</h3>
                <p className="text-xs text-emerald-100 mt-1">Registre uma entrada ou saída financeira</p>
              </div>
              <button 
                onClick={() => setIsNewTransactionOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-slate-700 font-semibold">Tipo de Transação</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType("income");
                      setCategory("Aluguel de Quadra");
                    }}
                    className={`py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                      type === 'income'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Entrada (Receita)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType("expense");
                      setCategory("Manutenção");
                    }}
                    className={`py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                      type === 'expense'
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Saída (Despesa)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-slate-700 font-semibold">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Mensalidade Escolinha de Futebol"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="amount" className="text-slate-700 font-semibold">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="150.00"
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
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="date" className="text-slate-700 font-semibold">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewTransactionOpen(false)}
                  className="flex-1 rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}