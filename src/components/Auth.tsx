"use client";

import React, { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import { showSuccess, showError } from "@/utils/toast";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      showError("Erro de conexão com o banco de dados.");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        
        // Se o usuário foi criado e já logado automaticamente (ou se precisa confirmar e-mail)
        if (data.user) {
          showSuccess("Conta criada com sucesso! Se o e-mail de confirmação estiver ativo, verifique sua caixa de entrada.");
          // Tenta logar automaticamente se a sessão já estiver ativa
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session?.user) {
            onAuthSuccess(sessionData.session.user);
          } else {
            setActiveTab('login');
          }
        }
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
          {/* Custom Tab Switcher */}
          <div className="p-4 bg-slate-950/50 border-b border-slate-800/60 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <LogIn size={16} />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <UserPlus size={16} />
              Cadastrar
            </button>
          </div>

          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-white">
              {activeTab === 'register' ? "Criar uma nova conta" : "Acessar sua conta"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {activeTab === 'register' 
                ? "Cadastre-se para salvar seus dados na nuvem com segurança" 
                : "Entre para sincronizar seus agendamentos, vendas e finanças"}
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
                {loading ? "Carregando..." : activeTab === 'register' ? "Criar Conta" : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}