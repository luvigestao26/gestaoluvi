"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, User, Calendar, Clock, DollarSign, Check, X, ShieldCheck, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import SplitPaymentInput from "./SplitPaymentInput";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" }
];

interface MensalistaManagementProps {
  mensalistas: any[];
  fields: any[];
  onAddMensalista: (mensalista: any) => void;
  onDeleteMensalista: (id: string) => void;
  onToggleActive: (id: string) => void;
}

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
  const [fieldId, setFieldId] = useState("");
  const [sport, setSport] = useState("Futebol");
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Array de dias selecionados (padrão: Segunda-feira)
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [price, setPrice] = useState("");
  const [recurrence, setRecurrence] = useState("weekly"); // weekly, biweekly, monthly_3x, custom
  const [dueDay, setDueDay] = useState("10"); // Dia de vencimento padrão: 10
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [splitPaymentDetails, setSplitPaymentDetails] = useState("");

  // Group mensalistas in the UI to show a single card per customer/schedule group
  const groupedMensalistas = React.useMemo(() => {
    const groups: { [key: string]: any } = {};
    mensalistas.forEach(m => {
      const key = `${m.customerName}-${m.timeSlot}-${m.fieldId}-${m.price}-${m.recurrence}-${m.paymentMethod}`;
      if (!groups[key]) {
        groups[key] = {
          ...m,
          daysOfWeek: [Number(m.dayOfWeek)],
          ids: [m.id]
        };
      } else {
        if (!groups[key].daysOfWeek.includes(Number(m.dayOfWeek))) {
          groups[key].daysOfWeek.push(Number(m.dayOfWeek));
        }
        groups[key].ids.push(m.id);
      }
    });
    Object.values(groups).forEach((g: any) => {
      g.daysOfWeek.sort((a: number, b: number) => a - b);
    });
    return Object.values(groups);
  }, [mensalistas]);

  // Sync fieldId when fields load asynchronously
  useEffect(() => {
    if (fields.length > 0 && !fieldId) {
      setFieldId(fields[0].id);
      setSport(fields[0].sport);
      setPrice(fields[0].pricePerHour.toString());
    }
  }, [fields, fieldId]);

  const handleFieldChange = (value: string) => {
    setFieldId(value);
    const field = fields.find(f => f.id === value);
    if (field) {
      setSport(field.sport);
      setPrice(field.pricePerHour.toString());
    }
  };

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayValue));
      } else {
        showError("Selecione pelo menos um dia da semana.");
      }
    } else {
      setSelectedDays([...selectedDays, dayValue].sort((a, b) => a - b));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !startTime || !endTime || !price || !fieldId) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (selectedDays.length === 0) {
      showError("Por favor, selecione pelo menos um dia da semana.");
      return;
    }

    const selectedField = fields.find(f => f.id === fieldId);
    const customTimeSlot = `${startTime} - ${endTime}`;
    const encodedRecurrence = `${recurrence}_due_${dueDay}`;
    const finalPaymentMethod = paymentMethod === 'Dividido' ? splitPaymentDetails : paymentMethod;

    // Divide o valor mensal total igualmente entre os dias selecionados
    const totalPrice = parseFloat(price);
    const pricePerDay = totalPrice / selectedDays.length;

    selectedDays.forEach((day, index) => {
      const newMensalista = {
        id: `${Date.now()}-${day}-${index}`,
        customerName,
        customerPhone,
        fieldId,
        fieldName: selectedField ? selectedField.name : "Quadra",
        sport,
        dayOfWeek: day,
        timeSlot: customTimeSlot,
        price: pricePerDay,
        active: true,
        recurrence: encodedRecurrence,
        paymentMethod: finalPaymentMethod
      };
      onAddMensalista(newMensalista);
    });

    showSuccess(`Mensalista cadastrado com sucesso para ${selectedDays.length} dia(s) da semana!`);
    
    // Reset
    setCustomerName("");
    setCustomerPhone("");
    setStartTime("18:00");
    setEndTime("19:30");
    setPrice("");
    setDueDay("10");
    setSelectedDays([1]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white">Mensalistas</h2>
          <p className="text-sm text-slate-400">Gerencie os clientes mensalistas com horários fixos semanais (suporta múltiplos dias)</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto font-bold"
        >
          <Plus size={18} />
          Novo Mensalista
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groupedMensalistas.map((m) => {
          const [recType, decodedDueDay] = (m.recurrence || 'weekly').split('_due_');
          
          return (
            <Card key={m.id} className="border-slate-800 shadow-md bg-slate-900 text-white overflow-hidden hover:border-slate-700 transition-all">
              <div className="h-2 bg-blue-500" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-full bg-blue-950 border border-blue-900 p-2 text-blue-400">
                      <User size={18} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-white">{m.customerName}</CardTitle>
                      <CardDescription className="text-slate-400">{m.customerPhone || "Sem telefone"}</CardDescription>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      m.ids.forEach((id: string) => onToggleActive(id));
                      showSuccess("Status de atividade atualizado!");
                    }}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      m.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {m.daysOfWeek.map((dayNum: number) => (
                      <span key={dayNum} className="inline-block bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2 py-0.5 rounded-lg font-semibold">
                        {DAYS_OF_WEEK.find(d => d.value === dayNum)?.short}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span>{m.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-slate-400" />
                  <span>{m.fieldName} ({m.sport})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Recorrência:</span>
                  <span className="text-xs font-semibold text-blue-400">
                    {recType === 'weekly' ? 'Toda semana' : 
                     recType === 'biweekly' ? 'De 15 em 15 dias' : 
                     recType === 'monthly_3x' ? '3 vezes no mês' : 'Personalizado'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-400">Vencimento:</span>
                  <span className="text-xs font-bold text-amber-400">Todo dia {decodedDueDay || '10'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Pagamento:</span>
                  <span className="text-xs font-semibold text-emerald-400">{m.paymentMethod || 'Pix'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl mt-2">
                  <span className="text-xs text-slate-400">Mensalidade Total</span>
                  <span className="font-bold text-white">R$ {(m.price * m.daysOfWeek.length).toFixed(2)}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o mensalista "${m.customerName}" de todos os dias selecionados?`)) {
                        m.ids.forEach((id: string) => onDeleteMensalista(id));
                        showSuccess("Mensalista excluído com sucesso!");
                      }
                    }}
                    className="w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Trash2 size={14} />
                    Excluir Mensalista
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {groupedMensalistas.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <p className="text-slate-400">Nenhum mensalista cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold">Novo Mensalista</h3>
                <p className="text-xs text-slate-400 mt-1">Cadastre horários fixos semanais</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <Label htmlFor="mName" className="text-slate-300 font-semibold">Nome do Cliente / Escolinha *</Label>
                <Input
                  id="mName"
                  placeholder="Ex: Escolinha de Futebol Fla"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mPhone" className="text-slate-300 font-semibold">Telefone / WhatsApp</Label>
                <Input
                  id="mPhone"
                  placeholder="Ex: (11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Quadra</Label>
                  <Select value={fieldId} onValueChange={handleFieldChange}>
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

                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Esporte</Label>
                  <Select value={sport} onValueChange={setSport}>
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
              </div>

              {/* Multi-select Days of Week */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold block">Dias da Semana * (Selecione um ou mais)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = selectedDays.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDay(d.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                            : 'border-slate-800 text-slate-400 hover:bg-slate-850'
                        }`}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom/Broken Hours Inputs for Mensalista */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="mStart" className="text-slate-300 font-semibold">Hora Início *</Label>
                  <Input
                    id="mStart"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mEnd" className="text-slate-300 font-semibold">Hora Fim *</Label>
                  <Input
                    id="mEnd"
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
                  <Label className="text-slate-300 font-semibold">Recorrência</Label>
                  <Select value={recurrence} onValueChange={setRecurrence}>
                    <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="weekly">Toda semana</SelectItem>
                      <SelectItem value="biweekly">De 15 em 15 dias</SelectItem>
                      <SelectItem value="monthly_3x">3 vezes no mês</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Dia de Vencimento *</Label>
                  <Select value={dueDay} onValueChange={setDueDay}>
                    <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white max-h-48 overflow-y-auto">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={day.toString()}>Todo dia {day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="Dividido">Dividido 🤝</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mPrice" className="text-slate-300 font-semibold">Valor Mensal Total (R$) *</Label>
                  <Input
                    id="mPrice"
                    type="number"
                    placeholder="Ex: 1000.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>
              </div>

              {paymentMethod === 'Dividido' && (
                <SplitPaymentInput 
                  totalPrice={parseFloat(price) || 0} 
                  onChange={setSplitPaymentDetails} 
                />
              )}

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