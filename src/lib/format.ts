const integerFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/** 5062 → « 5 062 » ; 34.1 → « 34,1 » */
export function formatNumber(value: number, decimals: 0 | 1 = 0): string {
  return (decimals === 0 ? integerFormat : decimalFormat).format(value);
}

/** 1 → « 1ʳᵉ », 19 → « 19ᵉ » */
export function formatRank(rank: number): string {
  return rank === 1 ? '1ʳᵉ' : `${rank}ᵉ`;
}

/** Rapport arrondi « à la française » : 1.47 → « 1,5 » */
export function formatRatio(a: number, b: number): string {
  return decimalFormat.format(a / b);
}
