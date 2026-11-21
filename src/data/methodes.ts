/**
 * « Source · Calcul · Millésime » de chaque chiffre clé du site.
 * Affiché dans la bulle ⓘ des chiffres clés (KeyFigure) et dans la section « Sources et méthode » en bas de page.
 * Les années sont toujours lues dans les données (jamais écrites à la main) : elles suivent les mises à jour.
 */
import { generatedAt, rang } from './commune';
import { agesDe, derniereAnneeEtatCivil, evolutionAges, faits, historique } from './population';
import { resumeRisques } from './patrimoine';
import { loyerMaison, resumeImmobilier } from './immobilier';
import { anneesBudget, resumeBudget } from './budget';
import { creations, resumeRevenus } from './revenus';
import { resumeAccidents } from './accidents';
import { ipsEtablissements, resumeEquipements } from './equipements';
import { anneesEnergie, resumeEnergie } from './energie';
import { dernierDe, participations, resumeElections } from './elections';
import { periodeDelinquance } from './delinquance';
import { resumeEau } from './eau';
import { resumeConstruction } from './construction';
import { appelsOffres, comparaison, conseil, derniereAnnee as derniereAnneeBalance, premiereAnnee as premiereAnneeBalance, premiereNotification, premierePublication } from './transparence';
import { periodesEquipements, resumeSport } from './sport';
import { resumeRues } from './rues';
import { formatCommunes, formatMonthYear, formatNumber } from '../lib/format';

export interface Methode {
  /** Nom court du chiffre, ex. « Habitants » */
  titre: string;
  source: string;
  calcul: string;
  millesime: string;
}

