import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useStore } from '../store';
import { Button, StatusBadge } from '../components/ui';
import { ArrowLeft, Printer, Check, Banknote, Smartphone, Globe, Download } from 'lucide-react';
import { getWhatsAppOrderCompletedUrl } from '../components/whatsapp-bill';
import { downloadBillPdf } from '../components/BillPdf';

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, showToast, laundryServices, getCustomerCategory, updateOrder } = useStore();
  const navigate = useNavigate();

  const order = orders.find(o => o.id === orderId);
  const SERVICE_LABELS: Record<string, string> = Object.fromEntries(laundryServices.map(s => [s.key, s.label]));

  const [paid, setPaid] = useState(order?.paid || false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'online' | ''>(order?.paymentMethod || '');
  const [completed, setCompleted] = useState(false);

  if (!order) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <div className="text-[48px] mb-4">🔍</div>
        <h2 className="font-['Plus_Jakarta_Sans'] text-[20px] text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>Order not found</h2>
        <p className="font-['DM_Sans'] text-[15px] text-[#64748B] mb-6">The order you're looking for doesn't exist.</p>
        <Button variant="primary" size="md" onClick={() => navigate('/orders')}>← Back to Orders</Button>
      </div>
    );
  }

  const cat = getCustomerCategory(order.customerId);
  const totalPcs = order.items.reduce((s, i) => s + i.qty, 0);

  const handleComplete = async () => {
    const updates = {
      status: 'completed' as const,
      paid,
      paymentMethod: paid ? paymentMethod : '' as const,
    };
    await updateOrder(orderId!, updates);
    setCompleted(true);
    showToast(`✅ Order #${orderId} completed${paid ? ' & paid' : ''}!`);

    // Auto-open WhatsApp with completion message
    const completedOrder = { ...order, ...updates };
    const whatsappUrl = getWhatsAppOrderCompletedUrl(completedOrder, laundryServices, cat || undefined);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  const handleDownloadPdf = async () => {
    const liveOrder = { ...order, status: completed ? 'completed' as const : order.status, paid, paymentMethod: paid ? paymentMethod : '' as const };
    await downloadBillPdf(liveOrder, laundryServices, cat || undefined);
    showToast('📄 PDF downloaded!');
  };

  const printReceipt = () => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const itemRows = order.items.map(i =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-family:'DM Sans',sans-serif;font-size:13px">${i.item}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-family:'DM Sans',sans-serif;font-size:13px">${SERVICE_LABELS[i.service] || i.service}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;font-family:'JetBrains Mono',monospace;font-size:13px">${i.qty}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-family:'JetBrains Mono',monospace;font-size:13px">₹${i.unitPrice}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-family:'JetBrains Mono',monospace;font-size:13px">₹${i.unitPrice * i.qty}</td>
      </tr>`
    ).join('');

    const paymentLinkHtml = order.paymentLink && !paid
      ? `<div style="margin-top:12px;text-align:center;padding:10px;border-radius:8px;background:#EFF6FF;border:1px solid #BFDBFE">
          <div style="font-size:12px;color:#2563EB;font-weight:600;margin-bottom:4px">💳 Pay Online</div>
          <a href="${order.paymentLink}" style="font-size:11px;color:#2563EB;word-break:break-all">${order.paymentLink}</a>
        </div>` : '';

    const html = `<!DOCTYPE html><html><head><title>Receipt #${order.id}</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
      <style>@media print{body{margin:0}}.receipt{max-width:380px;margin:0 auto;padding:24px 20px;font-family:'DM Sans',sans-serif}</style>
    </head><body>
      <div class="receipt">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:700;color:#2563EB">LaundroCare</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:2px">🧺 Professional Laundry Service</div>
        </div>
        <div style="border-top:2px dashed #E2E8F0;border-bottom:2px dashed #E2E8F0;padding:12px 0;margin-bottom:12px;text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:#2563EB">#${order.id}</div>
          <div style="font-size:14px;color:#0F172A;margin-top:4px">${order.customerName}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#64748B">${order.customerPhone}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-bottom:12px">
          <span>Date: ${timestamp}</span>
          <span>Due: ${order.dueDate}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px">
          <thead><tr style="border-bottom:2px solid #E2E8F0">
            <th style="text-align:left;padding:6px 8px;font-size:11px;color:#64748B;text-transform:uppercase">Item</th>
            <th style="text-align:left;padding:6px 8px;font-size:11px;color:#64748B;text-transform:uppercase">Service</th>
            <th style="text-align:center;padding:6px 8px;font-size:11px;color:#64748B;text-transform:uppercase">Qty</th>
            <th style="text-align:right;padding:6px 8px;font-size:11px;color:#64748B;text-transform:uppercase">Rate</th>
            <th style="text-align:right;padding:6px 8px;font-size:11px;color:#64748B;text-transform:uppercase">Amt</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="border-top:1px solid #E2E8F0;padding-top:8px;font-size:13px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#64748B">Subtotal</span><span style="font-family:'JetBrains Mono',monospace">₹${order.subtotal}</span></div>
          ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#64748B">Discount</span><span style="font-family:'JetBrains Mono',monospace;color:#DC2626">-₹${order.discount}</span></div>` : ''}
        </div>
        <div style="border-top:2px solid #0F172A;padding-top:10px;margin-top:8px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700">TOTAL</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:#16A34A">₹${order.total}</span>
        </div>
        <div style="margin-top:12px;text-align:center;padding:8px;border-radius:6px;font-size:14px;font-weight:600;${paid ? 'background:#DCFCE7;color:#166534' : 'background:#FEF2F2;color:#991B1B'}">
          ${paid ? `✅ PAID via ${paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'online' ? 'Online' : 'Cash'}` : '⏳ UNPAID'}
        </div>
        ${paymentLinkHtml}
        <div style="margin-top:16px;text-align:center;font-size:11px;color:#94A3B8;border-top:1px dashed #E2E8F0;padding-top:12px">
          Printed: ${timestamp}<br>Thank you for choosing LaundroCare!
        </div>
      </div>
      <script>window.onload=function(){window.print();}<\/script>
    </body></html>`;

    const win = window.open('', '_blank', 'width=420,height=600');
    if (win) { win.document.write(html); win.document.close(); }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/orders')} className="w-10 h-10 rounded-[8px] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC] cursor-pointer">
          <ArrowLeft size={20} className="text-[#64748B]" />
        </button>
        <h1 className="font-['Plus_Jakarta_Sans'] text-[24px] text-[#0F172A]" style={{ fontWeight: 700 }}>Complete Order</h1>
      </div>

      <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6 lg:p-8">
        {/* Order Header */}
        <div className="text-center mb-6 pb-6 border-b-2 border-dashed border-[#E2E8F0]">
          <div className="font-['JetBrains_Mono'] text-[28px] text-[#2563EB]" style={{ fontWeight: 700 }}>#{order.id}</div>
          <div className="font-['DM_Sans'] text-[16px] text-[#0F172A] mt-1" style={{ fontWeight: 500 }}>{order.customerName}</div>
          <div className="font-['JetBrains_Mono'] text-[14px] text-[#64748B]">{order.customerPhone}</div>
          <div className="flex justify-center gap-3 mt-3">
            <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">Created: {order.createdAt}</span>
            <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">Due: {order.dueDate}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#0F172A] mb-3" style={{ fontWeight: 700 }}>Order Items</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#E2E8F0]">
                <th className="text-left py-2 font-['DM_Sans'] text-[13px] text-[#64748B]">Item</th>
                <th className="text-left py-2 font-['DM_Sans'] text-[13px] text-[#64748B]">Service</th>
                <th className="text-center py-2 font-['DM_Sans'] text-[13px] text-[#64748B]">Qty</th>
                <th className="text-right py-2 font-['DM_Sans'] text-[13px] text-[#64748B]">Rate</th>
                <th className="text-right py-2 font-['DM_Sans'] text-[13px] text-[#64748B]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(i => (
                <tr key={i.id} className="border-b border-[#F1F5F9]">
                  <td className="py-3 font-['DM_Sans'] text-[15px] text-[#0F172A]">{i.item}</td>
                  <td className="py-3 font-['DM_Sans'] text-[14px] text-[#64748B]">{SERVICE_LABELS[i.service] || i.service}</td>
                  <td className="py-3 text-center font-['JetBrains_Mono'] text-[15px]">{i.qty}</td>
                  <td className="py-3 text-right font-['JetBrains_Mono'] text-[15px]">₹{i.unitPrice}</td>
                  <td className="py-3 text-right font-['JetBrains_Mono'] text-[15px]">₹{i.unitPrice * i.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between font-['DM_Sans'] text-[15px]">
            <span className="text-[#64748B]">Subtotal ({totalPcs} pcs)</span>
            <span className="font-['JetBrains_Mono'] text-[#0F172A]">₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-['DM_Sans'] text-[15px]">
              <span className="text-[#64748B]">Discount</span>
              <span className="font-['JetBrains_Mono'] text-[#DC2626]">-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t-2 border-[#0F172A]">
            <span className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A]" style={{ fontWeight: 700 }}>TOTAL</span>
            <span className="font-['JetBrains_Mono'] text-[28px] text-[#16A34A]" style={{ fontWeight: 700 }}>₹{order.total}</span>
          </div>
        </div>

        {/* Payment Section */}
        {!completed && (
          <div className="mb-6 p-5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <h3 className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#0F172A] mb-4" style={{ fontWeight: 700 }}>Payment</h3>

            {/* Paid toggle */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-['DM_Sans'] text-[15px] text-[#0F172A]" style={{ fontWeight: 500 }}>Status:</span>
              <button onClick={() => { setPaid(false); setPaymentMethod(''); }} className={`h-[52px] px-6 rounded-[8px] font-['DM_Sans'] text-[15px] cursor-pointer transition-all ${!paid ? 'bg-[#DC2626] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'}`} style={{ fontWeight: 600 }}>
                ⏳ Unpaid
              </button>
              <button onClick={() => setPaid(true)} className={`h-[52px] px-6 rounded-[8px] font-['DM_Sans'] text-[15px] cursor-pointer transition-all ${paid ? 'bg-[#16A34A] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'}`} style={{ fontWeight: 600 }}>
                ✅ Paid
              </button>
            </div>

            {/* Payment method - only show when paid */}
            {paid && (
              <div>
                <span className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-3 block">Payment Method:</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 h-[64px] rounded-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border-2 ${paymentMethod === 'cash' ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8]'}`}
                  >
                    <Banknote size={22} className={paymentMethod === 'cash' ? 'text-[#16A34A]' : 'text-[#64748B]'} />
                    <span className={`font-['DM_Sans'] text-[14px] ${paymentMethod === 'cash' ? 'text-[#16A34A]' : 'text-[#64748B]'}`} style={{ fontWeight: 600 }}>Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 h-[64px] rounded-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border-2 ${paymentMethod === 'upi' ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8]'}`}
                  >
                    <Smartphone size={22} className={paymentMethod === 'upi' ? 'text-[#2563EB]' : 'text-[#64748B]'} />
                    <span className={`font-['DM_Sans'] text-[14px] ${paymentMethod === 'upi' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} style={{ fontWeight: 600 }}>UPI</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`flex-1 h-[64px] rounded-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border-2 ${paymentMethod === 'online' ? 'border-[#7C3AED] bg-[#F5F3FF]' : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8]'}`}
                  >
                    <Globe size={22} className={paymentMethod === 'online' ? 'text-[#7C3AED]' : 'text-[#64748B]'} />
                    <span className={`font-['DM_Sans'] text-[14px] ${paymentMethod === 'online' ? 'text-[#7C3AED]' : 'text-[#64748B]'}`} style={{ fontWeight: 600 }}>Online</span>
                  </button>
                </div>
              </div>
            )}

            {/* Show payment link if available and not paid */}
            {!paid && order.paymentLink && (
              <div className="mt-4 p-3 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE]">
                <div className="font-['DM_Sans'] text-[13px] text-[#2563EB] mb-1" style={{ fontWeight: 600 }}>💳 Payment Link Available</div>
                <div className="flex items-center gap-2">
                  <input readOnly value={order.paymentLink} className="flex-1 h-[36px] px-2 rounded-[4px] border border-[#BFDBFE] bg-white font-['JetBrains_Mono'] text-[11px] text-[#2563EB]" />
                  <button onClick={() => { navigator.clipboard.writeText(order.paymentLink!); showToast('📋 Link copied!'); }} className="h-[36px] px-3 rounded-[4px] bg-[#2563EB] text-white font-['DM_Sans'] text-[12px] cursor-pointer hover:bg-[#1d4ed8]">Copy</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!completed ? (
            <Button
              variant="success"
              size="lg"
              className="w-full"
              onClick={handleComplete}
              disabled={paid && !paymentMethod}
            >
              <Check size={20} /> Complete Order{paid ? ` — ₹${order.total} ${paymentMethod === 'upi' ? 'via UPI' : paymentMethod === 'cash' ? 'via Cash' : paymentMethod === 'online' ? 'via Online' : ''}` : ' (Unpaid)'}
            </Button>
          ) : (
            <>
              <div className="text-center p-5 bg-[#DCFCE7] rounded-[10px] font-['DM_Sans'] text-[#166534]" style={{ fontWeight: 600 }}>
                <div className="text-[24px] mb-1">✅</div>
                <div className="text-[16px]">Order #{order.id} completed!</div>
                {paid && <div className="text-[14px] mt-1 opacity-80">Paid ₹{order.total} via {paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'online' ? 'Online' : 'Cash'}</div>}
              </div>

              {/* WhatsApp sent automatically notification */}
              <div className="text-center p-3 bg-[#F0FDF4] rounded-[8px] border border-[#BBF7D0]">
                <span className="font-['DM_Sans'] text-[13px] text-[#16A34A]" style={{ fontWeight: 500 }}>📱 Completion notification sent to {order.customerName} via WhatsApp</span>
              </div>

              {/* PDF Download */}
              <button
                onClick={handleDownloadPdf}
                className="w-full h-[52px] rounded-[8px] bg-[#7C3AED] text-white font-['DM_Sans'] flex items-center justify-center gap-2 hover:bg-[#6D28D9] cursor-pointer transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Download size={20} /> Download PDF Bill
              </button>

              <button
                onClick={printReceipt}
                className="w-full h-[52px] rounded-[8px] bg-[#F1F5F9] text-[#0F172A] font-['DM_Sans'] flex items-center justify-center gap-2 hover:bg-[#E2E8F0] cursor-pointer transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Printer size={20} /> Print Receipt
              </button>

              <Button variant="primary" size="md" className="w-full" onClick={() => navigate('/orders')}>
                ← Back to Orders
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}