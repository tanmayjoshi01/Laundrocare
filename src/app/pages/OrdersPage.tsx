import { useState, useEffect } from 'react';
import { useStore, Order } from '../store';
import { Button, StatusBadge, WhatsAppButton } from '../components/ui';
import { Search, Calendar } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router';
import { OrderBillModal } from '../components/OrderBillModal';
import { getWhatsAppBillUrl } from '../components/whatsapp-bill';

const TABS = [
  { key: 'pending', label: '🟡 Pending' },
  { key: 'completed', label: '🟢 Completed' },
  { key: 'all', label: 'All' },
];

export default function OrdersPage() {
  const { orders, setOrders, showToast, getCustomerCategory, customerCategories, customers, laundryServices } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightId = searchParams.get('highlight') || '';
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [viewBillOrder, setViewBillOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (highlightId) {
      setTab('all');
      setSearch(highlightId);
    }
  }, [highlightId]);

  const filtered = orders.filter(o => {
    if (tab !== 'all' && o.status !== tab) return false;
    if (search && !o.customerName.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const updateStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showToast(`✅ Order ${id} marked as ${status}!`);
  };

  const markPaid = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paid: true } : o));
    showToast(`✅ Order ${id} marked as paid!`);
  };

  const isOverdue = (o: Order) => o.status !== 'completed' && !o.paid && o.dueDate < new Date().toLocaleDateString('en-CA');

  // Group filtered orders by customer category
  const groupedOrders = (() => {
    const groups: { category: { id: string; name: string; discount: number; color: string } | null; orders: Order[] }[] = [];
    const categoryMap = new Map<string, Order[]>();
    const uncategorized: Order[] = [];

    filtered.forEach(o => {
      const customer = customers.find(c => c.id === o.customerId);
      const catId = customer?.categoryId;
      if (catId) {
        if (!categoryMap.has(catId)) categoryMap.set(catId, []);
        categoryMap.get(catId)!.push(o);
      } else {
        uncategorized.push(o);
      }
    });

    // Sort categories by discount descending
    const sortedCats = customerCategories
      .filter(c => categoryMap.has(c.id))
      .sort((a, b) => b.discount - a.discount);

    sortedCats.forEach(cat => {
      groups.push({ category: cat, orders: categoryMap.get(cat.id)! });
    });

    if (uncategorized.length > 0) {
      groups.push({ category: null, orders: uncategorized });
    }

    return groups;
  })();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-[24px] font-['Plus_Jakarta_Sans'] text-[#0F172A] mb-6" style={{ fontWeight: 700 }}>Orders</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`h-[48px] px-5 rounded-[8px] font-['DM_Sans'] text-[15px] transition-all cursor-pointer ${tab === t.key ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'}`}
          >
            {t.label} {t.key !== 'all' && counts[t.key as keyof typeof counts] !== undefined && `(${counts[t.key as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or order ID..." className="w-full h-[48px] pl-10 pr-4 rounded-[8px] border border-[#E2E8F0] bg-white font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#94A3B8] font-['DM_Sans']">
          <div className="text-[48px] mb-3">📦</div>
          <p className="text-[16px]">No orders found</p>
          <p className="text-[14px]">Try a different filter or search term</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedOrders.map((group, gi) => (
            <div key={group.category?.id || 'uncategorized'}>
              {/* Category Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: group.category?.color || '#94A3B8' }} />
                <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A]" style={{ fontWeight: 700 }}>
                  {group.category ? group.category.name : 'Walk-in / No Category'}
                </h2>
                {group.category && group.category.discount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] font-['JetBrains_Mono'] text-[12px] text-[#16A34A]" style={{ fontWeight: 600 }}>
                    {group.category.discount}% discount
                  </span>
                )}
                <span className="font-['DM_Sans'] text-[13px] text-[#94A3B8]">
                  {group.orders.length} order{group.orders.length !== 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              {/* Order Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.orders.map(o => (
                  <div key={o.id} className="bg-white rounded-[12px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-['JetBrains_Mono'] text-[18px] text-[#2563EB]" style={{ fontWeight: 700 }}>#{o.id}</span>
                      <div className="flex gap-1.5">
                        <StatusBadge status={isOverdue(o) ? 'overdue' : o.status} />
                        {!o.paid && <StatusBadge status="unpaid" />}
                      </div>
                    </div>
                    <div className="font-['DM_Sans'] text-[15px] text-[#0F172A]" style={{ fontWeight: 500 }}>{o.customerName}</div>
                    <div className="font-['JetBrains_Mono'] text-[13px] text-[#64748B]">{o.customerPhone}</div>
                    {(() => {
                      const cat = getCustomerCategory(o.customerId);
                      return cat && cat.discount > 0 ? (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0]">
                          <span className="font-['DM_Sans'] text-[11px] text-[#16A34A]" style={{ fontWeight: 600 }}>{cat.name} {cat.discount}% applied</span>
                        </div>
                      ) : null;
                    })()}
                    <div className="mt-2 text-[13px] text-[#64748B] font-['DM_Sans']">
                      {o.items.map(i => `${i.item} ×${i.qty}`).join(', ')}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-['JetBrains_Mono'] text-[20px] text-[#0F172A]" style={{ fontWeight: 700 }}>₹{o.total}</span>
                      <span className="text-[13px] text-[#64748B] font-['DM_Sans']">Due: {o.dueDate}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setViewBillOrder(o)}>📄 View Bill</Button>
                      {o.status === 'pending' && (
                        <Button variant="success" size="sm" onClick={() => navigate(`/checkout/${o.id}`)}>🟢 Complete</Button>
                      )}
                      {!o.paid && (
                        <Button variant="secondary" size="sm" onClick={() => markPaid(o.id)}>💳 Mark Paid</Button>
                      )}
                      <a href={getWhatsAppBillUrl(o, laundryServices, getCustomerCategory(o.customerId) || undefined)} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-[8px] bg-[#25D366] text-white flex items-center justify-center hover:bg-[#1ebe57] cursor-pointer">📱</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bill Modal */}
      {viewBillOrder && (
        <OrderBillModal order={viewBillOrder} onClose={() => setViewBillOrder(null)} />
      )}
    </div>
  );
}