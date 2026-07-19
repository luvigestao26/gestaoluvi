"use client";

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, UserPlus, LogIn, ArrowLeft, KeyRound, Shield } from 'lucide-react';
import { showSuccess, showError } from "@/utils/toast";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recover' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [arenaName, setArenaName] = useState(''); // Novo campo para o nome da arena
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Detect recovery mode from URL hash or Supabase session
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Check if URL contains recovery parameters in hash or search query
    const hash = window.location.hash;
    const search = window.location.search;
    if (
      (hash && (hash.includes('type=recovery') || hash.includes('recovery') || hash.includes('access_token'))) ||
      (search && (search.includes('type=recovery') || search.includes('recovery')))
    ) {
      setActiveTab('reset');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setActiveTab('reset');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
        if (!arenaName.trim()) {
          throw new Error("Por favor, informe o nome da sua Arena.");
        }

        // Realiza o cadastro simples com e-mail, senha e metadados da arena
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              arena_name: arenaName.trim() // Salva o nome da arena nos metadados do usuário
            }
          }
        });
        if (signUpError) throw signUpError;
        
        // Realiza o login automático imediatamente após o cadastro
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
          }
        );
        if (signInError) throw signInError;

        if (signInData.user) {
          showSuccess("Conta criada e login realizado com sucesso!");
          onAuthSuccess(signInData.user);
        }
      } else if (activeTab === 'recover') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        showSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setActiveTab('login');
      } else if (activeTab === 'reset') {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
        showSuccess("Sua senha foi redefinida com sucesso! Faça login com a nova senha.");
        setActiveTab('login');
        // Limpa o hash da URL
        window.history.replaceState(null, '', window.location.pathname);
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
      showError(error.message || "Erro ao processar solicitação. Verifique os dados informados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-3">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-white rounded-3xl p-2 border border-slate-800/40 shadow-lg">
            <img 
              src="/logo.png" 
              alt="Logo Gestão Arenas L.I" 
              className="w-full h-full object-contain object-center rounded-2xl"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Gestão Arenas L.I</h1>
          <p className="text-sm text-slate-400">Seu painel completo de controle e agendamentos esportivos</p>
        </div>

        {/* Auth Card */}
        <Card className="border-slate-800 bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
          {/* Custom Tab Switcher */}
          {activeTab !== 'recover' && activeTab !== 'reset' ? (
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
          ) : (
            <div className="p-4 bg-slate-950/50 border-b border-slate-800/60">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold transition-colors"
              >
                <ArrowLeft size={14} />
                Voltar para o login
              </button>
            </div>
          )}

          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-white">
              {activeTab === 'register' && "Criar uma nova conta"}
              {activeTab === 'login' && "Acessar sua conta"}
              {activeTab === 'recover' && "Recuperar sua senha"}
              {activeTab === 'reset' && "Definir nova senha"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {activeTab === 'register' && "Cadastre-se com e-mail e senha para acessar o painel imediatamente"}
              {activeTab === 'login' && "Entre para sincronizar seus agendamentos, vendas e finanças"}
              {activeTab === 'recover' && "Digite seu e-mail para receber as instruções de redefinição"}
              {activeTab === 'reset' && "Digite sua nova senha de acesso abaixo"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {activeTab === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="arenaName" className="text-slate-300 font-semibold">Nome da Arena *</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                      id="arenaName"
                      type="text"
                      placeholder="Ex: Arena das Palmeiras"
                      value={arenaName}
                      onChange={(e) => setArenaName(e.target.value)}
                      className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              {activeTab !== 'reset' && (
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
              )}

              {activeTab !== 'recover' && activeTab !== 'reset' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-slate-300 font-semibold">Senha</Label>
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('recover')}
                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors"
                      >
                        Esqueceu sua senha?
                      </button>
                    )}
                  </div>
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
              )}

              {activeTab === 'reset' && (
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-slate-300 font-semibold">Nova Senha</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Digite a nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 shadow-lg shadow-blue-600/20 transition-all"
              >
                {loading ? "Carregando..." : 
                 activeTab === 'register' ? "Criar Conta" : 
                 activeTab === 'recover' ? "Enviar Link de Recuperação" : 
                 activeTab === 'reset' ? "Salvar Nova Senha" : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}