import { ReactNode } from 'react';

const sizeMap = { sm: 'h-10 px-4 text-[14px]', md: 'h-[52px] px-6 text-[15px]', lg: 'h-[56px] px-8 text-[16px]' };
const variantMap = {
  primary: 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]',
  secondary: 'bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] hover:bg-[#E2E8F0]',
  ghost: 'bg-transparent text-[#64748B] hover:bg-[#F1F5F9]',
  danger: 'bg-[#DC2626] text-white hover:bg-[#b91c1c]',
  success: 'bg-[#16A34A] text-white hover:bg-[#15803d]',
  'success-outline': 'bg-transparent text-[#16A34A] border-2 border-[#16A34A] hover:bg-[#f0fdf4]',
};

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: { children: ReactNode; variant?: keyof typeof variantMap; size?: 'sm' | 'md' | 'lg'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`rounded-[8px] cursor-pointer inline-flex items-center justify-center gap-2 transition-colors font-['DM_Sans'] ${sizeMap[size]} ${variantMap[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

const statusColors: Record<string, string> = {
  pending: 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]',
  processing: 'bg-[#DBEAFE] text-[#1E40AF] border border-[#3B82F6]',
  completed: 'bg-[#DCFCE7] text-[#166534] border border-[#22C55E]',
  paid: 'bg-[#DCFCE7] text-[#166534] border border-[#22C55E]',
  overdue: 'bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]',
  unpaid: 'bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-['DM_Sans'] ${statusColors[status] || statusColors.pending}`}>
      {status === 'pending' && '🟡 '}{status === 'processing' && '🔵 '}{status === 'completed' && '🟢 '}{status === 'overdue' && '🔴 '}{status === 'paid' && '🟢 '}{status === 'unpaid' && '🔴 '}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function StatCard({ icon, label, value, color = '#2563EB' }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white rounded-[12px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] flex items-center gap-4 flex-1 min-w-[200px]">
      <div className="text-[28px]">{icon}</div>
      <div>
        <div className="text-[#64748B] text-[14px] font-['DM_Sans']">{label}</div>
        <div className="text-[24px] font-['JetBrains_Mono'] mt-0.5" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}

export function WhatsAppButton({ message, phone, className = '' }: { message: string; phone?: string; className?: string }) {
  const url = `https://wa.me/${phone || ''}?text=${encodeURIComponent(message)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 h-[52px] px-6 rounded-[8px] bg-[#25D366] text-white hover:bg-[#1ebe57] transition-colors cursor-pointer font-['DM_Sans'] ${className}`}>
      📱 WhatsApp
    </a>
  );
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 z-[9999] bg-[#0F172A] text-white px-6 py-4 rounded-[12px] shadow-xl font-['DM_Sans'] text-[15px] animate-[slideIn_0.3s_ease]">
      {message}
    </div>
  );
}
