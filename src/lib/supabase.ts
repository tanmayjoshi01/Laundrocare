import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function mapCustomer(row: any) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address || '',
    totalOrders: row.total_orders || 0,
    totalSpent: row.total_spent || 0,
    pendingDues: row.pending_dues || 0,
    lastVisit: row.last_visit || '',
    active: row.active,
    categoryId: row.category_id || undefined,
    notes: row.notes || undefined,
  };
}

export function mapOrder(row: any, items: any[]) {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    items: items.map(i => ({
      id: i.id,
      item: i.item,
      service: i.service,
      qty: i.qty,
      unitPrice: i.unit_price,
      notes: i.notes || undefined,
    })),
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    status: row.status,
    paid: row.paid,
    paymentMethod: row.payment_method || '',
    createdAt: row.created_at,
    dueDate: row.due_date,
  };
}
