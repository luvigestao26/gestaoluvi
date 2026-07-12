"use client";

import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, Calendar, Trash2, Edit, X, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

interface CustomerManagementProps {
  customers: any[];
  bookings: any[];
  onAddCustomer: (customer: any) => void;
  onDeleteCustomer: (id: string) => void;
  onUpdateCustomer: (customer: any) => void;
}

export default function CustomerManagement({ 
  customers, 
  bookings, 
  onAddCustomer, 
  onDeleteCustomer, 
  onUpdateCustomer 
}: CustomerManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showError("Nome e Telefone são obrigatórios.");
      return;
    }

    if (editingCustomer) {
      const updated = {
        ...editingCustomer,
        name,
        phone,
        email,
        notes
      };
      onUpdateCustomer(updated);
      showSuccess("Cliente atualizado com sucesso!");
      setEditingCustomer(null);
    } else {
      const newCustomer = {
        id: Date.now().toString(),
        name,
        phone,
        email,
        notes,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddCustomer(newCustomer);
      showSuccess("Cliente cadastrado com sucesso!");
    }

    // Reset form
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setIsNewCustomerOpen(false);
  };

  const startEdit = (customer: any) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email || "");
    setNotes(customer.notes || "");
    setIsNewCustomerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Buscar cliente por nome, telefone ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-slate-200 focus:ring-emerald-500"
          />
        </div>
        <Button 
          onClick={() => {
            setEditingCustomer(null);
            setName("");
            setPhone("");
            setEmail("");
            setNotes("");
            setIsNewCustomerOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Novo Cliente
        </Button>
      </div>

      {/* Customers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => {
          const customerBookings = bookings.filter(b => b.customerName.toLowerCase() === customer.name.toLowerCase());
          
          return (
            <Card key={customer.id} className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600">
                    <User size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">{customer.name}</CardTitle>
                    <CardDescription>Cliente desde {customer.createdAt || '2024'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{customerBookings.length} agendamentos realizados</span>
                  </div>
                </div>

                {customer.notes && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-500 italic">
                    &ldquo;{customer.notes}&rdquo;
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => startEdit(customer)}
                    className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                  >
                    <Edit size={14} />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o cliente "${customer.name}"?`)) {
                        onDeleteCustomer(customer.id);
                        showSuccess("Cliente excluído com sucesso!");
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

        {filteredCustomers.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-slate-500">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>

      {/* New/Edit Customer Modal */}
      {isNewCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <p className="text-xs text-emerald-100 mt-1">Cadastre as informações de contato do cliente</p>
              </div>
              <button 
                onClick={() => setIsNewCustomerOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="customerName" className="text-slate-700 font-semibold">Nome Completo *</Label>
                <Input
                  id="customerName"
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="customerPhone" className="text-slate-700 font-semibold">Telefone / WhatsApp *</Label>
                <Input
                  id="customerPhone"
                  placeholder="Ex: (11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="customerEmail" className="text-slate-700 font-semibold">E-mail</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="customerNotes" className="text-slate-700 font-semibold">Observações / Notas</Label>
                <textarea
                  id="customerNotes"
                  placeholder="Ex: Prefere jogar na quadra coberta, costuma pagar via Pix..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[80px] rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewCustomerOpen(false)}
                  className="flex-1 rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}