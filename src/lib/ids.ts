/** Compteur d'identifiants uniques pour le HTML généré (une même bulle peut apparaître plusieurs fois par page). */
let compteur = 0;

export function idUnique(prefixe: string): string {
  compteur += 1;
  return `${prefixe}-${compteur}`;
}
