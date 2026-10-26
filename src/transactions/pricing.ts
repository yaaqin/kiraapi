export const TAX_RATE = 0.1;

/** Voucher code -> discount fraction. */
export const VOUCHERS: Record<string, number> = {
  SOH10: 0.1,
  SOHVIP: 0.2,
};

export function calculateTotals(subtotal: number, discountRate: number) {
  const discount = Math.round(subtotal * discountRate);
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}
