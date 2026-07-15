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
import Auth from '@/components/Auth';
import { getSupabaseClient } from '@/lib/supabase';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Menu, Cloud, CloudLightning, CloudOff } from 'lucide-react';
import { showSuccess, showError } from "@/utils/toast";
import { keysToCamel, keysToSnake } from '@/lib/utils';

// Mock initial data
const INITIAL_FIELDS = [
  { id: '1', name: 'Quadra de Futebol Society A', sport: 'Futebol', pricePerHour: 120, status: 'active', color: 'emerald' },
  { id: '2', name: 'Quadra de Tênis Rápida', sport: 'Tênis', pricePerHour: 90, status: 'active', color: 'blue' },
  { id: '3', name: 'Arena Beach Tennis 1', sport: 'Beach Tennis', pricePerHour: 80, status: 'active', color: 'orange' },
];

const INITIAL_CUSTOMERS = [
  { id: '1', name: 'Carlos Eduardo', phone: '(11) 98765-4321', email: 'carlos@email.com', notes: 'Prefere jogar à noite', createdAt: new Date().toISOString() },
  { id: '2', name: 'Mariana Souza', phone: '(11) 91234-5678', email: 'mariana@email.com', notes: 'Sempre paga via Pix', createdAt: new Date().toISOString() },
  { id: '3', name: 'Roberto Alencar', phone: '(11) 95555-4444', email: 'roberto@email.com', notes: '', createdAt: new Date().toISOString() },
];

const INITIAL_SETTINGS = {
  id: 'default',
  name: "Gestão Arenas",
  address: "Av. das Flores, 1230 - Centro",
  phone: "(11) 98888-7777",
  openTime: "08:00",
  closeTime: "00:00",
  pixKey: "financeiro@gestaoarenas.com",
  bankName: "Banco Cora"
};

