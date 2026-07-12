"use client";

import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, Search, Trash2, User, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccess } from "@/utils/toast";

interface DiaristasManagementProps {
  bookings: any[];
  onDeleteBooking: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export default function DiaristasManagement({ bookings, onDeleteBooking, onTogglePaid }: DiaristasManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Buscar diarista por nome, quadra ou esporte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-slate-200"
          />
        </div>
        <div className="text-sm text-slate-500 font-semibold">
          Total de Diaristas: {filteredBookings.length}
        </div>
      </div>

      {/* Diaristas Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-blue-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <User size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">{booking.customerName}</CardTitle>
                    <CardDescription>{booking.customerPhone || "Sem telefone"}</CardDescription>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onTogglePaid(booking.id);
                    showSuccess("Status de pagamento atualizado!");
                  }}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all ${
                    booking.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {booking.paid ? 'Pago' : 'Pendente'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="font-medium text-slate-700">
                  {booking.date.split('-').reverse().join('/')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span>{booking.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {booking.sport}
                </span>
                <span className="text-xs text-slate-500">{booking.fieldName}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mt-2">
                <span className="text-xs text-slate-500">Valor da Reserva</span>
                <span className="font-bold text-slate-800">R$ {booking.price.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Deseja realmente cancelar o agendamento de "${booking.customerName}"?`)) {
                      onDeleteBooking(booking.id);
                      showSuccess("Agendamento cancelado!");
                    }
                  }}
                  className="w-full rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Cancelar Reserva
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredBookings.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-slate-500">Nenhum agendamento de diarista encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}