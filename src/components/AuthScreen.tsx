"use client";

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, KeyRound, Shield, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Get registered users from localStorage (fallback for offline mode)
  const getRegisteredUsers = (): any[] => {
    const users = localStorage.getItem('ga_registered_users');
    return users ? JSON.parse(users) : [];
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const loggedUser = {
            name: data.user.user_metadata.name || data.user.email?.split('@')[0] || 'Usuário',
            email: data.user.email || '',
          };
          localStorage.setItem('ga_current_user', JSON.stringify(loggedUser));
          onLoginSuccess(loggedUser);
          showSuccess(`Bem-vindo de volta, ${loggedUser.name}!`);
        }
      } catch (err: any) {
        showError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback simulado para modo offline
      setTimeout(() => {
        const users = getRegisteredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if ((email.toLowerCase() === 'admin@gestaoarenas.com' && password === 'admin123') || user) {
          const loggedUser = user || { name: 'Administrador', email: 'admin@gestaoarenas.com' };
          localStorage.setItem('ga_current_user', JSON.stringify(loggedUser));
          onLoginSuccess(loggedUser);
          showSuccess(`Bem-vindo de volta, ${loggedUser.name}!`);
        } else {
          showError("E-mail ou senha incorretos.");
        }
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showError("Por favor, preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      showError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const newUser = {
            name: name,
            email: data.user.email || '',
          };
          localStorage.setItem('ga_current_user', JSON.stringify(newUser));
          onLoginSuccess(newUser);
          showSuccess("Conta criada com sucesso! Bem-vindo ao Gestão Arenas.");
        }
      } catch (err: any) {
        showError(err.message || "Erro ao criar conta.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback simulado para modo offline
      setTimeout(() => {
        const users = getRegisteredUsers();
        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

        if (userExists || email.toLowerCase() === 'admin@gestaoarenas.com') {
          showError("Este e-mail já está cadastrado.");
          setIsLoading(false);
          return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('ga_registered_users', JSON.stringify(users));
        localStorage.setItem('ga_current_user', JSON.stringify(newUser));
        
        onLoginSuccess(newUser);
        showSuccess("Conta criada com sucesso! Bem-vindo ao Gestão Arenas.");
        setIsLoading(false);
      }, 1200);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showError("Por favor, insira seu e-mail.");
      return;
    }

    setIsLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        showSuccess(`E-mail de recuperação enviado com sucesso para ${email}!`);
        setMode('signin');
      } catch (err: any) {
        showError(err.message || "Erro ao enviar e-mail de recuperação.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        showSuccess(`E-mail de recuperação enviado com sucesso para ${email}!`);
        setMode('signin');
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    if (isSupabaseConfigured()) {
      try {
        showSuccess("Redirecionando para o Google...");
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } catch (err: any) {
        showError(err.message || "Erro ao conectar com o Google.");
        setIsLoading(false);
      }
    } else {
      // Fallback simulado para modo offline
      showSuccess("Conectando com o Google...");
      setTimeout(() => {
        const googleUser = {
          name: 'Usuário Google',
          email: 'usuario.google@gmail.com'
        };
        localStorage.setItem('ga_current_user', JSON.stringify(googleUser));
        onLoginSuccess(googleUser);
        showSuccess("Login realizado com sucesso via Google!");
        setIsLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-8 text-center text-white relative">
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles size={24} />
          </div>
          <div className="inline-flex items-center justify-center bg-white/10 p-3 rounded-2xl mb-3 backdrop-blur-md border border-white/10">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão Arenas</h2>
          <p className="text-xs text-blue-100 mt-1">O controle total do seu complexo esportivo</p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-slate-300 font-semibold">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
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

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-300 font-semibold">Senha</Label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
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
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {isLoading ? "Entrando..." : "Entrar no Painel"}
                <ArrowRight size={18} />
              </Button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="regName" className="text-slate-300 font-semibold">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="regName"
                    placeholder="Seu Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="regEmail" className="text-slate-300 font-semibold">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="regEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="regPassword" className="text-slate-300 font-semibold">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="regConfirm" className="text-slate-300 font-semibold">Confirmar</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <Input
                      id="regConfirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {isLoading ? "Criando Conta..." : "Criar Minha Conta"}
                <ArrowRight size={18} />
              </Button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="forgotEmail" className="text-slate-300 font-semibold">E-mail Cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2"
              >
                <KeyRound size={18} />
                {isLoading ? "Enviando..." : "Recuperar Senha"}
              </Button>

              <button
                type="button"
                onClick={() => setMode('signin')}
                className="w-full text-center text-xs text-slate-400 hover:text-white mt-2 block"
              >
                Voltar para o Login
              </button>
            </form>
          )}

          {/* Divider */}
          {mode !== 'forgot' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-3 text-slate-500 font-semibold">Ou continue com</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 rounded-xl py-3 font-semibold text-sm transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.435 0-6.223-2.788-6.223-6.223s2.788-6.223 6.223-6.223c1.555 0 2.963.576 4.05 1.526l3.116-3.116C19.13 1.69 15.858 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.82 0 12.24-5.42 12.24-12.24 0-.785-.07-1.54-.2-2.285H12.24z"
                  />
                </svg>
                Entrar com o Google
              </button>

              {/* Toggle Mode */}
              <div className="mt-6 text-center text-sm">
                {mode === 'signin' ? (
                  <p className="text-slate-400">
                    Não tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
                    >
                      Cadastre-se
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-400">
                    Já tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
                    >
                      Faça Login
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}