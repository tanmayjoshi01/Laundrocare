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
    `Payment: ${order.paid ? `✅ Paid${order.paymentMethod ? ` via ${order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'online' ? 'Online' : 'Cash'}` : ''}` : '⏳ Pending'}`,
  );

  // Add payment link if available and not yet paid
  if (order.paymentLink && !order.paid) {
    lines.push(
      ``,
      `💳 *Pay Online:*`,
      order.paymentLink,
    );
  }

  lines.push(
    ``,
    `Thank you for choosing LaundroCare!`,
  );

  return lines.join('\n');
}

export function generateOrderCreatedMessage(
  order: Order,
  services: LaundryService[],
  category?: CustomerCategory
): string {
  const bill = generateBillMessage(order, services, category);
  return `🧺 *New Order Registered!*\n\n${bill}`;
}

export function generateOrderCompletedMessage(
  order: Order,
  services: LaundryService[],
  category?: CustomerCategory
): string {
  const serviceLabels: Record<string, string> = Object.fromEntries(services.map(s => [s.key, s.label]));
  const totalPcs = order.items.reduce((s, i) => s + i.qty, 0);

  const itemLines = order.items.map((i, idx) =>
    `${idx + 1}. ${i.item} — ${serviceLabels[i.service] || i.service} (×${i.qty})`
  ).join('\n');

  const lines = [
    `🧺 *Order Completed!* ✅`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `   *LaundroCare*`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `Hi *${order.customerName}*,`,
    `Your order *#${order.id}* is now *COMPLETED*! 🎉`,
    ``,
    `*Items (${totalPcs} pcs):*`,
    itemLines,
    ``,
    `*Total: ₹${order.total}*`,
  ];

  if (order.discount > 0) {
    const discountLabel = category && category.discount > 0
      ? `(${category.name} ${category.discount}% discount applied)`
      : `(Discount applied)`;
    lines.push(discountLabel);
  }

  lines.push(
    ``,
    `Payment: ${order.paid ? `✅ Paid${order.paymentMethod ? ` via ${order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'online' ? 'Online' : 'Cash'}` : ''}` : '⏳ Pending'}`,
  );

  if (order.paymentLink && !order.paid) {
    lines.push(
      ``,
      `💳 *Pay Online:*`,
      order.paymentLink,
    );
  }

  lines.push(
    ``,
    `Thank you for choosing LaundroCare! 🙏`,
  );

  return lines.join('\n');
}

export function generateDailySummaryMessage(
  date: string,
  stats: {
    todayOrders: number; todayEarnings: number;
    paidAmount: number; unpaidAmount: number;
    pending: number; completed: number;
  }
): string {
  return [
    `📊 *LaundroCare — Daily Report*`,
    `━━━━━━━━━━━━━━━━━━`,
    `Date: *${date}*`,
    ``,
    `📦 Total Orders: *${stats.todayOrders}*`,
    `🟢 Completed: ${stats.completed}`,
    `🟡 Pending: ${stats.pending}`,
    ``,
    `💰 *Total Earnings: ₹${stats.todayEarnings.toLocaleString()}*`,
    `✅ Collected: ₹${stats.paidAmount.toLocaleString()}`,
    `⏳ Pending Dues: ₹${stats.unpaidAmount.toLocaleString()}`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `Have a great evening! 🌙`,
  ].join('\n');
}

export function getWhatsAppBillUrl(order: Order, services: LaundryService[], category?: CustomerCategory): string {
  const msg = generateBillMessage(order, services, category);
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
