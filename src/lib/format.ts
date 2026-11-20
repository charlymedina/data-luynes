const integerFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/** Intl sépare les milliers par une espace fine, presque invisible dans la police des titres
 *  (« 1 970 » ressemblait à l'année 1970) : on utilise une espace insécable normale. */
const NARROW_NBSP = / /g;

/** 5062 → « 5 062 » ; 34.1 → « 34,1 » */
export function formatNumber(value: number, decimals: 0 | 1 = 0): string {
  return (decimals === 0 ? integerFormat : decimalFormat).format(value).replace(NARROW_NBSP, ' ');
}

const oneDecimalFormat = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Toujours une décimale, pour comparer des taux côte à côte : 1 → « 1,0 » ; 0.33 → « 0,3 ». */
export function formatOneDecimal(value: number): string {
  return oneDecimalFormat.format(value).replace(NARROW_NBSP, ' ');
}

/** 1 → « 1ʳᵉ », 19 → « 19ᵉ » */
export function formatRank(rank: number): string {
  return rank === 1 ? '1ʳᵉ' : `${rank}ᵉ`;
}

/** Ensemble de référence par défaut des classements du site. */
export const COMMUNES_37 = "communes d'Indre-et-Loire";
/** Classement des prix : seules les communes avec assez de ventes sont comparées. */
export const COMMUNES_37_COMPARABLES = "communes d'Indre-et-Loire comparables";

/** 272 → « 272 communes d'Indre-et-Loire » ; (198, « communes comparables ») → « 198 communes comparables ». */
export function formatCommunes(total: number, ensemble: string = COMMUNES_37): string {
  return `${formatNumber(total)} ${ensemble}`;
}

/**
 * Rang toujours accompagné de son ensemble de référence, pour qu'aucun « sur 272 » ne reste ambigu :
 * (19, 272) → « 19ᵉ sur 272 communes d'Indre-et-Loire ».
 */
export function formatRankOf(rank: number, total: number, ensemble: string = COMMUNES_37): string {
  return `${formatRank(rank)} sur ${formatCommunes(total, ensemble)}`;
}

/** Date → « octobre 2026 » */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
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
