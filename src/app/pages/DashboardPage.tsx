import { useNavigate } from 'react-router';
import { useStore } from '../store';
import { Plus, Package, Users, BarChart3, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { orders } = useStore();
  const navigate = useNavigate();

  const pending = orders.filter(o => o.status === 'pending').length;

  const actions = [
    { icon: <Plus size={40} />, label: 'New Order', bg: '#2563EB', text: 'white', path: '/create-order' },
    { icon: <Package size={40} />, label: 'Orders', bg: '#F1F5F9', text: '#0F172A', path: '/orders', badge: pending },
    { icon: <Users size={40} />, label: 'Customers', bg: 'white', text: '#0F172A', path: '/customers', accent: '#16A34A' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Main Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {actions.map(a => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="relative rounded-[16px] p-8 flex flex-col items-center justify-center gap-4 min-h-[180px] transition-transform hover:scale-[1.02] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)]"
            style={{ backgroundColor: a.bg, color: a.text, border: a.accent ? `2px solid ${a.accent}` : 'none' }}
          >
            {a.badge !== undefined && a.badge > 0 && (
              <span className="absolute top-4 right-4 bg-[#D97706] text-white rounded-full w-8 h-8 flex items-center justify-center font-['JetBrains_Mono'] text-[14px]">{a.badge}</span>
            )}
            {a.icon}
            <span className="text-[18px] font-['Plus_Jakarta_Sans']" style={{ fontWeight: 700 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Secondary */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <button onClick={() => navigate('/reports')} className="rounded-[12px] bg-white border border-[#E2E8F0] p-5 flex items-center gap-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer">
          <BarChart3 size={24} className="text-[#2563EB]" />
          <span className="font-['DM_Sans'] text-[15px] text-[#0F172A]">Reports</span>
        </button>
        <button onClick={() => navigate('/settings')} className="rounded-[12px] bg-white border border-[#E2E8F0] p-5 flex items-center gap-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer">
          <Settings size={24} className="text-[#64748B]" />
          <span className="font-['DM_Sans'] text-[15px] text-[#0F172A]">Settings</span>
        </button>
      </div>
    </div>
  );
}