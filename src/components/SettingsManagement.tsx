"use client";

import React, { useState } from 'react';
import { Settings, MapPin, Clock, CreditCard, Save, Shield, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess } from "@/utils/toast";

interface SettingsManagementProps {
  arenaSettings: any;
  onSaveSettings: (settings: any) => void;
}

export default function SettingsManagement({ arenaSettings, onSaveSettings }: SettingsManagementProps) {
  const [name, setName] = useState(arenaSettings?.name || "Arena Central");
  const [address, setAddress] = useState(arenaSettings?.address || "Av. das Flores, 1230 - Centro");
  const [phone, setPhone] = useState(arenaSettings?.phone || "(11) 98888-7777");
  const [openTime, setOpenTime] = useState(arenaSettings?.openTime || "08:00");
  const [closeTime, setCloseTime] = useState(arenaSettings?.closeTime || "23:00");
  const [pixKey, setPixKey] = useState(arenaSettings?.pixKey || "financeiro@arenacentral.com");
  const [bankName, setBankName] = useState(arenaSettings?.bankName || "Banco Cora");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      name,
      address,
      phone,
      openTime,
      closeTime,
      pixKey,
      bankName
    });
    showSuccess("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="text-emerald-600" size={24} />
          Configurações da Arena
        </h2>
        <p className="text-sm text-slate-500">Gerencie as informações públicas, horários de funcionamento e dados de pagamento da sua arena</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        {/* General Info */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              Informações Gerais
            </CardTitle>
            <CardDescription>Dados de identificação e localização da arena</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="arenaName" className="text-slate-700 font-semibold">Nome da Arena</Label>
              <Input
                id="arenaName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="arenaAddress" className="text-slate-700 font-semibold">Endereço Completo</Label>
              <Input
                id="arenaAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="arenaPhone" className="text-slate-700 font-semibold">Telefone de Contato</Label>
              <Input
                id="arenaPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border-slate-200"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours & Payments */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock size={18} className="text-emerald-600" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription>Defina os horários limites para agendamentos</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="openTime" className="text-slate-700 font-semibold">Abertura</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="closeTime" className="text-slate-700 font-semibold">Fechamento</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                Dados de Pagamento (Pix)
              </CardTitle>
              <CardDescription>Chave Pix para recebimento de reservas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="pixKey" className="text-slate-700 font-semibold">Chave Pix</Label>
                <Input
                  id="pixKey"
                  placeholder="E-mail, CNPJ ou Celular"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bankName" className="text-slate-700 font-semibold">Instituição Bancária</Label>
                <Input
                  id="bankName"
                  placeholder="Ex: Nubank, Itaú..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="col-span-full flex justify-end">
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Save size={18} />
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}