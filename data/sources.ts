/**
 * Liste des sources de données téléchargées avant chaque construction du site.
 * Chaque source est enregistrée dans data/raw/<id>.json, que les requêtes SQL lisent ensuite.
 * Pense à documenter toute nouvelle source dans docs/sources.md (origine, licence, mise à jour).
 */
export interface Source {
  /** Nom du fichier produit dans data/raw/ (sans extension) */
  readonly id: string;
  readonly description: string;
  readonly url: string;
}

export const SOURCES: readonly Source[] = [
  {
    id: 'commune',
    description: 'Fiche de Luynes (API Géo)',
    url: 'https://geo.api.gouv.fr/communes/37139?fields=nom,code,population,surface,codesPostaux,centre,departement,region',
  },
  {
    id: 'communes_37',
    description: "Toutes les communes d'Indre-et-Loire (API Géo)",
    url: 'https://geo.api.gouv.fr/departements/37/communes?fields=nom,code,population,surface,centre',
  },
];
