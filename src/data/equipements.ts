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
