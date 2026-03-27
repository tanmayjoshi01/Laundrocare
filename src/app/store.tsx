import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  pendingDues: number;
  lastVisit: string;
  active: boolean;
}

export interface OrderItem {
  id: string;
  item: string;
  service: string;
  qty: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'completed';
  paid: boolean;
  createdAt: string;
  dueDate: string;
}

export interface LaundryItem {
  id: string;
  name: string;
  icon: string;
}

export interface LaundryService {
  id: string;
  key: string;
  icon: string;
  label: string;
}

export interface PricingEntry {
  itemId: string;
  serviceKey: string;
  price: number;
}

const DEFAULT_ITEMS: LaundryItem[] = [
  { id: 'i1', name: 'Shirt', icon: '👔' },
  { id: 'i2', name: 'Pant', icon: '👖' },
  { id: 'i3', name: 'Saree', icon: '🥻' },
  { id: 'i4', name: 'Blanket', icon: '🧤' },
  { id: 'i5', name: 'Kurta', icon: '👕' },
  { id: 'i6', name: 'Jacket', icon: '🧥' },
  { id: 'i7', name: 'Socks', icon: '🧦' },
  { id: 'i8', name: 'Bedsheet', icon: '🛏️' },
  { id: 'i9', name: 'Dupatta', icon: '🧣' },
];

const DEFAULT_SERVICES: LaundryService[] = [
  { id: 's1', key: 'wash', icon: '🫧', label: 'Wash Only' },
  { id: 's2', key: 'iron', icon: '🔥', label: 'Iron Only' },
  { id: 's3', key: 'dryclean', icon: '✨', label: 'Dry Clean' },
  { id: 's4', key: 'washiron', icon: '👔', label: 'Wash & Iron' },
  { id: 's5', key: 'starch', icon: '🧴', label: 'Starch' },
  { id: 's6', key: 'bleach', icon: '🤍', label: 'Bleach' },
  { id: 's7', key: 'fold', icon: '📦', label: 'Fold & Pack' },
  { id: 's8', key: 'stainremoval', icon: '🧽', label: 'Stain Removal' },
];

