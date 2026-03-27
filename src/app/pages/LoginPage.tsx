import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store';
import { Button } from '../components/ui';
import logoImg from 'figma:asset/29314f96b0646ef99b94a47ff8eedab177634f16.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const { setIsLoggedIn, showToast } = useStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsLoggedIn(true);
    showToast('✅ Login successful!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-full max-w-[420px] p-10">
        <div className="text-center mb-8">
          <img src={logoImg} alt="LaundroCare" className="h-16 w-16 rounded-xl mx-auto object-cover" />
          <h1 className="mt-4 text-[24px] font-['Plus_Jakarta_Sans'] text-[#0F172A]" style={{ fontWeight: 700 }}>Staff Login</h1>
          <p className="mt-1 text-[15px] text-[#64748B] font-['DM_Sans']">Access the management dashboard</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[14px] text-[#64748B] font-['DM_Sans'] mb-1.5 block">Phone or Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter phone or username"
              className="w-full h-[52px] px-4 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] font-['DM_Sans'] text-[16px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-[14px] text-[#64748B] font-['DM_Sans'] mb-1.5 block">PIN / Password</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="w-full h-[52px] px-4 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] font-['JetBrains_Mono'] text-[20px] text-[#0F172A] tracking-[0.3em] placeholder:tracking-normal placeholder:font-['DM_Sans'] placeholder:text-[16px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <Button variant="primary" size="lg" className="w-full" onClick={handleLogin}>
            Login →
          </Button>
        </div>
        <p className="mt-6 text-center text-[13px] text-[#94A3B8] font-['DM_Sans']">Forgot PIN? Contact admin.</p>
      </div>
    </div>
  );
}