const extraction = `extraction de ${formatMonthYear(generatedAt)}`;
const premiere = (annees: readonly number[]): number => Math.min(...annees);
const derniere = (annees: readonly number[]): number => Math.max(...annees);
const recensement = agesDe('Luynes').annee;
const pres = dernierDe('pres');
const muni = dernierDe('muni');
const { debut: delinquanceDebut, fin: delinquanceFin } = periodeDelinquance;
const prix = `${resumeImmobilier.annee_debut_prix}-${resumeImmobilier.annee_fin}`;
const DVF = 'DGFiP, demandes de valeurs foncières (DVF), via Etalab';
const DGFIP = 'DGFiP, comptes individuels des communes';
const HUBEAU = "contrôle sanitaire des eaux (ARS, ministère de la Santé), via l'API Hub'eau";
const BALANCES = 'DGFiP, balances comptables des communes (budget principal)';
const RNE = 'ministère de l\'Intérieur, répertoire national des élus (conseillers municipaux)';
const balances = `${premiereAnneeBalance}-${derniereAnneeBalance}`;
const INJEP = 'INJEP / ministère des Sports, recensement des licences auprès des fédérations sportives agréées (par commune de résidence)';
const RES = 'ministère des Sports, recensement des équipements sportifs (RES, « Data ES »)';
const BAN = 'Base Adresse Nationale (BAN, IGN / DINUM), adresses du code INSEE 37139';
const REFERENCE_RUES = 'table de correspondance écrite à la main (data/reference/noms-de-rues.csv), limitée aux cas certains';
const licencesAnnees = `${resumeSport.annee_debut}-${resumeSport.annee_fin}`;
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
  loyer_appartement: {
    titre: "Loyer d'un appartement",
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
  // — Graphiques (une bulle par graphique, réglette, carte…) —
  population_historique: {
    titre: 'Population à chaque recensement',
    source: 'INSEE, séries historiques du recensement, publiées par Tours Métropole',
    calcul: 'population municipale (sans doubles comptes) à chaque recensement',
    millesime: `${premiere(historique.map((h) => h.annee))}-${faits.annee_derniere}`,
  },
  pyramide: {
    titre: 'Pyramide des âges',
    source: 'INSEE, recensement (population par âge et sexe)',
    calcul: "habitants par tranche d'âge et par sexe ; le contour « France » donne la même répartition rapportée à la population de Luynes",
    millesime: String(recensement),
  },
  part_moins_20: {
    titre: 'Moins de 20 ans',
    source: 'INSEE, recensement',
    calcul: 'habitants de moins de 20 ans divisés par la population totale',
    millesime: String(recensement),
  },
  rang_croissance: {
    titre: 'Croissance de la population',
    source: 'INSEE, recensement (via API Melodi)',
    calcul: `évolution de la population municipale entre deux recensements ; rang parmi les ${formatCommunes(rang.nb_communes)} (1 = la plus forte hausse)`,
    millesime: `${rang.annee_debut}-${rang.annee_fin}`,
  },
  rang_population: {
    titre: 'Rang en population',
    source: 'INSEE, populations légales, via l’API Géo',
    calcul: `population municipale ; rang parmi les ${formatCommunes(rang.nb_communes)} (1 = la plus peuplée)`,
    millesime: String(faits.annee_derniere),
  },
  densite_communes: {
    titre: 'Densité des communes',
    source: 'INSEE (population) et IGN (surface), via l’API Géo',
    calcul: 'habitants divisés par la surface de chaque commune, rangées de la plus dense à la moins dense (échelle logarithmique)',
    millesime: String(faits.annee_derniere),
  },
  zone_inondable: {
    titre: 'Zone inondable',
    source: 'Géorisques, territoire à risque important d’inondation (TRI) de Tours, scénario moyen',
    calcul: 'surface de la zone inondable découpée par le contour de la commune, divisée par la surface communale',
    millesime: extraction,
  },
  carte_patrimoine: {
    titre: 'Carte patrimoine et risques',
    source: 'Mérimée (monuments), BRGM / Géorisques (cavités, zone inondable), IGN (contour) ; fond OpenFreeMap',
    calcul: 'positions publiées par chaque base ; les noms des cavités et les adresses privées ne sont pas repris',
    millesime: extraction,
  },
  carte_ventes: {
    titre: 'Carte des ventes',
    source: `${DVF} ; fond OpenFreeMap`,
    calcul: 'une vente = une mutation, placée à la parcelle ; couleur = prix au m² des ventes d’un seul logement',
    millesime: `${resumeImmobilier.annee_debut}-${resumeImmobilier.annee_fin}`,
  },
  ventes_prix_tranches: {
    titre: 'Prix des maisons vendues',
    source: DVF,
    calcul: "ventes d'une seule maison réparties par tranche de prix",
    millesime: prix,
  },
  dpe: {
    titre: 'Étiquettes énergie',
    source: 'ADEME, diagnostics de performance énergétique (DPE) des logements',
    calcul: 'répartition des étiquettes A à G des diagnostics réalisés depuis juillet 2021 ; « passoire » = F ou G',
    millesime: extraction,
  },
  budget_flux: {
    titre: 'Recettes et dépenses',
    source: DGFIP,
    calcul: 'répartition des recettes et des charges de fonctionnement par grand poste, ramenée à 100 €',
    millesime: String(resumeBudget.annee),
  },
  budget_series: {
    titre: 'Budget dans le temps',
    source: DGFIP,
    calcul: `montants par habitant (population DGFiP) chaque année, Luynes et moyenne des communes de même taille`,
    millesime: `${premiere(anneesBudget.map((a) => a.annee))}-${resumeBudget.annee}`,
  },
  actifs: {
    titre: 'Activité des 15-64 ans',
    source: 'INSEE, recensement',
    calcul: 'répartition des 15-64 ans par situation déclarée (emploi, chômage, études, retraite…)',
    millesime: String(resumeRevenus.annee_recensement),
  },
  trajets: {
    titre: 'Trajets domicile-travail',
    source: 'INSEE, recensement (mobilités professionnelles)',
    calcul: 'actifs ayant un emploi, selon le lieu de travail et le mode de transport principal déclarés',
    millesime: String(resumeRevenus.annee_recensement),
  },
  creations: {
    titre: "Créations d'entreprises",
    source: 'INSEE, répertoire des entreprises et des établissements (SIRENE)',
    calcul: "entreprises créées chaque année dans la commune, micro-entreprises comprises",
    millesime: `${premiere(creations.map((c) => c.annee))}-${derniere(creations.map((c) => c.annee))}`,
  },
  accidents_gravite: {
    titre: 'Conséquences des accidents',
    source: 'ONISR (BAAC)',
    calcul: 'accidents classés selon la conséquence la plus grave pour une des personnes impliquées',
    millesime: `${resumeAccidents.annee_debut}-${resumeAccidents.annee_fin}`,
  },
  accidents_detail: {
    titre: 'Accidents en détail',
    source: 'ONISR (BAAC) ; fond de carte OpenFreeMap',
    calcul: 'informations publiées pour chaque accident (sans l’adresse) ; âge = année de l’accident − année de naissance',
    millesime: `${resumeAccidents.annee_debut}-${resumeAccidents.annee_fin}`,
  },
  energie_secteurs: {
    titre: 'Énergie par secteur',
    source: 'Agence ORE (électricité et gaz)',
    calcul: 'consommation annuelle par secteur (résidentiel, tertiaire, industrie, agriculture), ramenée à 100 MWh',
    millesime: String(resumeEnergie.annee_energie),
  },
  energie_series: {
    titre: 'Consommation par logement',
    source: 'Agence ORE',
    calcul: 'consommation résidentielle divisée par le nombre de points de livraison résidentiels, chaque année',
    millesime: `${premiere(anneesEnergie.map((a) => a.annee))}-${resumeEnergie.annee_energie}`,
  },
  parc_voitures: {
    titre: 'Voitures par motorisation',
    source: 'SDES, parc de véhicules par commune',
    calcul: 'voitures particulières immatriculées dans la commune au 1er janvier, par motorisation et vignette Crit’Air',
    millesime: `1er janvier ${resumeEnergie.annee_parc}`,
  },
  elections_resultats: {
    titre: 'Résultats des élections',
    source: "Ministère de l'Intérieur, résultats officiels par bureau de vote",
    calcul: 'voix de chaque candidat ou liste divisées par les suffrages exprimés ; candidats sous 3 % partout regroupés',
    millesime: `${premiere(participations.map((p) => p.annee))}-${derniere(participations.map((p) => p.annee))}`,
  },
  delinquance_indicateur: {
    titre: 'Délinquance par indicateur',
    source: "SSMSI (ministère de l'Intérieur), base communale",
    calcul: 'faits enregistrés au lieu de commission, en moyenne par an, divisés par la population (ou les logements pour les cambriolages) × 1 000 ; années non publiées en pointillé',
    millesime: `${delinquanceDebut}-${delinquanceFin}`,
  },
  logements_commences: {
    titre: 'Logements mis en chantier',
    source: 'SDES (ministère de la Transition écologique), base Sitadel des permis de construire',
    calcul: 'logements commencés chaque année d’après les déclarations d’ouverture de chantier, en date de prise en compte administrative ; « collectif » = appartements ; années complètes seulement',
    millesime: `${resumeConstruction.annee_debut}-${resumeConstruction.annee_fin}`,
  },
  logements_sociaux: {
    titre: 'Logements sociaux',
    source: 'SDES, répertoire des logements locatifs des bailleurs sociaux (RPLS)',
    calcul: 'logements des bailleurs sociaux situés dans la commune au 1er janvier du dernier millésime publié',
    millesime: extraction,
  },
  evolution_ages: {
    titre: 'Évolution des âges',
    source: 'INSEE, recensement',
    calcul: 'part des 65 ans et plus et des moins de 20 ans dans la population, à deux recensements',
    millesime: `${premiere(evolutionAges.map((a) => a.annee))}-${derniere(evolutionAges.map((a) => a.annee))}`,
  },
  ips: {
    titre: 'Indice de position sociale (IPS)',
    source: 'Éducation nationale (DEPP), IPS des écoles et collèges',
    calcul: 'indice calculé à partir des professions des parents d’élèves (plus il est élevé, plus le milieu social est favorisé) ; référence : moyenne des établissements du même secteur dans le département',
    millesime: [...new Set(ipsEtablissements.map((e) => e.rentree))].join(', '),
  },
  participation: {
    titre: 'Participation',
    source: "Ministère de l'Intérieur, résultats officiels par bureau de vote",
    calcul: 'votants divisés par les inscrits au 1er tour ; rang parmi les communes du département',
    millesime: `${premiere(participations.map((p) => p.annee))}-${derniere(participations.map((p) => p.annee))}`,
  },
  gaz: {
    titre: 'Gaz par logement raccordé',
    source: 'Agence ORE (GRDF et autres gestionnaires)',
    calcul: 'consommation de gaz du secteur résidentiel divisée par le nombre de points de livraison résidentiels',
    millesime: String(resumeEnergie.annee_energie),
  },
  anecdotes: {
    titre: 'Le saviez-vous ?',
    source: 'les mêmes données publiques que les chiffres de la page (détail dans « Sources et méthode » et en pied de page)',
    calcul: 'phrases calculées automatiquement à partir des chiffres publiés, sans aucun chiffre écrit à la main',
    millesime: extraction,
  },
  eau_conformite: {
    titre: 'Conformité bactériologique',
    source: HUBEAU,
    calcul: "part des prélèvements d'eau du robinet conformes aux limites sanitaires pour les bactéries, parmi ceux où elles ont été contrôlées ; comparaison : analyses E. coli de tout le département",
    millesime: `${resumeEau.annee_debut}-${resumeEau.annee_fin} (comparaison ${resumeEau.fenetre_debut}-${resumeEau.fenetre_fin})`,
  },
  eau_physico: {
    titre: 'Conformité physico-chimique',
    source: HUBEAU,
    calcul: 'part des prélèvements conformes aux limites sanitaires physico-chimiques (nitrates, métaux, pesticides…)',
    millesime: `${resumeEau.annee_debut}-${resumeEau.annee_fin}`,
  },
  eau_prelevements: {
    titre: "Prélèvements d'eau",
    source: HUBEAU,
    calcul: "nombre d'échantillons d'eau prélevés sur le réseau qui alimente Luynes et analysés par le contrôle sanitaire, par année",
    millesime: `${resumeEau.annee_debut}-${resumeEau.annee_fin}`,
  },
  eau_nitrates: {
    titre: 'Nitrates',
    source: HUBEAU,
    calcul: 'moyenne des mesures de nitrates (mg/L) ; les valeurs sous le seuil de détection comptent pour 0 ; département : moyenne de toutes ses analyses, classement : moyenne de chaque commune',
    millesime: `${resumeEau.fenetre_debut}-${resumeEau.fenetre_fin}`,
  },
  eau_durete: {
    titre: 'Calcaire (dureté)',
    source: HUBEAU,
    calcul: 'moyenne du titre hydrotimétrique (°f, degrés français) mesuré ; département : moyenne de toutes ses analyses',
    millesime: `${resumeEau.fenetre_debut}-${resumeEau.fenetre_fin}`,
  },
  depenses_postes: {
    titre: 'Où vont 100 € de dépenses',
    source: BALANCES,
    calcul: `dépenses de fonctionnement payées dans l'année, regroupées par grandes natures de dépenses (comptes 60 à 67, hors amortissements et provisions, qui n'impliquent aucune sortie d'argent), ramenées à 100 € ; plan comptable M14 jusqu'en 2023, M57 ensuite, rapprochés par leurs premiers chiffres`,
    millesime: balances,
  },
  elus_indemnites: {
    titre: 'Indemnités des élus',
    source: BALANCES + ', compte 6531 (M14) puis 65311 (M57)',
    calcul: `indemnités versées aux élus dans l'année, divisées par la population retenue par la DGFiP (${formatNumber(resumeBudget.population)} habitants) ; comparaison : total des indemnités des communes de même taille (strate DGFiP, toute la France) divisé par leur population, et médiane des communes d'Indre-et-Loire (communes ayant une écriture sur ce compte)`,
    millesime: String(comparaison('indemnites').annee),
  },
  subventions_associations: {
    titre: 'Subventions aux associations',
    source: BALANCES + ', compte 6574 (M14) puis 65748 (M57) ; CCAS : 657362 puis 657363',
    calcul: `subventions de fonctionnement versées dans l'année, divisées par la population retenue par la DGFiP ; comparaison : même méthode que les indemnités des élus. Le détail association par association n'est pas repris sur ce site`,
    millesime: String(comparaison('associations').annee),
  },
  marches_plafonds: {
    titre: 'Marchés publics attribués',
    source: 'données essentielles de la commande publique consolidées (DECP, data.gouv.fr), marchés dont l\'acheteur est la mairie de Luynes',
    calcul: `nombre de marchés publiés (version à jour de chaque marché). Le montant affiché est le plafond du contrat : jamais une dépense, jamais additionné. La base ne contient que les marchés dont la commune a publié les données, à partir de ${formatMonthYear(new Date(premierePublication))} : les marchés plus anciens n'y figurent pas`,
    millesime: `marchés notifiés depuis ${formatMonthYear(new Date(premiereNotification))}`,
  },
  appels_offres: {
    titre: "Appels d'offres publiés",
    source: 'DILA, bulletin officiel des annonces de marchés publics (BOAMP)',
    calcul: "avis d'appel d'offres initiaux publiés par la mairie (sans les avis rectificatifs ni les avis d'attribution), comptés par année de parution",
    millesime: `${Math.min(...appelsOffres.map((a) => a.annee))}-${Math.max(...appelsOffres.map((a) => a.annee))}`,
  },
  conseil_parite: {
    titre: 'Conseil municipal',
    source: RNE,
    calcul: `nombre de conseillers (maire et adjoints compris) et part des femmes ; comparaison : part des femmes parmi les habitants de 18 ans et plus (recensement ${conseil.annee_recensement}, INSEE)`,
    millesime: `mandat en cours depuis le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(conseil.debut_mandat))} ; ${extraction}`,
  },
  conseil_ages: {
    titre: 'Âge des élus',
    source: RNE + ' ; INSEE, recensement (population par âge)',
    calcul: `âge des élus à la date de construction du site (la date de naissance n'est jamais publiée), regroupé en trois tranches ; comparaison : habitants de 18 ans et plus (recensement ${conseil.annee_recensement})`,
    millesime: extraction,
  },
  conseil_professions: {
    titre: 'Professions des élus',
    source: RNE,
    calcul: 'catégorie socioprofessionnelle déclarée, regroupée en grandes catégories de l\'INSEE (les anciens cadres, anciens employés… sont classés avec les retraités)',
    millesime: extraction,
  },
  sport_licences: {
    titre: 'Licences sportives',
    source: INJEP,
    calcul: `licences délivrées aux habitants de Luynes (une personne licenciée dans deux fédérations compte deux fois), divisées par la population légale (${formatNumber(resumeSport.population)} habitants) ; comparaison : toutes les communes d'Indre-et-Loire ; classement : 1ʳᵉ = le plus de licences par habitant, communes sans licence comprises`,
    millesime: String(resumeSport.annee_fin),
  },
  sport_federations: {
    titre: 'Podium des fédérations',
    source: INJEP,
    calcul: "licences par fédération ; les fédérations du sport scolaire et universitaire (UNSS, UGSEL, USEP…, codes 6xx) sont présentées à part du podium mais comptées dans le total",
    millesime: String(resumeSport.annee_fin),
  },
  sport_parite: {
    titre: 'Femmes et hommes',
    source: INJEP,
    calcul: 'part des femmes dans les licences dont le sexe est connu ; comparaison : toutes les licences d\'Indre-et-Loire',
    millesime: String(resumeSport.annee_fin),
  },
  sport_ages: {
    titre: 'Âge des licenciés',
    source: INJEP,
    calcul: "licences regroupées en cinq tranches d'âge (les âges inconnus sont écartés) ; part de chaque tranche à Luynes et en Indre-et-Loire",
    millesime: String(resumeSport.annee_fin),
  },
  sport_evolution: {
    titre: 'Licences par année',
    source: INJEP,
    calcul: "nombre de licences de chaque année publiée ; indice : première année = 100, à Luynes et en Indre-et-Loire. Les années 2020 et 2021 sont marquées par la crise sanitaire",
    millesime: licencesAnnees,
  },
  sport_equipements: {
    titre: 'Équipements sportifs',
    source: RES,
    calcul: `équipements recensés à Luynes (une ligne du RES = un équipement ; certaines lignes n'ont ni type ni position), pour 1 000 habitants ; comparaison et classement : toutes les communes d'Indre-et-Loire, communes sans équipement comprises`,
    millesime: `recensement consulté en ${formatMonthYear(generatedAt)}`,
  },
  sport_types: {
    titre: "Types d'équipements",
    source: RES,
    calcul: "équipements regroupés par famille du RES ; à défaut de type renseigné, par première activité sportive citée",
    millesime: `recensement consulté en ${formatMonthYear(generatedAt)}`,
  },
  sport_frise: {
    titre: 'Mise en service des équipements',
    source: RES,
    calcul: `équipements classés par période de mise en service (l'année exacte, quand elle est renseignée, désigne la période) ; ${formatNumber(resumeSport.equipements - periodesEquipements.reduce((total, p) => total + p.nombre, 0))} sans date connue`,
    millesime: `recensement consulté en ${formatMonthYear(generatedAt)}`,
  },
  sport_carte: {
    titre: 'Carte des équipements',
    source: RES + ' ; fond de carte OpenFreeMap (© OpenStreetMap)',
    calcul: "un point par équipement localisé ; les équipements sans coordonnées figurent dans la liste",
    millesime: `recensement consulté en ${formatMonthYear(generatedAt)}`,
  },
  rues_noms: {
    titre: 'Voies, lieux-dits et adresses',
    source: BAN,
    calcul: "un nom de voie ou de lieu-dit compte une fois, quel que soit son nombre d'adresses ; « voie » si le nom commence par rue, chemin, impasse, place, avenue, allée, route ou square, « lieu-dit ou quartier » sinon (la BAN ne fait pas la différence) ; une adresse = un numéro de la base",
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  rues_types: {
    titre: 'Types de voies',
    source: BAN,
    calcul: 'noms de voies regroupés d\'après leur premier mot (rue, chemin, impasse, place…) ; les autres noms sont comptés comme lieux-dits ou quartiers',
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  rues_classement: {
    titre: 'Noms les plus « peuplés »',
    source: BAN,
    calcul: "nombre d'adresses (numéros) rattachées à chaque nom de voie ou de lieu-dit ; ce n'est ni la longueur de la voie, ni le nombre d'habitants",
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  rues_femmes: {
    titre: 'Voies portant un nom de femme',
    source: `${BAN} ; ${REFERENCE_RUES}`,
    calcul: `parmi les ${formatNumber(resumeRues.voies_de_personnes)} voies dont le nom est celui d'une personne, nombre de voies dont la personne est une femme ; le sexe est déduit du prénom ou du titre (« Saint ») ; ${formatNumber(resumeRues.voies_sexe_indetermine)} voies restent sans sexe déterminé (prénom absent ou ambigu) ; les noms de lieux-dits ne sont pas comptés`,
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  rues_personnes: {
    titre: 'Personnes honorées',
    source: `${BAN} ; ${REFERENCE_RUES}`,
    calcul: `voies dont le nom est celui d'une personne, regroupées par catégorie ; une personne dont l'identité n'est pas établie avec certitude est classée « Non déterminé » (${formatNumber(resumeRues.voies_sans_categorie)} voies) ; deux voies peuvent honorer la même personne`,
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  rues_jumelage: {
    titre: 'Voies qui évoquent d\'autres communes',
    source: `${BAN} ; ${REFERENCE_RUES} ; villes jumelées : site de la commune (luynes.fr, comité de jumelages)`,
    calcul: 'voies dont le nom est celui d\'une ville jumelée avec Luynes, ou d\'une autre commune nommée Luynes',
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  rues_curiosites: {
    titre: 'Noms qui intriguent',
    source: `${BAN} ; choix éditorial (${REFERENCE_RUES})`,
    calcul: "sélection de noms au pouvoir d'évocation, sans explication d'origine (elle n'est pas dans les données) ; orthographe de la base",
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  rues_carte: {
    titre: 'Carte des voies et lieux-dits',
    source: BAN + ' ; fond de carte OpenFreeMap (© OpenStreetMap)',
    calcul: "un point par nom de voie ou de lieu-dit, placé sur l'adresse la plus proche du milieu de ses adresses (le tracé exact des voies n'est pas dans la base)",
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
} as const satisfies Record<string, Methode>;

export type CleMethode = keyof typeof METHODES;

export function methode(cle: CleMethode): Methode {
  return METHODES[cle];
}

/** Méthodes affichées dans la section « Sources et méthode » de chaque page (dans l'ordre des chiffres clés). */
const PAR_PAGE: Record<string, readonly CleMethode[]> = {
  accueil: ['population', 'age_median', 'naissances', 'superficie', 'densite', 'monuments', 'cavites', 'prix_m2_maison', 'ventes', 'depenses', 'niveau_vie', 'accidents_taux', 'voitures_electriques', 'equipements', 'eleves', 'participation_pres', 'delinquance_bilan', 'eau_conformite', 'logements_commences', 'elus_indemnites', 'conseil_parite', 'sport_licences', 'sport_equipements', 'rues_noms'],
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
  eau: ['eau_conformite', 'eau_physico', 'eau_prelevements', 'eau_nitrates', 'eau_durete'],
  construction: ['logements_commences', 'logements_sociaux'],
  sport: ['sport_licences', 'sport_federations', 'sport_parite', 'sport_ages', 'sport_evolution', 'sport_equipements', 'sport_types', 'sport_frise', 'sport_carte'],
  rues: ['rues_noms', 'rues_femmes', 'rues_types', 'rues_classement', 'rues_personnes', 'rues_jumelage', 'rues_curiosites', 'rues_carte'],
  transparence: ['depenses_postes', 'elus_indemnites', 'subventions_associations', 'marches_plafonds', 'appels_offres', 'conseil_parite', 'conseil_ages', 'conseil_professions'],
};

export function methodesDePage(page: string): Methode[] {
  return (PAR_PAGE[page] ?? []).map(methode);
}

/** Toutes les méthodes (utilisé par les tests de cohérence). */
export const TOUTES_LES_METHODES: readonly Methode[] = Object.values(METHODES);
