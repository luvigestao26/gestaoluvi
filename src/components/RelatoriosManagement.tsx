"use client";

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ArrowDownRight, 
  ArrowUpRight, 
  Filter, 
  Download,
  Utensils,
  Users,
  ShoppingBag,
  Percent,
  CreditCard,
  Coins,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { showSuccess } from "@/utils/toast";
import { getBrasiliaDate, getBrasiliaFirstDayOfMonth } from "@/utils/date";

interface RelatoriosManagementProps {
  bookings: any[];
  transactions: any[];
  sales: any[];
  accountsPayable: any[];
}

export default function RelatoriosManagement({ bookings, transactions, sales, accountsPayable }: RelatoriosManagementProps) {
  const todayStr = getBrasiliaDate();
  const firstDayOfMonthStr = getBrasiliaFirstDayOfMonth();

  const [startDate, setStartDate] = useState(firstDayOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Filter data based on selected date range (only if dates are valid)
  const isValidStartDate = startDate && startDate.length === 10 && !isNaN(Date.parse(startDate));
  const isValidEndDate = endDate && endDate.length === 10 && !isNaN(Date.parse(endDate));

  const filteredTransactions = transactions.filter(t => {
    if (!isValidStartDate || !isValidEndDate) return true;
    return t.date >= startDate && t.date <= endDate;
  });

  const filteredSales = sales.filter(s => {
    if (!isValidStartDate || !isValidEndDate) return true;
    return s.date >= startDate && s.date <= endDate;
  });

  const filteredBookings = bookings.filter(b => {
    if (!isValidStartDate || !isValidEndDate) return true;
    return b.date >= startDate && b.date <= endDate;
  });

  // Financial calculations
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Fields Revenue (Aluguel de Quadra category)
  const fieldsRevenue = filteredTransactions
    .filter(t => t.category === 'Aluguel de Quadra' && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Canteen Revenue (Bar / Lanchonete category)
  const canteenRevenue = filteredTransactions
    .filter(t => t.category === 'Bar / Lanchonete' && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Other Revenue
  const otherRevenue = totalIncome - fieldsRevenue - canteenRevenue;

  const netProfit = totalIncome - totalExpense;

  // Counts
  const totalBookingsCount = filteredBookings.length;
  const totalSalesCount = filteredSales.length;
  const paidBookingsCount = filteredBookings.filter(b => b.paid).length;
  const pendingBookingsCount = totalBookingsCount - paidBookingsCount;

  // Payment Methods Breakdown for Income Transactions
  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  
  const pixRevenue = incomeTransactions
    .filter(t => !t.paymentMethod || t.paymentMethod.includes('Pix'))
    .reduce((sum, t) => sum + t.amount, 0);

  const moneyRevenue = incomeTransactions
    .filter(t => t.paymentMethod && t.paymentMethod.includes('Dinheiro'))
    .reduce((sum, t) => sum + t.amount, 0);

  const creditRevenue = incomeTransactions
    .filter(t => t.paymentMethod && t.paymentMethod.includes('Crédito'))
    .reduce((sum, t) => sum + t.amount, 0);

  const debitRevenue = incomeTransactions
    .filter(t => t.paymentMethod && t.paymentMethod.includes('Débito'))
    .reduce((sum, t) => sum + t.amount, 0);

  // Prepare chart data for selected range
  const getChartData = () => {
    if (!isValidStartDate || !isValidEndDate) {
      return [];
    }

    const data = [];
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return [];
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    // Prevent infinite loop or excessive iterations if dates are weird
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

  // Export to Excel (CSV format)
  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data,Descricao,Categoria,Tipo,Forma de Pagamento,Valor (R$)\n";

    filteredTransactions.forEach(t => {
      const formattedDate = t.date.split('-').reverse().join('/');
      csvContent += `"${formattedDate}","${t.description}","${t.category}","${t.type === 'income' ? 'Entrada' : 'Saida'}","${t.paymentMethod || 'Pix'}",${t.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_financeiro_${startDate}_a_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Planilha exportada com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto">
            <Filter size={18} />
            Filtrar Período
          </Button>
          <Button 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Download size={18} />
            Baixar Planilha
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Faturamento Total</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">R$ {totalIncome.toFixed(2)}</div>
            <p className="text-[10px] text-slate-400 mt-1">Total de entradas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Faturamento Campos</CardTitle>
            <div className="rounded-full bg-emerald-950 p-2 text-emerald-400 border border-emerald-900">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-400">R$ {fieldsRevenue.toFixed(2)}</div>
            <p className="text-[10px] text-slate-400 mt-1">Locações de quadras</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Faturamento Cantina</CardTitle>
            <div className="rounded-full bg-amber-950 p-2 text-amber-400 border border-amber-900">
              <Utensils className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-400">R$ {canteenRevenue.toFixed(2)}</div>
            <p className="text-[10px] text-slate-400 mt-1">Vendas de produtos</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Despesas Totais</CardTitle>
            <div className="rounded-full bg-rose-950 p-2 text-rose-400 border border-rose-900">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-400">R$ {totalExpense.toFixed(2)}</div>
            <p className="text-[10px] text-slate-400 mt-1">Saídas e contas pagas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Lucro Líquido</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {netProfit.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Saldo líquido real</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown Section */}
      <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Smartphone className="text-blue-400" size={20} />
            Faturamento por Forma de Pagamento
          </CardTitle>
          <CardDescription className="text-slate-400">
            Detalhamento das receitas recebidas por cada meio de pagamento no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-950/50 p-2.5 text-blue-400 border border-blue-900/50">
                  <Smartphone size={20} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Pix</span>
                  <span className="text-lg font-bold text-white">R$ {pixRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-950/50 p-2.5 text-emerald-400 border border-emerald-900/50">
                  <Coins size={20} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Dinheiro</span>
                  <span className="text-lg font-bold text-white">R$ {moneyRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-950/50 p-2.5 text-purple-400 border border-purple-900/50">
                  <CreditCard size={20} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Cartão de Crédito</span>
                  <span className="text-lg font-bold text-white">R$ {creditRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-950/50 p-2.5 text-amber-400 border border-amber-900/50">
                  <CreditCard size={20} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Cartão de Débito</span>
                  <span className="text-lg font-bold text-white">R$ {debitRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total de Agendamentos</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalBookingsCount}</div>
            <p className="text-xs text-slate-400 mt-1">
              {paidBookingsCount} pagos • {pendingBookingsCount} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Vendas Realizadas</CardTitle>
            <div className="rounded-full bg-amber-950 p-2 text-amber-400 border border-amber-900">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSalesCount}</div>
            <p className="text-xs text-slate-400 mt-1">Produtos vendidos na cantina</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Aproveitamento de Quadras</CardTitle>
            <div className="rounded-full bg-emerald-950 p-2 text-emerald-400 border border-emerald-900">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalBookingsCount > 0 ? ((paidBookingsCount / totalBookingsCount) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-slate-400 mt-1">Taxa de adimplência das reservas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Fluxo de Caixa do Período</CardTitle>
            <CardDescription className="text-slate-400">Comparativo de receitas e despesas</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {chartData.length > 0 ? (
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
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Aguardando intervalo de datas válido...
              </div>
            )}
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
                  R$ {fieldsRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm font-semibold text-slate-300">Vendas de Produtos (Bar/Lanchonete)</span>
                <span className="font-bold text-emerald-400">R$ {canteenRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm font-semibold text-slate-300">Outras Receitas</span>
                <span className="font-bold text-emerald-400">
                  R$ {otherRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}