"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardOverview from '@/components/DashboardOverview';
import BookingCalendar from '@/components/BookingCalendar';
import MensalistaManagement from '@/components/MensalistaManagement';
import EventManagement from '@/components/EventManagement';
import AccountsPayableManagement from '@/components/AccountsPayableManagement';
import EstoqueManagement from '@/components/EstoqueManagement';
import VendasManagement from '@/components/VendasManagement';
import DiaristasManagement from '@/components/DiaristasManagement';
import RelatoriosManagement from '@/components/RelatoriosManagement';
import WhatsAppSimulator from '@/components/WhatsAppSimulator';
import { MadeWithDyad } from "@/components/made-with-dyad";

// Mock initial data
const INITIAL_FIELDS = [
  { id: '1', name: 'Quadra de Futebol Society A', sport: 'Futebol', pricePerHour: 120, status: 'active', color: 'emerald' },
  { id: '2', name: 'Quadra de Tênis Rápida', sport: 'Tênis', pricePerHour: 90, status: 'active', color: 'blue' },
  { id: '3', name: 'Arena Beach Tennis 1', sport: 'Beach Tennis', pricePerHour: 80, status: 'active', color: 'orange' },
];

const INITIAL_CUSTOMERS = [
  { id: '1', name: 'Carlos Eduardo', phone: '(11) 98765-4321', email: 'carlos@email.com', notes: 'Prefere jogar à noite', createdAt: '2024-01-15' },
  { id: '2', name: 'Mariana Souza', phone: '(11) 91234-5678', email: 'mariana@email.com', notes: 'Sempre paga via Pix', createdAt: '2024-02-10' },
  { id: '3', name: 'Roberto Alencar', phone: '(11) 95555-4444', email: 'roberto@email.com', notes: '', createdAt: '2024-03-01' },
];

const INITIAL_BOOKINGS = [
  { id: '1', customerName: 'Carlos Eduardo', customerPhone: '(11) 98765-4321', fieldId: '1', fieldName: 'Quadra de Futebol Society A', sport: 'Futebol', date: new Date().toISOString().split('T')[0], timeSlot: '19:00 - 20:00', price: 120, paid: true },
  { id: '2', customerName: 'Mariana Souza', customerPhone: '(11) 91234-5678', fieldId: '3', fieldName: 'Arena Beach Tennis 1', sport: 'Beach Tennis', date: new Date().toISOString().split('T')[0], timeSlot: '18:00 - 19:00', price: 80, paid: false },
];

const INITIAL_TRANSACTIONS = [
  { id: '1', description: 'Aluguel Quadra A - Carlos Eduardo', amount: 120, type: 'income', category: 'Aluguel de Quadra', date: new Date().toISOString().split('T')[0] },
  { id: '2', description: 'Compra de Bolas de Tênis', amount: 150, type: 'expense', category: 'Manutenção', date: new Date().toISOString().split('T')[0] },
];

const INITIAL_SETTINGS = {
  name: "Arena Central",
  address: "Av. das Flores, 1230 - Centro",
  phone: "(11) 98888-7777",
  openTime: "08:00",
  closeTime: "23:00",
  pixKey: "financeiro@arenacentral.com",
  bankName: "Banco Cora"
};

const INITIAL_MENSALISTAS = [
  { id: '1', customerName: 'Marcos Paulo', customerPhone: '(11) 97777-6666', fieldId: '1', fieldName: 'Quadra de Futebol Society A', sport: 'Futebol', dayOfWeek: 1, timeSlot: '20:00 - 21:00', price: 450, active: true },
  { id: '2', customerName: 'Juliana Lima', customerPhone: '(11) 96666-5555', fieldId: '3', fieldName: 'Arena Beach Tennis 1', sport: 'Beach Tennis', dayOfWeek: 3, timeSlot: '19:00 - 20:00', price: 380, active: true }
];

const INITIAL_EVENTOS = [
  { id: '1', title: 'Torneio Interno de Beach Tennis', description: 'Campeonato de duplas mistas', date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '18:00', price: 600, fieldId: '3', fieldName: 'Arena Beach Tennis 1' }
];

const INITIAL_ACCOUNTS_PAYABLE = [
  { id: '1', description: 'Conta de Energia Elétrica', amount: 450, dueDate: new Date().toISOString().split('T')[0], category: 'Energia / Água', status: 'pending' },
  { id: '2', description: 'Manutenção dos Refletores', amount: 300, dueDate: new Date().toISOString().split('T')[0], category: 'Manutenção', status: 'paid' }
];

