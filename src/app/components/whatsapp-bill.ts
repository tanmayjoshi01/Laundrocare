import { Order, LaundryService, CustomerCategory, OrderItem } from '../store';
import { generateUpiLink } from '../../lib/upi';

const UPI_ID = import.meta.env.VITE_UPI_ID || 'yourshop@upi';
const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'LaundroCare';

const NUMBER_EMOJIS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getNumberEmoji(num: number): string {
  if (num <= 10) return NUMBER_EMOJIS[num];
  return `${num}.`;
}

export function generateItemsList(items: OrderItem[], services: LaundryService[]): string {
  const serviceLabels: Record<string, string> = Object.fromEntries(services.map(s => [s.key, s.label]));
  
  return items.map((i, idx) => {
    const emoji = getNumberEmoji(idx + 1);
    const serviceName = serviceLabels[i.service] || i.service;
    return `${emoji} ${i.item} — ${serviceName} × ${i.qty} = ₹${i.unitPrice * i.qty}`;
  }).join('\n');
}

export function generateOrderCreatedMessage(
  order: Order,
  services: LaundryService[],
  category?: CustomerCategory
): string {
  const itemsList = generateItemsList(order.items, services);
  
  let paymentSection = '';
  if (!order.paid) {
    const upiLink = generateUpiLink({
      upiId: UPI_ID,
      name: UPI_NAME,
      amount: order.total,
      orderId: order.id,
    });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiLink)}`;
    paymentSection = `
💳 *Pay online to confirm:*
UPI ID: ${UPI_ID}

🔗 *Click to view QR Code:*
${qrCodeUrl}

━━━━━━━━━━━━━━━━━━
`;
  }

  let billSection = '';
  if (order.billUrl) {
    billSection = `
📄 *Download PDF Bill:*
${order.billUrl}

━━━━━━━━━━━━━━━━━━
`;
  }

  return `🧺 *LaundroCare*
━━━━━━━━━━━━━━━━━━
✨ *Order Confirmed!*
━━━━━━━━━━━━━━━━━━

📦 *Order ID:* #${order.id}
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}

📅 *Date:* ${order.createdAt}
⏳ *Due Date:* ${order.dueDate}

━━━━━━━━━━━━━━━━━━
🧾 *Items Summary*
━━━━━━━━━━━━━━━━━━

${itemsList}

━━━━━━━━━━━━━━━━━━
💵 *Total Amount:* ₹${order.total}
📌 *Status:* Order Received

━━━━━━━━━━━━━━━━━━
${paymentSection}${billSection}📲 We’ll notify you once your order is ready.

🙏 Thank you for choosing *LaundroCare*!`;
}

export function generateOrderCompletedMessage(
  order: Order,
  services: LaundryService[],
  category?: CustomerCategory,
  method?: string
): string {
  const itemsList = order.items.map((item, i) => {
    const total = item.qty * item.unitPrice
    const emoji = getNumberEmoji(i + 1)
    return `${emoji} ${item.item} — ${item.service}
   Qty: ${item.qty} × ₹${item.unitPrice} = ₹${total}`
  }).join('\n\n')

  const totalItems = order.items.reduce((sum, item) => sum + item.qty, 0)
  const paymentMethodStr = method || order.paymentMethod || 'Cash';

  let billSection = '';
  if (order.billUrl) {
    billSection = `
📄 *Download Final PDF Bill:*
${order.billUrl}

━━━━━━━━━━━━━━━━━━
`;
  }

  return `🧺 *LaundroCare*
━━━━━━━━━━━━━━━━━━
🎉 *Order Completed Successfully!*
━━━━━━━━━━━━━━━━━━

📦 *Order ID:* #${order.id}
👤 *Customer:* ${order.customerName}

━━━━━━━━━━━━━━━━━━
🧾 *Clothes Delivered*
━━━━━━━━━━━━━━━━━━

${itemsList}

━━━━━━━━━━━━━━━━━━
📊 *Summary*
━━━━━━━━━━━━━━━━━━

🧺 Total Items: ${totalItems} pcs  
💵 *Total Amount:* ₹${order.total}  
💳 *Payment:* Paid via ${paymentMethodStr === 'upi' || paymentMethodStr === 'UPI' ? 'UPI' : 'Cash'}  

