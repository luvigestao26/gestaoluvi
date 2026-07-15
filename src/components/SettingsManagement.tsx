"use client";

import React, { useState } from 'react';
import { Settings, MapPin, Clock, CreditCard, Save, Shield, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { getSupabaseClient } from '@/lib/supabase';

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

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      id: 'default',
      name,
      address,
      phone,
      openTime,
      closeTime,
      pixKey,
      bankName
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showError("Por favor, digite sua senha atual.");
      return;
    }
    if (!newPassword) {
      showError("Por favor, digite a nova senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("As senhas novas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      showError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setPassLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase não configurado.");

      // Primeiro, tentamos validar a senha atual fazendo um re-login rápido por segurança
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });
        if (signInError) {
          throw new Error("A senha atual informada está incorreta.");
        }
      }

      // Se a senha atual estiver correta, atualiza para a nova senha
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      showSuccess("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showError(err.message || "Erro ao atualizar senha.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="text-blue-500" size={24} />
          Configurações do Sistema
        </h2>
        <p className="text-sm text-slate-400">Gerencie as informações públicas da arena, horários de funcionamento, dados de pagamento e segurança da conta</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Info */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin size={18} className="text-blue-500" />
                Informações Gerais
              </CardTitle>
              <CardDescription className="text-slate-400">Dados de identificação e localização da arena</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="arenaName" className="text-slate-300 font-semibold">Nome da Arena</Label>
                <Input
                  id="arenaName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="arenaAddress" className="text-slate-300 font-semibold">Endereço Completo</Label>
                <Input
                  id="arenaAddress"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="arenaPhone" className="text-slate-300 font-semibold">Telefone de Contato</Label>
                <Input
                  id="arenaPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription className="text-slate-400">Defina os horários limites para agendamentos</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="openTime" className="text-slate-300 font-semibold">Abertura</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="closeTime" className="text-slate-300 font-semibold">Fechamento</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard size={18} className="text-blue-500" />
                Dados de Pagamento (Pix)
              </CardTitle>
              <CardDescription className="text-slate-400">Chave Pix para recebimento de reservas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="pixKey" className="text-slate-300 font-semibold">Chave Pix</Label>
                <Input
                  id="pixKey"
                  placeholder="E-mail, CNPJ ou Celular"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bankName" className="text-slate-300 font-semibold">Instituição Bancária</Label>
                <Input
                  id="bankName"
                  placeholder="Ex: Nubank, Itaú..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg shadow-blue-600/20 font-bold"
            >
              <Save size={18} />
              Salvar Configurações
            </Button>
          </div>
        </form>

        {/* Security / Password Change */}
        <div className="space-y-6">
          <Card className="border-slate-800 shadow-md bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                Segurança da Conta
              </CardTitle>
              <CardDescription className="text-slate-400">Altere a senha de acesso ao painel administrativo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPass" className="text-slate-300 font-semibold">Senha Atual</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                      id="currentPass"
                      type={showCurrentPass ? "text" : "password"}
                      placeholder="Digite sua senha atual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPass" className="text-slate-300 font-semibold">Nova Senha</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                      id="newPass"
                      type={showNewPass ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPass" className="text-slate-300 font-semibold">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                      id="confirmPass"
                      type={showNewPass ? "text" : "password"}
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={passLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 shadow-lg shadow-blue-600/20 transition-all"
                >
                  {passLoading ? "Atualizando..." : "Atualizar Senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}