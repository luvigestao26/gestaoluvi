"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, DollarSign, Tag, X, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

interface EventManagementProps {
  eventos: any[];
  fields: any[];
  onAddEvento: (evento: any) => void;
  onDeleteEvento: (id: string) => void;
}

export default function EventManagement({ eventos, fields, onAddEvento, onDeleteEvento }: EventManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dates, setDates] = useState<string[]>([new Date().toISOString().split('T')[0]]); // Array de datas selecionadas
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [price, setPrice] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [recurrence, setRecurrence] = useState("once"); // once, weekly, biweekly, monthly_3x, custom
  const [paymentMethod, setPaymentMethod] = useState("Pix");

  // Group events in the UI to show a single card per event series
  const groupedEventos = React.useMemo(() => {
    const groups: { [key: string]: any } = {};
    eventos.forEach(ev => {
      // Group by title, description, startTime, endTime, price, fieldId, recurrence, paymentMethod
      const key = `${ev.title}-${ev.description}-${ev.startTime}-${ev.endTime}-${ev.price}-${ev.fieldId}-${ev.recurrence}-${ev.paymentMethod}`;
      if (!groups[key]) {
        groups[key] = {
          ...ev,
          dates: [ev.date],
          ids: [ev.id]
        };
      } else {
        if (!groups[key].dates.includes(ev.date)) {
          groups[key].dates.push(ev.date);
        }
        groups[key].ids.push(ev.id);
      }
    });
    // Sort dates for each group
    Object.values(groups).forEach((g: any) => {
      g.dates.sort();
    });
    return Object.values(groups);
  }, [eventos]);

  // Sync fieldId when fields load asynchronously
  useEffect(() => {
    if (fields.length > 0 && !fieldId) {
      setFieldId(fields[0].id);
    }
  }, [fields, fieldId]);

  const handleAddDateInput = () => {
    setDates([...dates, new Date().toISOString().split('T')[0]]);
  };

  const handleRemoveDateInput = (index: number) => {
    if (dates.length > 1) {
      setDates(dates.filter((_, i) => i !== index));
    } else {
      showError("O evento deve ter pelo menos uma data.");
    }
  };

  const handleDateChange = (index: number, value: string) => {
    const updated = [...dates];
    updated[index] = value;
    setDates(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || dates.some(d => !d) || !price || !fieldId) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const selectedField = fields.find(f => f.id === fieldId);

    // Divide o valor total igualmente entre as datas selecionadas
    const totalPrice = parseFloat(price);
    const pricePerDate = totalPrice / dates.length;

    // Cadastra um registro de evento para cada data selecionada
    dates.forEach((d, index) => {
      const newEvento = {
        id: `${Date.now()}-${index}`,
        title,
        description,
        date: d,
        startTime,
        endTime,
        price: pricePerDate,
        fieldId,
        fieldName: selectedField ? selectedField.name : "Quadra",
        recurrence,
        paymentMethod
      };
      onAddEvento(newEvento);
    });

    showSuccess(`Evento cadastrado com sucesso para ${dates.length} data(s)!`);

    // Reset
    setTitle("");
    setDescription("");
    setPrice("");
    setDates([new Date().toISOString().split('T')[0]]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white">Eventos e Torneios</h2>
          <p className="text-sm text-slate-400">Organize campeonatos, aniversários e eventos corporativos na sua arena (suporta múltiplas datas)</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto font-bold"
        >
          <Plus size={18} />
          Novo Evento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groupedEventos.map((ev) => (
          <Card key={ev.id} className="border-slate-800 shadow-md bg-slate-900 text-white overflow-hidden hover:border-slate-700 transition-all">
            <div className="h-2 bg-amber-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-bold text-white">{ev.title}</CardTitle>
                  <CardDescription className="mt-1 text-slate-400">{ev.description || "Sem descrição"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {ev.dates.map((d: string) => (
                    <span key={d} className="inline-block bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2 py-0.5 rounded-lg font-semibold">
                      {d.split('-').reverse().join('/')}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span>{ev.startTime} até {ev.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span>{ev.fieldName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Recorrência:</span>
                <span className="text-xs font-semibold text-amber-400">
                  {ev.recurrence === 'once' ? 'Evento único' : 
                   ev.recurrence === 'weekly' ? 'Toda semana' : 
                   ev.recurrence === 'biweekly' ? 'De 15 em 15 dias' : 
                   ev.recurrence === 'monthly_3x' ? '3 vezes no mês' : 'Personalizado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Pagamento:</span>
                <span className="text-xs font-semibold text-emerald-400">{ev.paymentMethod || 'Pix'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl mt-2">
                <span className="text-xs text-slate-400">Custo / Arrecadação Total</span>
                <span className="font-bold text-white">R$ {(ev.price * ev.dates.length).toFixed(2)}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Deseja realmente excluir o evento "${ev.title}" de todas as datas selecionadas?`)) {
                      ev.ids.forEach((id: string) => onDeleteEvento(id));
                      showSuccess("Evento excluído com sucesso!");
                    }
                  }}
                  className="w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center justify-center gap-1.5 font-bold"
                >
                  <Trash2 size={14} />
                  Excluir Evento
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {groupedEventos.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <p className="text-slate-400">Nenhum evento cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold">Novo Evento</h3>
                <p className="text-xs text-slate-400 mt-1">Cadastre um evento ou torneio especial</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <Label htmlFor="evTitle" className="text-slate-300 font-semibold">Título do Evento *</Label>
                <Input
                  id="evTitle"
                  placeholder="Ex: Torneio de Férias Society"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="evDesc" className="text-slate-300 font-semibold">Descrição / Detalhes</Label>
                <Input
                  id="evDesc"
                  placeholder="Ex: Campeonato interno com 8 equipes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                />
              </div>

              {/* Multi-date Selection */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold flex justify-between items-center">
                  <span>Datas do Evento *</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddDateInput}
                    className="h-7 text-xs border-slate-800 bg-slate-950 text-blue-400 hover:bg-slate-850"
                  >
                    + Adicionar Data
                  </Button>
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {dates.map((d, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={d}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                        className="rounded-xl border-slate-800 bg-slate-950 text-white flex-1"
                        required
                      />
                      {dates.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDateInput(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-10 w-10 p-0 rounded-xl"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="evStart" className="text-slate-300 font-semibold">Hora Início</Label>
                  <Input
                    id="evStart"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="evEnd" className="text-slate-300 font-semibold">Hora Fim</Label>
                  <Input
                    id="evEnd"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Quadra Reservada</Label>
                  <Select value={fieldId} onValueChange={setFieldId}>
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
                  <Label className="text-slate-300 font-semibold">Recorrência</Label>
                  <Select value={recurrence} onValueChange={setRecurrence}>
                    <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="once">Evento único</SelectItem>
                      <SelectItem value="weekly">Toda semana</SelectItem>
                      <SelectItem value="biweekly">De 15 em 15 dias</SelectItem>
                      <SelectItem value="monthly_3x">3 vezes no mês</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="evPrice" className="text-slate-300 font-semibold">Valor Total do Evento (R$) *</Label>
                  <Input
                    id="evPrice"
                    type="number"
                    placeholder="Ex: 1000.00"
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
                  Salvar Evento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}