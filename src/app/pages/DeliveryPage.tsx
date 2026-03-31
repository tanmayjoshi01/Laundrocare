import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useStore } from '../store';
import { ArrowLeft, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import { UpiQrCode } from '../components/UpiQrCode';
import { getWhatsAppPaymentCollectedUrl } from '../components/whatsapp-bill';

type Step = 'summary' | 'upi' | 'cash' | 'done';

export default function DeliveryPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, updateOrder, showToast, ownerPhone } = useStore();
  const navigate = useNavigate();

  const order = orders.find(o => o.id === orderId);
  const [step, setStep] = useState<Step>('summary');
  const [confirming, setConfirming] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="text-center">
          <div className="text-[64px] mb-4">🔍</div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[22px] text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>
            Order not found
          </h2>
          <p className="font-['DM_Sans'] text-[15px] text-[#64748B] mb-6">
            This order doesn't exist or was already processed.
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="h-[52px] px-8 rounded-[12px] bg-[#2563EB] text-white font-['DM_Sans'] text-[16px] cursor-pointer hover:bg-[#1d4ed8] transition-colors"
            style={{ fontWeight: 600 }}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Already paid
  if (order.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="text-center">
          <div className="text-[64px] mb-4">✅</div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[22px] text-[#16A34A] mb-2" style={{ fontWeight: 700 }}>
            Already Paid
          </h2>
          <p className="font-['DM_Sans'] text-[15px] text-[#64748B] mb-6">
            Order #{order.id} is already marked as paid.
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="h-[52px] px-8 rounded-[12px] bg-[#2563EB] text-white font-['DM_Sans'] text-[16px] cursor-pointer hover:bg-[#1d4ed8] transition-colors"
            style={{ fontWeight: 600 }}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmPayment = async (method: 'cash' | 'upi') => {
    setConfirming(true);
    try {
      await updateOrder(order.id, {
        paid: true,
        paymentMethod: method,
        status: 'completed',
      });

      // Notify owner via WhatsApp
      if (ownerPhone) {
        const waUrl = getWhatsAppPaymentCollectedUrl(ownerPhone, order, method);
        window.open(waUrl, '_blank');
      }

      showToast(`✅ Payment collected — ₹${order.total} via ${method === 'upi' ? 'UPI' : 'Cash'}!`);
      setStep('done');
    } catch (err) {
      console.error('Payment update failed:', err);
      showToast('❌ Failed to update payment. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  /* ─────────────── DONE SCREEN ─────────────── */
  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]">
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 rounded-full bg-[#16A34A] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(22,163,74,0.4)]">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[28px] text-[#166534] mb-2" style={{ fontWeight: 700 }}>
            Payment Done!
          </h1>
          <p className="font-['DM_Sans'] text-[16px] text-[#16A34A] mb-1">Order #{order.id} — PAID</p>
          <p className="font-['DM_Sans'] text-[15px] text-[#64748B] mb-2">{order.customerName}</p>
          <div className="font-['JetBrains_Mono'] text-[36px] text-[#16A34A] mb-6" style={{ fontWeight: 700 }}>
            ₹{order.total}
          </div>

          <div className="bg-white rounded-[16px] p-4 mb-6 shadow-sm border border-[#BBF7D0]">
            <div className="font-['DM_Sans'] text-[14px] text-[#16A34A]" style={{ fontWeight: 600 }}>
              ✅ Order marked as Completed & Paid
            </div>
            {ownerPhone && (
              <div className="font-['DM_Sans'] text-[13px] text-[#64748B] mt-1">
                📱 Owner notified via WhatsApp
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="w-full h-[56px] rounded-[14px] bg-[#16A34A] text-white font-['DM_Sans'] text-[16px] cursor-pointer hover:bg-[#15803d] transition-colors shadow-[0_4px_16px_rgba(22,163,74,0.3)]"
            style={{ fontWeight: 700 }}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────── UPI SCREEN ─────────────── */
  if (step === 'upi') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={() => setStep('summary')}
            className="w-10 h-10 rounded-[10px] border border-[#E2E8F0] flex items-center justify-center hover:bg-white cursor-pointer"
          >
            <ArrowLeft size={20} className="text-[#64748B]" />
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[20px] text-[#0F172A]" style={{ fontWeight: 700 }}>
            UPI Payment
          </h1>
        </div>

        {/* Customer + Amount */}
        <div className="bg-white rounded-[16px] p-5 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#E2E8F0]">
          <div className="font-['DM_Sans'] text-[15px] text-[#64748B] mb-1">Customer</div>
          <div className="font-['DM_Sans'] text-[18px] text-[#0F172A] mb-0.5" style={{ fontWeight: 700 }}>{order.customerName}</div>
          <div className="font-['JetBrains_Mono'] text-[13px] text-[#64748B]">{order.customerPhone}</div>
          <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex justify-between items-center">
            <span className="font-['DM_Sans'] text-[14px] text-[#64748B]">Order #{order.id}</span>
            <span className="font-['JetBrains_Mono'] text-[22px] text-[#2563EB]" style={{ fontWeight: 700 }}>₹{order.total}</span>
          </div>
        </div>

        {/* QR Code */}
        <UpiQrCode amount={order.total} orderId={order.id} />

        {/* Confirm Button */}
        <button
          onClick={() => handleConfirmPayment('upi')}
          disabled={confirming}
          className="w-full h-[60px] rounded-[14px] bg-[#2563EB] text-white font-['DM_Sans'] text-[17px] cursor-pointer hover:bg-[#1d4ed8] transition-all mt-5 shadow-[0_4px_16px_rgba(37,99,235,0.3)] disabled:opacity-60"
          style={{ fontWeight: 700 }}
        >
          {confirming ? '⏳ Confirming...' : '✅ Customer Has Paid — Confirm'}
        </button>

        <p className="text-center font-['DM_Sans'] text-[12px] text-[#94A3B8] mt-3">
          Only tap confirm after customer shows payment success screen
        </p>
      </div>
    );
  }

  /* ─────────────── CASH SCREEN ─────────────── */
  if (step === 'cash') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={() => setStep('summary')}
            className="w-10 h-10 rounded-[10px] border border-[#E2E8F0] flex items-center justify-center hover:bg-white cursor-pointer"
          >
            <ArrowLeft size={20} className="text-[#64748B]" />
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[20px] text-[#0F172A]" style={{ fontWeight: 700 }}>
            Cash Collection
          </h1>
        </div>

        {/* Big Amount Card */}
        <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-[20px] p-8 text-center mb-6 border border-[#BBF7D0]">
          <div className="font-['DM_Sans'] text-[16px] text-[#16A34A] mb-2">Collect from customer</div>
          <div className="font-['JetBrains_Mono'] text-[56px] text-[#16A34A]" style={{ fontWeight: 700 }}>
            ₹{order.total}
          </div>
          <div className="font-['DM_Sans'] text-[15px] text-[#64748B] mt-2">{order.customerName}</div>
          <div className="font-['JetBrains_Mono'] text-[13px] text-[#94A3B8]">Order #{order.id}</div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-[16px] p-5 mb-6 border border-[#E2E8F0]">
          <div className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-3" style={{ fontWeight: 600 }}>Steps:</div>
          {[
            `Collect ₹${order.total} cash from ${order.customerName}`,
            'Count the cash and verify the amount',
            'Tap confirm once cash is in hand',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-['JetBrains_Mono'] text-[12px] shrink-0 mt-0.5" style={{ fontWeight: 700 }}>
                {i + 1}
              </div>
              <span className="font-['DM_Sans'] text-[14px] text-[#374151]">{step}</span>
            </div>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => handleConfirmPayment('cash')}
          disabled={confirming}
          className="w-full h-[60px] rounded-[14px] bg-[#16A34A] text-white font-['DM_Sans'] text-[17px] cursor-pointer hover:bg-[#15803d] transition-all shadow-[0_4px_16px_rgba(22,163,74,0.3)] disabled:opacity-60"
          style={{ fontWeight: 700 }}
        >
          {confirming ? '⏳ Confirming...' : '💵 Confirm Cash Received'}
        </button>
      </div>
    );
  }

  /* ─────────────── SUMMARY / METHOD SELECTION ─────────────── */
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <button
          onClick={() => navigate('/orders')}
          className="w-10 h-10 rounded-[10px] border border-[#E2E8F0] flex items-center justify-center hover:bg-white cursor-pointer"
        >
          <ArrowLeft size={20} className="text-[#64748B]" />
        </button>
        <div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[20px] text-[#0F172A]" style={{ fontWeight: 700 }}>
            💰 Collect Payment
          </h1>
          <p className="font-['DM_Sans'] text-[12px] text-[#64748B]">Order #{order.id}</p>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-[16px] p-5 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-['DM_Sans'] text-[18px] text-[#0F172A]" style={{ fontWeight: 700 }}>{order.customerName}</div>
            <div className="font-['JetBrains_Mono'] text-[13px] text-[#64748B]">{order.customerPhone}</div>
          </div>
          <div className="text-right">
            <div className="font-['DM_Sans'] text-[12px] text-[#94A3B8]">Order</div>
            <div className="font-['JetBrains_Mono'] text-[16px] text-[#2563EB]" style={{ fontWeight: 700 }}>#{order.id}</div>
          </div>
        </div>

        {/* Items summary */}
        <div className="p-3 rounded-[10px] bg-[#F8FAFC] border border-[#F1F5F9]">
          <div className="font-['DM_Sans'] text-[12px] text-[#64748B] mb-1">Items:</div>
          <div className="font-['DM_Sans'] text-[13px] text-[#374151]">
            {order.items.map(i => `${i.item} ×${i.qty}`).join(' • ')}
          </div>
        </div>
      </div>

      {/* Total Amount — BIG */}
      <div className="bg-gradient-to-br from-[#1E40AF] to-[#2563EB] rounded-[20px] p-6 text-center mb-6 shadow-[0_8px_32px_rgba(37,99,235,0.3)]">
        <div className="font-['DM_Sans'] text-[15px] text-[#93C5FD] mb-1">Total Amount Due</div>
        <div className="font-['JetBrains_Mono'] text-[52px] text-white" style={{ fontWeight: 700 }}>
          ₹{order.total}
        </div>
        {order.discount > 0 && (
          <div className="font-['DM_Sans'] text-[13px] text-[#93C5FD] mt-1">
            Discount applied: ₹{order.discount}
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-3 text-center" style={{ fontWeight: 600 }}>
        Choose Payment Method
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* UPI */}
        <button
          onClick={() => setStep('upi')}
          className="bg-white rounded-[16px] p-5 border-2 border-[#BFDBFE] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all cursor-pointer text-center group active:scale-95"
        >
          <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] group-hover:bg-[#DBEAFE] flex items-center justify-center mx-auto mb-3 transition-colors">
            <Smartphone size={26} className="text-[#2563EB]" />
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#1E40AF]" style={{ fontWeight: 700 }}>UPI</div>
          <div className="font-['DM_Sans'] text-[12px] text-[#64748B] mt-1">QR Code / Scan</div>
          <div className="text-[10px] text-[#93C5FD] mt-1 font-['DM_Sans']">GPay · PhonePe · Paytm</div>
        </button>

        {/* Cash */}
        <button
          onClick={() => setStep('cash')}
          className="bg-white rounded-[16px] p-5 border-2 border-[#BBF7D0] hover:border-[#16A34A] hover:bg-[#F0FDF4] transition-all cursor-pointer text-center group active:scale-95"
        >
          <div className="w-12 h-12 rounded-[12px] bg-[#F0FDF4] group-hover:bg-[#DCFCE7] flex items-center justify-center mx-auto mb-3 transition-colors">
            <Banknote size={26} className="text-[#16A34A]" />
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#166534]" style={{ fontWeight: 700 }}>Cash</div>
          <div className="font-['DM_Sans'] text-[12px] text-[#64748B] mt-1">Collect in person</div>
          <div className="text-[10px] text-[#86EFAC] mt-1 font-['DM_Sans']">Count & verify</div>
        </button>
      </div>

      <p className="text-center font-['DM_Sans'] text-[12px] text-[#94A3B8]">
        Select how the customer is paying
      </p>
    </div>
  );
}
