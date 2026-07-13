"use client";

import React, { useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured, saveCustomCredentials } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, UserPlus, LogIn, Database, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from "@/utils/toast";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Supabase manual config states
  const [showConfig, setShowConfig] = useState(!isSupabaseConfigured());
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('custom_supabase_url') || '');
  const [customKey, setCustomKey] = useState(localStorage.getItem('custom_supabase_anon_key') || '');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      showError("Supabase não está configurado. Configure as credenciais abaixo.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        showSuccess("Conta criada com sucesso! Verifique seu e-mail ou faça login.");
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (<dyad-write path="src/components/Auth.tsx" description="Criando a tela de Login e Cadastro integrada ao Supabase">
"use client";

import React, { useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured, saveCustomCredentials } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, UserPlus, LogIn, Database, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from "@/utils/toast";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Supabase manual config states
  const [showConfig, setShowConfig] = useState(!isSupabaseConfigured());
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('custom_supabase_url') || '');
  const [customKey, setCustomKey] = useState(localStorage.getItem('custom_supabase_anon_key') || '');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      showError("Supabase não está configurado. Configure as credenciais abaixo.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        showSuccess("Conta criada com sucesso! Você já pode fazer login.");
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          showSuccess("Login realizado com sucesso!");
          onAuthSuccess(data.user);
        }
      }
    } catch (error: any) {
      showError(error.message || "Erro ao autenticar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl || !customKey) {
      showError("Preencha a URL e a Anon Key do Supabase.");
      return;
    }
    saveCustomCredentials(customUrl, customKey);
    showSuccess("Configurações do Supabase salvas! A página será recarregada.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-2xl bg-blue-600 p-3.5 text-white font-bold text-2xl shadow-lg shadow-blue-600/30">
            GA
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Gestão Arenas</h1>
          <p className="text-sm text-slate-400">Seu painel completo de controle e agendamentos esportivos</p>
        </div>

        {/* Auth Card */}
        <Card className="border-slate-800 bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              {isSignUp ? <UserPlus className="text-blue-500" size={20} /> : <LogIn className="text-blue-500" size={20} />}
              {isSignUp ? "Criar uma nova conta" : "Acessar sua conta"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isSignUp ? "Cadastre-se para salvar seus dados na nuvem" : "Entre para sincronizar seus agendamentos e finanças"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 font-semibold">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 font-semibold">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 shadow-lg shadow-blue-600/20 transition-all"
              >
                {loading ? "Carregando..." : isSignUp ? "Cadastrar" : "Entrar"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-semibold"
              >
                {isSignUp ? "Já tem uma conta? Faça login" : "Não tem uma conta? Cadastre-se"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Supabase Connection Config Panel */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-2xl p-4 space-y-3">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white font-semibold"
          >
            <span className="flex items-center gap-1.5">
              <Database size={14} className="text-blue-400" />
              Configurações de Conexão Supabase
            </span>
            <span>{showConfig ? "Ocultar" : "Mostrar"}</span>
          </button>

          {showConfig && (
            <form onSubmit={handleSaveConfig} className="space-y-3 pt-2 border-t border-slate-800/60 animate-in fade-in duration-200">
              <div className="flex items-start gap-2 bg-blue-950/40 border border-blue-900/50 p-2.5 rounded-xl text-[11px] text-blue-300">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>Insira as credenciais do seu projeto Supabase para salvar os dados de forma permanente e segura.</span>
              </div>

              <div className="space-y-1">
                <Label htmlFor="supabaseUrl" className="text-[11px] text-slate-400 font-semibold">SUPABASE_URL</Label>
                <Input
                  id="supabaseUrl"
                  placeholder="https://xxxxxx.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="h-8 text-xs rounded-lg border-slate-800 bg-slate-950 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="supabaseKey" className="text-[11px] text-slate-400 font-semibold">SUPABASE_ANON_KEY</Label>
                <Input
                  id="supabaseKey"
                  placeholder="eyJhbGciOi..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="h-8 text-xs rounded-lg border-slate-800 bg-slate-950 text-white"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg h-8"
              >
                Salvar e Conectar
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}