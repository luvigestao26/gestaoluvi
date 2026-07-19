"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Search, Trash2, User, Check, X, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { getBrasiliaDate } from "@/utils/date";
import SplitPaymentInput from "./SplitPaymentInput";

interface DiaristasManagementProps {
  bookings: any[];
  fields: any[];
  customers: any[];
  onAddBooking: (booking: any) => void;
  onDeleteBooking: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export default function DiaristasManagement({ 
  bookings, 
  fields, 
  customers, 
  onAddBooking, 
  onDeleteBooking, 
  onTogglePaid 
}: DiaristasManagementProps) {
  const todayStr = getBrasiliaDate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Form states for new Diarista booking
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [selectedSport, setSelectedSport] = useState("Futebol");
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:00");
  const [price, setPrice] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [splitPaymentDetails, setSplitPaymentDetails] = useState("");

  // Derive unique customers from existing bookings (diaristas) and mensalistas
  const derivedCustomers = React.useMemo(() => {
    const list: Array<{ id: string; name: string; phone: string }> = [];
    const seen = new Set<string>();

    bookings.forEach(b => {
      if (b.customerName) {
        const key = `${b.customerName.trim().toLowerCase()}_${(b.customerPhone || '').trim()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            id: `b-${b.id}`,
            name: b.customerName,
            phone: b.customerPhone || ''
          });
        }
      }
    });

    return list;
  }, [bookings]);

  // Sync selectedFieldId when fields load asynchronously
  useEffect(() => {
    if (fields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(fields[0].id);
      setSelectedSport(fields[0].sport);
      setPrice(fields[0].pricePerHour.toString());
    }
  }, [fields, selectedFieldId]);

  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.sport.toLowerCase().includes(searchQuery.toLowerCase())
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
    const customer = derivedCustomers.find(c => c.id === customerId);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !startTime || !endTime || !selectedFieldId || !price) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const customTimeSlot = `${startTime} - ${endTime}`;
    const field = fields.find(f => f.id === selectedFieldId);
    const finalPaymentMethod = paymentMethod === 'Dividido' ? splitPaymentDetails : paymentMethod;

    const newBooking = {
      id: Date.now().toString(),
      customerName,
      customerPhone,
      fieldId: selectedFieldId,
      fieldName: field ? field.name : "Quadra",
      sport: selectedSport,
      date,
      timeSlot: customTimeSlot,
      price: parseFloat(price),
      paid: isPaid,
      paymentMethod: finalPaymentMethod
    };

    onAddBooking(newBooking);
    showSuccess("Diarista agendado com sucesso!");

    // Reset
    setCustomerName("");
    setCustomerPhone("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Buscar diarista por nome, quadra ou esporte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
          />
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-bold"
        >
          <Plus size={18} />
          Novo Diarista
        </Button>
      </div>

      {/* Diaristas Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="border-slate-800 shadow-md bg-slate-900 text-white overflow-hidden hover:border-slate-700 transition-all">
            <div className="h-2 bg-blue-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-full bg-blue-950 border border-blue-900 p-2 text-blue-400">
                    <User size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-white">{booking.customerName}</CardTitle>
                    <CardDescription className="text-slate-400">{booking.customerPhone || "Sem telefone"}</CardDescription>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onTogglePaid(booking.id);
                    showSuccess("Status de pagamento atualizado!");
                  }}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all ${
                    booking.paid 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                      : 'bg-amber-950 text-amber-400 border border-amber-900'
                  }`}
                >
                  {booking.paid ? 'Pago' : 'Pendente'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="font-medium text-slate-200">
                  {booking.date.split('-').reverse().join('/')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span>{booking.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-950 text-blue-400 border border-blue-900 px-2.5 py-0.5 text-xs font-medium">
                  {booking.sport}
                </span>
                <span className="text-xs text-slate-400">{booking.fieldName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Pagamento:</span>
                <span className="text-xs font-semibold text-emerald-400">{booking.paymentMethod || 'Pix'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl mt-2">
                <span className="text-xs text-slate-400">Valor da Reserva</span>
                <span className="font-bold text-white">R$ {booking.price.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Deseja realmente cancelar o agendamento de "${booking.customerName}"?`)) {
                      onDeleteBooking(booking.id);
                      showSuccess("Agendamento cancelado!");
                    }
                  }}
                  className="w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center justify-center gap-1.5 font-bold"
                >
                  <Trash2 size={14} />
                  Cancelar Reserva
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredBookings.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <p className="text-slate-400">Nenhum agendamento de diarista encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold">Novo Diarista</h3>
                <p className="text-xs text-slate-400 mt-1">Agende uma reserva avulsa</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Quick Select Existing Customer */}
              <div className="space-y-1">
                <Label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Users size={16} className="text-blue-400" />
                  Selecionar Cliente Cadastrado
                </Label>
                <select
                  onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 text-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-slate-950 text-white">Escolha um cliente existente (opcional)</option>
                  {derivedCustomers.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-950 text-white">
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
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
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 text-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Futebol" className="bg-slate-950 text-white">Futebol ⚽</option>
                    <option value="Tênis" className="bg-slate-950 text-white">Tênis 🎾</option>
                    <option value="Beach Tennis" className="bg-slate-950 text-white">Beach Tennis 🏖️</option>
                    <option value="Vôlei" className="bg-slate-950 text-white">Vôlei 🏐</option>
                    <option value="Futevôlei" className="bg-slate-950 text-white">Futevôlei ⚽🏖️</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Quadra</Label>
                  <select
                    value={selectedFieldId}
                    onChange={(e) => handleFieldChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 text-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fields.map(f => (
                      <option key={f.id} value={f.id} className="bg-slate-950 text-white">{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="date" className="text-slate-300 font-semibold">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 text-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pix" className="bg-slate-950 text-white">Pix 📱</option>
                    <option value="Dinheiro" className="bg-slate-950 text-white">Dinheiro 💵</option>
                    <option value="Cartão de Crédito" className="bg-slate-950 text-white">Cartão de Crédito 💳</option>
                    <option value="Cartão de Débito" className="bg-slate-950 text-white">Cartão de Débito 💳</option>
                    <option value="Dividido" className="bg-slate-950 text-white">Dividido 🤝</option>
                  </select>
                </div>
              </div>

              {paymentMethod === 'Dividido' && (
                <SplitPaymentInput 
                  totalPrice={parseFloat(price) || 0} 
                  onChange={setSplitPaymentDetails} 
                />
              )}

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
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border-slate-800 bg-slate-950 text-white font-bold"
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