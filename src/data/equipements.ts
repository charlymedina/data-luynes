/**
 * Données « Écoles, santé & services », générées par `npm run data`
 * (voir data/sql/_equipements.sql, equipements_*.sql et ecoles_*.sql).
 * Sources : INSEE, base permanente des équipements (BPE) ; Éducation nationale (annuaire, effectifs).
 */
import resumeRows from './generated/equipements_resume.json';
import domainesRows from './generated/equipements_domaines.json';
import typesRows from './generated/equipements_types.json';
import effectifsRows from './generated/ecoles_effectifs.json';
import ecolesRows from './generated/ecoles_liste.json';
import ipsRows from './generated/ecoles_ips.json';
import collegeRows from './generated/ecoles_college.json';
import mediathequeRows from './generated/equipements_mediatheque.json';
import cantinesRows from './generated/equipements_cantines.json';
import cantinesEcolesRows from './generated/equipements_cantines_ecoles.json';
import { firstRow } from './rows';

export interface ResumeEquipements {
  annee_bpe: number;
  equipements: number;
  equipements_pour_1000: number;
  equipements_pour_1000_37: number;
  rang_equipements: number;
  nb_communes: number;
  medecins: number;
  medecins_pour_10000: number;
  medecins_pour_10000_37: number;
  pharmacies: number;
  etablissements_sante: number;
  professionnels_sante: number;
  premiere_rentree: number;
  eleves_premiere_rentree: number;
  derniere_rentree: number;
  eleves: number;
  evolution_eleves_pct: number;
  evolution_eleves_37_pct: number;
  eleves_par_classe: number;
  eleves_par_classe_37: number;
  etablissements_scolaires: number;
}

export interface DomaineEquipements {
  domaine: string;
  libelle: string;
  nombre: number;
  pour_1000_luynes: number;
  pour_1000_37: number;
  rang: number | null;
  nb_communes: number | null;
}

export interface TypeEquipement {
  code: string;
  libelle: string;
  domaine: string;
  domaine_libelle: string;
  nombre: number;
  pour_10000_luynes: number;
  pour_10000_37: number;
}

export interface EffectifsRentree {
  rentree: number;
  eleves: number;
  classes: number;
  eleves_par_classe: number;
  eleves_37: number | null;
  eleves_par_classe_37: number | null;
}

export interface Etablissement {
  uai: string;
  nom: string;
  niveau: string;
  statut: string;
  eleves: number | null;
  classes: number | null;
  lat: number;
  lon: number;
}

/** Indice de position sociale d'un établissement à sa dernière rentrée publiée (voir data/sql/ecoles_ips.sql). */
export interface IpsEtablissement {
  uai: string;
  nom: string;
  est_college: boolean;
  /** ex. « 2024-2025 » */
  rentree: string;
  secteur: 'public' | 'privé';
  ips: number;
  ips_37_secteur: number;
  ips_france_secteur: number;
  ips_37: number;
  ips_france: number;
}

export interface RentreeCollege {
  rentree: number;
  eleves: number;
  sixiemes: number;
  cinquiemes: number;
  quatriemes: number;
  troisiemes: number;
}

export const ipsEtablissements: readonly IpsEtablissement[] = (ipsRows as IpsEtablissement[]).filter((e) => e.ips !== null);
export const effectifsCollege: readonly RentreeCollege[] = collegeRows as RentreeCollege[];

export const resumeEquipements: ResumeEquipements = firstRow(resumeRows as ResumeEquipements[], 'equipements_resume');
export const domainesEquipements: readonly DomaineEquipements[] = (domainesRows as DomaineEquipements[]).filter((d) => d.domaine !== '_T');
export const typesEquipements: readonly TypeEquipement[] = typesRows as TypeEquipement[];
export const effectifsEcoles: readonly EffectifsRentree[] = effectifsRows as EffectifsRentree[];
export const etablissementsScolaires: readonly Etablissement[] = ecolesRows as Etablissement[];

/** Nombre d'équipements d'un type à Luynes (0 s'il n'y en a pas). */
export function nombreDe(...codes: string[]): number {
  return typesEquipements.filter((t) => codes.includes(t.code)).reduce((s, t) => s + t.nombre, 0);
}

export function typeEquipement(code: string): TypeEquipement | undefined {
  return typesEquipements.find((t) => t.code === code);
}

/** Médiathèque de Luynes (enquête annuelle du ministère de la Culture), voir data/sql/equipements_mediatheque.sql. */
export interface Mediatheque {
  nom: string;
  adresse: string;
  annee: number;
  surface_m2: number | null;
  places: number | null;
  postes_informatiques: number | null;
  heures_par_semaine: number | null;
  ouverte_dimanche: boolean | null;
  wifi: boolean | null;
  livres: number | null;
  cd: number | null;
  dvd: number | null;
  emprunteurs: number | null;
  prets: number | null;
  actions_culturelles: number | null;
  personnes_touchees: number | null;
  prets_par_habitant: number | null;
  emprunteurs_pct_population: number | null;
  livres_par_habitant: number | null;
}

/** Une cantine de Luynes déclarée sur « Ma Cantine » (parts en %). */
export interface Cantine {
  annee: number;
  nom: string;
  secteur: string | null;
  ecole: boolean;
  bio_pct: number;
  durable_pct: number;
}

export interface CantinesEcoles {
  annee: number;
  cuisines: number;
  bio_pct: number;
  durable_pct: number;
  cantines_ecoles: number;
}

/** Vide si Luynes n'est pas dans l'enquête : la page n'affiche alors rien. */
export const mediatheque: Mediatheque | undefined = (mediathequeRows as Mediatheque[])[0];
export const cantines: readonly Cantine[] = cantinesRows as Cantine[];
export const cantinesEcoles: CantinesEcoles | undefined = (cantinesEcolesRows as CantinesEcoles[])[0];

/** Objectifs de la loi EGalim pour la restauration collective publique (part des achats alimentaires, en %). */
export const OBJECTIF_BIO = 20;
export const OBJECTIF_DURABLE = 50;
