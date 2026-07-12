"use client";

import React, { useState } from 'react';
import { Plus, Trash2, User, Calendar, Clock, DollarSign, Check, X, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

interface MensalistaManagementProps {
  mensalistas: any[];
  fields: any[];
  onAddMensalista: (mensalista: any) => void;
  onDeleteMensalista: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" }
];

const TIME_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00",
  "20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00"
];

export default function MensalistaManagement({ 
  mensalistas, 
  fields, 
  onAddMensalista, 
  onDeleteMensalista, 
  onToggleActive 
}: MensalistaManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fieldId, setFieldId] = useState(fields[0]?.id || "");
  const [sport, setSport] = useState("Futebol");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [timeSlot, setTimeSlot] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !timeSlot || !price) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const selectedField = fields.find(f => f.id === fieldId);

    const newMensalista = {
      id: Date.now().toString(),
      customerName,
      customerPhone,
      fieldId,
      fieldName: selectedField ? selectedField.name : "Quadra",
      sport,
      dayOfWeek: parseInt(dayOfWeek),
      timeSlot,
      price: parseFloat(price),
      active: true
    };

    onAddMensalista(newMensalista);
    showSuccess("Mensalista cadastrado com sucesso!");
    
    // Reset
    setCustomerName("");
    setCustomerPhone("");
    setTimeSlot("");
    setPrice("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Mensalistas</h2>
          <p className="text-sm text-slate-500">Gerencie os clientes mensalistas com horários fixos semanais</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Novo Mensalista
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mensalistas.map((m) => (
          <Card key={m.id} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-emerald-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                    <User size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">{m.customerName}</CardTitle>
                    <CardDescription>{m.customerPhone || "Sem telefone"}</CardDescription>
                  </div>
                </div>
                <button
                  onClick={() => onToggleActive(m.id)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    m.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="font-medium text-slate-700">
                  {DAYS_OF_WEEK.find(d => d.value === m.dayOfWeek)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span>{m.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-slate-400" />
                <span>{m.fieldName} ({m.sport})</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mt-2">
                <span className="text-xs text-slate-500">Mensalidade</span>
                <span className="font-bold text-slate-800">R$ {m.price.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Deseja realmente excluir o mensalista "${m.customerName}"?`)) {
                      onDeleteMensalista(m.id);
                      showSuccess("Mensalista excluído com sucesso!");
                    }
                  }}
                  className="w-full rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Excluir Mensalista
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {mensalistas.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-slate-500">Nenhum mensalista cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Novo Mensalista</h3>
                <p className="text-xs text-emerald-100 mt-1">Cadastre um horário fixo semanal</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="mName" className="text-slate-700 font-semibold">Nome do Cliente *</Label>
                <Input
                  id="mName"
                  placeholder="Ex: Carlos Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mPhone" className="text-slate-700 font-semibold">Telefone / WhatsApp</Label>
                <Input
                  id="mPhone"
                  placeholder="Ex: (11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Quadra</Label>
                  <Select value={fieldId} onValueChange={setFieldId}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Esporte</Label>
                  <Select value={sport} onValueChange={setSport}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Dia da Semana</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(d => (
                        <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Horário *</Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
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

              <div className="space-y-1">
                <Label htmlFor="mPrice" className="text-slate-700 font-semibold">Valor Mensal (R$) *</Label>
                <Input
                  id="mPrice"
                  type="number"
                  placeholder="Ex: 400.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Salvar Mensalista
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}