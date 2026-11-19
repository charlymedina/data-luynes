/** Renvoie la première ligne d'un résultat SQL, ou une erreur claire si la requête n'a rien produit. */
export function firstRow<T>(rows: readonly T[], name: string): T {
  const row = rows[0];
  if (row === undefined) throw new Error(`Données « ${name} » vides : relancer npm run data.`);
  return row;
}

/** Renvoie la dernière ligne d'un résultat SQL (ex. la dernière année d'une série). */
export function lastRow<T>(rows: readonly T[], name: string): T {
  return firstRow([...rows].reverse(), name);
}
