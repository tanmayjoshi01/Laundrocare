import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store';
import { StatusBadge } from '../components/ui';
import { ArrowLeft, TrendingUp, Calendar, Users, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReportsPage() {
  const { orders, customers } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'earnings' | 'customers'>('earnings');
  const [custSearch, setCustSearch] = useState('');
  const [expandedCust, setExpandedCust] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-CA');
  const monthPrefix = today.slice(0, 7);
  const yearPrefix = today.slice(0, 4);

  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => o.createdAt === today);
    const todayEarnings = todayOrders.reduce((s, o) => s + o.total, 0);

    // Monthly: same month & year
    const monthOrders = orders.filter(o => o.createdAt.startsWith(monthPrefix));
    const monthEarnings = monthOrders.reduce((s, o) => s + o.total, 0);

    // Yearly: same year
    const yearOrders = orders.filter(o => o.createdAt.startsWith(yearPrefix));
    const yearEarnings = yearOrders.reduce((s, o) => s + o.total, 0);

    // Total (all-time)
    const totalEarnings = orders.reduce((s, o) => s + o.total, 0);

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    const totalOrders = orders.length;

    const paidAmount = orders.filter(o => o.paid).reduce((s, o) => s + o.total, 0);
    const unpaidAmount = orders.filter(o => !o.paid).reduce((s, o) => s + o.total, 0);

    return { todayEarnings, todayOrders: todayOrders.length, monthEarnings, monthOrders: monthOrders.length, yearEarnings, yearOrders: yearOrders.length, totalEarnings, totalOrders, pendingCount, completedCount, paidAmount, unpaidAmount };
  }, [orders, monthPrefix, today, yearPrefix]);

  // Per-customer earnings
  const customerEarnings = useMemo(() => {
    const map = new Map<string, { customerId: string; name: string; phone: string; total: number; orderCount: number; orders: typeof orders }>();
    for (const o of orders) {
      const existing = map.get(o.customerId);
      if (existing) {
        existing.total += o.total;
        existing.orderCount += 1;
        existing.orders.push(o);
      } else {
        map.set(o.customerId, { customerId: o.customerId, name: o.customerName, phone: o.customerPhone, total: o.total, orderCount: 1, orders: [o] });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [orders]);

  const filteredCustomerEarnings = customerEarnings.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch)
  );

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-[8px] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC] cursor-pointer">
          <ArrowLeft size={20} className="text-[#64748B]" />
        </button>
        <h1 className="text-[24px] font-['Plus_Jakarta_Sans'] text-[#0F172A]" style={{ fontWeight: 700 }}>Reports</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('earnings')}
          className={`h-[48px] px-6 rounded-[8px] font-['DM_Sans'] text-[15px] cursor-pointer transition-all ${tab === 'earnings' ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'}`}
          style={{ fontWeight: tab === 'earnings' ? 600 : 400 }}
        >
          <TrendingUp size={16} className="inline mr-2" />Earnings Overview
        </button>
        <button
          onClick={() => setTab('customers')}
          className={`h-[48px] px-6 rounded-[8px] font-['DM_Sans'] text-[15px] cursor-pointer transition-all ${tab === 'customers' ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'}`}
          style={{ fontWeight: tab === 'customers' ? 600 : 400 }}
        >
          <Users size={16} className="inline mr-2" />Customer Earnings
        </button>
      </div>

      {/* Earnings Tab */}
      {tab === 'earnings' && (
        <div className="space-y-6">
          {/* Earnings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <EarningCard icon="📅" label="Today's Earnings" value={stats.todayEarnings} subtext={`${stats.todayOrders} orders`} color="#2563EB" />
            <EarningCard icon="📆" label="This Month" value={stats.monthEarnings} subtext={`${stats.monthOrders} orders`} color="#16A34A" />
            <EarningCard icon="🗓️" label="This Year" value={stats.yearEarnings} subtext={`${stats.yearOrders} orders`} color="#D97706" />
            <EarningCard icon="💰" label="Total Earnings" value={stats.totalEarnings} subtext={`${stats.totalOrders} orders`} color="#0F172A" />
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
            <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A] mb-5" style={{ fontWeight: 700 }}>Order Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FFFBEB] rounded-[10px] p-5 text-center">
                <div className="text-[28px] mb-1">🟡</div>
                <div className="font-['JetBrains_Mono'] text-[28px] text-[#D97706]" style={{ fontWeight: 700 }}>{stats.pendingCount}</div>
                <div className="font-['DM_Sans'] text-[14px] text-[#92400E]">Pending</div>
              </div>
              <div className="bg-[#F0FDF4] rounded-[10px] p-5 text-center">
                <div className="text-[28px] mb-1">🟢</div>
                <div className="font-['JetBrains_Mono'] text-[28px] text-[#16A34A]" style={{ fontWeight: 700 }}>{stats.completedCount}</div>
                <div className="font-['DM_Sans'] text-[14px] text-[#166534]">Completed</div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
            <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A] mb-5" style={{ fontWeight: 700 }}>Payment Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F0FDF4] rounded-[10px] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[18px]">✅</div>
                  <span className="font-['DM_Sans'] text-[15px] text-[#166534]" style={{ fontWeight: 600 }}>Collected</span>
                </div>
                <div className="font-['JetBrains_Mono'] text-[28px] text-[#16A34A]" style={{ fontWeight: 700 }}>₹{stats.paidAmount.toLocaleString()}</div>
              </div>
              <div className="bg-[#FEF2F2] rounded-[10px] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[18px]">⏳</div>
                  <span className="font-['DM_Sans'] text-[15px] text-[#991B1B]" style={{ fontWeight: 600 }}>Pending Dues</span>
                </div>
                <div className="font-['JetBrains_Mono'] text-[28px] text-[#DC2626]" style={{ fontWeight: 700 }}>₹{stats.unpaidAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Earnings Tab */}
      {tab === 'customers' && (
        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>Earnings by Customer</h2>
          <p className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-5">Click a customer to see their orders. Click an order to view it in the Orders page.</p>

          <div className="relative mb-5">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={custSearch}
              onChange={e => setCustSearch(e.target.value)}
              placeholder="Search customer..."
              className="w-full h-[48px] pl-10 pr-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="space-y-2">
            {filteredCustomerEarnings.map(c => {
              const isExpanded = expandedCust === c.customerId;
              return (
                <div key={c.customerId} className="border border-[#E2E8F0] rounded-[10px] overflow-hidden">
                  <button
                    onClick={() => setExpandedCust(isExpanded ? null : c.customerId)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-[#F8FAFC] cursor-pointer transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[14px] font-['DM_Sans'] shrink-0">
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-['DM_Sans'] text-[15px] text-[#0F172A]" style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="font-['JetBrains_Mono'] text-[12px] text-[#64748B]">{c.phone}</div>
                    </div>
                    <div className="text-right shrink-0 mr-2">
                      <div className="font-['JetBrains_Mono'] text-[18px] text-[#16A34A]" style={{ fontWeight: 700 }}>₹{c.total.toLocaleString()}</div>
                      <div className="font-['DM_Sans'] text-[12px] text-[#94A3B8]">{c.orderCount} order{c.orderCount > 1 ? 's' : ''}</div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-[#94A3B8] shrink-0" /> : <ChevronDown size={18} className="text-[#94A3B8] shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      <div className="border-t border-[#E2E8F0] pt-3 mb-2">
                        <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">Click an order to view it in Orders page</span>
                      </div>
                      {c.orders.map(o => (
                        <button
                          key={o.id}
                          onClick={() => navigate(`/orders?highlight=${o.id}`)}
                          className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-4">
                            <span className="font-['JetBrains_Mono'] text-[14px] text-[#2563EB]">#{o.id}</span>
                            <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">{o.createdAt}</span>
                            <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">{o.items.map(i => `${i.item}×${i.qty}`).join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-['JetBrains_Mono'] text-[15px] text-[#0F172A]">₹{o.total}</span>
                            <StatusBadge status={o.status} />
                            <span className={`px-2 py-0.5 rounded text-[11px] font-['DM_Sans'] ${o.paid ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF2F2] text-[#991B1B]'}`} style={{ fontWeight: 600 }}>
                              {o.paid ? 'PAID' : 'UNPAID'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCustomerEarnings.length === 0 && (
              <div className="text-center py-10 text-[#94A3B8] font-['DM_Sans']">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-[15px]">No customers found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EarningCard({ icon, label, value, subtext, color }: { icon: string; label: string; value: number; subtext: string; color: string }) {
  return (
    <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[24px]">{icon}</span>
        <span className="font-['DM_Sans'] text-[14px] text-[#64748B]">{label}</span>
      </div>
      <div className="font-['JetBrains_Mono'] text-[28px]" style={{ fontWeight: 700, color }}>₹{value.toLocaleString()}</div>
      <div className="font-['DM_Sans'] text-[13px] text-[#94A3B8] mt-1">{subtext}</div>
    </div>
  );
}