const DEFAULT_PRICING_LIST: PricingEntry[] = [
  // Shirt
  { itemId: 'i1', serviceKey: 'wash', price: 10 }, { itemId: 'i1', serviceKey: 'iron', price: 8 }, { itemId: 'i1', serviceKey: 'dryclean', price: 40 }, { itemId: 'i1', serviceKey: 'washiron', price: 15 }, { itemId: 'i1', serviceKey: 'starch', price: 5 }, { itemId: 'i1', serviceKey: 'bleach', price: 12 }, { itemId: 'i1', serviceKey: 'fold', price: 3 }, { itemId: 'i1', serviceKey: 'stainremoval', price: 20 },
  // Pant
  { itemId: 'i2', serviceKey: 'wash', price: 15 }, { itemId: 'i2', serviceKey: 'iron', price: 10 }, { itemId: 'i2', serviceKey: 'dryclean', price: 50 }, { itemId: 'i2', serviceKey: 'washiron', price: 20 }, { itemId: 'i2', serviceKey: 'starch', price: 6 }, { itemId: 'i2', serviceKey: 'bleach', price: 15 }, { itemId: 'i2', serviceKey: 'fold', price: 4 }, { itemId: 'i2', serviceKey: 'stainremoval', price: 25 },
  // Saree
  { itemId: 'i3', serviceKey: 'wash', price: 25 }, { itemId: 'i3', serviceKey: 'iron', price: 15 }, { itemId: 'i3', serviceKey: 'dryclean', price: 80 }, { itemId: 'i3', serviceKey: 'washiron', price: 35 }, { itemId: 'i3', serviceKey: 'starch', price: 10 }, { itemId: 'i3', serviceKey: 'bleach', price: 20 }, { itemId: 'i3', serviceKey: 'fold', price: 6 }, { itemId: 'i3', serviceKey: 'stainremoval', price: 35 },
  // Blanket
  { itemId: 'i4', serviceKey: 'wash', price: 60 }, { itemId: 'i4', serviceKey: 'iron', price: 30 }, { itemId: 'i4', serviceKey: 'dryclean', price: 120 }, { itemId: 'i4', serviceKey: 'washiron', price: 75 }, { itemId: 'i4', serviceKey: 'starch', price: 15 }, { itemId: 'i4', serviceKey: 'bleach', price: 40 }, { itemId: 'i4', serviceKey: 'fold', price: 10 }, { itemId: 'i4', serviceKey: 'stainremoval', price: 50 },
  // Kurta
  { itemId: 'i5', serviceKey: 'wash', price: 12 }, { itemId: 'i5', serviceKey: 'iron', price: 8 }, { itemId: 'i5', serviceKey: 'dryclean', price: 45 }, { itemId: 'i5', serviceKey: 'washiron', price: 18 }, { itemId: 'i5', serviceKey: 'starch', price: 5 }, { itemId: 'i5', serviceKey: 'bleach', price: 12 }, { itemId: 'i5', serviceKey: 'fold', price: 3 }, { itemId: 'i5', serviceKey: 'stainremoval', price: 22 },
  // Jacket
  { itemId: 'i6', serviceKey: 'wash', price: 30 }, { itemId: 'i6', serviceKey: 'iron', price: 20 }, { itemId: 'i6', serviceKey: 'dryclean', price: 70 }, { itemId: 'i6', serviceKey: 'washiron', price: 40 }, { itemId: 'i6', serviceKey: 'starch', price: 10 }, { itemId: 'i6', serviceKey: 'bleach', price: 25 }, { itemId: 'i6', serviceKey: 'fold', price: 8 }, { itemId: 'i6', serviceKey: 'stainremoval', price: 35 },
  // Socks
  { itemId: 'i7', serviceKey: 'wash', price: 5 }, { itemId: 'i7', serviceKey: 'iron', price: 3 }, { itemId: 'i7', serviceKey: 'dryclean', price: 15 }, { itemId: 'i7', serviceKey: 'washiron', price: 7 }, { itemId: 'i7', serviceKey: 'starch', price: 2 }, { itemId: 'i7', serviceKey: 'bleach', price: 5 }, { itemId: 'i7', serviceKey: 'fold', price: 1 }, { itemId: 'i7', serviceKey: 'stainremoval', price: 10 },
  // Bedsheet
  { itemId: 'i8', serviceKey: 'wash', price: 40 }, { itemId: 'i8', serviceKey: 'iron', price: 20 }, { itemId: 'i8', serviceKey: 'dryclean', price: 90 }, { itemId: 'i8', serviceKey: 'washiron', price: 50 }, { itemId: 'i8', serviceKey: 'starch', price: 12 }, { itemId: 'i8', serviceKey: 'bleach', price: 30 }, { itemId: 'i8', serviceKey: 'fold', price: 8 }, { itemId: 'i8', serviceKey: 'stainremoval', price: 40 },
  // Dupatta
  { itemId: 'i9', serviceKey: 'wash', price: 15 }, { itemId: 'i9', serviceKey: 'iron', price: 10 }, { itemId: 'i9', serviceKey: 'dryclean', price: 50 }, { itemId: 'i9', serviceKey: 'washiron', price: 20 }, { itemId: 'i9', serviceKey: 'starch', price: 6 }, { itemId: 'i9', serviceKey: 'bleach', price: 15 }, { itemId: 'i9', serviceKey: 'fold', price: 4 }, { itemId: 'i9', serviceKey: 'stainremoval', price: 25 },
];

