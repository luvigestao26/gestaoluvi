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
import { Menu, Cloud, CloudOff } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

  // Supabase Sync Hook
  const { isConfigured, loadTable, saveItem, deleteItem, loadSettings } = useSupabaseSync();

  // Auth State
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('ga_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Helper to get user-scoped localStorage key
  const getScopedKey = (key: string) => {
    if (!currentUser) return `ga_guest_${key}`;
    const userKey = currentUser.id || currentUser.email;
    return `ga_${userKey}_${key}`;
  };

  // Helper to load scoped data synchronously on mount
  const getScopedData = (key: string, defaultData: any) => {
    const savedUser = localStorage.getItem('ga_current_user');
    if (!savedUser) return defaultData;
    const user = JSON.parse(savedUser);
    const userKey = user.id || user.email;
    const saved = localStorage.getItem(`ga_${userKey}_${key}`);
    return saved ? JSON.parse(saved) : defaultData;
  };

  // State initialization with user-scoped localStorage persistence
  const [fields, setFields] = useState(() => getScopedData('fields', INITIAL_FIELDS));
  const [customers, setCustomers] = useState(() => getScopedData('customers', INITIAL_CUSTOMERS));
  const [bookings, setBookings] = useState(() => getScopedData('bookings', INITIAL_BOOKINGS));
  const [transactions, setTransactions] = useState(() => getScopedData('transactions', INITIAL_TRANSACTIONS));
  const [settings, setSettings] = useState(() => getScopedData('settings', INITIAL_SETTINGS));
  const [blockedSlots, setBlockedSlots] = useState(() => getScopedData('blockedSlots', []));
  const [mensalistas, setMensalistas] = useState(() => getScopedData('mensalistas', INITIAL_MENSALISTAS));
  const [eventos, setEventos] = useState(() => getScopedData('eventos', INITIAL_EVENTOS));
  const [accountsPayable, setAccountsPayable] = useState(() => getScopedData('accountsPayable', INITIAL_ACCOUNTS_PAYABLE));
  const [products, setProducts] = useState(() => getScopedData('products', INITIAL_PRODUCTS));
  const [sales, setSales] = useState(() => getScopedData('sales', INITIAL_SALES));

  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Check current session on mount
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const loggedUser = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
          };
          localStorage.setItem('ga_current_user', JSON.stringify(loggedUser));
          setCurrentUser(loggedUser);
        }
      });

      // Listen to auth changes (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const loggedUser = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
          };
          localStorage.setItem('ga_current_user', JSON.stringify(loggedUser));
          setCurrentUser(loggedUser);
        } else {
          localStorage.removeItem('ga_current_user');
          setCurrentUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Load data from Supabase if configured and user is logged in
  useEffect(() => {
    if (isConfigured && currentUser) {
      const fetchDbData = async () => {
        try {
          const dbFields = await loadTable('fields');
          if (dbFields) setFields(dbFields);

          const dbCustomers = await loadTable('customers');
          if (dbCustomers) setCustomers(dbCustomers);

          const dbBookings = await loadTable('bookings');
          if (dbBookings) setBookings(dbBookings);

          const dbTransactions = await loadTable('transactions');
          if (dbTransactions) setTransactions(dbTransactions);

          const dbSettings = await loadSettings();
          if (dbSettings) setSettings(dbSettings);

          const dbBlocked = await loadTable('blocked_slots');
          if (dbBlocked) setBlockedSlots(dbBlocked);

          const dbMensalistas = await loadTable('mensalistas');
          if (dbMensalistas) setMensalistas(dbMensalistas);

          const dbEventos = await loadTable('eventos');
          if (dbEventos) setEventos(dbEventos);

          const dbPayable = await loadTable('accounts_payable');
          if (dbPayable) setAccountsPayable(dbPayable);

          const dbProducts = await loadTable('products');
          if (dbProducts) setProducts(dbProducts);

          const dbSales = await loadTable('sales');
          if (dbSales) setSales(dbSales);
        } catch (err) {
          console.error("Erro ao sincronizar dados iniciais com o Supabase:", err);
        }
      };
      fetchDbData();
    }
  }, [isConfigured, currentUser]);

  // Sync states to user-scoped localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('fields'), JSON.stringify(fields));
  }, [fields, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('customers'), JSON.stringify(customers));
  }, [customers, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('bookings'), JSON.stringify(bookings));
  }, [bookings, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('transactions'), JSON.stringify(transactions));
  }, [transactions, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('settings'), JSON.stringify(settings));
  }, [settings, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('blockedSlots'), JSON.stringify(blockedSlots));
  }, [blockedSlots, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('mensalistas'), JSON.stringify(mensalistas));
  }, [mensalistas, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('eventos'), JSON.stringify(eventos));
  }, [eventos, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('accountsPayable'), JSON.stringify(accountsPayable));
  }, [accountsPayable, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('products'), JSON.stringify(products));
  }, [products, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(getScopedKey('sales'), JSON.stringify(sales));
  }, [sales, currentUser]);

  // Logout Handler
  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('ga_current_user');
    setCurrentUser(null);
    showSuccess("Você saiu da sua conta.");
  };

  // Reset All Data Handler (Scoped to current user)
  const handleResetAllData = async () => {
    if (isConfigured) {
      // Delete from Supabase
      for (const b of bookings) await deleteItem('bookings', b.id);
      for (const t of transactions) await deleteItem('transactions', t.id);
      for (const s of sales) await deleteItem('sales', s.id);
      for (const m of mensalistas) await deleteItem('mensalistas', m.id);
      for (const e of eventos) await deleteItem('eventos', e.id);
      for (const ap of accountsPayable) await deleteItem('accounts_payable', ap.id);
      for (const bs of blockedSlots) await deleteItem('blocked_slots', bs.id);
    }
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
    
    // Clear only current user's keys
    if (currentUser) {
      const userKey = currentUser.id || currentUser.email;
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`ga_${userKey}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  };

  // Campos Handlers
  const handleAddField = async (newField: any) => {
    setFields([...fields, newField]);
    if (isConfigured) {
      await saveItem('fields', newField);
    }
  };

  const handleDeleteField = async (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (isConfigured) {
      await deleteItem('fields', id);
    }
  };

  const handleUpdateField = async (updatedField: any) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
    if (isConfigured) {
      await saveItem('fields', updatedField);
    }
  };

  // Booking Handlers
  const handleAddBooking = async (newBooking: any) => {
    setBookings([newBooking, ...bookings]);
    if (isConfigured) {
      await saveItem('bookings', newBooking);
    }
    
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
      if (isConfigured) {
        await saveItem('transactions', newTransaction);
      }
    }

    // Trigger WhatsApp Simulation
    const formattedDate = newBooking.date.split('-').reverse().join('/');
    const msg = `Olá, *${newBooking.customerName}*!\n\nSua reserva na *${settings.name}* foi confirmada com sucesso! 🎉\n\n📅 *Data:* ${formattedDate}\n⏰ *Horário:* ${newBooking.timeSlot}\n🏟️ *Quadra:* ${newBooking.fieldName}\n💵 *Valor:* R$ ${newBooking.price.toFixed(2)}\n🚦 *Status:* ${newBooking.paid ? '✅ Pago' : '⏳ Pendente de Pagamento'}\n\n_Chave Pix para pagamento:_ ${settings.pixKey} (${settings.bankName})\n\nObrigado e bom jogo! ⚽🎾`;
    setWhatsappMessage(msg);
  };

  const handleDeleteBooking = async (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
    if (isConfigured) {
      await deleteItem('bookings', id);
    }
  };

  const handleTogglePaid = async (id: string) => {
    setBookings(bookings.map(b => {
      if (b.id === id) {
        const updatedPaid = !b.paid;
        const updatedBooking = { ...b, paid: updatedPaid };
        
        if (isConfigured) {
          saveItem('bookings', updatedBooking);
        }

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
          if (isConfigured) {
            saveItem('transactions', newTransaction);
          }

          const formattedDate = b.date.split('-').reverse().join('/');
          const msg = `Olá, *${b.customerName}*!\n\nConfirmamos o recebimento do seu pagamento para a reserva do dia *${formattedDate}* às *${b.timeSlot}* na *${b.fieldName}*! 💵✅\n\nTudo pronto para o seu jogo. Nos vemos na *${settings.name}*! ⚽🎾`;
          setWhatsappMessage(msg);
        }
        return updatedBooking;
      }
      return b;
    }));
  };

  // Block Slot Handlers
  const handleBlockSlot = async (newBlock: any) => {
    setBlockedSlots([...blockedSlots, newBlock]);
    if (isConfigured) {
      await saveItem('blocked_slots', newBlock);
    }
  };

  const handleUnblockSlot = async (id: string) => {
    setBlockedSlots(blockedSlots.filter(b => b.id !== id));
    if (isConfigured) {
      await deleteItem('blocked_slots', id);
    }
  };

  // Mensalista Handlers
  const handleAddMensalista = async (newMensalista: any) => {
    setMensalistas([...mensalistas, newMensalista]);
    if (isConfigured) {
      await saveItem('mensalistas', newMensalista);
    }
    
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
    if (isConfigured) {
      await saveItem('transactions', newTransaction);
    }
  };

  const handleDeleteMensalista = async (id: string) => {
    setMensalistas(mensalistas.filter(m => m.id !== id));
    if (isConfigured) {
      await deleteItem('mensalistas', id);
    }
  };

  const handleToggleMensalistaActive = async (id: string) => {
    setMensalistas(mensalistas.map(m => {
      if (m.id === id) {
        const updated = { ...m, active: !m.active };
        if (isConfigured) {
          saveItem('mensalistas', updated);
        }
        return updated;
      }
      return m;
    }));
  };

  // Event Handlers
  const handleAddEvento = async (newEvento: any) => {
    setEventos([...eventos, newEvento]);
    if (isConfigured) {
      await saveItem('eventos', newEvento);
    }
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
    if (isConfigured) {
      await saveItem('transactions', newTransaction);
    }
  };

  const handleDeleteEvento = async (id: string) => {
    setEventos(eventos.filter(e => e.id !== id));
    if (isConfigured) {
      await deleteItem('eventos', id);
    }
  };

  // Accounts Payable Handlers
  const handleAddAccount = async (newAccount: any) => {
    setAccountsPayable([...accountsPayable, newAccount]);
    if (isConfigured) {
      await saveItem('accounts_payable', newAccount);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    setAccountsPayable(accountsPayable.filter(a => a.id !== id));
    if (isConfigured) {
      await deleteItem('accounts_payable', id);
    }
  };

  const handleTogglePaidStatus = async (id: string) => {
    setAccountsPayable(accountsPayable.map(a => {
      if (a.id === id) {
        const updatedStatus = a.status === 'paid' ? 'pending' : 'paid';
        const updatedAccount = { ...a, status: updatedStatus };
        
        if (isConfigured) {
          saveItem('accounts_payable', updatedAccount);
        }

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
          if (isConfigured) {
            saveItem('transactions', newTransaction);
          }
        }
        return updatedAccount;
      }
      return a;
    }));
  };

  // Estoque Handlers
  const handleAddProduct = async (newProduct: any) => {
    setProducts([...products, newProduct]);
    if (isConfigured) {
      await saveItem('products', newProduct);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    if (isConfigured) {
      await deleteItem('products', id);
    }
  };

  const handleUpdateProduct = async (updatedProduct: any) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    if (isConfigured) {
      await saveItem('products', updatedProduct);
    }
  };

  // Vendas Handlers
  const handleAddSale = async (newSale: any) => {
    setSales([newSale, ...sales]);
    if (isConfigured) {
      await saveItem('sales', newSale);
    }
    
    // Deduct from stock
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === newSale.productId) {
        const updatedProduct = { ...p, quantity: p.quantity - newSale.quantity };
        if (isConfigured) {
          saveItem('products', updatedProduct);
        }
        return updatedProduct;
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
    if (isConfigured) {
      await saveItem('transactions', newTransaction);
    }
  };

  const handleDeleteSale = async (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      // Return to stock
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === sale.productId) {
          const updatedProduct = { ...p, quantity: p.quantity + sale.quantity };
          if (isConfigured) {
            saveItem('products', updatedProduct);
          }
          return updatedProduct;
        }
        return p;
      }));
    }
    setSales(sales.filter(s => s.id !== id));
    if (isConfigured) {
      await deleteItem('sales', id);
    }
  };

  const handleSaveSettings = async (newSettings: any) => {
    const settingsWithId = { ...newSettings, id: currentUser?.id || 'default' };
    setSettings(settingsWithId);
    if (isConfigured) {
      await saveItem('settings', settingsWithId);
    }
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
            {/* Connection Status Badge */}
            {isConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 border border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-400 shadow-sm">
                <Cloud size={14} className="animate-pulse" />
                Nuvem Conectada (Supabase)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-400 shadow-sm">
                <CloudOff size={14} />
                Modo Local (Offline)
              </span>
            )}
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