"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardOverview from '@/components/DashboardOverview';
import BookingCalendar from '@/components/BookingCalendar';
import FieldManagement from '@/components/FieldManagement';
import CustomerManagement from '@/components/CustomerManagement';
import FinancialManagement from '@/components/FinancialManagement';
import SettingsManagement from '@/components/SettingsManagement';
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

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  // Field Handlers
  const handleAddField = (newField: any) => {
    setFields([...fields, newField]);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleUpdateField = (updatedField: any) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
  };

  // Customer Handlers
  const handleAddCustomer = (newCustomer: any) => {
    setCustomers([...customers, newCustomer]);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const handleUpdateCustomer = (updatedCustomer: any) => {
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

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
        // If toggled to paid, add transaction
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

          // Trigger WhatsApp Simulation for Payment Confirmation
          const formattedDate = b.date.split('-').reverse().join('/');
          const msg = `Olá, *${b.customerName}*!\n\nConfirmamos o recebimento do seu pagamento para a reserva do dia *${formattedDate}* às *${b.timeSlot}* na *${b.fieldName}*! 💵✅\n\nTudo pronto para o seu jogo. Nos vemos na *${settings.name}*! ⚽🎾`;
          setWhatsappMessage(msg);
        }
        return { ...b, paid: updatedPaid };
      }
      return b;
    }));
  };

  // Transaction Handlers
  const handleAddTransaction = (newTransaction: any) => {
    setTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
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

          {activeTab === 'calendar' && (
            <BookingCalendar 
              bookings={bookings} 
              customers={customers} 
              fields={fields}
              onAddBooking={handleAddBooking}
              onDeleteBooking={handleDeleteBooking}
              onTogglePaid={handleTogglePaid}
            />
          )}

          {activeTab === 'fields' && (
            <FieldManagement 
              fields={fields}
              onAddField={handleAddField}
              onDeleteField={handleDeleteField}
              onUpdateField={handleUpdateField}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement 
              customers={customers}
              bookings={bookings}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onUpdateCustomer={handleUpdateCustomer}
            />
          )}

          {activeTab === 'financial' && (
            <FinancialManagement 
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManagement 
              arenaSettings={settings}
              onSaveSettings={setSettings}
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