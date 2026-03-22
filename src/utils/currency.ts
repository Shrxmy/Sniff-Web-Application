const USD_TO_PHP = 56;

function parseNumeric(input: string): number | null {
  const compact = input.replace(/,/g, "").trim();
  const matched = compact.match(/[0-9]+(?:\.[0-9]+)?/);
  if (!matched) return null;
  const value = Number(matched[0]);
  return Number.isFinite(value) ? value : null;
}

export function toPhpAmount(rawPrice: string, rawCurrency?: string): { amount: number | null; isApprox: boolean } {
  const value = parseNumeric(rawPrice);
  if (value === null) return { amount: null, isApprox: false };

  const currency = (rawCurrency || "").toUpperCase().trim();
  const hasDollarSign = rawPrice.includes("$");

  if (currency === "USD" || hasDollarSign) {
    return { amount: value * USD_TO_PHP, isApprox: true };
  }

  return { amount: value, isApprox: false };
}

export function formatPhp(rawPrice: string, rawCurrency?: string): string {
  const { amount, isApprox } = toPhpAmount(rawPrice, rawCurrency);
  if (amount === null) {
    return rawPrice;
  }

  const formatted = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

  return isApprox ? `~${formatted}` : formatted;
}
