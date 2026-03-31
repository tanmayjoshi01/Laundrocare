import React, {
  createContext, useContext, useState,
  useEffect, useRef, ReactNode, useCallback
} from 'react';
import { supabase, mapCustomer, mapOrder } from '../lib/supabase';

export interface CustomerCategory {
  id: string; name: string; discount: number; color: string;
}
export interface Customer {
  id: string; name: string; phone: string; address: string;
  totalOrders: number; totalSpent: number; pendingDues: number;
  lastVisit: string; active: boolean; categoryId?: string; notes?: string;
}
export interface OrderItem {
  id: string; item: string; service: string;
  qty: number; unitPrice: number; notes?: string;
}
export interface Order {
  id: string; customerId: string; customerName: string; customerPhone: string;
  items: OrderItem[]; subtotal: number; discount: number; total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paid: boolean;
  paymentMethod?: 'cash' | 'online' | 'upi' | '';
  createdAt: string;
  dueDate: string;
  paymentLink?: string;
  paymentLinkId?: string;
  billUrl?: string;
}
export interface LaundryItem { id: string; name: string; }
export interface LaundryService { id: string; key: string; label: string; }
export interface PricingEntry { itemId: string; serviceKey: string; price: number; }

interface StoreContextType {
  customers: Customer[];
  orders: Order[];
  laundryItems: LaundryItem[];
  laundryServices: LaundryService[];
  pricingList: PricingEntry[];
  customerCategories: CustomerCategory[];
  shopOpen: boolean;
  isLoggedIn: boolean;
  loading: boolean;
  currentOrderItems: OrderItem[];
  selectedCustomer: Customer | null;
  ownerPhone: string;
  dailySummaryEnabled: boolean;
  monthlySummaryEnabled: boolean;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setLaundryItems: React.Dispatch<React.SetStateAction<LaundryItem[]>>;
  setLaundryServices: React.Dispatch<React.SetStateAction<LaundryService[]>>;
  setPricingList: React.Dispatch<React.SetStateAction<PricingEntry[]>>;
  setCustomerCategories: React.Dispatch<React.SetStateAction<CustomerCategory[]>>;
  setShopOpen: (open: boolean) => Promise<void>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
  nextOrderId: () => Promise<string>;
  showToast: (msg: string) => void;
  toastMessage: string;
  getPricing: () => Record<string, Record<string, number>>;
  getCustomerDues: (customerId: string) => number;
  getCustomerCategory: (customerId: string) => CustomerCategory | undefined;
  saveCustomer: (customer: Customer) => Promise<void>;
  saveOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  savePricing: (itemId: string, serviceKey: string, price: number) => Promise<void>;
  saveCategory: (cat: CustomerCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveLaundryItem: (item: LaundryItem) => Promise<void>;
  deleteLaundryItem: (id: string) => Promise<void>;
  saveLaundryService: (svc: LaundryService) => Promise<void>;
  deleteLaundryService: (id: string, key: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createPaymentLink: (order: Order) => Promise<string | null>;
  saveOwnerSettings: (phone: string, daily: boolean, monthly: boolean) => Promise<void>;
  generateDailySummary: () => { todayOrders: number; todayEarnings: number; paidAmount: number; unpaidAmount: number; pending: number; completed: number };
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
  const [laundryServices, setLaundryServices] = useState<LaundryService[]>([]);
  const [pricingList, setPricingList] = useState<PricingEntry[]>([]);
  const [customerCategories, setCustomerCategories] = useState<CustomerCategory[]>([]);
  const [shopOpen, setShopOpenState] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(true);
  const [monthlySummaryEnabled, setMonthlySummaryEnabled] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsLoggedIn(true);
      } else {
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (!session) {
        setLoading(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadAllData();
  }, [isLoggedIn]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        { data: cats },
        { data: custs },
        { data: items },
        { data: svcs },
        { data: pricing },
        { data: ordersData },
        { data: orderItemsData },
        { data: settings },
      ] = await Promise.all([
        supabase.from('customer_categories').select('*').order('name'),
        supabase.from('customers').select('*').order('name'),
        supabase.from('laundry_items').select('*').order('name'),
        supabase.from('laundry_services').select('*').order('label'),
        supabase.from('pricing_entries').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('order_items').select('*'),
        supabase.from('shop_settings').select('*').eq('id', 1).single(),
      ]);

      if (cats) setCustomerCategories(cats.map(c => ({ id: c.id, name: c.name, discount: c.discount, color: c.color })));
      if (custs) setCustomers(custs.map(mapCustomer));
      if (items) setLaundryItems(items.map(i => ({ id: i.id, name: i.name })));
      if (svcs) setLaundryServices(svcs.map(s => ({ id: s.id, key: s.key, label: s.label })));
      if (pricing) setPricingList(pricing.map(p => ({ itemId: p.item_id, serviceKey: p.service_key, price: p.price })));
      if (ordersData && orderItemsData) {
        setOrders(ordersData.map(o => mapOrder(o, orderItemsData.filter(i => i.order_id === o.id))));
      }
      if (settings) {
        setShopOpenState(settings.shop_open);
        if (settings.owner_phone) setOwnerPhone(settings.owner_phone);
        if (settings.daily_summary_enabled !== undefined) setDailySummaryEnabled(settings.daily_summary_enabled);
        if (settings.monthly_summary_enabled !== undefined) setMonthlySummaryEnabled(settings.monthly_summary_enabled);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const setShopOpen = async (open: boolean) => {
    setShopOpenState(open);
    await supabase.from('shop_settings').update({ shop_open: open }).eq('id', 1);
  };

  const nextOrderId = async (): Promise<string> => {
    const { data } = await supabase.from('shop_settings').select('order_counter').eq('id', 1).single();
    const counter = data?.order_counter || 1;
    await supabase.from('shop_settings').update({ order_counter: counter + 1 }).eq('id', 1);
    return `T${String(counter).padStart(3, '0')}`;
  };

  const saveCustomer = async (customer: Customer) => {
    await supabase.from('customers').upsert({
      id: customer.id, name: customer.name, phone: customer.phone,
      address: customer.address, total_orders: customer.totalOrders,
      total_spent: customer.totalSpent, pending_dues: customer.pendingDues,
      last_visit: customer.lastVisit, active: customer.active,
      category_id: customer.categoryId || null, notes: customer.notes || null,
    });
  };

  const saveOrder = async (order: Order) => {
    await supabase.from('orders').insert({
      id: order.id, customer_id: order.customerId,
      customer_name: order.customerName, customer_phone: order.customerPhone,
      subtotal: order.subtotal, discount: order.discount, total: order.total,
      status: order.status, paid: order.paid,
      payment_method: order.paymentMethod || '',
      created_at: order.createdAt, due_date: order.dueDate,
      payment_link: order.paymentLink || null,
      payment_link_id: order.paymentLinkId || null,
    });
    await supabase.from('order_items').insert(
      order.items.map(i => ({
        id: i.id, order_id: order.id, item: i.item,
        service: i.service, qty: i.qty, unit_price: i.unitPrice,
        notes: i.notes || null,
      }))
    );
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const row: any = {};
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.paid !== undefined) row.paid = updates.paid;
    if (updates.paymentMethod !== undefined) row.payment_method = updates.paymentMethod;
    if (updates.paymentLink !== undefined) row.payment_link = updates.paymentLink;
    if (updates.paymentLinkId !== undefined) row.payment_link_id = updates.paymentLinkId;
    await supabase.from('orders').update(row).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const saveCategory = async (cat: CustomerCategory) => {
    await supabase.from('customer_categories').upsert({ id: cat.id, name: cat.name, discount: cat.discount, color: cat.color });
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('customer_categories').delete().eq('id', id);
  };

  const saveLaundryItem = async (item: LaundryItem) => {
    await supabase.from('laundry_items').upsert({ id: item.id, name: item.name });
  };

  const deleteLaundryItem = async (id: string) => {
    await supabase.from('laundry_items').delete().eq('id', id);
  };

  const saveLaundryService = async (svc: LaundryService) => {
    await supabase.from('laundry_services').upsert({ id: svc.id, key: svc.key, label: svc.label });
  };

  const deleteLaundryService = async (id: string, key: string) => {
    await supabase.from('laundry_services').delete().eq('id', id);
    await supabase.from('pricing_entries').delete().eq('service_key', key);
  };

  const savePricing = async (itemId: string, serviceKey: string, price: number) => {
    await supabase.from('pricing_entries').upsert({ item_id: itemId, service_key: serviceKey, price });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getPricing = useCallback(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const item of laundryItems) {
      map[item.name] = {};
      for (const p of pricingList) {
        if (p.itemId === item.id) map[item.name][p.serviceKey] = p.price;
      }
    }
    return map;
  }, [laundryItems, pricingList]);

  const getCustomerDues = (customerId: string) =>
    orders.filter(o => o.customerId === customerId && !o.paid).reduce((s, o) => s + o.total, 0);

  const getCustomerCategory = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer?.categoryId) return undefined;
    return customerCategories.find(cat => cat.id === customer.categoryId);
  };

