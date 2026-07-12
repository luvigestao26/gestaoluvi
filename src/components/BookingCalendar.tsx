"use client";

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  DollarSign, 
  User, 
  Activity,
  Search,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

interface BookingCalendarProps {
  bookings: any[];
  customers: any[];
  fields: any[];
  onAddBooking: (booking: any) => void;
  onDeleteBooking: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

const TIME_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00",
  "20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00"
];

export default function BookingCalendar({ 
  bookings, 
  customers, 
  fields, 
  onAddBooking, 
  onDeleteBooking, 
  onTogglePaid 
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || "");
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedSport, setSelectedSport] = useState("Futebol");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [price, setPrice] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  // Filter bookings for selected date and field
  const filteredBookings = bookings.filter(
    b => b.date === selectedDate && b.fieldId === selectedFieldId
  );

  const handleFieldChange = (value: string) => {
    setSelectedFieldId(value);
    const field = fields.find(f => f.id === value);
    if (field) {
      setSelectedSport(field.sport);
      setPrice(field.pricePerHour.toString());
    }
  };

  const handleSelectExistingCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedTimeSlot || !selectedFieldId || !price) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Check if slot is already booked
    const isAlreadyBooked = bookings.some(
      b => b.date === selectedDate && b.fieldId === selectedFieldId && b.timeSlot === selectedTimeSlot
    );

    if (isAlreadyBooked) {
      showError("Este horário já está reservado para esta quadra!");
      return;
    }

    const field = fields.find(f => f.id === selectedFieldId);

    const newBooking = {
      id: Date.now().toString(),
      customerName,
      customerPhone,
      fieldId: selectedFieldId,
      fieldName: field ? field.name : "Quadra",
      sport: selectedSport,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      price: parseFloat(price),
      paid: isPaid
    };

    onAddBooking(newBooking);
    showSuccess("Agendamento realizado com sucesso!");
    
    // Reset form
    setCustomerName("");
    setCustomerPhone("");
    setSelectedTimeSlot("");
    setIsNewBookingOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 mb-1">Data</span>
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-44 rounded-xl border-slate-200 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 mb-1">Quadra</span>
            <Select value={selectedFieldId} onValueChange={handleFieldChange}>
              <SelectTrigger className="w-48 rounded-xl border-slate-200">
                <SelectValue placeholder="Selecione a quadra" />
              </SelectTrigger>
              <SelectContent>
                {fields.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={() => setIsNewBookingOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-end sm:self-auto"
        >
          <Plus size={18} />
          Novo Agendamento
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Time Slots List */}
        <Card className="lg:col-span-2 border-none shadow-md bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="text-emerald-600" size={20} />
              Grade de Horários
            </CardTitle>
            <CardDescription>
              Horários para o dia {selectedDate.split('-').reverse().join('/')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {TIME_SLOTS.map(slot => {
              const booking = filteredBookings.find(b => b.timeSlot === slot);
              return (
                <div key={slot} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-600 w-28">{slot}</span>
                    {booking ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {booking.sport}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{booking.customerName}</span>
                        {booking.customerPhone && (
                          <span className="text-xs text-slate-400">({booking.customerPhone})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Disponível</span>
                    )}
                  </div>

                  <div>
                    {booking ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onTogglePaid(booking.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                            booking.paid 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {booking.paid ? 'Pago' : 'Pendente'}
                        </button>
                        <button
                          onClick={() => {
                            if(confirm("Deseja realmente cancelar este agendamento?")) {
                              onDeleteBooking(booking.id);
                              showSuccess("Agendamento cancelado!");
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTimeSlot(slot);
                          const field = fields.find(f => f.id === selectedFieldId);
                          if (field) {
                            setSelectedSport(field.sport);
                            setPrice(field.pricePerHour.toString());
                          }
                          setIsNewBookingOpen(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                      >
                        Reservar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Stats & Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Resumo do Dia</CardTitle>
              <CardDescription>Estatísticas rápidas para a data selecionada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total de Reservas</span>
                <span className="text-lg font-bold text-slate-800">{filteredBookings.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Receita Estimada</span>
                <span className="text-lg font-bold text-emerald-600">
                  R$ {filteredBookings.reduce((sum, b) => sum + b.price, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Confirmados (Pagos)</span>
                <span className="text-lg font-bold text-blue-600">
                  {filteredBookings.filter(b => b.paid).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Booking Modal */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Novo Agendamento</h3>
                <p className="text-xs text-emerald-100 mt-1">Preencha os dados para reservar a quadra</p>
              </div>
              <button 
                onClick={() => setIsNewBookingOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Quick Select Existing Customer */}
              <div className="space-y-1">
                <Label className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Users size={16} className="text-emerald-600" />
                  Selecionar Cliente Cadastrado
                </Label>
                <Select onValueChange={handleSelectExistingCustomer}>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Escolha um cliente existente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-slate-100 my-2 pt-2" />

              <div className="space-y-1">
                <Label htmlFor="customerName" className="text-slate-700 font-semibold">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  placeholder="Ex: João Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="customerPhone" className="text-slate-700 font-semibold">Telefone</Label>
                <Input
                  id="customerPhone"
                  placeholder="Ex: (11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Esporte</Label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Futebol">Futebol ⚽</SelectItem>
                      <SelectItem value="Tênis">Tênis 🎾</SelectItem>
                      <SelectItem value="Beach Tennis">Beach Tennis 🏖️</SelectItem>
                      <SelectItem value="Vôlei">Vôlei 🏐</SelectItem>
                      <SelectItem value="Futevôlei">Futevôlei ⚽🏖️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Horário *</Label>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="price" className="text-slate-700 font-semibold">Valor (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="120.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="isPaid" className="text-slate-700 font-semibold cursor-pointer">Já está pago?</Label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewBookingOpen(false)}
                  className="flex-1 rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Confirmar Reserva
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}