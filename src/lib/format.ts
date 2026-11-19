const integerFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/** Intl sépare les milliers par une espace fine, presque invisible dans la police des titres
 *  (« 1 970 » ressemblait à l'année 1970) : on utilise une espace insécable normale. */
const NARROW_NBSP = / /g;

/** 5062 → « 5 062 » ; 34.1 → « 34,1 » */
export function formatNumber(value: number, decimals: 0 | 1 = 0): string {
  return (decimals === 0 ? integerFormat : decimalFormat).format(value).replace(NARROW_NBSP, ' ');
}

/** 1 → « 1ʳᵉ », 19 → « 19ᵉ » */
export function formatRank(rank: number): string {
  return rank === 1 ? '1ʳᵉ' : `${rank}ᵉ`;
}

/** Rapport arrondi « à la française » : 1.47 → « 1,5 » */
export function formatRatio(a: number, b: number): string {
  return decimalFormat.format(a / b);
}

/** 26.5 → « 26,5 % » (espace insécable avant le signe, comme en typographie française) */
export function formatPercent(value: number): string {
  return `${decimalFormat.format(value)} %`;
}

/** (26.5, « habitant ») → « plus d'un habitant sur 4 » : traduit un pourcentage en proportion parlante. */
export function formatOneIn(percent: number, noun: string): string {
  const denominator = Math.ceil(100 / percent);
  return percent > 100 / denominator ? `plus d'un ${noun} sur ${denominator}` : `un ${noun} sur ${denominator}`;
}
