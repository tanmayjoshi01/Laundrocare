import { useState, useEffect } from 'react';
import { useStore, Order } from '../store';
import { Button, StatusBadge, WhatsAppButton } from '../components/ui';
import { Search, Calendar, Link2, Copy } from 'lucide-react';
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
                      {o.paymentLink && !o.paid && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(o.paymentLink!); showToast('📋 Payment link copied!'); }}
                          className="h-10 px-3 rounded-[8px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center gap-1.5 hover:bg-[#DBEAFE] cursor-pointer font-['DM_Sans'] text-[13px]"
                          style={{ fontWeight: 500 }}
                        >
                          <Link2 size={14} /> Copy Link
                        </button>
                      )}
                      <a
                        href={getWhatsAppBillUrl(o, laundryServices, getCustomerCategory(o.customerId) || undefined)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-[8px] bg-[#25D366] text-white flex items-center justify-center hover:bg-[#1ebe57] cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 448 512"
                          fill="currentColor"
                        >
                          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
                      </a>
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