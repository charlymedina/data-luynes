/**
 * « Source · Calcul · Millésime » de chaque chiffre clé du site.
 * Affiché dans la bulle ⓘ des chiffres clés (KeyFigure) et dans la section « Sources et méthode » en bas de page.
 * Les années sont toujours lues dans les données (jamais écrites à la main) : elles suivent les mises à jour.
 */
import { generatedAt, rang } from './commune';
import { agesDe, derniereAnneeEtatCivil, faits } from './population';
import { resumeRisques } from './patrimoine';
import { loyerMaison, resumeImmobilier } from './immobilier';
import { resumeBudget } from './budget';
import { resumeRevenus } from './revenus';
import { resumeAccidents } from './accidents';
import { resumeEquipements } from './equipements';
import { resumeEnergie } from './energie';
import { dernierDe, resumeElections } from './elections';
import { periodeDelinquance } from './delinquance';
import { formatCommunes, formatMonthYear, formatNumber } from '../lib/format';

export interface Methode {
  /** Nom court du chiffre, ex. « Habitants » */
  titre: string;
  source: string;
  calcul: string;
  millesime: string;
}

const extraction = `extraction de ${formatMonthYear(generatedAt)}`;
const recensement = agesDe('Luynes').annee;
const pres = dernierDe('pres');
const muni = dernierDe('muni');
const { debut: delinquanceDebut, fin: delinquanceFin } = periodeDelinquance;
const prix = `${resumeImmobilier.annee_debut_prix}-${resumeImmobilier.annee_fin}`;
const DVF = 'DGFiP, demandes de valeurs foncières (DVF), via Etalab';
const DGFIP = 'DGFiP, comptes individuels des communes';
const POPULATION_DGFIP = `population retenue par la DGFiP (${formatNumber(resumeBudget.population)} habitants, population légale « totale »)`;