// Helper to build PRICING lookup from list
function buildPricingMap(items: LaundryItem[], pricingList: PricingEntry[]): Record<string, Record<string, number>> {
  const map: Record<string, Record<string, number>> = {};
  for (const item of items) {
    map[item.name] = {};
    for (const p of pricingList) {
      if (p.itemId === item.id) {
        map[item.name][p.serviceKey] = p.price;
      }
    }
  }
  return map;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C001', name: 'Rajesh Kumar', phone: '9876543210', address: '12, MG Road', totalOrders: 15, totalSpent: 2400, pendingDues: 120, lastVisit: '2026-03-25', active: true },
  { id: 'C002', name: 'Priya Sharma', phone: '9876543211', address: '45, Nehru Nagar', totalOrders: 8, totalSpent: 1200, pendingDues: 0, lastVisit: '2026-03-20', active: true },
  { id: 'C003', name: 'Amit Patel', phone: '9876543212', address: '78, Station Road', totalOrders: 22, totalSpent: 3600, pendingDues: 250, lastVisit: '2026-02-10', active: false },
  { id: 'C004', name: 'Sunita Devi', phone: '9876543213', address: '3, Gandhi Colony', totalOrders: 5, totalSpent: 800, pendingDues: 0, lastVisit: '2026-03-26', active: true },
  { id: 'C005', name: 'Vikram Singh', phone: '9876543214', address: '90, Civil Lines', totalOrders: 12, totalSpent: 1800, pendingDues: 0, lastVisit: '2026-03-15', active: true },
];

const MOCK_ORDERS: Order[] = [
  { id: 'T001', customerId: 'C001', customerName: 'Rajesh Kumar', customerPhone: '9876543210', items: [{ id: '1', item: 'Shirt', service: 'wash', qty: 2, unitPrice: 10 }, { id: '2', item: 'Pant', service: 'iron', qty: 1, unitPrice: 10 }], subtotal: 30, discount: 0, total: 30, status: 'pending', paid: false, createdAt: '2026-03-27', dueDate: '2026-03-29' },
  { id: 'T002', customerId: 'C002', customerName: 'Priya Sharma', customerPhone: '9876543211', items: [{ id: '3', item: 'Saree', service: 'dryclean', qty: 1, unitPrice: 80 }], subtotal: 80, discount: 0, total: 80, status: 'processing', paid: false, createdAt: '2026-03-26', dueDate: '2026-03-28' },
  { id: 'T003', customerId: 'C004', customerName: 'Sunita Devi', customerPhone: '9876543213', items: [{ id: '4', item: 'Blanket', service: 'wash', qty: 2, unitPrice: 60 }, { id: '5', item: 'Shirt', service: 'iron', qty: 3, unitPrice: 8 }], subtotal: 144, discount: 10, total: 134, status: 'completed', paid: true, createdAt: '2026-03-25', dueDate: '2026-03-27' },
  { id: 'T004', customerId: 'C005', customerName: 'Vikram Singh', customerPhone: '9876543214', items: [{ id: '6', item: 'Kurta', service: 'wash', qty: 4, unitPrice: 12 }], subtotal: 48, discount: 0, total: 48, status: 'pending', paid: false, createdAt: '2026-03-27', dueDate: '2026-03-30' },
  { id: 'T005', customerId: 'C001', customerName: 'Rajesh Kumar', customerPhone: '9876543210', items: [{ id: '7', item: 'Jacket', service: 'dryclean', qty: 1, unitPrice: 70 }], subtotal: 70, discount: 5, total: 65, status: 'pending', paid: false, createdAt: '2026-03-27', dueDate: '2026-03-31' },
  { id: 'T006', customerId: 'C003', customerName: 'Amit Patel', customerPhone: '9876543212', items: [{ id: '8', item: 'Shirt', service: 'wash', qty: 5, unitPrice: 10 }, { id: '9', item: 'Pant', service: 'wash', qty: 3, unitPrice: 15 }], subtotal: 95, discount: 0, total: 95, status: 'completed', paid: true, createdAt: '2026-03-24', dueDate: '2026-03-26' },
  { id: 'T007', customerId: 'C002', customerName: 'Priya Sharma', customerPhone: '9876543211', items: [{ id: '10', item: 'Dupatta', service: 'iron', qty: 2, unitPrice: 10 }], subtotal: 20, discount: 0, total: 20, status: 'completed', paid: true, createdAt: '2026-03-23', dueDate: '2026-03-25' },
  { id: 'T008', customerId: 'C004', customerName: 'Sunita Devi', customerPhone: '9876543213', items: [{ id: '11', item: 'Bedsheet', service: 'wash', qty: 1, unitPrice: 40 }], subtotal: 40, discount: 0, total: 40, status: 'pending', paid: false, createdAt: '2026-03-27', dueDate: '2026-03-29' },
  { id: 'T009', customerId: 'C005', customerName: 'Vikram Singh', customerPhone: '9876543214', items: [{ id: '12', item: 'Saree', service: 'dryclean', qty: 2, unitPrice: 80 }, { id: '13', item: 'Kurta', service: 'iron', qty: 1, unitPrice: 8 }], subtotal: 168, discount: 15, total: 153, status: 'processing', paid: false, createdAt: '2026-03-26', dueDate: '2026-03-28' },
  { id: 'T010', customerId: 'C001', customerName: 'Rajesh Kumar', customerPhone: '9876543210', items: [{ id: '14', item: 'Shirt', service: 'wash', qty: 3, unitPrice: 10 }], subtotal: 30, discount: 0, total: 30, status: 'completed', paid: false, createdAt: '2026-03-22', dueDate: '2026-03-24' },
  { id: 'T011', customerId: 'C003', customerName: 'Amit Patel', customerPhone: '9876543212', items: [{ id: '15', item: 'Blanket', service: 'dryclean', qty: 1, unitPrice: 120 }], subtotal: 120, discount: 0, total: 120, status: 'completed', paid: true, createdAt: '2026-03-21', dueDate: '2026-03-23' },
  { id: 'T012', customerId: 'C004', customerName: 'Sunita Devi', customerPhone: '9876543213', items: [{ id: '16', item: 'Pant', service: 'iron', qty: 2, unitPrice: 10 }], subtotal: 20, discount: 0, total: 20, status: 'completed', paid: true, createdAt: '2026-03-20', dueDate: '2026-03-22' },
];

