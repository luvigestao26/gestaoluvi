"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit, Shield, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

interface CamposManagementProps {
  fields: any[];
  onAddField: (field: any) => void;
  onDeleteField: (id: string) => void;
  onUpdateField: (field: any) => void;
}

export default function CamposManagement({ fields, onAddField, onDeleteField, onUpdateField }: CamposManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [sport, setSport] = useState("Futebol");
  const [pricePerHour, setPricePerHour] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pricePerHour) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (editingField) {
      const updated = {
        ...editingField,
        name,
        sport,
        pricePerHour: parseFloat(pricePerHour)
      };
      onUpdateField(updated);
      showSuccess("Campo atualizado com sucesso!");
      setEditingField(null);
    } else {
      const newField = {
        id: Date.now().toString(),
        name,
        sport,
        pricePerHour: parseFloat(pricePerHour),
        status: 'active'
      };
      onAddField(newField);
      showSuccess("Campo cadastrado com sucesso!");
    }

    // Reset
    setName("");
    setPricePerHour("");
    setIsOpen(false);
  };

  const startEdit = (field: any) => {
    setEditingField(field);
    setName(field.name);
    setSport(field.sport);
    setPricePerHour(field.pricePerHour.toString());
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white">Gerenciamento de Campos e Quadras</h2>
          <p className="text-sm text-slate-400">Cadastre e configure os espaços esportivos disponíveis para locação</p>
        </div>
        <Button 
          onClick={() => {
            setEditingField(null);
            setName("");
            setPricePerHour("");
            setIsOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={18} />
          Novo Campo / Quadra
        </Button>
      </div>

      {/* Fields Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <Card key={field.id} className="border-slate-800 shadow-md bg-slate-900 text-white overflow-hidden hover:border-slate-700 transition-all">
            <div className="h-2 bg-blue-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-full bg-blue-950 border border-blue-900 p-2 text-blue-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-white">{field.name}</CardTitle>
                    <CardDescription className="text-slate-400">{field.sport}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-400">Preço por Hora</span>
                <span className="font-bold text-white text-lg">R$ {field.pricePerHour.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => startEdit(field)}
                  className="flex-1 rounded-xl border-slate-800 bg-slate-950 text-white hover:bg-slate-800"
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Deseja realmente excluir o campo "${field.name}"?`)) {
                      onDeleteField(field.id);
                      showSuccess("Campo excluído!");
                    }
                  }}
                  className="rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {fields.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <p className="text-slate-400">Nenhum campo ou quadra cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold">{editingField ? 'Editar Campo' : 'Novo Campo'}</h3>
                <p className="text-xs text-slate-400 mt-1">Configure as informações do espaço esportivo</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fieldName" className="text-slate-300 font-semibold">Nome do Campo / Quadra *</Label>
                <Input
                  id="fieldName"
                  placeholder="Ex: Quadra de Futebol Society B"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Esporte Principal</Label>
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

                <div className="space-y-1">
                  <Label htmlFor="fieldPrice" className="text-slate-300 font-semibold">Preço por Hora (R$) *</Label>
                  <Input
                    id="fieldPrice"
                    type="number"
                    placeholder="Ex: 120.00"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border-slate-800 bg-slate-950 text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  {editingField ? 'Salvar Alterações' : 'Cadastrar Campo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}