const METHODES = {
  population: {
    titre: 'Habitants',
    source: 'INSEE, recensement de la population',
    calcul: 'population municipale (les personnes dont la résidence habituelle est à Luynes)',
    millesime: `${faits.annee_derniere}, en vigueur au 1er janvier ${faits.annee_derniere + 3}`,
  },
  multiplie_1968: {
    titre: 'Évolution depuis 1968',
    source: 'INSEE, séries historiques du recensement (via Tours Métropole pour les années avant 1968)',
    calcul: `population ${faits.annee_derniere} divisée par la population 1968`,
    millesime: `1968-${faits.annee_derniere}`,
  },
  age_median: {
    titre: 'Âge médian',
    source: 'INSEE, recensement (population par âge)',
    calcul: "âge qui partage les habitants en deux moitiés, estimé par interpolation dans la tranche d'âge médiane",
    millesime: String(recensement),
  },
  part_65: {
    titre: '65 ans et plus',
    source: 'INSEE, recensement',
    calcul: 'habitants de 65 ans et plus divisés par la population totale',
    millesime: String(recensement),
  },
  naissances: {
    titre: 'Naissances et décès',
    source: 'INSEE, état civil',
    calcul: 'naissances et décès de personnes domiciliées à Luynes (lieu de résidence, pas lieu de l’événement)',
    millesime: String(derniereAnneeEtatCivil.annee),
  },
  superficie: {
    titre: 'Superficie',
    source: 'IGN, via l’API Géo (geo.api.gouv.fr)',
    calcul: `surface du contour de la commune ; rang parmi les ${formatCommunes(rang.nb_communes)} (1 = la plus grande). L'INSEE publie une surface très légèrement différente, d'où d'éventuels écarts d'une unité sur la densité`,
    millesime: extraction,
  },
  densite: {
    titre: 'Densité',
    source: 'INSEE (population) et IGN (surface), via l’API Géo',
    calcul: `population municipale divisée par la surface IGN ; « Indre-et-Loire » = tous les habitants du département divisés par toute sa surface (${formatNumber(rang.densite_departement)} hab./km²)`,
    millesime: String(faits.annee_derniere),
  },
  monuments: {
    titre: 'Monuments historiques',
    source: 'Ministère de la Culture, base Mérimée',
    calcul: `immeubles protégés (classés ou inscrits) ; rang parmi les ${formatCommunes(resumeRisques.nb_communes)}`,
    millesime: extraction,
  },
  cavites: {
    titre: 'Cavités souterraines',
    source: 'BRGM, inventaire des cavités (Géorisques)',
    calcul: `cavités recensées dans la commune (surtout des caves) ; rang parmi les ${formatCommunes(resumeRisques.nb_communes)}`,
    millesime: extraction,
  },
  catnat: {
    titre: 'Catastrophes naturelles',
    source: 'Géorisques, base GASPAR (arrêtés publiés au Journal officiel)',
    calcul: `événements reconnus « catastrophe naturelle » pour Luynes (${formatNumber(resumeRisques.catnat)}), par ${formatNumber(resumeRisques.catnat_arretes)} arrêtés distincts : un arrêté peut couvrir plusieurs événements`,
    millesime: `${resumeRisques.catnat_premiere_annee}-${resumeRisques.catnat_derniere_annee}`,
  },
  mouvements: {
    titre: 'Mouvements de terrain',
    source: 'BRGM, inventaire des mouvements de terrain (Géorisques)',
    calcul: 'éboulements, glissements et effondrements inventoriés dans la commune ; inventaire non exhaustif et peu mis à jour',
    millesime: `${resumeRisques.mouvement_plus_ancien}-${resumeRisques.mouvement_plus_recent}`,
  },
  prix_m2_maison: {
    titre: "Prix au m² d'une maison",
    source: DVF,
    calcul: `médiane du prix divisé par la surface habitable, pour les ventes d'une seule maison (hors valeurs aberrantes : moins de 300 ou plus de 15 000 €/m²) ; rang parmi les communes avec au moins 30 ventes de maisons`,
    millesime: `${prix} (5 dernières années disponibles)`,
  },
  prix_maison: {
    titre: "Prix d'une maison",
    source: DVF,
    calcul: "prix médian des ventes d'une seule maison (la moitié des ventes au-dessus, l'autre en dessous)",
    millesime: prix,
  },
  ventes: {
    titre: 'Ventes immobilières',
    source: `${DVF}, plus l'archive du site pour les années qui ne sont plus publiées`,
    calcul: `ventes (dont ventes sur plan) d'au moins 1 000 € ; une vente = une mutation, même si elle compte plusieurs lots ; ${formatNumber(resumeImmobilier.ventes_geolocalisees)} localisées sur la carte`,
    millesime: `${resumeImmobilier.annee_debut}-${resumeImmobilier.annee_fin}`,
  },
  loyer_maison: {
    titre: "Loyer d'une maison",
    source: 'Ministère de la Transition écologique, carte des loyers',
    calcul: "loyer d'annonce estimé par un modèle statistique (et non moyenne des annonces), charges comprises, en €/m² par mois",
    millesime: String(loyerMaison?.annee ?? ''),
  },
  depenses: {
    titre: 'Charges de fonctionnement',
    source: DGFIP,
    calcul: `charges de fonctionnement en comptabilité DGFiP (y compris amortissements) ; par habitant : divisées par la ${POPULATION_DGFIP}, comme la moyenne des communes de même taille`,
    millesime: String(resumeBudget.annee),
  },
  dette: {
    titre: 'Dette par habitant',
    source: DGFIP,
    calcul: `encours de la dette au 31 décembre divisé par la ${POPULATION_DGFIP}`,
    millesime: String(resumeBudget.annee),
  },
  taxe_fonciere: {
    titre: 'Taxe foncière',
    source: DGFIP,
    calcul: "taux voté sur le foncier bâti ; depuis 2021, il inclut l'ancienne part du département",
    millesime: String(resumeBudget.annee),
  },
  equipement: {
    titre: 'Équipements par habitant',
    source: DGFIP,
    calcul: `dépenses d'équipement de l'année (travaux, bâtiments, voirie, matériel) divisées par la ${POPULATION_DGFIP}`,
    millesime: String(resumeBudget.annee),
  },
  niveau_vie: {
    titre: 'Niveau de vie médian',
    source: 'INSEE, Filosofi (revenus fiscaux et sociaux)',
    calcul: 'revenu disponible par « unité de consommation » partageant les habitants en deux moitiés ; divisé par 12 pour le montant mensuel',
    millesime: `revenus ${resumeRevenus.annee_revenus}`,
  },
  pauvrete: {
    titre: 'Taux de pauvreté',
    source: 'INSEE, Filosofi',
    calcul: 'part des habitants vivant sous 60 % du niveau de vie médian national',
    millesime: `revenus ${resumeRevenus.annee_revenus}`,
  },
  chomage: {
    titre: 'Chômage',
    source: 'INSEE, recensement',
    calcul: 'personnes de 15 à 64 ans se déclarant au chômage, divisées par les actifs du même âge ; différent du taux de chômage officiel (au sens du BIT)',
    millesime: String(resumeRevenus.annee_recensement),
  },
  salaire: {
    titre: 'Salaire net',
    source: 'INSEE, base Tous salariés',
    calcul: 'salaire net mensuel moyen en équivalent temps plein, secteur privé',
    millesime: String(resumeRevenus.annee_salaires),
  },
  accidents: {
    titre: 'Accidents de la route',
    source: "Observatoire national de la sécurité routière, fichiers des accidents corporels (BAAC), plus l'archive du site",
    calcul: 'accidents corporels (au moins un blessé) constatés par les forces de l’ordre et rattachés à la commune',
    millesime: `${resumeAccidents.annee_debut}-${resumeAccidents.annee_fin}`,
  },
  accidents_taux: {
    titre: 'Accidents pour 1 000 habitants',
    source: 'ONISR (BAAC) et INSEE (population)',
    calcul: "nombre moyen d'accidents corporels par an, divisé par la population municipale, × 1 000 ; même calcul pour le département (dont les premières années sont incomplètes dans le fichier national)",
    millesime: `${resumeAccidents.annee_debut}-${resumeAccidents.annee_fin}`,
  },
  accidents_annees_sans: {
    titre: 'Années sans accident',
    source: 'ONISR (BAAC)',
    calcul: 'années sans aucun accident corporel enregistré dans la commune',
    millesime: `${resumeAccidents.annee_debut}-${resumeAccidents.annee_fin}`,
  },
  equipements: {
    titre: 'Commerces, services, équipements',
    source: 'INSEE, base permanente des équipements (BPE)',
    calcul: `équipements recensés dans la commune (commerces, services, santé, enseignement, sport, tourisme) ; rang par habitant parmi les ${formatCommunes(resumeEquipements.nb_communes)}`,
    millesime: String(resumeEquipements.annee_bpe),
  },
  medecins: {
    titre: 'Médecins généralistes',
    source: 'INSEE, base permanente des équipements (BPE)',
    calcul: 'médecins généralistes recensés ; taux = nombre divisé par la population municipale × 10 000',
    millesime: String(resumeEquipements.annee_bpe),
  },
  eleves: {
    titre: 'Élèves des écoles',
    source: 'Éducation nationale, effectifs par école',
    calcul: 'élèves des écoles maternelles et élémentaires de la commune (publiques et privée)',
    millesime: `rentrée ${resumeEquipements.derniere_rentree}`,
  },
  etablissements: {
    titre: 'Écoles et collège',
    source: "Éducation nationale, annuaire de l'éducation et effectifs",
    calcul: 'établissements ouverts dans la commune ; élèves par classe = élèves des écoles divisés par le nombre de classes',
    millesime: `rentrée ${resumeEquipements.derniere_rentree}`,
  },
  voitures_electriques: {
    titre: 'Voitures électriques',
    source: 'SDES (ministère de la Transition écologique), parc de véhicules par commune',
    calcul: `voitures particulières électriques divisées par les voitures immatriculées dans la commune au 1er janvier ; rang parmi les ${formatCommunes(resumeEnergie.nb_communes_parc)}`,
    millesime: `1er janvier ${resumeEnergie.annee_parc}`,
  },
  solaire: {
    titre: 'Puissance solaire',
    source: "ODRÉ, registre national des installations de production d'électricité",
    calcul: 'puissance cumulée des installations solaires raccordées dans la commune ; par habitant : divisée par la population municipale × 1 000',
    millesime: extraction,
  },
  electricite: {
    titre: 'Électricité par logement',
    source: 'Agence ORE (Enedis et autres gestionnaires de réseau)',
    calcul: 'consommation du secteur résidentiel divisée par le nombre de points de livraison résidentiels (≈ logements)',
    millesime: String(resumeEnergie.annee_energie),
  },
  bornes: {
    titre: 'Bornes de recharge',
    source: 'Base nationale des infrastructures de recharge (IRVE, data.gouv.fr)',
    calcul: 'stations de recharge ouvertes au public situées dans le contour de la commune',
    millesime: extraction,
  },
  inscrits: {
    titre: 'Électeurs inscrits',
    source: "Ministère de l'Intérieur, résultats électoraux",
    calcul: 'inscrits sur les listes électorales de la commune au dernier scrutin',
    millesime: String(resumeElections.derniere_annee),
  },
  participation_pres: {
    titre: 'Participation, présidentielle',
    source: "Ministère de l'Intérieur (données agrégées sur data.gouv.fr)",
    calcul: 'votants divisés par inscrits au 1er tour ; « France » = bureaux du fichier national',
    millesime: String(pres?.annee ?? ''),
  },
  participation_muni: {
    titre: 'Participation, municipales',
    source: "Ministère de l'Intérieur",
    calcul: `votants divisés par inscrits au 1er tour ; rang parmi les ${formatCommunes(muni?.nb_communes ?? 0)} dont le résultat est publié`,
    millesime: String(muni?.annee ?? ''),
  },
  au_dessus_france: {
    titre: 'Participation comparée à la France',
    source: "Ministère de l'Intérieur",
    calcul: 'nombre de 1ers tours où la participation à Luynes dépasse celle de la France, parmi les scrutins où la référence nationale est complète',
    millesime: `${resumeElections.premiere_annee}-${resumeElections.derniere_annee}`,
  },
  delinquance_bilan: {
    titre: 'Délinquance enregistrée',
    source: "SSMSI (ministère de l'Intérieur), bases communale et départementale",
    calcul: `pour chaque indicateur publié pour Luynes : faits enregistrés en moyenne par an sur ${delinquanceDebut}-${delinquanceFin}, pour 1 000 habitants (ou logements), comparés à l'Indre-et-Loire`,
    millesime: `${delinquanceDebut}-${delinquanceFin}`,
  },
  delinquance_cambriolages: {
    titre: 'Cambriolages',
    source: "SSMSI (ministère de l'Intérieur)",
    calcul: `cambriolages de logements enregistrés en moyenne par an, divisés par le nombre de logements × 1 000`,
    millesime: `${delinquanceDebut}-${delinquanceFin}`,
  },
  delinquance_degradations: {
    titre: 'Dégradations',
    source: "SSMSI (ministère de l'Intérieur)",
    calcul: `destructions et dégradations volontaires enregistrées en moyenne par an, divisées par la population × 1 000`,
    millesime: `${delinquanceDebut}-${delinquanceFin}`,
  },
} as const satisfies Record<string, Methode>;

