"use client";

import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  MessageSquare, 
  Plus, 
  Search, 
  Check, 
  X, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  TrendingUp,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

interface SuperAdminDashboardProps {
  tenants: any[];
  tickets: any[];
  onAddTenant: (tenant: any) => void;
  onUpdateTenantStatus: (id: string, status: string) => void;
  onImpersonateTenant: (tenant: any) => void;
  onResolveTicket: (id: string) => void;
  onAddTicketReply: (id: string, reply: string) => void;
}

export default function SuperAdminDashboard({
  tenants,
  tickets,
  onAddTenant,
  onUpdateTenantStatus,
  onImpersonateTenant,
  onResolveTicket,
  onAddTicketReply
}: SuperAdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tenants' | 'tickets'>('overview');
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewTenantOpen, setIsNewTenantOpen] = useState(false);
  
  // Form states for new Tenant
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState("Gestão de Arena");
  const [monthlyFee, setMonthlyFee] = useState("149.90");
  const [status, setStatus] = useState("active");

  // Ticket reply state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // SaaS Metrics Calculations
  const activeTenants = tenants.filter(t => t.status === 'active');
  const overdueTenants = tenants.filter(t => t.status === 'overdue');
  const trialTenants = tenants.filter(t => t.status === 'trial');
  
  const mrr = activeTenants.reduce((sum, t) => sum + t.monthlyFee, 0);
  const pendingTickets = tickets.filter(t => t.status !== 'resolved').length;

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerName || !email || !monthlyFee) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newTenant = {
      id: Date.now().toString(),
      name,
      ownerName,
      email,
      phone,
      projectType,
      monthlyFee: parseFloat(monthlyFee),
      status,
      createdAt: new Date().toISOString().split('T')[0],
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    onAddTenant(newTenant);
    showSuccess(`Cliente SaaS "${name}" cadastrado com sucesso!`);
    
    // Reset
    setName("");
    setOwnerName("");
    setEmail("");
    setPhone("");
    setIsNewTenantOpen(false);
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    onAddTicketReply(ticketId, replyText);
    showSuccess("Resposta enviada ao cliente!");
    setReplyText("");
    setSelectedTicketId(null);
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.projectType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* SaaS Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 p-6 rounded-3xl border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
            Painel do Proprietário SaaS
          </span>
          <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
            <Layers className="text-purple-400" size={24} />
            Super Admin - Gestão Multi-Tenant
          </h2>
          <p className="text-sm text-slate-400 mt-1">Gerencie seus clientes, assinaturas, suporte e faturamento recorrente de todas as verticais</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsNewTenantOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-2"
          >
            <Plus size={18} />
            Novo Cliente SaaS
          </Button>
        </div>
      </div>

      {/* SaaS Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'overview' 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Visão Geral & Métricas
        </button>
        <button
          onClick={() => setActiveSubTab('tenants')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'tenants' 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Clientes Ativos ({tenants.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'tickets' 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Suporte & Chamados ({pendingTickets})
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* SaaS Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-800 bg-slate-900 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">MRR (Recorrência Mensal)</CardTitle>
                <div className="rounded-full bg-purple-950 p-2 text-purple-400 border border-purple-900">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">R$ {mrr.toFixed(2)}</div>
                <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  Faturamento recorrente ativo
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Clientes Ativos</CardTitle>
                <div className="rounded-full bg-emerald-950 p-2 text-emerald-400 border border-emerald-900">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{activeTenants.length}</div>
                <p className="text-xs text-slate-400 mt-1">{trialTenants.length} em período de testes (Trial)</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Inadimplentes</CardTitle>
                <div className="rounded-full bg-rose-950 p-2 text-rose-400 border border-rose-900">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-400">{overdueTenants.length}</div>
                <p className="text-xs text-slate-400 mt-1">Acesso bloqueado ou pendente</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Chamados em Aberto</CardTitle>
                <div className="rounded-full bg-blue-950 p-2 text-blue-400 border border-blue-900">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{pendingTickets}</div>
                <p className="text-xs text-slate-400 mt-1">Aguardando resposta do suporte</p>
              </CardContent>
            </Card>
          </div>

          {/* Verticals / Projects Distribution */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-800 bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-base font-bold">Distribuição por Verticais de Negócio</CardTitle>
                <CardDescription className="text-slate-400">Projetos ativos por nicho de mercado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["Gestão de Arena", "Escolinha de Futebol", "Microempreendedor"].map(type => {
                  const count = tenants.filter(t => t.projectType === type).length;
                  const percentage = tenants.length > 0 ? (count / tenants.length) * 100 : 0;
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{type}</span>
                        <span>{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-base font-bold">Últimos Chamados de Suporte</CardTitle>
                <CardDescription className="text-slate-400">Acompanhe as solicitações recentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tickets.slice(0, 3).map(ticket => (
                  <div key={ticket.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{ticket.tenantName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ticket.subject}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === 'open' ? 'bg-rose-950 text-rose-400 border border-rose-900' :
                      ticket.status === 'in_progress' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-900'
                    }`}>
                      {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Progresso' : 'Resolvido'}
                    </span>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhum chamado registrado.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TENANTS TAB */}
      {activeSubTab === 'tenants' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Buscar cliente por nome, proprietário ou vertical..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-slate-800 bg-slate-950 text-white"
              />
            </div>
          </div>

          {/* Tenants Table */}
          <Card className="border-slate-800 bg-slate-900 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                      <th className="p-4">Cliente / Empresa</th>
                      <th className="p-4">Proprietário</th>
                      <th className="p-4">Vertical / Projeto</th>
                      <th className="p-4">Mensalidade</th>
                      <th className="p-4">Status SaaS</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-white">{tenant.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{tenant.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{tenant.ownerName}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center rounded-full bg-purple-950 border border-purple-900 px-2.5 py-0.5 text-xs font-medium text-purple-400">
                            {tenant.projectType}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white">R$ {tenant.monthlyFee.toFixed(2)}/mês</td>
                        <td className="p-4">
                          <select
                            value={tenant.status}
                            onChange={(e) => onUpdateTenantStatus(tenant.id, e.target.value)}
                            className={`rounded-lg px-2 py-1 text-xs font-semibold bg-slate-950 border border-slate-800 text-white focus:outline-none ${
                              tenant.status === 'active' ? 'text-emerald-400 border-emerald-900' :
                              tenant.status === 'trial' ? 'text-blue-400 border-blue-900' :
                              'text-rose-400 border-rose-900'
                            }`}
                          >
                            <option value="active">Ativo ✅</option>
                            <option value="trial">Período de Testes ⏳</option>
                            <option value="overdue">Inadimplente ❌</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onImpersonateTenant(tenant)}
                              className="border-purple-900 text-purple-400 hover:bg-purple-950/30 rounded-lg flex items-center gap-1 text-xs"
                            >
                              <ExternalLink size={12} />
                              Acessar Painel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTenants.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Nenhum cliente SaaS encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TICKETS TAB */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Tickets List */}
            <Card className="md:col-span-1 border-slate-800 bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-base font-bold">Chamados de Suporte</CardTitle>
                <CardDescription className="text-slate-400">Selecione um chamado para responder</CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-800">
                {tickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full text-left p-4 hover:bg-slate-950/50 transition-colors flex flex-col gap-1.5 ${
                      selectedTicketId === ticket.id ? 'bg-slate-950' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-bold text-purple-400">{ticket.tenantName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        ticket.status === 'open' ? 'bg-rose-950 text-rose-400 border border-rose-900' :
                        ticket.status === 'in_progress' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      }`}>
                        {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Progresso' : 'Resolvido'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate w-full">{ticket.subject}</p>
                    <span className="text-[10px] text-slate-500">{ticket.createdAt}</span>
                  </button>
                ))}
                {tickets.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-8">Nenhum chamado de suporte registrado.</p>
                )}
              </CardContent>
            </Card>

            {/* Ticket Chat Area */}
            <Card className="md:col-span-2 border-slate-800 bg-slate-900 text-white flex flex-col min-h-[400px]">
              {selectedTicketId ? (() => {
                const ticket = tickets.find(t => t.id === selectedTicketId);
                if (!ticket) return null;
                return (
                  <>
                    <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">{ticket.subject}</CardTitle>
                        <CardDescription className="text-slate-400">Cliente: {ticket.tenantName} ({ticket.category})</CardDescription>
                      </div>
                      {ticket.status !== 'resolved' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            onResolveTicket(ticket.id);
                            showSuccess("Chamado marcado como resolvido!");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                        >
                          Marcar como Resolvido
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {/* Client Message */}
                      <div className="flex flex-col gap-1 max-w-[80%] bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-tl-none">
                        <span className="text-[10px] font-bold text-purple-400">{ticket.tenantName}</span>
                        <p className="text-xs text-slate-200">{ticket.message}</p>
                        <span className="text-[9px] text-slate-500 self-end mt-1">{ticket.createdAt}</span>
                      </div>

                      {/* Replies */}
                      {ticket.replies?.map((reply: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col gap-1 max-w-[80%] p-3 rounded-2xl ${
                            reply.sender === 'admin' 
                              ? 'bg-purple-950/40 border border-purple-900/50 rounded-tr-none self-end' 
                              : 'bg-slate-950 border border-slate-800 rounded-tl-none'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-purple-400">
                            {reply.sender === 'admin' ? 'Suporte SaaS (Você)' : ticket.tenantName}
                          </span>
                          <p className="text-xs text-slate-200">{reply.message}</p>
                          <span className="text-[9px] text-slate-500 self-end mt-1">{reply.createdAt}</span>
                        </div>
                      ))}
                    </CardContent>
                    {ticket.status !== 'resolved' && (
                      <div className="p-4 border-t border-slate-800 flex gap-2">
                        <Input
                          placeholder="Digite sua resposta de suporte..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="rounded-xl border-slate-800 bg-slate-950 text-white"
                        />
                        <Button
                          onClick={() => handleSendReply(ticket.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                          <Send size={16} />
                        </Button>
                      </div>
                    )}
                  </>
                );
              })() : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                  <MessageSquare size={48} className="text-slate-700 mb-2" />
                  <p className="text-sm">Selecione um chamado de suporte para visualizar e responder</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* New Tenant Modal */}
      {isNewTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-950 to-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold">Novo Cliente SaaS</h3>
                <p className="text-xs text-slate-400 mt-1">Cadastre uma nova empresa/projeto na plataforma</p>
              </div>
              <button onClick={() => setIsNewTenantOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <Label htmlFor="tenantName" className="text-slate-300 font-semibold">Nome da Empresa / Arena *</Label>
                <Input
                  id="tenantName"
                  placeholder="Ex: Arena Gol de Ouro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ownerName" className="text-slate-300 font-semibold">Nome do Proprietário *</Label>
                <Input
                  id="ownerName"
                  placeholder="Ex: Roberto Alencar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tenantEmail" className="text-slate-300 font-semibold">E-mail de Acesso *</Label>
                <Input
                  id="tenantEmail"
                  type="email"
                  placeholder="Ex: roberto@arena.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tenantPhone" className="text-slate-300 font-semibold">Telefone / WhatsApp</Label>
                <Input
                  id="tenantPhone"
                  placeholder="Ex: (11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border-slate-800 bg-slate-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300 font-semibold">Vertical / Projeto</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="Gestão de Arena">Gestão de Arena ⚽</SelectItem>
                      <SelectItem value="Escolinha de Futebol">Escolinha de Futebol 🏆</SelectItem>
                      <SelectItem value="Microempreendedor">Microempreendedor 💼</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="monthlyFee" className="text-slate-300 font-semibold">Mensalidade (R$) *</Label>
                  <Input
                    id="monthlyFee"
                    type="number"
                    step="0.01"
                    placeholder="149.90"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="rounded-xl border-slate-800 bg-slate-950 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 font-semibold">Status Inicial</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-xl border-slate-800 bg-slate-950 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    <SelectItem value="active">Ativo ✅</SelectItem>
                    <SelectItem value="trial">Período de Testes (Trial) ⏳</SelectItem>
                    <SelectItem value="overdue">Inadimplente ❌</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewTenantOpen(false)}
                  className="flex-1 rounded-xl border-slate-800 bg-slate-950 text-white font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold"
                >
                  Cadastrar Cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}