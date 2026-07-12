"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit, Check, X, Shield, Activity, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

interface FieldManagementProps {
  fields: any[];
  onAddField: (field: any) => void;
  onDeleteField: (id: string) => void;
  onUpdateField: (field: any) => void;
}

export default function FieldManagement({ fields, onAddField, onDeleteField, onUpdateField }: FieldManagementProps) {
  const [isNewFieldOpen, setIsNewFieldOpen] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [sport, setSport] = useState("Futebol");
  const [pricePerHour, setPricePerHour] = useState("");
  const [status, setStatus] = useState("active");
  const [color, setColor] = useState("emerald");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pricePerHour) {
      showError("Por favor, preencha todos os campos.");
      return;
    }

    if (editingField) {
      const updated = {
        ...editingField,
        name,
        sport,
        pricePerHour: parseFloat(pricePerHour),
        status,
        color
      };
      onUpdateField(updated);
      showSuccess("Quadra atualizada com sucesso!");
      setEditingField(null);
    } else {
      const newField = {
        id: Date.now().toString(),
        name,
        sport,
        pricePerHour: parseFloat(pricePerHour),
        status,
        color
      };
      onAddField(newField);
      showSuccess("Nova quadra cadastrada com sucesso!");
    }

    // Reset form
    setName("");
    setPricePerHour("");
    setIsNewFieldOpen(false);
  };

  const startEdit = (field: any) => {
    setEditingField(field);
    setName(field.name);
    setSport(field.sport);
    setPricePerHour(field.pricePerHour.toString());
    setStatus(field.status);
    setColor(field.color || "emerald");
    setIsNewFieldOpen(true);
  };

  const colors = [
    { name: 'Verde', value: 'emerald' },
    { name: 'Azul', value: 'blue' },
    { name: 'Laranja', value: 'orange' },
    { name: 'Roxo', value: 'purple' },
    { name: 'Vermelho', value: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gerenciamento de Quadras</h2>
          <p className="text-sm text-slate-500">Cadastre e configure as quadras e campos da sua arena</p>
        </div>
        <Button 
          onClick={() => {
            setEditingField(null);
            setName("");
            setPricePerHour("");
            setIsNewFieldOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Nova Quadra
        </Button>
      </div>

      {/* Fields Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => {
          const colorClasses: any = {
            emerald: 'from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50',
            blue: 'from-blue-500 to-indigo-600 text-blue-600 bg-blue-50',
            orange: 'from-orange-500 to-amber-600 text-orange-600 bg-orange-50',
            purple: 'from-purple-500 to-pink-600 text-purple-600 bg-purple-50',
            red: 'from-red-500 to-rose-600 text-red-600 bg-red-50'
          };

          const currentColors = colorClasses[field.color || 'emerald'] || colorClasses.emerald;

          return (
            <Card key={field.id} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-3 bg-gradient-to-r ${currentColors.split(' ')[0]} ${currentColors.split(' ')[1]}`} />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${currentColors.split(' ')[3]} ${currentColors.split(' ')[2]}`}>
                      {field.sport}
                    </span>
                    <CardTitle className="text-lg font-bold text-slate-800">{field.name}</CardTitle>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    field.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {field.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <DollarSign size={16} />
                    Valor por Hora
                  </span>
                  <span className="text-base font-bold text-slate-800">R$ {field.pricePerHour.toFixed(2)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => startEdit(field)}
                    className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                  >
                    <Edit size={14} />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir a quadra "${field.name}"?`)) {
                        onDeleteField(field.id);
                        showSuccess("Quadra excluída com sucesso!");
                      }
                    }}
                    className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {fields.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-slate-500">Nenhuma quadra cadastrada ainda. Comece adicionando uma!</p>
          </div>
        )}
      </div>

      {/* New/Edit Field Modal */}
      {isNewFieldOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{editingField ? 'Editar Quadra' : 'Nova Quadra'}</h3>
                <p className="text-xs text-emerald-100 mt-1">Configure as informações da quadra</p>
              </div>
              <button 
                onClick={() => setIsNewFieldOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fieldName" className="text-slate-700 font-semibold">Nome da Quadra *</Label>
                <Input
                  id="fieldName"
                  placeholder="Ex: Quadra de Futebol Society A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Esporte Principal</Label>
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

                <div className="space-y-1">
                  <Label htmlFor="pricePerHour" className="text-slate-700 font-semibold">Preço por Hora (R$) *</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    placeholder="120.00"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Cor Temática</Label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewFieldOpen(false)}
                  className="flex-1 rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {editingField ? 'Salvar Alterações' : 'Cadastrar Quadra'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}