━━━━━━━━━━━━━━━━━━
${billSection}✅ No payment pending.

📌 Please check your items at the time of delivery.

━━━━━━━━━━━━━━━━━━
🙏 Thank you for choosing *LaundroCare*!`
}

export function generateReceiptMessage(
  order: Order,
  services: LaundryService[],
  category?: CustomerCategory,
  paymentMethod?: string,
  billLink?: string
): string {
  const method = paymentMethod || order.paymentMethod || 'Cash';
  const linkString = billLink || order.paymentLink || 'Shop internally generated receipt';
  
  return `🧺 *LaundroCare*
━━━━━━━━━━━━━━━━━━
🧾 *Payment Receipt*
━━━━━━━━━━━━━━━━━━

📦 *Order ID:* #${order.id}
👤 *Customer:* ${order.customerName}

━━━━━━━━━━━━━━━━━━
💰 *Total Paid:* ₹${order.total}
💳 *Payment Method:* ${method}

📅 *Date:* ${new Date().toLocaleDateString('en-IN')}

━━━━━━━━━━━━━━━━━━
📄 View full bill:
${linkString}

━━━━━━━━━━━━━━━━━━
🙏 Thank you for trusting *LaundroCare*!`;
}

export function generatePaymentCollectedMessage(
  order: Order,
  method: 'cash' | 'upi'
): string {
  const now = new Date().toLocaleString('en-IN');
  return `🧺 *LaundroCare*
━━━━━━━━━━━━━━━━━━
💰 *Payment Collected*
━━━━━━━━━━━━━━━━━━

📦 *Order ID:* #${order.id}
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}

💵 *Amount:* ₹${order.total}
💳 *Method:* ${method === 'upi' ? 'UPI' : 'Cash'}

🕒 *Time:* ${now}

━━━━━━━━━━━━━━━━━━
✅ Payment successfully received.`;
}

export function generateDailySummaryMessage(
  date: string,
  stats: {
    todayOrders: number; todayEarnings: number;
    paidAmount: number; unpaidAmount: number;
    upiTotal: number; cashTotal: number;
    pending: number; completed: number;
  }
): string {
  return `🧺 *LaundroCare*
━━━━━━━━━━━━━━━━━━
📊 *Daily Summary*
━━━━━━━━━━━━━━━━━━

📅 *Date:* ${date}

📦 Orders Completed: ${stats.completed}
💰 Total Revenue: ₹${stats.todayEarnings}

💳 UPI Payments: ₹${stats.upiTotal}
💵 Cash Payments: ₹${stats.cashTotal}

━━━━━━━━━━━━━━━━━━
📌 Pending Payments: ${stats.unpaidAmount}

━━━━━━━━━━━━━━━━━━
🚀 Keep up the great work!`;
}

export function getWhatsAppBillUrl(order: Order, services: LaundryService[], category?: CustomerCategory): string {
  const method = order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'online' ? 'Online' : 'Cash';
  const msg = generateReceiptMessage(order, services, category, method);
  return `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(msg)}`;
}

export function getWhatsAppOrderCreatedUrl(order: Order, services: LaundryService[], category?: CustomerCategory): string {
  const msg = generateOrderCreatedMessage(order, services, category);
  return `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(msg)}`;
}

export function getWhatsAppOrderCompletedUrl(order: Order, services: LaundryService[], category?: CustomerCategory): string {
  const msg = generateOrderCompletedMessage(order, services, category);
  return `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(msg)}`;
}

export function getWhatsAppDailySummaryUrl(ownerPhone: string, date: string, stats: Parameters<typeof generateDailySummaryMessage>[1]): string {
  const msg = generateDailySummaryMessage(date, stats);
  return `https://wa.me/91${ownerPhone}?text=${encodeURIComponent(msg)}`;
}

export function getWhatsAppPaymentCollectedUrl(ownerPhone: string, order: Order, method: 'cash' | 'upi'): string {
  const msg = generatePaymentCollectedMessage(order, method);
  return `https://wa.me/91${ownerPhone}?text=${encodeURIComponent(msg)}`;
}

