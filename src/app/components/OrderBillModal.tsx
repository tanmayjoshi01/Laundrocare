import { useStore, Order } from '../store';
import { X, Printer, MessageCircle } from 'lucide-react';
import { Button, StatusBadge } from './ui';
import { getWhatsAppBillUrl } from './whatsapp-bill';

interface OrderBillModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderBillModal({ order, onClose }: OrderBillModalProps) {
  const { laundryServices, getCustomerCategory } = useStore();
  const SERVICE_LABELS: Record<string, string> = Object.fromEntries(laundryServices.map(s => [s.key, s.label]));
  const totalPcs = order.items.reduce((s, i) => s + i.qty, 0);
  const cat = getCustomerCategory(order.customerId);
  const whatsappUrl = getWhatsAppBillUrl(order, laundryServices, cat || undefined);

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

    const html = `<!DOCTYPE html><html><head><title>Receipt #${order.id}</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
      <style>@media print{body{margin:0}}.receipt{max-width:380px;margin:0 auto;padding:24px 20px;font-family:'DM Sans',sans-serif}</style>
    </head><body>
      <div class="receipt">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:700;color:#2563EB">LaundroCare</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:2px">Professional Laundry Service</div>
        </div>
        <div style="border-top:2px dashed #E2E8F0;border-bottom:2px dashed #E2E8F0;padding:12px 0;margin-bottom:12px;text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:#2563EB">#${order.id}</div>
          <div style="font-size:14px;color:#0F172A;margin-top:4px">${order.customerName}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#64748B">${order.customerPhone}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-bottom:12px">
          <span>Date: ${order.createdAt}</span><span>Due: ${order.dueDate}</span>
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
        <div style="margin-top:12px;text-align:center;padding:8px;border-radius:6px;font-size:14px;font-weight:600;${order.paid ? 'background:#DCFCE7;color:#166534' : 'background:#FEF2F2;color:#991B1B'}">
          ${order.paid ? `✅ PAID${order.paymentMethod ? ` via ${order.paymentMethod === 'upi' ? 'UPI' : 'Cash'}` : ''}` : '⏳ UNPAID'}
        </div>
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[16px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-[16px] border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="font-['JetBrains_Mono'] text-[20px] text-[#2563EB]" style={{ fontWeight: 700 }}>#{order.id}</span>
            <StatusBadge status={order.status} />
            {!order.paid && <StatusBadge status="unpaid" />}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-[8px] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC] cursor-pointer transition-colors"
          >
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        <div className="p-6">
          {/* Customer Info */}
          <div className="mb-5 pb-5 border-b border-dashed border-[#E2E8F0]">
            <div className="font-['DM_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 600 }}>{order.customerName}</div>
            <div className="font-['JetBrains_Mono'] text-[14px] text-[#64748B]">{order.customerPhone}</div>
            {cat && cat.discount > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0]">
                <span className="font-['DM_Sans'] text-[12px] text-[#16A34A]" style={{ fontWeight: 600 }}>
                  {cat.name} — {cat.discount}% discount applied
                </span>
              </div>
            )}
            <div className="flex gap-4 mt-2">
              <span className="font-['DM_Sans'] text-[13px] text-[#94A3B8]">Created: {order.createdAt}</span>
              <span className="font-['DM_Sans'] text-[13px] text-[#94A3B8]">Due: {order.dueDate}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-5">
            <h3 className="font-['Plus_Jakarta_Sans'] text-[15px] text-[#0F172A] mb-3" style={{ fontWeight: 700 }}>
              Items & Services ({totalPcs} pcs)
            </h3>
            <div className="rounded-[10px] border border-[#E2E8F0] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    <th className="text-left py-2.5 px-3 font-['DM_Sans'] text-[12px] text-[#64748B]" style={{ fontWeight: 600 }}>ITEM</th>
                    <th className="text-left py-2.5 px-3 font-['DM_Sans'] text-[12px] text-[#64748B]" style={{ fontWeight: 600 }}>SERVICE</th>
                    <th className="text-center py-2.5 px-3 font-['DM_Sans'] text-[12px] text-[#64748B]" style={{ fontWeight: 600 }}>QTY</th>
                    <th className="text-right py-2.5 px-3 font-['DM_Sans'] text-[12px] text-[#64748B]" style={{ fontWeight: 600 }}>RATE</th>
                    <th className="text-right py-2.5 px-3 font-['DM_Sans'] text-[12px] text-[#64748B]" style={{ fontWeight: 600 }}>AMT</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(i => (
                    <tr key={i.id} className="border-t border-[#F1F5F9]">
                      <td className="py-3 px-3 font-['DM_Sans'] text-[14px] text-[#0F172A]" style={{ fontWeight: 500 }}>{i.item}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#EFF6FF] font-['DM_Sans'] text-[12px] text-[#2563EB]" style={{ fontWeight: 500 }}>
                          {SERVICE_LABELS[i.service] || i.service}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-['JetBrains_Mono'] text-[14px] text-[#0F172A]">{i.qty}</td>
                      <td className="py-3 px-3 text-right font-['JetBrains_Mono'] text-[14px] text-[#64748B]">₹{i.unitPrice}</td>
                      <td className="py-3 px-3 text-right font-['JetBrains_Mono'] text-[14px] text-[#0F172A]" style={{ fontWeight: 600 }}>₹{i.unitPrice * i.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 mb-5">
            <div className="flex justify-between mb-2">
              <span className="font-['DM_Sans'] text-[14px] text-[#64748B]">Subtotal ({totalPcs} pcs)</span>
              <span className="font-['JetBrains_Mono'] text-[14px] text-[#0F172A]">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between mb-2">
                <span className="font-['DM_Sans'] text-[14px] text-[#64748B]">Discount{cat ? ` (${cat.name} ${cat.discount}%)` : ''}</span>
                <span className="font-['JetBrains_Mono'] text-[14px] text-[#DC2626]" style={{ fontWeight: 600 }}>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t-2 border-[#0F172A]">
              <span className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 700 }}>TOTAL</span>
              <span className="font-['JetBrains_Mono'] text-[24px] text-[#16A34A]" style={{ fontWeight: 700 }}>₹{order.total}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className={`rounded-[10px] p-4 mb-5 text-center ${order.paid ? 'bg-[#DCFCE7] border border-[#BBF7D0]' : 'bg-[#FEF2F2] border border-[#FECACA]'}`}>
            <div className="font-['DM_Sans'] text-[15px]" style={{ fontWeight: 600, color: order.paid ? '#166534' : '#991B1B' }}>
              {order.paid
                ? `✅ Paid${order.paymentMethod ? ` via ${order.paymentMethod === 'upi' ? 'UPI' : 'Cash'}` : ''}`
                : '⏳ Payment Pending'
              }
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={printReceipt}
              className="flex-1 h-[52px] rounded-[8px] bg-[#F1F5F9] text-[#0F172A] font-['DM_Sans'] flex items-center justify-center gap-2 hover:bg-[#E2E8F0] cursor-pointer transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Printer size={18} /> Print
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-[52px] rounded-[8px] bg-[#25D366] text-white font-['DM_Sans'] flex items-center justify-center gap-2 hover:bg-[#1ebe57] cursor-pointer transition-colors"
              style={{ fontWeight: 600 }}
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}