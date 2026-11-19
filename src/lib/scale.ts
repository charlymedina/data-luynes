/** Outils d'échelle pour les graphiques dessinés côté serveur (positions en % de la zone de tracé). */

const NICE_MULTIPLIERS = [1, 2, 2.5, 5, 10] as const;

/** Graduations « rondes » de 0 jusqu'au-dessus de maxValue (ex. 5 259 → 0, 2 000, 4 000, 6 000). */
export function niceTicks(maxValue: number, targetCount = 4): number[] {
  if (maxValue <= 0) return [0, 1];
  const rough = maxValue / targetCount;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = NICE_MULTIPLIERS.map((m) => m * power).find((s) => s >= rough) ?? 10 * power;
  const top = Math.ceil(maxValue / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

/** Position en % (0 à 100) d'une valeur dans l'intervalle [min, max]. */
export function toPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}
