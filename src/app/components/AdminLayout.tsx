import { useEffect } from 'react';
import logoImg from '../../assets/29314f96b0646ef99b94a47ff8eedab177634f16.png';
import { Outlet, useNavigate } from 'react-router';
import { useStore } from '../store';
import { Toast } from './ui';
import { LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { shopOpen, setShopOpen, isLoggedIn, loading, toastMessage, signOut } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-['DM_Sans'] text-[16px] text-[#64748B]">Loading LaundroCare...</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-[#E2E8F0] h-[72px] flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src={logoImg} alt="LaundroCare" className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-[18px] font-['Plus_Jakarta_Sans'] text-[#2563EB] hidden sm:block" style={{ fontWeight: 700 }}>LaundroCare</span>
        </div>
        <div className="flex-1 text-center">
          <span className="font-['DM_Sans'] text-[15px] text-[#0F172A]">Good morning, Operator 👋</span>
          <span className="font-['DM_Sans'] text-[13px] text-[#64748B] ml-3 hidden md:inline">{today}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={async () => { await setShopOpen(!shopOpen); }}
            className={`h-[40px] px-4 rounded-full font-['DM_Sans'] text-[13px] flex items-center gap-2 cursor-pointer transition-colors ${shopOpen ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}
          >
            {shopOpen ? '🟢 Open' : '🔴 Closed'}
          </button>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-10 h-10 rounded-[8px] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>
      <Outlet />
      <Toast message={toastMessage} />
    </div>
  );
}