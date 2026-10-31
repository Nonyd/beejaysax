// Shared by the checkout form and the server, so the fee a buyer sees is the fee they pay.
// No database or secret imports here.

/**
 * Paystack's pricing for a Nigerian business. Local cards: 1.5% + ₦100, with the ₦100 waived on
 * payments under ₦2,500 and the fee capped at ₦2,000. Other currencies (international payments):
 * 3.9%. Update these if Paystack changes its pricing (paystack.com/pricing).
 */
const PRICING: Record<string, { rate: number; flat: number; flatFrom: number; cap: number | null }> = {
  NGN: { rate: 0.015, flat: 100, flatFrom: 2500, cap: 2000 },
}
const OTHER = { rate: 0.039, flat: 0, flatFrom: 0, cap: null }

/**
 * The processing fee added on top of the ticket price, so that after Paystack takes its cut the
 * full ticket price is left. Nothing for free orders. Foreign cards on naira payments cost Paystack
 * more (3.9%); that difference isn't passed on.
 */
export function processingFee(amount: number, currency: string): number {
  if (amount <= 0) return 0
  const p = PRICING[currency] ?? OTHER
  // Charge c such that c − fee(c) = amount, where fee(c) = rate·c (+ flat once c reaches flatFrom).
  let charge = amount / (1 - p.rate)
  if (p.flat && charge >= p.flatFrom) charge = (amount + p.flat) / (1 - p.rate)
  let fee = charge - amount
  if (p.cap != null) fee = Math.min(fee, p.cap)
  // Round up to the whole naira (or cent), so the payout never comes out a little short.
  const unit = currency === 'NGN' ? 1 : 0.01
  return Math.round(Math.ceil(fee / unit - 1e-9) * unit * 100) / 100
}
