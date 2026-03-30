import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore, Order } from '../store';
import { Button } from '../components/ui';
import { Printer, Check, Download, ExternalLink } from 'lucide-react';
import { getWhatsAppOrderCreatedUrl } from '../components/whatsapp-bill';
import { downloadBillPdf, uploadBillPdf } from '../components/BillPdf';
import { UpiQrCode } from '../components/UpiQrCode';
import { Banknote, Smartphone, Globe } from 'lucide-react';

export default function BillingPage() {
  const { currentOrderItems, setCurrentOrderItems, selectedCustomer, setSelectedCustomer, setOrders, nextOrderId, showToast, laundryServices, customerCategories, saveOrder, createPaymentLink, getCustomerCategory } = useStore();
  const SERVICE_LABELS: Record<string, string> = Object.fromEntries(laundryServices.map(s => [s.key, s.label]));
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'₹' | '%'>('₹');
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'online' | ''>('');
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('en-CA');
  });
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    nextOrderId().then(setOrderId);
  }, [nextOrderId]);

  const subtotal = currentOrderItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  // Auto category discount
  const custCategory = selectedCustomer?.categoryId ? customerCategories.find(c => c.id === selectedCustomer.categoryId) : undefined;
  const categoryDiscount = custCategory?.discount || 0;
  const categoryDiscountAmt = Math.round(subtotal * categoryDiscount / 100);

  const manualDiscountAmt = discountType === '%' ? Math.round(subtotal * discount / 100) : discount;
  const discountAmt = categoryDiscountAmt + manualDiscountAmt;
  const total = Math.max(0, subtotal - discountAmt);
  const totalPcs = currentOrderItems.reduce((s, i) => s + i.qty, 0);

  const confirmOrder = async () => {
    const order: Order = {
      id: orderId,
      customerId: selectedCustomer?.id || '',
      customerName: selectedCustomer?.name || '',
      customerPhone: selectedCustomer?.phone || '',
      items: currentOrderItems,
      subtotal,
      discount: discountAmt,
      total,
      status: 'pending',
      paid,
      paymentMethod: paid ? paymentMethod : '' as const,
      createdAt: new Date().toLocaleDateString('en-CA'),
      dueDate,
    };

    // Auto-upload the bill PDF so WhatsApp can use it
    showToast('⏳ Generating bill PDF...');
    const cat = selectedCustomer?.categoryId ? customerCategories.find(c => c.id === selectedCustomer.categoryId) : undefined;
    const uploadedUrl = await uploadBillPdf(order, laundryServices, cat || undefined);
    if (uploadedUrl) {
      order.billUrl = uploadedUrl;
    }

    await saveOrder(order);
    setOrders(prev => [order, ...prev]);
    setConfirmedOrder(order);
    setConfirmed(true);
    showToast('✅ Order confirmed and bill generated!');

    // Generate payment link if not paid
    if (!paid) {
      setGeneratingLink(true);
      try {
        const link = await createPaymentLink(order);
        if (link) {
          setPaymentLink(link);
          order.paymentLink = link;
          setConfirmedOrder({ ...order, paymentLink: link });
        }
      } catch (e) {
        console.error('Payment link generation failed:', e);
      }
      setGeneratingLink(false);
    }

    // Auto-open WhatsApp with order details
    const whatsappUrl = getWhatsAppOrderCreatedUrl(order, laundryServices, cat || undefined);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  const handleDone = () => {
    setCurrentOrderItems([]);
    setSelectedCustomer(null);
    navigate('/orders');
  };

  const handleDownloadPdf = async () => {
    if (!confirmedOrder) return;
    const cat = getCustomerCategory(confirmedOrder.customerId);
    await downloadBillPdf(confirmedOrder, laundryServices, cat || undefined);
    showToast('📄 PDF downloaded!');
  };

  const printReceipt = () => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const itemRows = currentOrderItems.map(i =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-family:'DM Sans',sans-serif;font-size:13px">${i.item}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-family:'DM Sans',sans-serif;font-size:13px">${SERVICE_LABELS[i.service] || i.service}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;font-family:'JetBrains Mono',monospace;font-size:13px">${i.qty}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-family:'JetBrains Mono',monospace;font-size:13px">₹${i.unitPrice}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-family:'JetBrains Mono',monospace;font-size:13px">₹${i.unitPrice * i.qty}</td>
      </tr>`
    ).join('');

    const paymentLinkHtml = paymentLink && !paid
      ? `<div style="margin-top:12px;text-align:center;padding:10px;border-radius:8px;background:#EFF6FF;border:1px solid #BFDBFE">
          <div style="font-size:12px;color:#2563EB;font-weight:600;margin-bottom:4px">💳 Pay Online</div>
          <a href="${paymentLink}" style="font-size:11px;color:#2563EB;word-break:break-all">${paymentLink}</a>
        </div>` : '';

    const html = `<!DOCTYPE html><html><head><title>Receipt #${orderId}</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
      <style>@media print{body{margin:0}}.receipt{max-width:380px;margin:0 auto;padding:24px 20px;font-family:'DM Sans',sans-serif}</style>
    </head><body>
      <div class="receipt">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:700;color:#2563EB">LaundroCare</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:2px">🧺 Professional Laundry Service</div>
        </div>
        <div style="border-top:2px dashed #E2E8F0;border-bottom:2px dashed #E2E8F0;padding:12px 0;margin-bottom:12px;text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:#2563EB">#${orderId}</div>
          <div style="font-size:14px;color:#0F172A;margin-top:4px">${selectedCustomer?.name || ''}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#64748B">${selectedCustomer?.phone || ''}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-bottom:12px">
          <span>Date: ${timestamp}</span>
          <span>Due: ${dueDate}</span>
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
          <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#64748B">Subtotal</span><span style="font-family:'JetBrains Mono',monospace">₹${subtotal}</span></div>
          ${discountAmt > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#64748B">Discount</span><span style="font-family:'JetBrains Mono',monospace;color:#DC2626">-₹${discountAmt}</span></div>` : ''}
        </div>
        <div style="border-top:2px solid #0F172A;padding-top:10px;margin-top:8px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700">TOTAL</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:#16A34A">₹${total}</span>
        </div>
        <div style="margin-top:12px;text-align:center;padding:8px;border-radius:6px;font-size:14px;font-weight:600;${paid ? 'background:#DCFCE7;color:#166534' : 'background:#FEF2F2;color:#991B1B'}">
          ${paid ? '✅ PAID' : '⏳ UNPAID'}
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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="font-['JetBrains_Mono'] text-[28px] text-[#2563EB]" style={{ fontWeight: 700 }}>#{orderId}</div>
          <div className="font-['DM_Sans'] text-[16px] text-[#0F172A] mt-1">{selectedCustomer?.name} • {selectedCustomer?.phone}</div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="font-['DM_Sans'] text-[14px] text-[#64748B]">Due:</span>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="font-['JetBrains_Mono'] text-[14px] border border-[#E2E8F0] rounded-[6px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-[#E2E8F0]">
              <th className="text-left py-2 font-['DM_Sans'] text-[14px] text-[#64748B]">Item</th>
              <th className="text-left py-2 font-['DM_Sans'] text-[14px] text-[#64748B]">Service</th>
              <th className="text-center py-2 font-['DM_Sans'] text-[14px] text-[#64748B]">Qty</th>
              <th className="text-right py-2 font-['DM_Sans'] text-[14px] text-[#64748B]">Unit</th>
              <th className="text-right py-2 font-['DM_Sans'] text-[14px] text-[#64748B]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentOrderItems.map(i => (
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

        {/* Totals */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between font-['DM_Sans'] text-[15px]">
            <span className="text-[#64748B]">Subtotal</span>
            <span className="font-['JetBrains_Mono'] text-[#0F172A]">₹{subtotal}</span>
          </div>
          {custCategory && categoryDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0]">
                <span className="font-['DM_Sans'] text-[13px] text-[#16A34A]" style={{ fontWeight: 600 }}>{custCategory.name} Discount {categoryDiscount}% applied</span>
              </span>
              <span className="font-['JetBrains_Mono'] text-[14px] text-[#16A34A]" style={{ fontWeight: 600 }}>-₹{categoryDiscountAmt}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-[#64748B] font-['DM_Sans'] text-[15px]">Extra Discount</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setDiscountType(discountType === '₹' ? '%' : '₹')} className="w-8 h-8 rounded border border-[#E2E8F0] font-['JetBrains_Mono'] text-[13px] cursor-pointer hover:bg-[#F1F5F9]">{discountType}</button>
              <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-20 h-8 px-2 rounded border border-[#E2E8F0] font-['JetBrains_Mono'] text-[14px] text-right focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-[#0F172A]">
            <span className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A]" style={{ fontWeight: 700 }}>TOTAL</span>
            <span className="font-['JetBrains_Mono'] text-[28px] text-[#16A34A]" style={{ fontWeight: 700 }}>₹{total}</span>
          </div>
        </div>

        {/* Payment toggle + method */}
        <div className="mb-8 p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-4 mb-3">
            <span className="font-['DM_Sans'] text-[15px] text-[#0F172A]">Payment:</span>
            <button onClick={() => { setPaid(false); setPaymentMethod(''); }} className={`h-[44px] px-5 rounded-[8px] font-['DM_Sans'] text-[14px] cursor-pointer transition-all ${!paid ? 'bg-[#DC2626] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B]'}`}>Unpaid</button>
            <button onClick={() => setPaid(true)} className={`h-[44px] px-5 rounded-[8px] font-['DM_Sans'] text-[14px] cursor-pointer transition-all ${paid ? 'bg-[#16A34A] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B]'}`}>Paid</button>
          </div>
          {paid && (
            <>
              <span className="font-['DM_Sans'] text-[13px] text-[#64748B] mb-2 block">Payment Method:</span>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setPaymentMethod('cash')} className={`flex-1 h-[52px] rounded-[8px] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all border-2 ${paymentMethod === 'cash' ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8]'}`}>
                  <Banknote size={18} className={paymentMethod === 'cash' ? 'text-[#16A34A]' : 'text-[#64748B]'} />
                  <span className={`font-['DM_Sans'] text-[12px] ${paymentMethod === 'cash' ? 'text-[#16A34A]' : 'text-[#64748B]'}`} style={{ fontWeight: 600 }}>Cash</span>
                </button>
                <button onClick={() => setPaymentMethod('upi')} className={`flex-1 h-[52px] rounded-[8px] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all border-2 ${paymentMethod === 'upi' ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8]'}`}>
                  <Smartphone size={18} className={paymentMethod === 'upi' ? 'text-[#2563EB]' : 'text-[#64748B]'} />
                  <span className={`font-['DM_Sans'] text-[12px] ${paymentMethod === 'upi' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} style={{ fontWeight: 600 }}>UPI</span>
                </button>
                <button onClick={() => setPaymentMethod('online')} className={`flex-1 h-[52px] rounded-[8px] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all border-2 ${paymentMethod === 'online' ? 'border-[#7C3AED] bg-[#F5F3FF]' : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8]'}`}>
                  <Globe size={18} className={paymentMethod === 'online' ? 'text-[#7C3AED]' : 'text-[#64748B]'} />
                  <span className={`font-['DM_Sans'] text-[12px] ${paymentMethod === 'online' ? 'text-[#7C3AED]' : 'text-[#64748B]'}`} style={{ fontWeight: 600 }}>Online</span>
                </button>
              </div>
              {paymentMethod === 'upi' && orderId && (
                <UpiQrCode amount={total} orderId={orderId} />
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!confirmed ? (
            <Button variant="primary" size="lg" className="w-full" onClick={confirmOrder}>
              <Check size={20} /> Confirm Order
            </Button>
          ) : (
            <>
              <div className="text-center p-4 bg-[#DCFCE7] rounded-[8px] font-['DM_Sans'] text-[#166534] text-[15px]" style={{ fontWeight: 600 }}>
                ✅ Order #{orderId} confirmed!
              </div>

              {/* WhatsApp sent automatically notification */}
              <div className="text-center p-3 bg-[#F0FDF4] rounded-[8px] border border-[#BBF7D0]">
                <span className="font-['DM_Sans'] text-[13px] text-[#16A34A]" style={{ fontWeight: 500 }}>📱 WhatsApp bill sent automatically to {selectedCustomer?.name}</span>
              </div>


              {/* PDF Download */}
              <button
                onClick={handleDownloadPdf}
                className="w-full h-[52px] rounded-[8px] bg-[#7C3AED] text-white font-['DM_Sans'] flex items-center justify-center gap-2 hover:bg-[#6D28D9] cursor-pointer transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Download size={20} /> Download PDF Bill
              </button>

              {/* Print Receipt */}
              <button onClick={printReceipt} className="w-full h-[52px] rounded-[8px] bg-[#F1F5F9] text-[#64748B] font-['DM_Sans'] flex items-center justify-center gap-2 hover:bg-[#E2E8F0] cursor-pointer">
                <Printer size={20} /> Print Receipt
              </button>

              <Button variant="primary" size="md" className="w-full" onClick={handleDone}>
                Done — Go to Orders
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}