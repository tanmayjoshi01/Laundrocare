import { useState, useEffect } from 'react';
import { useStore, Order } from '../store';
import { Button, StatusBadge, WhatsAppButton } from '../components/ui';
import { Search, Calendar } from 'lucide-react';
import { useSearchParams } from 'react-router';

const TABS = [
  { key: 'pending', label: '🟡 Pending' },
  { key: 'completed', label: '🟢 Completed' },
  { key: 'all', label: 'All' },
];

export default function OrdersPage() {
  const { orders, setOrders, showToast } = useStore();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight') || '';
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

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

  const isOverdue = (o: Order) => o.status !== 'completed' && !o.paid && o.dueDate < '2026-03-27';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(o => (
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
              <div className="mt-2 text-[13px] text-[#64748B] font-['DM_Sans']">
                {o.items.map(i => `${i.item} ×${i.qty}`).join(', ')}
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="font-['JetBrains_Mono'] text-[20px] text-[#0F172A]" style={{ fontWeight: 700 }}>₹{o.total}</span>
                <span className="text-[13px] text-[#64748B] font-['DM_Sans']">Due: {o.dueDate}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {o.status === 'pending' && (
                  <Button variant="success" size="sm" onClick={() => updateStatus(o.id, 'completed')}>🟢 Complete</Button>
                )}
                {!o.paid && (
                  <Button variant="secondary" size="sm" onClick={() => markPaid(o.id)}>💳 Mark Paid</Button>
                )}
                <a href={`https://wa.me/91${o.customerPhone}?text=${encodeURIComponent(`Hi ${o.customerName}, your order #${o.id} update from LaundroCare`)}`} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-[8px] bg-[#25D366] text-white flex items-center justify-center hover:bg-[#1ebe57] cursor-pointer">📱</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}