interface StoreContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  shopOpen: boolean;
  setShopOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  currentOrderItems: OrderItem[];
  setCurrentOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  selectedCustomer: Customer | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
  nextOrderId: () => string;
  toastMessage: string;
  showToast: (msg: string) => void;
  laundryItems: LaundryItem[];
  setLaundryItems: React.Dispatch<React.SetStateAction<LaundryItem[]>>;
  laundryServices: LaundryService[];
  setLaundryServices: React.Dispatch<React.SetStateAction<LaundryService[]>>;
  pricingList: PricingEntry[];
  setPricingList: React.Dispatch<React.SetStateAction<PricingEntry[]>>;
  getPricing: () => Record<string, Record<string, number>>;
  getCustomerDues: (customerId: string) => number;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [shopOpen, setShopOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const orderCounterRef = useRef(13);
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>(DEFAULT_ITEMS);
  const [laundryServices, setLaundryServices] = useState<LaundryService[]>(DEFAULT_SERVICES);
  const [pricingList, setPricingList] = useState<PricingEntry[]>(DEFAULT_PRICING_LIST);

  const nextOrderId = () => {
    const id = `T${String(orderCounterRef.current).padStart(3, '0')}`;
    orderCounterRef.current += 1;
    return id;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getPricing = () => buildPricingMap(laundryItems, pricingList);

  const getCustomerDues = (customerId: string) =>
    orders.filter(o => o.customerId === customerId && !o.paid).reduce((s, o) => s + o.total, 0);

  return (
    <StoreContext.Provider value={{ customers, setCustomers, orders, setOrders, shopOpen, setShopOpen, isLoggedIn, setIsLoggedIn, currentOrderItems, setCurrentOrderItems, selectedCustomer, setSelectedCustomer, nextOrderId, toastMessage, showToast, laundryItems, setLaundryItems, laundryServices, setLaundryServices, pricingList, setPricingList, getPricing, getCustomerDues }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};