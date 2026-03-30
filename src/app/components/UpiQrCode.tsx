import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateUpiLink } from '../../lib/upi';
import { Copy, Check } from 'lucide-react';

interface UpiQrCodeProps {
  amount: number;
  orderId: string;
}

const UPI_ID = import.meta.env.VITE_UPI_ID || 'yourshop@upi';
const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'LaundroCare';

export function UpiQrCode({ amount, orderId }: UpiQrCodeProps) {
  const [copied, setCopied] = useState(false);

  const upiLink = generateUpiLink({
    upiId: UPI_ID,
    name: UPI_NAME,
    amount,
    orderId,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-5 p-5 rounded-[16px] bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] border border-[#BFDBFE] text-center">
      <div className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#1E40AF] mb-1" style={{ fontWeight: 700 }}>
        📱 Scan & Pay via UPI
      </div>
      <div className="font-['DM_Sans'] text-[13px] text-[#3B82F6] mb-4">
        GPay · PhonePe · Paytm · Any UPI App
      </div>

      {/* QR Code */}
      <div className="inline-flex p-4 bg-white rounded-[16px] shadow-[0_4px_20px_rgba(37,99,235,0.15)] mb-4">
        <QRCodeSVG
          value={upiLink}
          size={180}
          bgColor="#ffffff"
          fgColor="#1E40AF"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Amount */}
      <div className="font-['JetBrains_Mono'] text-[32px] text-[#1E40AF] mb-1" style={{ fontWeight: 700 }}>
        ₹{amount}
      </div>
      <div className="font-['DM_Sans'] text-[13px] text-[#64748B] mb-4">
        Order #{orderId}
      </div>

      {/* UPI ID with copy */}
      <div className="flex items-center justify-center gap-2 bg-white rounded-[10px] px-4 py-3 border border-[#BFDBFE] mb-4">
        <span className="font-['JetBrains_Mono'] text-[14px] text-[#1E40AF]" style={{ fontWeight: 600 }}>
          {UPI_ID}
        </span>
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 h-8 px-3 rounded-[6px] bg-[#2563EB] text-white font-['DM_Sans'] text-[12px] cursor-pointer hover:bg-[#1d4ed8] transition-colors"
          style={{ fontWeight: 600 }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Steps */}
      <div className="text-left space-y-1.5">
        {['Open GPay / PhonePe / Paytm', 'Scan QR code or enter UPI ID', `Pay ₹${amount} and confirm`].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-['JetBrains_Mono'] text-[11px] shrink-0" style={{ fontWeight: 700 }}>
              {i + 1}
            </div>
            <span className="font-['DM_Sans'] text-[13px] text-[#1E40AF]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
