"use client";

import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  X, 
  Trash2, 
  Lock, 
  Unlock, 
  Users,
  CalendarDays,
  Award
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
  blockedSlots: any[];
  mensalistas: any[];
  eventos: any[];
  onAddBooking: (booking: any) => void;
  onDeleteBooking: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onBlockSlot: (block: any) => void;
  onUnblockSlot: (id: string) => void;
}

// Half-hour slots for broken hours support
const TIME_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "18:30 - 19:30",
  "19:00 - 20:00", "19:30 - 20:30", "20:00 - 21:00", "21:00 - 22:00",
  "22:00 - 23:00"
];

export default function BookingCalendar({ 
  bookings, 
  customers, 
  fields, 
  blockedSlots,
  mensalistas,
  eventos,
  onAddBooking,
  onDeleteBooking,
  onTogglePaid,
  onBlockSlot,
  onUnblockSlot
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || "");
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  
  // Form states for booking
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedSport, setSelectedSport] = useState("Futebol");
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:00");
  const [price, setPrice] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  // Form states for blocking
  const [blockTimeSlot, setBlockTimeSlot] = useState("");
  const [blockType, setBlockType] = useState<'single' | 'monthly'>('single');

  // Get day of week for selected date (0 = Sunday, 1 = Monday, etc.)
  const selectedDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();

  // Filter bookings for selected date and field
  const filteredBookings = bookings.filter(
    b => b.date === selectedDate && b.fieldId === selectedFieldId
  );

  // Filter mensalistas for selected day of week and field, respecting recurrence
  const activeMensalistas = mensalistas.filter(m => {
    if (!m.active || m.fieldId !== selectedFieldId || m.dayOfWeek !== selectedDayOfWeek) {
      return false;
    }

    // Recurrence logic
    if (m.recurrence === 'biweekly') {
      // Check if the week number of the year is even/odd to alternate weeks
      const dateObj = new Date(selectedDate + 'T00:00:00');
      const oneJan = new Date(dateObj.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((dateObj.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((dateObj.getDay() + 1 + numberOfDays) / 7);
      return weekNumber % 2 === 0;
    }

    if (m.recurrence === 'monthly_3x') {
      // Only show in the first 3 weeks of the month (day of month <= 21)
      const dayOfMonth = new Date(selectedDate + 'T00:00:00').getDate();
      return dayOfMonth <= 21;
    }

    return true; // weekly or custom defaults to true
  });

  // Filter events for selected date and field
  const activeEventos = eventos.filter(
    e => e.date === selectedDate && e.fieldId === selectedFieldId
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

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !startTime || !endTime || !selectedFieldId || !price) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const customTimeSlot = `${startTime} - ${endTime}`;

    // Check if slot is blocked
    const isBlocked = blockedSlots.some(b => {
      if (b.fieldId !== selectedFieldId || b.timeSlot !== customTimeSlot) return false;
      if (b.type === 'single' && b.date === bookingDate) return true;
      if (b.type === 'monthly') {
        const [bYear, bMonth] = b.date.split('-');
        const [sYear, sMonth] = bookingDate.split('-');
        return bMonth === sMonth && bYear === sYear;
      }
      return false;
    });

    if (isBlocked) {
      showError("Este horário está bloqueado pelo administrador!");
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
      date: bookingDate,
      timeSlot: customTimeSlot,
      price: parseFloat(price),
      paid: isPaid
    };

    onAddBooking(newBooking);
    showSuccess("Agendamento realizado com sucesso!");
    
    // Reset form
    setCustomerName("");
    setCustomerPhone("");
    setIsNewBookingOpen(false);
  };

  const handleBlockSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTimeSlot) {
      showError("Selecione um horário para bloquear.");
      return;
    }

    const newBlock = {
      id: Date.now().toString(),
      fieldId: selectedFieldId,
      date: selectedDate,
      timeSlot: blockTimeSlot,
      type: blockType
    };

    onBlockSlot(newBlock);
    showSuccess("Horário bloqueado com sucesso!");
    setBlockTimeSlot("");
    setIsBlockModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 mb-1">Data</span>
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-44 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 mb-1">Quadra</span>
            <Select value={selectedFieldId} onValueChange={handleFieldChange}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl border-slate-800 bg-slate-950 text-white">
                <SelectValue placeholder="Selecione a quadra" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-white">
                {fields.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button 
            onClick={() => setIsBlockModalOpen(true)}
            variant="outline"
            className="border-rose-900 text-rose-400 hover:bg-rose-950/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm"
          >
            <Lock size={16} />
            Bloquear Horário
          </Button>
          <Button 
            onClick={() => {
              setBookingDate(selectedDate);
              setIsNewBookingOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-bold text-xs sm:text-sm"
          >
            <Plus size={16} />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Time Slots List */}
        <Card className="lg:col-span-2 border-slate-800 shadow-md bg-slate-900 text-white">
          <CardHeader className="border-b border-slate-800 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="text-blue-400" size={20} />
              Grade de Horários Integrada
            </CardTitle>
            <CardDescription className="text-slate-400">
              Visualização em tempo real para o dia {selectedDate.split('-').reverse().join('/')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-800">
            {TIME_SLOTS.map(slot => {
              // 1. Check if slot is blocked
              const block = blockedSlots.find(b => {
                if (b.fieldId !== selectedFieldId || b.timeSlot !== slot) return false;
                if (b.type === 'single' && b.date === selectedDate) return true;
                if (b.type === 'monthly') {
                  const [bYear, bMonth] = b.date.split('-');
                  const [sYear, sMonth] = selectedDate.split('-');
                  return bMonth === sMonth && bYear === sYear;
                }
                return false;
              });

              // 2. Check if slot has a Diarista booking (including custom/broken hours)
              const booking = filteredBookings.find(b => {
                if (b.timeSlot === slot) return true;
                
                try {
                  const [slotStart, slotEnd] = slot.split(' - ');
                  const [bStart, bEnd] = b.timeSlot.split(' - ');
                  
                  const slotStartMin = parseInt(slotStart.split(':')[0]) * 60 + parseInt(slotStart.split(':')[1]);
                  const slotEndMin = parseInt(slotEnd.split(':')[0]) * 60 + parseInt(slotEnd.split(':')[1]);
                  const bStartMin = parseInt(bStart.split(':')[0]) * 60 + parseInt(bStart.split(':')[1]);
                  const bEndMin = parseInt(bEnd.split(':')[0]) * 60 + parseInt(bEnd.split(':')[1]);
                  
                  return (bStartMin < slotEndMin && bEndMin > slotStartMin);
                } catch (e) {
                  return false;
                }
              });

              // 3. Check if slot has a Mensalista
              const mensalista = activeMensalistas.find(m => m.timeSlot === slot);

              // 4. Check if slot has an Event
              const event = activeEventos.find(ev => {
                const [slotStart] = slot.split(' - ');
                const slotHour = parseInt(slotStart.split(':')[0]);
                const eventStartHour = parseInt(ev.startTime.split(':')[0]);
                const eventEndHour = parseInt(ev.endTime.split(':')[0]);
                return slotHour >= eventStartHour && slotHour < eventEndHour;
              });

              return (
                <div key={slot} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-950/50 transition-colors gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-300 w-28">{slot}</span>
                    
                    {block ? (
                      <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                        <Lock size={14} />
                        <span>Bloqueado pelo Administrador {block.type === 'monthly' && '(Mensal/Anual)'}</span>
                      </div>
                    ) : event ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-amber-950 text-amber-400 border border-amber-900 px-2.5 py-0.5 text-xs font-semibold">
                          🏆 Evento: {event.title}
                        </span>
                        <span className="text-xs text-slate-400">({event.description || "Sem detalhes"})</span>
                      </div>
                    ) : mensalista ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-blue-950 text-blue-400 border border-blue-900 px-2.5 py-0.5 text-xs font-semibold">
                          👤 Mensalista: {mensalista.customerName}
                        </span>
                        <span className="text-xs text-slate-400">({mensalista.sport})</span>
                      </div>
                    ) : booking ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900 px-2.5 py-0.5 text-xs font-semibold">
                          ⚽ Diarista: {booking.customerName}
                        </span>
                        <span className="text-xs text-slate-400">({booking.sport} • {booking.timeSlot})</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 italic">Disponível</span>
                    )}
                  </div>

                  <div className="self-end sm:self-auto">
                    {block ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onUnblockSlot(block.id);
                          showSuccess("Horário desbloqueado!");
                        }}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg flex items-center gap-1 text-xs"
                      >
                        <Unlock size={14} />
                        Desbloquear
                      </Button>
                    ) : !event && !mensalista && !booking ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const [start, end] = slot.split(' - ');
                          setStartTime(start);
                          setEndTime(end);
                          setBookingDate(selectedDate);
                          setIsNewBookingOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 rounded-lg font-bold text-xs"
                      >
                        Reservar
                      </Button>
                    ) : booking ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onTogglePaid(booking.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                            booking.paid 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900 hover:bg-emerald-900/50' 
                              : 'bg-amber-950 text-amber-400 border border-amber-900 hover:bg-amber-900/50'
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
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Stats & Info */}
        <div className="space-y-6">
          <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Resumo do Dia</CardTitle>
              <CardDescription className="text-slate-400">Estatísticas rápidas para a data selecionada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm text-slate-400">Diaristas Reservados</span>
                <span className="text-lg font-bold text-white">{filteredBookings.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm text-slate-400">Mensalistas Ativos Hoje</span>
                <span className="text-lg font-bold text-blue-400">{activeMensalistas.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm text-slate-400">Eventos Hoje</span>
                <span className="text-lg font-bold text-amber-400">{activeEventos.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Block Slot Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold">Bloquear Horário</h3>
                <p className="text-xs text-slate-400 mt-1">Impeça reservas neste horário específico</p>
              </div>
              <button onClick={() => setIsBlockModalOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBlockSlotSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-slate-300 font-semibold">Horário para Bloquear *</Label>
                <Select value={blockTimeSlot} onValueChange={setBlockTimeSlot}>
                  <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    {TIME_SLOTS.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 font-semibold">Tipo de Bloqueio</Label>
                <Select value={blockType} onValueChange={(v: any) => setBlockType(v)}>
                  <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    <SelectItem value="single">Apenas nesta data específica</SelectItem>
                    <SelectItem value="monthly">Bloqueio Mensal / Anual (Recorrente)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 rounded-xl border-slate-800 bg-slate-950 text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  Bloquear Horário
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold">Novo Agendamento</h3>
                <p className="text-xs text-slate-400 mt-1">Preencha os dados para reservar a quadra</p>
              </div>
              <button 
                onClick={() => setIsNewBookingOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Quick Select Existing Customer */}
              <div className="space-y-1">
                <Label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Users size={16} className="text-blue-400" />
                  Selecionar Cliente Cadastrado
                </Label>
                <Select onValueChange={handleSelectExistingCustomer}>
                  <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                    <SelectValue placeholder="Escolha um cliente existente (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-slate-800 my-2 pt-2" />

              <div className="space-y-1">
                <Label htmlFor="customerName" className="text-slate-300 font-semibold">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  placeholder="Ex: João Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="customerPhone" className="text-slate-300 font-semibold">Telefone</Label>
                <Input
                  id="customerPhone"
                  placeholder="Ex: (11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Esporte</Label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="Futebol">Futebol ⚽</SelectItem>
                      <SelectItem value="Tênis">Tênis 🎾</SelectItem>
                      <SelectItem value="Beach Tennis">Beach Tennis 🏖️</SelectItem>
                      <SelectItem value="Vôlei">Vôlei 🏐</SelectItem>
                      <SelectItem value="Futevôlei">Futevôlei ⚽🏖️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Quadra</Label>
                  <Select value={selectedFieldId} onValueChange={handleFieldChange}>
                    <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {fields.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Picker in Modal */}
              <div className="space-y-1">
                <Label htmlFor="bookingDate" className="text-slate-300 font-semibold">Data do Agendamento *</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              {/* Custom/Broken Hours Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="startTime" className="text-slate-300 font-semibold">Hora Início *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="endTime" className="text-slate-300 font-semibold">Hora Fim *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="price" className="text-slate-300 font-semibold">Valor (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="120.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 text-blue-600 focus:ring-blue-500 bg-slate-950"
                  />
                  <Label htmlFor="isPaid" className="text-slate-300 font-semibold cursor-pointer">Já está pago?</Label>
                </div>
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewBookingOpen(false)}
                  className="flex-1 rounded-xl border-slate-800 bg-slate-950 text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
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