  const createPaymentLink = async (order: Order): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          orderId: order.id,
          amount: order.total * 100, // paise
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          description: `LaundroCare Order #${order.id}`,
        },
      });
      if (error || !data?.short_url) {
        console.error('Payment link error:', error || data);
        return null;
      }
      // Update order with payment link
      await updateOrder(order.id, { paymentLink: data.short_url, paymentLinkId: data.id });
      return data.short_url;
    } catch (err) {
      console.error('Payment link creation failed:', err);
      return null;
    }
  };

  const saveOwnerSettings = async (phone: string, daily: boolean, monthly: boolean) => {
    setOwnerPhone(phone);
    setDailySummaryEnabled(daily);
    setMonthlySummaryEnabled(monthly);
    await supabase.from('shop_settings').update({
      owner_phone: phone,
      daily_summary_enabled: daily,
      monthly_summary_enabled: monthly,
    }).eq('id', 1);
  };

  const generateDailySummary = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const todayOrders = orders.filter(o => o.createdAt === today);
    return {
      todayOrders: todayOrders.length,
      todayEarnings: todayOrders.reduce((s, o) => s + o.total, 0),
      paidAmount: todayOrders.filter(o => o.paid).reduce((s, o) => s + o.total, 0),
      unpaidAmount: todayOrders.filter(o => !o.paid).reduce((s, o) => s + o.total, 0),
      upiTotal: todayOrders.filter(o => o.paid && o.paymentMethod === 'upi').reduce((s, o) => s + o.total, 0),
      cashTotal: todayOrders.filter(o => o.paid && o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0),
      pending: todayOrders.filter(o => o.status === 'pending').length,
      completed: todayOrders.filter(o => o.status === 'completed').length,
    };
  };

  return (
    <StoreContext.Provider value={{
      customers, setCustomers, orders, setOrders,
      laundryItems, setLaundryItems, laundryServices, setLaundryServices,
      pricingList, setPricingList, customerCategories, setCustomerCategories,
      shopOpen, setShopOpen, isLoggedIn, setIsLoggedIn, loading,
      currentOrderItems, setCurrentOrderItems,
      selectedCustomer, setSelectedCustomer,
      ownerPhone, dailySummaryEnabled, monthlySummaryEnabled,
      nextOrderId, toastMessage, showToast,
      getPricing, getCustomerDues, getCustomerCategory,
      saveCustomer, saveOrder, updateOrder, savePricing,
      saveCategory, deleteCategory,
      saveLaundryItem, deleteLaundryItem,
      saveLaundryService, deleteLaundryService,
      signIn, signOut, createPaymentLink, saveOwnerSettings, generateDailySummary,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
