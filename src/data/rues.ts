/**
 * Données « Les rues de Luynes », générées par `npm run data` (voir data/sql/_rues.sql et rues_*.sql).
 * Source : Base Adresse Nationale (BAN, IGN / DINUM). Les personnes honorées viennent de la table de
 * correspondance écrite à la main data/reference/noms-de-rues.csv (cas certains seulement).
 */
import resumeRows from './generated/rues_resume.json';
import typesRows from './generated/rues_types.json';
import classementRows from './generated/rues_classement.json';
import personnesRows from './generated/rues_personnes.json';
import categoriesRows from './generated/rues_categories.json';
import ailleursRows from './generated/rues_ailleurs.json';
import curiositesRows from './generated/rues_curiosites.json';
import carteRows from './generated/rues_carte.json';
import { firstRow } from './rows';
import type { IconName } from '../lib/icons';

export interface ResumeRues {
  noms: number;
  voies: number;
  lieux_dits: number;
  adresses: number;
  adresses_lieux_dits: number;
  types_de_voies: number;
  voie_plus_peuplee: string;
  voie_plus_peuplee_adresses: number;
  lieu_dit_plus_peuple: string;
  lieu_dit_plus_peuple_adresses: number;
  voies_de_personnes: number;
  personnes_distinctes: number;
  voies_femmes: number;
  voies_hommes: number;
  voies_sexe_indetermine: number;
  voies_sans_categorie: number;
  lignes_reference: number;
  lignes_reference_trouvees: number;
}

export interface TypeVoie {
  type: string;
  voie: boolean;
  nombre: number;
  adresses: number;
}

export interface NomClasse {
  rang: number;
  nom: string;
  type: string;
  voie: boolean;
  adresses: number;
}

export type SexeHonore = 'homme' | 'femme' | 'indetermine';

export interface VoiePersonne {
  nom: string;
  sujet: string;
  sexe: SexeHonore;
  categorie: string;
  description: string | null;
  adresses: number;
}

export interface CategorieHonoree {
  categorie: string;
  voies: number;
  personnes: number;
  femmes: number;
  adresses: number;
}

export interface VoieAilleurs {
  nom: string;
  sujet: string;
  nature: 'ville_jumelle' | 'homonyme';
  description: string | null;
  adresses: number;
}

export interface Curiosite {
  nom: string;
  type: string;
  adresses: number;
}

export interface PointNom {
  nom: string;
  type: string;
  voie: boolean;
  adresses: number;
  lat: number;
  lon: number;
}

/** Catégorie des personnes dont la table de correspondance ne donne pas l'identité avec certitude. */
export const CATEGORIE_INCONNUE = 'Non déterminé';

export const resumeRues: ResumeRues = firstRow(resumeRows as ResumeRues[], 'rues_resume');
export const typesDeVoies: readonly TypeVoie[] = typesRows as TypeVoie[];
export const classement: readonly NomClasse[] = classementRows as NomClasse[];
export const voiesDePersonnes: readonly VoiePersonne[] = personnesRows as VoiePersonne[];
export const categoriesHonorees: readonly CategorieHonoree[] = categoriesRows as CategorieHonoree[];
export const voiesAilleurs: readonly VoieAilleurs[] = ailleursRows as VoieAilleurs[];
export const curiosites: readonly Curiosite[] = curiositesRows as Curiosite[];
export const pointsNoms: readonly PointNom[] = carteRows as PointNom[];

/** Icône d'une catégorie de personnes honorées. */
export function iconeCategorie(categorie: string): IconName {
  if (categorie.startsWith('Écrivains')) return 'livre';
  if (categorie.startsWith('Militaires')) return 'medaille';
  if (categorie.startsWith('Hommes d')) return 'mairie';
  if (categorie.startsWith('Savants')) return 'regle';
  if (categorie === 'Histoire locale') return 'aqueduc';
  if (categorie === 'Saints') return 'etoiles';
  return 'personnes';
}
