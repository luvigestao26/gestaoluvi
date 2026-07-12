"use client";

import React, { useState, useEffect } from 'react';
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
import CamposManagement from '@/components/CamposManagement';
import SettingsManagement from '@/components/SettingsManagement';
import WhatsAppSimulator from '@/components/WhatsAppSimulator';
import AuthScreen from '@/components/AuthScreen';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Menu } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

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
  { id: '1', customerName: 'Carlos Eduardo', customerPhone: '(11) 98765-4321', fieldId: '1', fieldName: 'Quadra de Futebol Society A', sport: 'Futebol', date: new Date().toISOString().split('T')[0], timeSlot: '19:00 - 20:00', price: 120, paid: true, paymentMethod: 'Pix' },
  { id: '2', customerName: 'Mariana Souza', customerPhone: '(11) 91234-5678', fieldId: '3', fieldName: 'Arena Beach Tennis 1', sport: 'Beach Tennis', date: new Date().toISOString().split('T')[0], timeSlot: '18:00 - 19:00', price: 80, paid: false, paymentMethod: 'Dinheiro' },
];

const INITIAL_TRANSACTIONS = [
  { id: '1', description: 'Aluguel Quadra A - Carlos Eduardo', amount: 120, type: 'income', category: 'Aluguel de Quadra', date: new Date().toISOString().split('T')[0], paymentMethod: 'Pix' },
  { id: '2', description: 'Compra de Bolas de Tênis', amount: 150, type: 'expense', category: 'Manutenção', date: new Date().toISOString().split('T')[0], paymentMethod: 'Pix' },
];

const INITIAL_SETTINGS = {
  name: "Gestão Arenas",
  address: "Av. das Flores, 1230 - Centro",
  phone: "(11) 98888-7777",
  openTime: "08:00",
  closeTime: "23:00",
  pixKey: "financeiro@gestaoarenas.com",
  bankName: "Banco Cora"
};

const INITIAL_MENSALISTAS = [
  { id: '1', customerName: 'Marcos Paulo', customerPhone: '(11) 97777-6666', fieldId: '1', fieldName: 'Quadra de Futebol Society A', sport: 'Futebol', dayOfWeek: 1, timeSlot: '20:00 - 21:00', price: 450, active: true, recurrence: 'weekly', paymentMethod: 'Pix' },
  { id: '2', customerName: 'Juliana Lima', customerPhone: '(11) 96666-5555', fieldId: '3', fieldName: 'Arena Beach Tennis 1', sport: 'Beach Tennis', dayOfWeek: 3, timeSlot: '19:00 - 20:00', price: 380, active: true, recurrence: 'weekly', paymentMethod: 'Cartão de Crédito' }
];

const INITIAL_EVENTOS = [
  { id: '1', title: 'Torneio Interno de Beach Tennis', description: 'Campeonato de duplas mistas', date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '18:00', price: 600, fieldId: '3', fieldName: 'Arena Beach Tennis 1', recurrence: 'once', paymentMethod: 'Pix' }
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('ga_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // State initialization with localStorage persistence
  const [fields, setFields] = useState(() => {
    const saved = localStorage.getItem('ga_fields');
    return saved ? JSON.parse(saved) : INITIAL_FIELDS;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('ga_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('ga_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('ga_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ga_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [blockedSlots, setBlockedSlots] = useState(() => {
    const saved = localStorage.getItem('ga_blockedSlots');
    return saved ? JSON.parse(saved) : [];
  });

  const [mensalistas, setMensalistas] = useState(() => {
    const saved = localStorage.getItem('ga_mensalistas');
    return saved ? JSON.parse(saved) : INITIAL_MENSALISTAS;
  });

  const [eventos, setEventos] = useState(() => {
    const saved = localStorage.getItem('ga_eventos');
    return saved ? JSON.parse(saved) : INITIAL_EVENTOS;
  });

  const [accountsPayable, setAccountsPayable] = useState(() => {
    const saved = localStorage.getItem('ga_accountsPayable');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS_PAYABLE;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('ga_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('ga_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('ga_fields', JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem('ga_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('ga_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('ga_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ga_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ga_blockedSlots', JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  useEffect(() => {
    localStorage.setItem('ga_mensalistas', JSON.stringify(mensalistas));
  }, [mensalistas]);

  useEffect(() => {
    localStorage.setItem('ga_eventos', JSON.stringify(eventos));
  }, [eventos]);

  useEffect(() => {
    localStorage.setItem('ga_accountsPayable', JSON.stringify(accountsPayable));
  }, [accountsPayable]);

  useEffect(() => {
    localStorage.setItem('ga_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ga_sales', JSON.stringify(sales));
  }, [sales]);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('ga_current_user');
    setCurrentUser(null);
    showSuccess("Você saiu da sua conta.");
  };

  // Reset All Data Handler
  const handleResetAllData = () => {
    setBookings([]);
    setTransactions([]);
    setSales([]);
    setMensalistas([]);
    setEventos([]);
    setAccountsPayable([]);
    setBlockedSlots([]);
    setFields(INITIAL_FIELDS);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    localStorage.clear();
  };

  // Campos Handlers
  const handleAddField = (newField: any) => {
    setFields([...fields, newField]);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleUpdateField = (updatedField: any) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
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
        date: newBooking.date,
        paymentMethod: newBooking.paymentMethod || 'Pix'
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
            date: b.date,
            paymentMethod: b.paymentMethod || 'Pix'
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
    
    // Automatically add to transactions as income
    const newTransaction = {
      id: Date.now().toString() + '-m',
      description: `Mensalidade: ${newMensalista.customerName}`,
      amount: newMensalista.price,
      type: 'income',
      category: 'Aluguel de Quadra',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: newMensalista.paymentMethod || 'Pix'
    };
    setTransactions([newTransaction, ...transactions]);
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
      date: newEvento.date,
      paymentMethod: newEvento.paymentMethod || 'Pix'
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
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'Pix'
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
      date: newSale.date,
      paymentMethod: newSale.paymentMethod || 'Pix'
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

  const handleSaveSettings = (newSettings: any) => {
    setSettings(newSettings);
  };

  // If user is not logged in, show the Auth Screen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 relative">
      {/* Sidebar - Collapsible on Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }} 
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-slate-950 w-full">
        {/* Top Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-semibold text-slate-400">Arena Ativa:</span>
              <span className="text-xs md:text-sm font-bold text-white bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">{settings.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:inline">Última sincronização: Agora mesmo</span>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              bookings={bookings} 
              customers={customers} 
              fields={fields} 
              transactions={transactions}
              products={products}
              sales={sales}
              onNavigate={setActiveTab}
              onResetAllData={handleResetAllData}
            />
          )}

          {activeTab === 'campos' && (
            <CamposManagement 
              fields={fields}
              onAddField={handleAddField}
              onDeleteField={handleDeleteField}
              onUpdateField={handleUpdateField}
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
              fields={fields}
              customers={customers}
              onAddBooking={handleAddBooking}
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

          {activeTab === 'settings' && (
            <SettingsManagement 
              arenaSettings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>

        {/* WhatsApp Simulator Widget */}
        <WhatsAppSimulator 
          message={whatsappMessage} 
          onClose={() => setWhatsappMessage(null)} 
        />

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-800 bg-slate-900 py-4">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
}