const INITIAL_PRODUCTS = [
  { id: '1', name: 'Água Mineral 500ml', category: 'Bebidas', quantity: 120, minQuantity: 20, costPrice: 1.20, salePrice: 3.50 },
  { id: '2', name: 'Refrigerante Lata', category: 'Bebidas', quantity: 80, minQuantity: 15, costPrice: 2.00, salePrice: 5.00 },
  { id: '3', name: 'Grip para Raquete', category: 'Acessórios', quantity: 15, minQuantity: 5, costPrice: 5.00, salePrice: 15.00 }
];

const INITIAL_SALES = [
  { id: '1', productId: '1', productName: 'Água Mineral 500ml', quantity: 2, total: 7.00, paymentMethod: 'Pix', customerName: 'Carlos Eduardo', date: new Date().toISOString().split('T')[0] }
];

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [mensalistas, setMensalistas] = useState<any[]>(INITIAL_MENSALISTAS);
  const [eventos, setEventos] = useState<any[]>(INITIAL_EVENTOS);
  const [accountsPayable, setAccountsPayable] = useState<any[]>(INITIAL_ACCOUNTS_PAYABLE);
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<any[]>(INITIAL_SALES);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  // Booking Handlers
  const handleAddBooking = (newBooking: any) => {
    setBookings([newBooking, ...bookings]);
    
    // Automatically add to transactions if paid
    if (newBooking.paid) {
      const newTransaction = {
        id: Date.now().toString() + '-t',
        description: `Aluguel ${newBooking.fieldName} - ${newBooking.customerName}`,
        amount: newBooking.price,
        type: 'income',
        category: 'Aluguel de Quadra',
        date: newBooking.date
      };
      setTransactions([newTransaction, ...transactions]);
    }

    // Trigger WhatsApp Simulation
    const formattedDate = newBooking.date.split('-').reverse().join('/');
    const msg = `Olá, *${newBooking.customerName}*!\n\nSua reserva na *${settings.name}* foi confirmada com sucesso! 🎉\n\n📅 *Data:* ${formattedDate}\n⏰ *Horário:* ${newBooking.timeSlot}\n🏟️ *Quadra:* ${newBooking.fieldName}\n💵 *Valor:* R$ ${newBooking.price.toFixed(2)}\n🚦 *Status:* ${newBooking.paid ? '✅ Pago' : '⏳ Pendente de Pagamento'}\n\n_Chave Pix para pagamento:_ ${settings.pixKey} (${settings.bankName})\n\nObrigado e bom jogo! ⚽🎾`;
    setWhatsappMessage(msg);
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const handleTogglePaid = (id: string) => {
    setBookings(bookings.map(b => {
      if (b.id === id) {
        const updatedPaid = !b.paid;
        if (updatedPaid) {
          const newTransaction = {
            id: Date.now().toString() + '-t',
            description: `Aluguel ${b.fieldName} - ${b.customerName}`,
            amount: b.price,
            type: 'income',
            category: 'Aluguel de Quadra',
            date: b.date
          };
          setTransactions(prev => [newTransaction, ...prev]);

          const formattedDate = b.date.split('-').reverse().join('/');
          const msg = `Olá, *${b.customerName}*!\n\nConfirmamos o recebimento do seu pagamento para a reserva do dia *${formattedDate}* às *${b.timeSlot}* na *${b.fieldName}*! 💵✅\n\nTudo pronto para o seu jogo. Nos vemos na *${settings.name}*! ⚽🎾`;
          setWhatsappMessage(msg);
        }
        return { ...b, paid: updatedPaid };
      }
      return b;
    }));
  };

  // Block Slot Handlers
  const handleBlockSlot = (newBlock: any) => {
    setBlockedSlots([...blockedSlots, newBlock]);
  };

  const handleUnblockSlot = (id: string) => {
    setBlockedSlots(blockedSlots.filter(b => b.id !== id));
  };

  // Mensalista Handlers
  const handleAddMensalista = (newMensalista: any) => {
    setMensalistas([...mensalistas, newMensalista]);
  };

  const handleDeleteMensalista = (id: string) => {
    setMensalistas(mensalistas.filter(m => m.id !== id));
  };

  const handleToggleMensalistaActive = (id: string) => {
    setMensalistas(mensalistas.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  // Event Handlers
  const handleAddEvento = (newEvento: any) => {
    setEventos([...eventos, newEvento]);
    const newTransaction = {
      id: Date.now().toString() + '-ev',
      description: `Evento: ${newEvento.title}`,
      amount: newEvento.price,
      type: 'income',
      category: 'Eventos',
      date: newEvento.date
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteEvento = (id: string) => {
    setEventos(eventos.filter(e => e.id !== id));
  };

  // Accounts Payable Handlers
  const handleAddAccount = (newAccount: any) => {
    setAccountsPayable([...accountsPayable, newAccount]);
  };

  const handleDeleteAccount = (id: string) => {
    setAccountsPayable(accountsPayable.filter(a => a.id !== id));
  };

  const handleTogglePaidStatus = (id: string) => {
    setAccountsPayable(accountsPayable.map(a => {
      if (a.id === id) {
        const updatedStatus = a.status === 'paid' ? 'pending' : 'paid';
        if (updatedStatus === 'paid') {
          const newTransaction = {
            id: Date.now().toString() + '-ap',
            description: `Pagamento: ${a.description}`,
            amount: a.amount,
            type: 'expense',
            category: a.category,
            date: new Date().toISOString().split('T')[0]
          };
          setTransactions(prev => [newTransaction, ...prev]);
        }
        return { ...a, status: updatedStatus };
      }
      return a;
    }));
  };

  // Estoque Handlers
  const handleAddProduct = (newProduct: any) => {
    setProducts([...products, newProduct]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateProduct = (updatedProduct: any) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  // Vendas Handlers
  const handleAddSale = (newSale: any) => {
    setSales([newSale, ...sales]);
    
    // Deduct from stock
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === newSale.productId) {
        return { ...p, quantity: p.quantity - newSale.quantity };
      }
      return p;
    }));

    // Add to transactions
    const newTransaction = {
      id: Date.now().toString() + '-sale',
      description: `Venda: ${newSale.productName} (${newSale.quantity}x)`,
      amount: newSale.total,
      type: 'income',
      category: 'Bar / Lanchonete',
      date: newSale.date
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleDeleteSale = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      // Return to stock
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === sale.productId) {
          return { ...p, quantity: p.quantity + sale.quantity };
        }
        return p;
      }));
    }
    setSales(sales.filter(s => s.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">Arena Ativa:</span>
            <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">{settings.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Última sincronização: Agora mesmo</span>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              bookings={bookings} 
              customers={customers} 
              fields={fields} 
              transactions={transactions}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'estoque' && (
            <EstoqueManagement 
              products={products}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateProduct={handleUpdateProduct}
            />
          )}

          {activeTab === 'vendas' && (
            <VendasManagement 
              sales={sales}
              products={products}
              onAddSale={handleAddSale}
              onDeleteSale={handleDeleteSale}
            />
          )}

          {activeTab === 'calendar' && (
            <BookingCalendar 
              bookings={bookings} 
              customers={customers} 
              fields={fields}
              blockedSlots={blockedSlots}
              mensalistas={mensalistas}
              eventos={eventos}
              onAddBooking={handleAddBooking}
              onDeleteBooking={handleDeleteBooking}
              onTogglePaid={handleTogglePaid}
              onBlockSlot={handleBlockSlot}
              onUnblockSlot={handleUnblockSlot}
            />
          )}

          {activeTab === 'mensalistas' && (
            <MensalistaManagement 
              mensalistas={mensalistas}
              fields={fields}
              onAddMensalista={handleAddMensalista}
              onDeleteMensalista={handleDeleteMensalista}
              onToggleActive={handleToggleMensalistaActive}
            />
          )}

          {activeTab === 'diaristas' && (
            <DiaristasManagement 
              bookings={bookings}
              onDeleteBooking={handleDeleteBooking}
              onTogglePaid={handleTogglePaid}
            />
          )}

          {activeTab === 'eventos' && (
            <EventManagement 
              eventos={eventos}
              fields={fields}
              onAddEvento={handleAddEvento}
              onDeleteEvento={handleDeleteEvento}
            />
          )}

          {activeTab === 'payable' && (
            <AccountsPayableManagement 
              accountsPayable={accountsPayable}
              onAddAccount={handleAddAccount}
              onDeleteAccount={handleDeleteAccount}
              onTogglePaidStatus={handleTogglePaidStatus}
            />
          )}

          {activeTab === 'relatorios' && (
            <RelatoriosManagement 
              bookings={bookings}
              transactions={transactions}
              sales={sales}
              accountsPayable={accountsPayable}
            />
          )}
        </div>

        {/* WhatsApp Simulator Widget */}
        <WhatsAppSimulator 
          message={whatsappMessage} 
          onClose={() => setWhatsappMessage(null)} 
        />

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-100 bg-white py-4">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
}