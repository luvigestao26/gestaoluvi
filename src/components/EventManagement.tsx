"use client";

import React, { useState } from 'react';
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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [price, setPrice] = useState("");
  const [fieldId, setFieldId] = useState(fields[0]?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !price) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const selectedField = fields.find(f => f.id === fieldId);

    const newEvento = {
      id: Date.now().toString(),
      title,
      description,
      date,
      startTime,
      endTime,
      price: parseFloat(price),
      fieldId,
      fieldName: selectedField ? selectedField.name : "Quadra"
    };

    onAddEvento(newEvento);
    showSuccess("Evento cadastrado com sucesso!");

    // Reset
    setTitle("");
    setDescription("");
    setPrice("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Eventos e Torneios</h2>
          <p className="text-sm text-slate-500">Organize campeonatos, aniversários e eventos corporativos na sua arena</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Novo Evento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventos.map((ev) => (
          <Card key={ev.id} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-amber-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">{ev.title}</CardTitle>
                  <CardDescription className="mt-1">{ev.description || "Sem descrição"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="font-medium text-slate-700">
                  {ev.date.split('-').reverse().join('/')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span>{ev.startTime} até {ev.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span>{ev.fieldName}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mt-2">
                <span className="text-xs text-slate-500">Custo / Arrecadação</span>
                <span className="font-bold text-slate-800">R$ {ev.price.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Deseja realmente excluir o evento "${ev.title}"?`)) {
                      onDeleteEvento(ev.id);
                      showSuccess("Evento excluído com sucesso!");
                    }
                  }}
                  className="w-full rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Excluir Evento
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {eventos.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-slate-500">Nenhum evento cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Novo Evento</h3>
                <p className="text-xs text-amber-100 mt-1">Cadastre um evento ou torneio especial</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="evTitle" className="text-slate-700 font-semibold">Título do Evento *</Label>
                <Input
                  id="evTitle"
                  placeholder="Ex: Torneio de Férias Society"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="evDesc" className="text-slate-700 font-semibold">Descrição / Detalhes</Label>
                <Input
                  id="evDesc"
                  placeholder="Ex: Campeonato interno com 8 equipes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="evDate" className="text-slate-700 font-semibold">Data *</Label>
                <Input
                  id="evDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="evStart" className="text-slate-700 font-semibold">Hora Início</Label>
                  <Input
                    id="evStart"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="evEnd" className="text-slate-700 font-semibold">Hora Fim</Label>
                  <Input
                    id="evEnd"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Quadra Reservada</Label>
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
                  <Label htmlFor="evPrice" className="text-slate-700 font-semibold">Valor / Custo (R$) *</Label>
                  <Input
                    id="evPrice"
                    type="number"
                    placeholder="Ex: 500.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>
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
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
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