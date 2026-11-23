/**
 * Données « Revenus & emploi », générées par `npm run data` (voir data/sql/_revenus.sql et revenus_*.sql).
 * Sources INSEE : Filosofi (revenus), recensement (activité, trajets), base Tous salariés, SIDE (créations).
 */
import resumeRows from './generated/revenus_resume.json';
import activiteRows from './generated/revenus_activite.json';
import trajetsRows from './generated/revenus_trajets.json';
import creationsRows from './generated/revenus_creations.json';
import cafResumeRows from './generated/revenus_caf_resume.json';
import cafPrestationsRows from './generated/revenus_caf_prestations.json';
import cafAnneesRows from './generated/revenus_caf_annees.json';
import { firstRow } from './rows';

export interface ResumeRevenus {
  annee_revenus: number;
  niveau_vie: number;
  niveau_vie_37: number;
  niveau_vie_france: number;
  pauvrete: number;
  pauvrete_37: number;
  pauvrete_france: number;
  rang_niveau_vie: number;
  nb_communes_niveau_vie: number;
  annee_recensement: number;
  chomage: number;
  chomage_37: number;
  chomage_france: number;
  rang_chomage: number;
  nb_communes_chomage: number;
  part_travail_ailleurs: number;
  part_travail_ailleurs_37: number;
  part_travail_ailleurs_france: number;
  part_voiture: number;
  part_voiture_37: number;
  part_voiture_france: number;
  annee_salaires: number;
  salaire: number;
  salaire_37: number;
  salaire_france: number;
  salaire_femmes: number;
  salaire_hommes: number;
}

export interface Activite {
  territoire: 'Luynes' | 'Indre-et-Loire' | 'France';
  en_emploi: number;
  chomage: number;
  etudes: number;
  retraite_autres: number;
}

export interface Trajets {
  actifs_en_emploi: number;
  voiture: number;
  transports_en_commun: number;
  marche_velo_deux_roues: number;
  sans_trajet: number;
  dans_la_commune: number;
  ailleurs_dans_le_37: number;
  hors_departement: number;
}

export interface Creation {
  annee: number;
  creations: number;
}

export const resumeRevenus: ResumeRevenus = firstRow(resumeRows as ResumeRevenus[], 'revenus_resume');
export const activites: readonly Activite[] = activiteRows as Activite[];
export const trajets: Trajets = firstRow(trajetsRows as Trajets[], 'revenus_trajets');
export const creations: readonly Creation[] = creationsRows as Creation[];

export function activiteDe(territoire: Activite['territoire']): Activite {
  return firstRow(activites.filter((a) => a.territoire === territoire), `revenus_activite (${territoire})`);
}

/** Aides de la CAF : foyers allocataires (au moins une prestation légale), comparés aux ménages (recensement). */
export interface ResumeCaf {
  /** Année du dernier décembre publié par la CAF pour les communes */
  annee: number;
  foyers: number;
  personnes: number;
  annee_recensement: number;
  menages: number;
  part_menages: number;
  foyers_37: number;
  menages_37: number;
  part_menages_37: number;
  rang: number;
  nb_communes: number;
}

/** Une prestation de la CAF : foyers de Luynes concernés (arrondis à 5 par la CAF ; « masque » = moins de 3 foyers). */
export interface PrestationCaf {
  code: string;
  groupe: 'Logement' | 'Familles' | 'Petite enfance' | 'Revenus et solidarité';
  libelle: string;
  principale: boolean;
  foyers: number;
  masque: boolean;
  part_menages: number;
  foyers_37: number;
  part_menages_37: number;
}

export interface AnneeCaf {
  annee: number;
  foyers: number;
  foyers_37: number;
  evolution_pct: number;
  evolution_37_pct: number;
}

export const resumeCaf: ResumeCaf = firstRow(cafResumeRows as ResumeCaf[], 'revenus_caf_resume');
export const prestationsCaf: readonly PrestationCaf[] = cafPrestationsRows as PrestationCaf[];
export const anneesCaf: readonly AnneeCaf[] = cafAnneesRows as AnneeCaf[];

export function prestationCaf(code: string): PrestationCaf {
  return firstRow(prestationsCaf.filter((p) => p.code === code), `revenus_caf_prestations (${code})`);
}
