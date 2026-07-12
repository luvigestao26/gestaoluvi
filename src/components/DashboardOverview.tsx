"use client";

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  Clock, 
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardOverviewProps {
  bookings: any[];
  customers: any[];
  fields: any[];
  transactions: any[];
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({ bookings, customers, fields, transactions, onNavigate }: DashboardOverviewProps) {
  // Calculate metrics
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const todayRevenue = todayBookings
    .filter(b => b.paid)
    .reduce((sum, b) => sum + b.price, 0);

  // Occupancy rate calculation (assuming 10 slots per field per day)
  const totalSlotsAvailable = fields.length * 10;
  const occupancyRate = totalSlotsAvailable > 0 
    ? Math.min(Math.round((todayBookings.length / totalSlotsAvailable) * 100), 100)
    : 0;

  // Bookings by sport
  const sportStats = bookings.reduce((acc: any, b) => {
    acc[b.sport] = (acc[b.sport] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-100">
            Painel de Controle
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Bem-vindo ao ArenaGestão! ⚽🎾
          </h1>
          <p className="mt-2 text-emerald-100">
            Gerencie suas quadras, agendamentos, clientes e financeiro em um único lugar de forma simples e rápida.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigate('calendar')}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition-all"
            >
              Novo Agendamento
            </button>
            <button 
              onClick={() => onNavigate('fields')}
              className="rounded-xl bg-emerald-700/40 border border-emerald-400/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700/60 transition-all"
            >
              Ver Quadras
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 transform rotate-12 pointer-events-none">
          <Activity size={300} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Total</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Lucro líquido: R$ {netProfit.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos Hoje</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{todayBookings.length}</div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              Receita hoje: R$ {todayRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{occupancyRate}%</div>
            <div className="mt-2">
              <Progress value={occupancyRate} className="h-1.5 bg-amber-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{customers.length}</div>
            <p className="text-xs text-purple-600 flex items-center mt-1">
              <Award className="h-3 w-3 mr-1" />
              Fidelizados e ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Sport Distribution */}
        <Card className="col-span-3 border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Popularidade por Esporte</CardTitle>
            <CardDescription>Distribuição de agendamentos realizados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(sportStats).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum agendamento registrado ainda.
              </div>
            ) : (
              Object.entries(sportStats).map(([sport, count]: [string, any]) => {
                const percentage = Math.round((count / bookings.length) * 100);
                const colors: any = {
                  'Futebol': 'bg-emerald-500',
                  'Tênis': 'bg-amber-500',
                  'Beach Tennis': 'bg-orange-400',
                  'Vôlei': 'bg-blue-500',
                  'Futevôlei': 'bg-teal-500'
                };
                return (
                  <div key={sport} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{sport}</span>
                      <span className="text-muted-foreground">{count} jogos ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className={`h-2 ${colors[sport] || 'bg-slate-500'}`} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="col-span-4 border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Últimos Agendamentos</CardTitle>
              <CardDescription>Próximos jogos e reservas recentes</CardDescription>
            </div>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Ver todos
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 font-bold text-xs">
                      {booking.sport === 'Futebol' ? '⚽' : booking.sport === 'Tênis' ? '🎾' : '🏖️'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.fieldName} • {booking.date} às {booking.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">R$ {booking.price.toFixed(2)}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      booking.paid 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {booking.paid ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum agendamento recente.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}