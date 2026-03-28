import { Order, LaundryService, CustomerCategory } from '../store';
import jsPDF from 'jspdf';

export async function generateBillPdf(
  order: Order,
  services: LaundryService[],
  category?: CustomerCategory
): Promise<jsPDF> {
  const SERVICE_LABELS: Record<string, string> = Object.fromEntries(services.map(s => [s.key, s.label]));
  const totalPcs = order.items.reduce((s, i) => s + i.qty, 0);
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] }); // thermal receipt width

  const w = 80;
  let y = 8;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235); // #2563EB
  doc.text('LaundroCare', w / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Professional Laundry Service', w / 2, y, { align: 'center' });
  y += 5;

  // Dashed line
  doc.setDrawColor(226, 232, 240);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, w - 5, y);
  y += 5;

  // Order ID
  doc.setFont('courier', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235);
  doc.text(`#${order.id}`, w / 2, y, { align: 'center' });
  y += 5;

  // Customer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(order.customerName, w / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(order.customerPhone, w / 2, y, { align: 'center' });
  y += 5;

  // Dates
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Date: ${order.createdAt}`, 5, y);
  doc.text(`Due: ${order.dueDate}`, w - 5, y, { align: 'right' });
  y += 4;

  // Dashed line
  doc.line(5, y, w - 5, y);
  y += 4;

  // Items header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('ITEM', 5, y);
  doc.text('SVC', 30, y);
  doc.text('QTY', 50, y);
  doc.text('AMT', w - 5, y, { align: 'right' });
  y += 1;
  doc.setLineDashPattern([], 0);
  doc.setDrawColor(226, 232, 240);
  doc.line(5, y, w - 5, y);
  y += 4;

  // Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  for (const item of order.items) {
    const svcLabel = (SERVICE_LABELS[item.service] || item.service).slice(0, 10);
    const itemName = item.item.length > 12 ? item.item.slice(0, 12) + '..' : item.item;
    doc.text(itemName, 5, y);
    doc.setTextColor(100, 116, 139);
    doc.text(svcLabel, 30, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('courier', 'normal');
    doc.text(String(item.qty), 53, y);
    doc.text(`₹${item.unitPrice * item.qty}`, w - 5, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    y += 4;
  }
  y += 1;

  // Totals
  doc.setDrawColor(226, 232, 240);
  doc.line(5, y, w - 5, y);
  y += 4;

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Subtotal (${totalPcs} pcs)`, 5, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`₹${order.subtotal}`, w - 5, y, { align: 'right' });
  y += 4;

  if (order.discount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const discLabel = category && category.discount > 0
      ? `Discount (${category.name} ${category.discount}%)`
      : 'Discount';
    doc.text(discLabel, 5, y);
    doc.setFont('courier', 'normal');
    doc.setTextColor(220, 38, 38);
    doc.text(`-₹${order.discount}`, w - 5, y, { align: 'right' });
    y += 4;
  }

  // Total line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(5, y, w - 5, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL', 5, y);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(22, 163, 74);
  doc.text(`₹${order.total}`, w - 5, y, { align: 'right' });
  y += 6;

  // Payment status
  doc.setLineWidth(0.2);
  if (order.paid) {
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(5, y - 2, w - 10, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    const paidText = `✅ PAID${order.paymentMethod ? ` via ${order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'online' ? 'Online' : 'Cash'}` : ''}`;
    doc.text(paidText, w / 2, y + 2.5, { align: 'center' });
  } else {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(5, y - 2, w - 10, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text('⏳ UNPAID', w / 2, y + 2.5, { align: 'center' });
  }
  y += 10;

  // Payment link
  if (order.paymentLink && !order.paid) {
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(5, y - 2, w - 10, 10, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(37, 99, 235);
    doc.text('💳 Pay Online:', w / 2, y + 1.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(37, 99, 235);
    doc.textWithLink(order.paymentLink, w / 2, y + 5.5, {
      align: 'center',
      url: order.paymentLink,
    });
    y += 13;
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, w - 5, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(`Generated: ${now}`, w / 2, y, { align: 'center' });
  y += 3;
  doc.text('Thank you for choosing LaundroCare!', w / 2, y, { align: 'center' });

  return doc;
}

export async function downloadBillPdf(
  order: Order,
  services: LaundryService[],
  category?: CustomerCategory
) {
  const doc = await generateBillPdf(order, services, category);
  doc.save(`LaundroCare-Bill-${order.id}.pdf`);
}
