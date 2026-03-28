import { Order, LaundryService, CustomerCategory } from '../store';

export function generateBillMessage(
  order: Order,
  services: LaundryService[],
  category?: CustomerCategory
): string {
  const serviceLabels: Record<string, string> = Object.fromEntries(services.map(s => [s.key, s.label]));
  const totalPcs = order.items.reduce((s, i) => s + i.qty, 0);

  const itemLines = order.items.map((i, idx) =>
    `${idx + 1}. ${i.item} — ${serviceLabels[i.service] || i.service}\n   Qty: ${i.qty} × ₹${i.unitPrice} = ₹${i.unitPrice * i.qty}`
  ).join('\n');

  const lines = [
    `━━━━━━━━━━━━━━━━━━`,
    `   *LaundroCare*`,
    `  Professional Laundry`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `*Order #${order.id}*`,
    `Customer: *${order.customerName}*`,
    `Phone: ${order.customerPhone}`,
    `Date: ${order.createdAt}`,
    `Due: ${order.dueDate}`,
    ``,
    `━━ *Items & Services* ━━`,
    ``,
    itemLines,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `Items: ${totalPcs} pcs`,
    `Subtotal: ₹${order.subtotal}`,
  ];

  if (order.discount > 0) {
    const discountLabel = category && category.discount > 0
      ? `Discount (${category.name} ${category.discount}%)`
      : `Discount`;
    lines.push(`${discountLabel}: -₹${order.discount}`);
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━`,
    `*TOTAL: ₹${order.total}*`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `Status: ${order.status === 'completed' ? '✅ Completed' : '⏳ Pending'}`,
    `Payment: ${order.paid ? `✅ Paid${order.paymentMethod ? ` via ${order.paymentMethod === 'upi' ? 'UPI' : 'Cash'}` : ''}` : '⏳ Pending'}`,
    ``,
    `Thank you for choosing LaundroCare!`,
  );

  return lines.join('\n');
}

export function getWhatsAppBillUrl(order: Order, services: LaundryService[], category?: CustomerCategory): string {
  const msg = generateBillMessage(order, services, category);
  return `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(msg)}`;
}