const INITIAL_PRODUCTS = [
  { id: '1', name: 'Água Mineral 500ml', category: 'Bebidas', quantity: 120, minQuantity: 20, costPrice: 1.20, salePrice: 3.50 },
  { id: '2', name: 'Refrigerante Lata', category: 'Bebidas', quantity: 80, minQuantity: 15, costPrice: 2.00, salePrice: 5.00 },
  { id: '3', name: 'Grip para Raquete', category: 'Acessórios', quantity: 15, minQuantity: 5, costPrice: 5.00, salePrice: 15.00 }
];

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');

  // State initialization
  const [fields, setFields] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(INITIAL_SETTINGS);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [mensalistas, setMensalistas] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [accountsPayable, setAccountsPayable] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  // Check active session on mount
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadAllData(session.user);
        }
      }
      setAuthChecked(true);
    };
    checkSession();
  }, []);

  // Load all data from individual Supabase tables scoped by user.id
  const loadAllData = async (currentUser: any) => {
    const supabase = getSupabaseClient();
    if (!supabase || !currentUser) return;

    setSyncing(true);
    try {
      const userPrefix = `${currentUser.id}_`;

      // 1. Fields
      const { data: fieldsData } = await supabase.from('fields').select('*').like('id', `${userPrefix}%`);
      if (fieldsData && fieldsData.length > 0) {
        setFields(keysToCamel(fieldsData));
      } else {
        const userFields = INITIAL_FIELDS.map(f => ({ ...f, id: `${userPrefix}${f.id}` }));
        await supabase.from('fields').insert(keysToSnake(userFields));
        setFields(userFields);
      }

      // 2. Customers
      const { data: customersData } = await supabase.from('customers').select('*').like('id', `${userPrefix}%`);
      if (customersData && customersData.length > 0) {
        setCustomers(keysToCamel(customersData));
      } else {
        const userCustomers = INITIAL_CUSTOMERS.map(c => ({ ...c, id: `${userPrefix}${c.id}` }));
        await supabase.from('customers').insert(keysToSnake(userCustomers));
        setCustomers(userCustomers);
      }

      // 3. Bookings
      const { data: bookingsData } = await supabase.from('bookings').select('*').like('id', `${userPrefix}%`);
      if (bookingsData) setBookings(keysToCamel(bookingsData));

      // 4. Transactions
      const { data: transactionsData } = await supabase.from('transactions').select('*').like('id', `${userPrefix}%`);
      if (transactionsData) setTransactions(keysToCamel(transactionsData));

      // 5. Settings (Scoped by user.id)
      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', currentUser.id).maybeSingle();
      if (settingsData) {
        setSettings(keysToCamel(settingsData));
      } else {
        const userSettings = { ...INITIAL_SETTINGS, id: currentUser.id, name: `Arena de ${currentUser.email.split('@')[0]}` };
        await supabase.from('settings').insert(keysToSnake(userSettings));
        setSettings(userSettings);
      }

      // 6. Blocked Slots
      const { data: blockedData } = await supabase.from('blocked_slots').select('*').like('id', `${userPrefix}%`);
      if (blockedData) setBlockedSlots(keysToCamel(blockedData));

      // 7. Mensalistas
      const { data: mensalistasData } = await supabase.from('mensalistas').select('*').like('id', `${userPrefix}%`);
      if (mensalistasData) setMensalistas(keysToCamel(mensalistasData));

      // 8. Eventos
      const { data: eventosData } = await supabase.from('eventos').select('*').like('id', `${userPrefix}%`);
      if (eventosData) setEventos(keysToCamel(eventosData));

      // 9. Accounts Payable
      const { data: payableData } = await supabase.from('accounts_payable').select('*').like('id', `${userPrefix}%`);
      if (payableData) setAccountsPayable(keysToCamel(payableData));

      // 10. Products
      const { data: productsData } = await supabase.from('products').select('*').like('id', `${userPrefix}%`);
      if (productsData && productsData.length > 0) {
        setProducts(keysToCamel(productsData));
      } else {
        const userProducts = INITIAL_PRODUCTS.map(p => ({ ...p, id: `${userPrefix}${p.id}` }));
        await supabase.from('products').insert(keysToSnake(userProducts));
        setProducts(userProducts);
      }

      // 11. Sales
      const { data: salesData } = await supabase.from('sales').select('*').like('id', `${userPrefix}%`);
      if (salesData) setSales(keysToCamel(salesData));

      setSyncStatus('synced');
    } catch (err) {
      console.error("Erro ao carregar dados do Supabase:", err);
      setSyncStatus('error');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setFields([]);
    setCustomers([]);
    setBookings([]);
    setTransactions([]);
    setSettings(INITIAL_SETTINGS);
    setBlockedSlots([]);
    setMensalistas([]);
    setEventos([]);
    setAccountsPayable([]);
    setProducts([]);
    setSales([]);
    showSuccess("Sessão encerrada com sucesso!");
  };

  // Reset All Data Handler (Scoped by user.id)
  const handleResetAllData = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;

    setSyncStatus('pending');
    try {
      const userPrefix = `${user.id}_`;
      await supabase.from('bookings').delete().like('id', `${userPrefix}%`);
      await supabase.from('transactions').delete().like('id', `${userPrefix}%`);
      await supabase.from('sales').delete().like('id', `${userPrefix}%`);
      await supabase.from('mensalistas').delete().like('id', `${userPrefix}%`);
      await supabase.from('eventos').delete().like('id', `${userPrefix}%`);
      await supabase.from('accounts_payable').delete().like('id', `${userPrefix}%`);
      await supabase.from('blocked_slots').delete().like('id', `${userPrefix}%`);
      
      setBookings([]);
      setTransactions([]);
      setSales([]);
      setMensalistas([]);
      setEventos([]);
      setAccountsPayable([]);
      setBlockedSlots([]);
      setSyncStatus('synced');
      showSuccess("Todos os seus dados foram resetados no Supabase!");
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  };

  // Campos Handlers
  const handleAddField = async (newField: any) => {
    const supabase = getSupabaseClient();
    const fieldWithUser = { ...newField, id: `${user.id}_${newField.id}` };
    if (supabase) {
      await supabase.from('fields').insert(keysToSnake(fieldWithUser));
    }
    setFields([...fields, fieldWithUser]);
  };

  const handleDeleteField = async (id: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('fields').delete().eq('id', id);
    }
    setFields(fields.filter(f => f.id !== id));
  };

  const handleUpdateField = async (updatedField: any) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('fields').update(keysToSnake(updatedField)).eq('id', updatedField.id);
    }
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
  };

  // Booking Handlers
  const handleAddBooking = async (newBooking: any) => {
    const supabase = getSupabaseClient();
    const bookingWithUser = { ...newBooking, id: `${user.id}_${newBooking.id}` };
    if (supabase) {
      await supabase.from('bookings').insert(keysToSnake(bookingWithUser));
    }
    setBookings([bookingWithUser, ...bookings]);
    
    if (newBooking.paid) {
      const newTransaction = {
        id: `${user.id}_booking-${newBooking.id}`,
        description: `Aluguel ${newBooking.fieldName} - ${newBooking.customerName}`,
        amount: newBooking.price,
        type: 'income',
        category: 'Aluguel de Quadra',
        date: newBooking.date,
        paymentMethod: newBooking.paymentMethod || 'Pix'
      };
      if (supabase) {
        await supabase.from('transactions').insert(keysToSnake(newTransaction));
      }
      setTransactions([newTransaction, ...transactions]);
    }

    const formattedDate = newBooking.date.split('-').reverse().join('/');
    const msg = `Olá, *${newBooking.customerName}*!\n\nSua reserva na *${settings.name}* foi confirmada com sucesso! 🎉\n\n📅 *Data:* ${formattedDate}\n⏰ *Horário:* ${newBooking.timeSlot}\n🏟️ *Quadra:* ${newBooking.fieldName}\n💵 *Valor:* R$ ${newBooking.price.toFixed(2)}\n🚦 *Status:* ${newBooking.paid ? '✅ Pago' : '⏳ Pendente de Pagamento'}\n\n_Chave Pix para pagamento:_ ${settings.pixKey} (${settings.bankName})\n\nObrigado e bom jogo! ⚽🎾`;
    setWhatsappMessage(msg);
  };

  const handleDeleteBooking = async (id: string) => {
    const supabase = getSupabaseClient();
    const cleanId = id.replace(`${user.id}_`, '');
    if (supabase) {
      await supabase.from('bookings').delete().eq('id', id);
      await supabase.from('transactions').delete().eq('id', `${user.id}_booking-${cleanId}`);
    }
    setBookings(bookings.filter(b => b.id !== id));
    setTransactions(transactions.filter(t => t.id !== `${user.id}_booking-${cleanId}`));
  };

  const handleTogglePaid = async (id: string) => {
    const supabase = getSupabaseClient();
    const cleanId = id.replace(`${user.id}_`, '');
    const updatedBookings = bookings.map(b => {
      if (b.id === id) {
        const updatedPaid = !b.paid;
        if (updatedPaid) {
          const newTransaction = {
            id: `${user.id}_booking-${cleanId}`,
            description: `Aluguel ${b.fieldName} - ${b.customerName}`,
            amount: b.price,
            type: 'income',
            category: 'Aluguel de Quadra',
            date: b.date,
            paymentMethod: b.paymentMethod || 'Pix'
          };
          if (supabase) {
            supabase.from('transactions').insert(keysToSnake(newTransaction)).then();
          }
          setTransactions(prev => [newTransaction, ...prev]);

          const formattedDate = b.date.split('-').reverse().join('/');
          const msg = `Olá, *${b.customerName}*!\n\nConfirmamos o recebimento do seu pagamento para a reserva do dia *${formattedDate}* às *${b.timeSlot}* na *${b.fieldName}*! 💵✅\n\nTudo pronto para o seu jogo. Nos vemos na *${settings.name}*! ⚽🎾`;
          setWhatsappMessage(msg);
        } else {
          if (supabase) {
            supabase.from('transactions').delete().eq('id', `${user.id}_booking-${cleanId}`).then();
          }
          setTransactions(prev => prev.filter(t => t.id !== `${user.id}_booking-${cleanId}`));
        }
        if (supabase) {
          supabase.from('bookings').update({ paid: updatedPaid }).eq('id', id).then();
        }
        return { ...b, paid: updatedPaid };
      }
      return b;
    });
    setBookings(updatedBookings);
  };

  // Block Slot Handlers
  const handleBlockSlot = async (newBlock: any) => {
    const supabase = getSupabaseClient();
    const blockWithUser = { ...newBlock, id: `${user.id}_${newBlock.id}` };
    if (supabase) {
      await supabase.from('blocked_slots').insert(keysToSnake(blockWithUser));
    }
    setBlockedSlots([...blockedSlots, blockWithUser]);
  };

  const handleUnblockSlot = async (id: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('blocked_slots').delete().eq('id', id);
    }
    setBlockedSlots(blockedSlots.filter(b => b.id !== id));
  };

  // Mensalista Handlers
  const handleAddMensalista = async (newMensalista: any) => {
    const supabase = getSupabaseClient();
    const mensalistaWithUser = { ...newMensalista, id: `${user.id}_${newMensalista.id}` };
    if (supabase) {
      await supabase.from('mensalistas').insert(keysToSnake(mensalistaWithUser));
    }
    setMensalistas([...mensalistas, mensalistaWithUser]);
    
    const newTransaction = {
      id: `${user.id}_mensalista-${newMensalista.id}`,
      description: `Mensalidade: ${newMensalista.customerName}`,
      amount: newMensalista.price,
      type: 'income',
      category: 'Aluguel de Quadra',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: newMensalista.paymentMethod || 'Pix'
    };
    if (supabase) {
      await supabase.from('transactions').insert(keysToSnake(newTransaction));
    }
    setTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteMensalista = async (id: string) => {
    const supabase = getSupabaseClient();
    const cleanId = id.replace(`${user.id}_`, '');
    if (supabase) {
      await supabase.from('mensalistas').delete().eq('id', id);
      await supabase.from('transactions').delete().eq('id', `${user.id}_mensalista-${cleanId}`);
    }
    setMensalistas(mensalistas.filter(m => m.id !== id));
    setTransactions(transactions.filter(t => t.id !== `${user.id}_mensalista-${cleanId}`));
  };

  const handleToggleMensalistaActive = async (id: string) => {
    const target = mensalistas.find(m => m.id === id);
    if (target) {
      const updatedActive = !target.active;
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('mensalistas').update({ active: updatedActive }).eq('id', id);
      }
      setMensalistas(mensalistas.map(m => m.id === id ? { ...m, active: updatedActive } : m));
    }
  };

  // Event Handlers
  const handleAddEvento = async (newEvento: any) => {
    const supabase = getSupabaseClient();
    const eventWithUser = { ...newEvento, id: `${user.id}_${newEvento.id}` };
    if (supabase) {
      await supabase.from('eventos').insert(keysToSnake(eventWithUser));
    }
    setEventos([...eventos, eventWithUser]);
    const newTransaction = {
      id: `${user.id}_event-${newEvento.id}`,
      description: `Evento: ${newEvento.title}`,
      amount: newEvento.price,
      type: 'income',
      category: 'Eventos',
      date: newEvento.date,
      paymentMethod: newEvento.paymentMethod || 'Pix'
    };
    if (supabase) {
      await supabase.from('transactions').insert(keysToSnake(newTransaction));
    }
    setTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteEvento = async (id: string) => {
    const supabase = getSupabaseClient();
    const cleanId = id.replace(`${user.id}_`, '');
    if (supabase) {
      await supabase.from('eventos').delete().eq('id', id);
      await supabase.from('transactions').delete().eq('id', `${user.id}_event-${cleanId}`);
    }
    setEventos(eventos.filter(e => e.id !== id));
    setTransactions(transactions.filter(t => t.id !== `${user.id}_event-${cleanId}`));
  };

  // Accounts Payable Handlers
  const handleAddAccount = async (newAccount: any) => {
    const supabase = getSupabaseClient();
    const accountWithUser = { ...newAccount, id: `${user.id}_${newAccount.id}` };
    if (supabase) {
      await supabase.from('accounts_payable').insert(keysToSnake(accountWithUser));
    }
    setAccountsPayable([...accountsPayable, accountWithUser]);
  };

  const handleDeleteAccount = async (id: string) => {
    const supabase = getSupabaseClient();
    const cleanId = id.replace(`${user.id}_`, '');
    if (supabase) {
      await supabase.from('accounts_payable').delete().eq('id', id);
      await supabase.from('transactions').delete().eq('id', `${user.id}_payable-${cleanId}`);
    }
    setAccountsPayable(accountsPayable.filter(a => a.id !== id));
    setTransactions(transactions.filter(t => t.id !== `${user.id}_payable-${cleanId}`));
  };

  const handleTogglePaidStatus = async (id: string) => {
    const target = accountsPayable.find(a => a.id === id);
    if (target) {
      const updatedStatus = target.status === 'paid' ? 'pending' : 'paid';
      const supabase = getSupabaseClient();
      const cleanId = id.replace(`${user.id}_`, '');
      if (supabase) {
        await supabase.from('accounts_payable').update({ status: updatedStatus }).eq('id', id);
      }
      if (updatedStatus === 'paid') {
        const newTransaction = {
          id: `${user.id}_payable-${cleanId}`,
          description: `Pagamento: ${target.description}`,
          amount: target.amount,
          type: 'expense',
          category: target.category,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Pix'
        };
        if (supabase) {
          await supabase.from('transactions').insert(keysToSnake(newTransaction));
        }
        setTransactions(prev => [newTransaction, ...prev]);
      } else {
        if (supabase) {
          await supabase.from('transactions').delete().eq('id', `${user.id}_payable-${cleanId}`);
        }
        setTransactions(prev => prev.filter(t => t.id !== `${user.id}_payable-${cleanId}`));
      }
      setAccountsPayable(accountsPayable.map(a => a.id === id ? { ...a, status: updatedStatus } : a));
    }
  };

  // Estoque Handlers
  const handleAddProduct = async (newProduct: any) => {
    const supabase = getSupabaseClient();
    const productWithUser = { ...newProduct, id: `${user.id}_${newProduct.id}` };
    if (supabase) {
      await supabase.from('products').insert(keysToSnake(productWithUser));
    }
    setProducts([...products, productWithUser]);
  };

  const handleDeleteProduct = async (id: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateProduct = async (updatedProduct: any) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('products').update(keysToSnake(updatedProduct)).eq('id', updatedProduct.id);
    }
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  // Vendas Handlers
  const handleAddSale = async (newSale: any) => {
    const supabase = getSupabaseClient();
    const saleWithUser = { ...newSale, id: `${user.id}_${newSale.id}` };
    if (supabase) {
      await supabase.from('sales').insert(keysToSnake(saleWithUser));
    }
    setSales([saleWithUser, ...sales]);
    
    const updatedProducts = products.map(p => {
      if (p.id === newSale.productId) {
        const newQty = p.quantity - newSale.quantity;
        if (supabase) {
          supabase.from('products').update({ quantity: newQty }).eq('id', p.id).then();
        }
        return { ...p, quantity: newQty };
      }
      return p;
    });
    setProducts(updatedProducts);

    const newTransaction = {
      id: `${user.id}_sale-${newSale.id}`,
      description: `Venda: ${newSale.productName} (${newSale.quantity}x)`,
      amount: newSale.total,
      type: 'income',
      category: 'Bar / Lanchonete',
      date: newSale.date,
      paymentMethod: newSale.paymentMethod || 'Pix'
    };
    if (supabase) {
      await supabase.from('transactions').insert(keysToSnake(newTransaction));
    }
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleDeleteSale = async (id: string) => {
    const sale = sales.find(s => s.id === id);
    const supabase = getSupabaseClient();
    const cleanId = id.replace(`${user.id}_`, '');
    if (sale) {
      const updatedProducts = products.map(p => {
        if (p.id === sale.productId) {
          const newQty = p.quantity + sale.quantity;
          if (supabase) {
            supabase.from('products').update({ quantity: newQty }).eq('id', p.id).then();
          }
          return { ...p, quantity: newQty };
        }
        return p;
      });
      setProducts(updatedProducts);
    }
    if (supabase) {
      await supabase.from('sales').delete().eq('id', id);
      await supabase.from('transactions').delete().eq('id', `${user.id}_sale-${cleanId}`);
    }
    setSales(sales.filter(s => s.id !== id));
    setTransactions(transactions.filter(t => t.id !== `${user.id}_sale-${cleanId}`));
  };

  // Settings Handlers
  const handleSaveSettings = async (updatedSettings: any) => {
    const supabase = getSupabaseClient();
    const settingsWithUser = { ...updatedSettings, id: user.id };
    if (supabase) {
      await supabase.from('settings').update(keysToSnake(settingsWithUser)).eq('id', user.id);
    }
    setSettings(settingsWithUser);
    showSuccess("Configurações salvas com sucesso!");
  };

  // If auth is not checked yet, show a loading spinner
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-slate-400">Carregando painel...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the Auth screen
  if (!user) {
    return <Auth onAuthSuccess={(loggedInUser) => {
      setUser(loggedInUser);
      loadAllData(loggedInUser);
    }} />;
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
          userEmail={user.email}
          onLogout={handleLogout}
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
            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {syncStatus === 'synced' && (
                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded-lg">
                  <Cloud size={14} />
                  Nuvem Sincronizada
                </span>
              )}
              {syncStatus === 'pending' && (
                <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 border border-amber-900/50 px-2.5 py-1 rounded-lg animate-pulse">
                  <CloudLightning size={14} />
                  Salvando alterações...
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="flex items-center gap-1 text-rose-400 bg-rose-950/40 border border-rose-900/50 px-2.5 py-1 rounded-lg">
                  <CloudOff size={14} />
                  Erro de Sincronização
                </span>
              )}
            </div>
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
              settings={settings}
              onAddBooking={handleAddBooking}
              onDeleteBooking={handleDeleteBooking}
              onTogglePaid={handleTogglePaid}
              onBlockSlot={handleBlockSlot}
              onUnblockSlot={handleUnblockSlot}
              onAddMensalista={handleAddMensalista}
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