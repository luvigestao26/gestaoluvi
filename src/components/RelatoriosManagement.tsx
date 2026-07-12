"use client";

import React from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';

interface RelatoriosManagementProps {
  bookings: any[];
  transactions: any[];
  sales: any[];
  accountsPayable: any[];
}

export default function RelatoriosManagement({ bookings, transactions, sales, accountsPayable }: RelatoriosManagementProps) {
  // Financial calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

  const totalPendingPayable = accountsPayable
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  // Prepare chart data for last 7 days
  const getChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
      
      const dayIncome = transactions
        .filter(t => t.date === dateStr && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpense = transactions
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
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Total</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ {totalIncome.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Entradas acumuladas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Totais</CardTitle>
            <div className="rounded-full bg-rose-100 p-2 text-rose-600">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">R$ {totalExpense.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Saídas acumuladas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              R$ {netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Saldo líquido atual</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contas Pendentes</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">R$ {totalPendingPayable.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">A pagar no mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Fluxo de Caixa (7 dias)</CardTitle>
            <CardDescription>Comparativo de receitas e despesas diárias</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Faturamento por Categoria</CardTitle>
            <CardDescription>Distribuição de receitas da arena</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">Aluguel de Quadras (Diaristas)</span>
                <span className="font-bold text-emerald-600">
                  R$ {transactions.filter(t => t.category === 'Aluguel de Quadra').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">Vendas de Produtos (Bar/Lanchonete)</span>
                <span className="font-bold text-emerald-600">R$ {totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">Eventos e Torneios</span>
                <span className="font-bold text-emerald-600">
                  R$ {transactions.filter(t => t.category === 'Eventos').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}