export type CleMethode = keyof typeof METHODES;

export function methode(cle: CleMethode): Methode {
  return METHODES[cle];
}

/** Méthodes affichées dans la section « Sources et méthode » de chaque page (dans l'ordre des chiffres clés). */
const PAR_PAGE: Record<string, readonly CleMethode[]> = {
  accueil: ['population', 'age_median', 'naissances', 'superficie', 'densite', 'monuments', 'cavites', 'prix_m2_maison', 'ventes', 'depenses', 'niveau_vie', 'accidents_taux', 'voitures_electriques', 'equipements', 'eleves', 'participation_pres', 'delinquance_bilan'],
  population: ['population', 'multiplie_1968', 'age_median', 'part_65', 'naissances'],
  territoire: ['superficie', 'densite'],
  'patrimoine-risques': ['monuments', 'cavites', 'catnat', 'mouvements'],
  immobilier: ['prix_m2_maison', 'prix_maison', 'ventes', 'loyer_maison'],
  budget: ['depenses', 'dette', 'taxe_fonciere', 'equipement'],
  'revenus-emploi': ['niveau_vie', 'pauvrete', 'chomage', 'salaire'],
  accidents: ['accidents', 'accidents_taux', 'accidents_annees_sans'],
  equipements: ['equipements', 'medecins', 'eleves', 'etablissements'],
  'energie-mobilite': ['voitures_electriques', 'solaire', 'electricite', 'bornes'],
  elections: ['inscrits', 'participation_pres', 'participation_muni', 'au_dessus_france'],
  delinquance: ['delinquance_bilan', 'delinquance_cambriolages', 'delinquance_degradations'],
};

export function methodesDePage(page: string): Methode[] {
  return (PAR_PAGE[page] ?? []).map(methode);
}

/** Toutes les méthodes (utilisé par les tests de cohérence). */
export const TOUTES_LES_METHODES: readonly Methode[] = Object.values(METHODES);
