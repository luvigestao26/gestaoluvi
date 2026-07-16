"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Activity, 
  Clock, 
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { showSuccess } from "@/utils/toast";

interface DashboardOverviewProps {
  bookings: any[];
  customers: any[];
  fields: any[];
  transactions: any[];
  products: any[];
  sales: any[];
  onNavigate: (tab: string) => void;
  onResetAllData?: () => void;
}

export default function DashboardOverview({ 
  bookings, 
  customers, 
  fields, 
  transactions, 
  products,
  sales,
  onNavigate,
  onResetAllData 
}: DashboardOverviewProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [resetStep, setResetStep] = useState(0); // 0 = idle, 1 = first confirm, 2 = second confirm

  // 1. Faturamento Campo (Total bookings revenue)
  const totalCampoRevenue = bookings.reduce((sum, b) => sum + b.price, 0);

  // 2. Faturamento Cantina (Total transactions from Bar/Lanchonete category)
  const totalCantinaRevenue = transactions
    .filter(t => t.category === 'Bar / Lanchonete' && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 3. Faturamento Diário (Today's bookings + Today's sales)
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const todayBookingsRevenue = todayBookings.reduce((sum, b) => sum + b.price, 0);
  
  const todayCantinaRevenue = transactions
    .filter(t => t.date === todayStr && t.category === 'Bar / Lanchonete' && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayTotalRevenue = todayBookingsRevenue + todayCantinaRevenue;

  // 4. Lucro Líquido Diário (Today's Daily Revenue - Today's Expenses - Today's Cost of Goods Sold)
  const todayExpense = transactions
    .filter(t => t.date === todayStr && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate Cost of Goods Sold (COGS) dynamically for today
  const todaySales = sales.filter(s => s.date === todayStr);
  const todayCogs = todaySales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    const cost = product ? product.costPrice : 0;
    return sum + (cost * sale.quantity);
  }, 0);

  // Lucro diário baseado estritamente no faturamento diário operacional de hoje
  const dailyNetProfit = todayTotalRevenue - todayExpense - todayCogs;

  // Filter bookings for today
  const todayBookingsList = bookings.filter(b => b.date === todayStr);

  // Prepare chart data (last 7 days)
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

  const handleResetClick = () => {
    if (resetStep === 0) {
      setResetStep(1);
    } else if (resetStep === 1) {
      setResetStep(2);
    } else if (resetStep === 2) {
      if (onResetAllData) {
        onResetAllData();
        showSuccess("Todo o painel foi resetado com sucesso!");
      }
      setResetStep(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
            Painel de Controle
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Gestão Arenas ⚽
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigate('calendar')}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm hover:bg-slate-100 transition-all"
            >
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Reset Panel Button with Double Confirmation */}
        <div className="relative z-10 flex flex-col items-end justify-center">
          {resetStep > 0 && (
            <div className="bg-slate-950/80 border border-rose-900 p-3 rounded-xl mb-2 text-xs text-rose-400 flex items-center gap-2 max-w-xs animate-in fade-in slide-in-from-bottom-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>
                {resetStep === 1 
                  ? "Atenção: Isso apagará todos os agendamentos, vendas e clientes. Clique novamente para confirmar." 
                  : "ÚLTIMO AVISO: Esta ação é irreversível! Clique mais uma vez para resetar tudo."}
              </span>
            </div>
          )}
          <Button
            onClick={handleResetClick}
            variant={resetStep > 0 ? "destructive" : "outline"}
            className={`rounded-xl px-4 py-2.5 flex items-center gap-2 font-bold transition-all ${
              resetStep === 0 
                ? "border-rose-900 text-rose-400 hover:bg-rose-950/30" 
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }`}
          >
            <Trash2 size={18} />
            {resetStep === 0 ? "Resetar Painel" : resetStep === 1 ? "Confirmar Reset" : "Confirmar Definitivamente"}
          </Button>
          {resetStep > 0 && (
            <button 
              onClick={() => setResetStep(0)}
              className="text-xs text-slate-400 hover:text-white underline mt-1"
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="absolute -right-10 -bottom-10 opacity-5 transform rotate-12 pointer-events-none">
          <Activity size={300} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Faturamento Diário */}
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white hover:border-slate-700 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Faturamento Diário</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {todayTotalRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">Soma de hoje (Campo + Cantina)</p>
          </CardContent>
        </Card>

        {/* Faturamento Campo */}
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white hover:border-slate-700 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Faturamento Campo</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalCampoRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">Total acumulado de reservas</p>
          </CardContent>
        </Card>

        {/* Faturamento Cantina */}
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white hover:border-slate-700 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Faturamento Cantina</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <Utensils className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalCantinaRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">Total acumulado de vendas</p>
          </CardContent>
        </Card>

        {/* Lucro Líquido Diário */}
        <Card className="border-slate-800 shadow-md bg-slate-900 text-white hover:border-slate-700 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Lucro Líquido Diário</CardTitle>
            <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dailyNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {dailyNetProfit.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Saldo líquido de hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Chart Section */}
      <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Desempenho Financeiro</CardTitle>
          <CardDescription className="text-slate-400">Fluxo de caixa dos últimos 7 dias</CardDescription>
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
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} />
              <Tooltip formatter={(value) => [`R$ ${value}`, '']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
              <Area type="monotone" dataKey="Receitas" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Agendamentos do Dia */}
      <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-white">Agendamentos do Dia</CardTitle>
            <CardDescription className="text-slate-400">Reservas e jogos agendados para hoje</CardDescription>
          </div>
          <button 
            onClick={() => onNavigate('calendar')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
          >
            Ver todos
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayBookingsList.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-950 border border-blue-900 p-2 text-blue-400 font-bold text-xs">
                    {booking.sport === 'Futebol' ? '⚽' : booking.sport === 'Tênis' ? '🎾' : '🏖️'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{booking.customerName}</p>
                    <p className="text-xs text-slate-400">
                      {booking.fieldName} • {booking.date} às {booking.timeSlot}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">R$ {booking.price.toFixed(2)}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    booking.paid 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                      : 'bg-amber-950 text-amber-400 border border-amber-900'
                  }`}>
                    {booking.paid ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
            {todayBookingsList.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum agendamento registrado para hoje.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}