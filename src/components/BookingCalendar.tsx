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

// Helper functions for time calculations
const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.trim().split(':').map(Number);
  return hours * 60 + minutes;
};

const formatMinutesToTime = (mins: number): string => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

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
  const [paymentMethod, setPaymentMethod] = useState("Pix");

  // Form states for blocking
  const [blockStartTime, setBlockStartTime] = useState("10:00");
  const [blockEndTime, setBlockEndTime] = useState("11:00");
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
      const dateObj = new Date(selectedDate + 'T00:00:00');
      const oneJan = new Date(dateObj.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((dateObj.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((dateObj.getDay() + 1 + numberOfDays) / 7);
      return weekNumber % 2 === 0;
    }

    if (m.recurrence === 'monthly_3x') {
      const dayOfMonth = new Date(selectedDate + 'T00:00:00').getDate();
      return dayOfMonth <= 21;
    }

    return true;
  });

  // Filter events for selected date and field
  const activeEventos = eventos.filter(
    e => e.date === selectedDate && e.fieldId === selectedFieldId
  );

  // Filter blocks for selected date and field
  const activeBlocks = blockedSlots.filter(b => {
    if (b.fieldId !== selectedFieldId) return false;
    if (b.type === 'single' && b.date === selectedDate) return true;
    if (b.type === 'monthly') {
      const [bYear, bMonth] = b.date.split('-');
      const [sYear, sMonth] = selectedDate.split('-');
      return bMonth === sMonth && bYear === sYear;
    }
    return false;
  });

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

  // Dynamic Timeline Generation Algorithm
  const generateTimeline = () => {
    const dayStart = 480; // 08:00 in minutes
    const dayEnd = 1380; // 23:00 in minutes

    // Collect all busy intervals
    const busyIntervals: Array<{
      start: number;
      end: number;
      type: 'booking' | 'mensalista' | 'event' | 'block';
      label: string;
      data: any;
    }> = [];

    // 1. Add Diarista bookings
    filteredBookings.forEach(b => {
      try {
        const [startStr, endStr] = b.timeSlot.split('-');
        busyIntervals.push({
          start: parseTimeToMinutes(startStr),
          end: parseTimeToMinutes(endStr),
          type: 'booking',
          label: b.customerName,
          data: b
        });
      } catch (e) {}
    });

    // 2. Add Mensalistas
    activeMensalistas.forEach(m => {
      try {
        const [startStr, endStr] = m.timeSlot.split('-');
        busyIntervals.push({
          start: parseTimeToMinutes(startStr),
          end: parseTimeToMinutes(endStr),
          type: 'mensalista',
          label: m.customerName,
          data: m
        });
      } catch (e) {}
    });

    // 3. Add Events
    activeEventos.forEach(ev => {
      try {
        busyIntervals.push({
          start: parseTimeToMinutes(ev.startTime),
          end: parseTimeToMinutes(ev.endTime),
          type: 'event',
          label: ev.title,
          data: ev
        });
      } catch (e) {}
    });

    // 4. Add Blocks
    activeBlocks.forEach(block => {
      try {
        const [startStr, endStr] = block.timeSlot.split('-');
        busyIntervals.push({
          start: parseTimeToMinutes(startStr),
          end: parseTimeToMinutes(endStr),
          type: 'block',
          label: 'Bloqueado',
          data: block
        });
      } catch (e) {}
    });

    // Sort busy intervals by start time
    busyIntervals.sort((a, b) => a.start - b.start);

    // Build the timeline
    const timeline: Array<{
      start: number;
      end: number;
      isBusy: boolean;
      type?: 'booking' | 'mensalista' | 'event' | 'block';
      label?: string;
      data?: any;
    }> = [];

    let current = dayStart;

    busyIntervals.forEach(interval => {
      // If there is a gap before this busy interval, fill it with free slots
      if (interval.start > current) {
        let gapStart = current;
        const gapEnd = interval.start;

        // Split the gap into 1-hour slots for better usability
        while (gapStart < gapEnd) {
          const nextHour = gapStart + 60;
          const slotEnd = Math.min(nextHour, gapEnd);
          timeline.push({
            start: gapStart,
            end: slotEnd,
            isBusy: false
          });
          gapStart = slotEnd;
        }
      }

      // Add the busy interval
      timeline.push({
        start: interval.start,
        end: interval.end,
        isBusy: true,
        type: interval.type,
        label: interval.label,
        data: interval.data
      });

      current = Math.max(current, interval.end);
    });

    // Fill any remaining gap at the end of the day
    if (current < dayEnd) {
      let gapStart = current;
      while (gapStart < dayEnd) {
        const nextHour = gapStart + 60;
        const slotEnd = Math.min(nextHour, dayEnd);
        timeline.push({
          start: gapStart,
          end: slotEnd,
          isBusy: false
        });
        gapStart = slotEnd;
      }
    }

    return timeline;
  };

  const timeline = generateTimeline();

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !startTime || !endTime || !selectedFieldId || !price) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const customTimeSlot = `${startTime} - ${endTime}`;
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
      paid: isPaid,
      paymentMethod
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
    if (!blockStartTime || !blockEndTime) {
      showError("Selecione o horário de início e fim para bloquear.");
      return;
    }

    const newBlock = {
      id: Date.now().toString(),
      fieldId: selectedFieldId,
      date: selectedDate,
      timeSlot: `${blockStartTime} - ${blockEndTime}`,
      type: blockType
    };

    onBlockSlot(newBlock);
    showSuccess("Horário bloqueado com sucesso!");
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
              Grade de Horários Dinâmica
            </CardTitle>
            <CardDescription className="text-slate-400">
              Visualização em tempo real para o dia {selectedDate.split('-').reverse().join('/')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-800">
            {timeline.map((slot, index) => {
              const slotTimeStr = `${formatMinutesToTime(slot.start)} - ${formatMinutesToTime(slot.end)}`;

              return (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-950/50 transition-colors gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-300 w-28">{slotTimeStr}</span>
                    
                    {slot.isBusy ? (
                      slot.type === 'block' ? (
                        <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                          <Lock size={14} />
                          <span>Bloqueado pelo Administrador {slot.data?.type === 'monthly' && '(Mensal/Anual)'}</span>
                        </div>
                      ) : slot.type === 'event' ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center rounded-full bg-amber-950 text-amber-400 border border-amber-900 px-2.5 py-0.5 text-xs font-semibold">
                            🏆 Evento: {slot.label}
                          </span>
                          <span className="text-xs text-slate-400">({slot.data?.description || "Sem detalhes"})</span>
                        </div>
                      ) : slot.type === 'mensalista' ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center rounded-full bg-blue-950 text-blue-400 border border-blue-900 px-2.5 py-0.5 text-xs font-semibold">
                            👤 Mensalista: {slot.label}
                          </span>
                          <span className="text-xs text-slate-400">({slot.data?.sport})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900 px-2.5 py-0.5 text-xs font-semibold">
                            ⚽ Diarista: {slot.label}
                          </span>
                          <span className="text-xs text-slate-400">({slot.data?.sport})</span>
                        </div>
                      )
                    ) : (
                      <span className="text-sm text-slate-500 italic">Disponível</span>
                    )}
                  </div>

                  <div className="self-end sm:self-auto">
                    {slot.isBusy ? (
                      slot.type === 'block' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onUnblockSlot(slot.data.id);
                            showSuccess("Horário desbloqueado!");
                          }}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg flex items-center gap-1 text-xs"
                        >
                          <Unlock size={14} />
                          Desbloquear
                        </Button>
                      ) : slot.type === 'booking' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onTogglePaid(slot.data.id)}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                              slot.data.paid 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900 hover:bg-emerald-900/50' 
                                : 'bg-amber-950 text-amber-400 border border-amber-900 hover:bg-amber-900/50'
                            }`}
                          >
                            {slot.data.paid ? 'Pago' : 'Pendente'}
                          </button>
                          <button
                            onClick={() => {
                              if(confirm("Deseja realmente cancelar este agendamento?")) {
                                onDeleteBooking(slot.data.id);
                                showSuccess("Agendamento cancelado!");
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : null
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setStartTime(formatMinutesToTime(slot.start));
                          setEndTime(formatMinutesToTime(slot.end));
                          setBookingDate(selectedDate);
                          setIsNewBookingOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 rounded-lg font-bold text-xs"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="blockStart" className="text-slate-300 font-semibold">Hora Início *</Label>
                  <Input
                    id="blockStart"
                    type="time"
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="blockEnd" className="text-slate-300 font-semibold">Hora Fim *</Label>
                  <Input
                    id="blockEnd"
                    type="time"
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>
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

                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="Pix">Pix 📱</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro 💵</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito 💳</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito 💳</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-800 text-blue-600 focus:ring-blue-500 bg-slate-950"
                />
                <Label htmlFor="isPaid" className="text-slate-300 font-semibold cursor-pointer">Já está pago?</Label>
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