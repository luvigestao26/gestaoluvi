"use client";

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RelatoriosManagementProps {
  bookings: any[];
  transactions: any[];
  sales: any[];
  accountsPayable: any[];
}

export default function RelatoriosManagement({ bookings, transactions, sales, accountsPayable }: RelatoriosManagementProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Filter data based on selected date range
  const filteredTransactions = transactions.filter(t => t.date >= startDate && t.date <= endDate);
  const filteredSales = sales.filter(s => s.date >= startDate && s.date <= endDate);
  const filteredBookings = bookings.filter(b => b.date >= startDate && b.date <= endDate);
  const filteredAccountsPayable = accountsPayable.filter(a => a.dueDate >= startDate && a.dueDate <= endDate);

  // Financial calculations
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);

  const totalPendingPayable = filteredAccountsPayable
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  // Prepare chart data for selected range
  const getChartData = () => {
    const data = [];
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    // Limit to max 30 days to avoid chart clutter
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const step = Math.max(1, Math.ceil(diffDays / 10));

    for (let i = 0; i <= diffDays; i += step) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d > end) break;

      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      
      const dayIncome = filteredTransactions
        .filter(t => t.date === dateStr && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpense = filteredTransactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        name: label,
        Receitas: dayIncome,
        Despesas: dayExpense
      });
    }
    return data;
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-slate-300 font-semibold">Data Início</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border-slate-800 bg-slate-950 text-white"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-slate-300 font-semibold">Data Fim</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border-slate-800 bg-slate-950 text-white"
            />
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 flex items-center gap-2">
          <Filter size={18} />
          Filtrar Período
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Faturamento Total</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalIncome.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">Entradas no período</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Despesas Totais</CardTitle>
            <div className="rounded-full bg-rose-950 p-2 text-rose-400 border border-rose-900">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">R$ {totalExpense.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">Saídas no período</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Lucro Líquido</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Saldo líquido do período</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Contas Pendentes</CardTitle>
            <div className="rounded-full bg-amber-950 p-2 text-amber-400 border border-amber-900">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">R$ {totalPendingPayable.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">A pagar no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Fluxo de Caixa do Período</CardTitle>
            <CardDescription className="text-slate-400">Comparativo de receitas e despesas</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
                <Area type="monotone" dataKey="Receitas" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Faturamento por Categoria</CardTitle>
            <CardDescription className="text-slate-400">Distribuição de receitas da arena</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm font-semibold text-slate-300">Aluguel de Quadras (Diaristas)</span>
                <span className="font-bold text-emerald-400">
                  R$ {filteredTransactions.filter(t => t.category === 'Aluguel de Quadra').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm font-semibold text-slate-300">Vendas de Produtos (Bar/Lanchonete)</span>
                <span className="font-bold text-emerald-400">R$ {totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm font-semibold text-slate-300">Eventos e Torneios</span>
                <span className="font-bold text-emerald-400">
                  R$ {filteredTransactions.filter(t => t.category === 'Eventos').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}