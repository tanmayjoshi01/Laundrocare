export function generateUpiLink({
  upiId,
  name,
  amount,
  orderId,
}: {
  upiId: string;
  name: string;
  amount: number;
  orderId: string;
}): string {
  const note = encodeURIComponent(`LaundroCare Order ${orderId}`);
  const payeeName = encodeURIComponent(name);
  return `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
}
