/**
 * « Source · Calcul · Millésime » de chaque chiffre clé du site.
 * Affiché dans la bulle ⓘ des chiffres clés (KeyFigure) et dans la section « Sources et méthode » en bas de page.
 * Les années sont toujours lues dans les données (jamais écrites à la main) : elles suivent les mises à jour.
 */
import { commune, generatedAt, rang } from './commune';
import { agesDe, derniereAnneeEtatCivil, evolutionAges, faits, historique } from './population';
import { resumeObjets, resumeRisques } from './patrimoine';
import { loyerMaison, resumeImmobilier } from './immobilier';
import { anneesBudget, resumeBudget } from './budget';
import { creations, resumeRevenus } from './revenus';
import { resumeAccidents } from './accidents';
import { cantinesEcoles, ipsEtablissements, mediatheque, resumeEquipements } from './equipements';
import { anneesEnergie, resumeEnergie } from './energie';
import { dernierDe, participations, resumeElections } from './elections';
import { periodeDelinquance } from './delinquance';
import { resumeEau, resumePompage } from './eau';
import { resumeConstruction } from './construction';
import { appelsOffres, comparaison, conseil, premiereNotification, premierePublication } from './budget-vie-municipale';
import { periodesEquipements, resumeSport } from './sport';
import { resumeRues } from './rues';
import { resumeBiodiversite, resumeNature } from './nature';
import { derniereAnneeCovoiturage, dernierTrimestreFibre, premierTrimestreFibre, resumeDae, resumeFibre, resumeMobilier } from './quotidien';
import { formatCommunes, formatMonthYear, formatNumber, formatOneDecimal } from '../lib/format';

export interface Methode {
  /** Nom court du chiffre, ex. « Habitants » */
  titre: string;
  source: string;
  calcul: string;
  millesime: string;
}

/** « de mars 2026 » / « d'avril 2026 » (élision devant une voyelle). */
const deMois = (date: Date): string => {
  const mois = formatMonthYear(date);
  return /^[aeiouyéèêô]/i.test(mois) ? `d'${mois}` : `de ${mois}`;
};
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
const PALISSY = 'ministère de la Culture, base Palissy (objets mobiliers protégés au titre des monuments historiques), via la plateforme POP';
const SLL = 'ministère de la Culture, Service du livre et de la lecture (enquête annuelle sur les bibliothèques des collectivités territoriales)';
const MA_CANTINE_SOURCE = 'ministère de l\'Agriculture, Ma Cantine (télédéclarations des cantines, loi EGalim)';
const BNPE = "Banque nationale des prélèvements en eau (BNPE, OFB), via l'API Hub'eau « prélèvements »";
const BALANCES = 'DGFiP, balances comptables des communes (budget principal)';
const RNE = 'ministère de l\'Intérieur, répertoire national des élus (conseillers municipaux)';
const INJEP = 'INJEP / ministère des Sports, recensement des licences auprès des fédérations sportives agréées (par commune de résidence)';
const RES = 'ministère des Sports, recensement des équipements sportifs (RES, « Data ES »)';
const BAN = 'Base Adresse Nationale (BAN, IGN / DINUM), adresses du code INSEE 37139';
const REFERENCE_RUES = 'table de correspondance écrite à la main (data/reference/noms-de-rues.csv), limitée aux cas certains';
const INPN = 'MNHN / INPN (inventaire national du patrimoine naturel), via l\'API Carto « nature » de l\'IGN';
const RPG = 'IGN, registre parcellaire graphique (RPG : parcelles agricoles déclarées par les exploitants, Géoplateforme)';
const INAO_AOC = 'INAO, délimitation parcellaire des AOC viticoles, diffusée par la Géoplateforme de l\'IGN';
const GBIF = 'GBIF (Global Biodiversity Information Facility) : observations d\'espèces partagées par des naturalistes, associations et programmes de sciences participatives';
const DECOUPE = 'toutes les formes sont découpées au contour exact de la commune (calcul géographique DuckDB, projection Lambert 93) ; les terrains relevant de plusieurs zonages ne sont comptés qu\'une fois';
const licencesAnnees = `${resumeSport.annee_debut}-${resumeSport.annee_fin}`;
const ARCEP = 'ARCEP, « Ma connexion internet » (éligibilité des locaux aux technologies fixes, par commune et par trimestre)';
const GEODAE = "ministère de la Santé, Géo'DAE (base nationale des défibrillateurs automatisés externes, déclarés par leurs exploitants)";
const RPC = 'Registre de preuve de covoiturage, via le tableau de bord des mobilités durables (trajets de covoiturage intermédié par plateforme)';
const TOURS_OPEN_DATA = 'Tours Métropole Val de Loire, portail open data (inventaires de la métropole)';
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
    calcul: `dépenses d'équipement de l'année (acquisitions et travaux d'équipement, y compris les subventions d'équipement versées à d'autres organismes, comptes 204) divisées par la ${POPULATION_DGFIP}. En ${resumeBudget.annee} : ${formatNumber(resumeBudget.equipement_subventions)} € de subventions d'équipement versées sur ${formatNumber(resumeBudget.equipement)} € ; hors subventions, ${resumeBudget.equipement_hors_subventions_hab} € par habitant (au lieu de ${resumeBudget.equipement_hab} €). La moyenne des communes de même taille suit la même définition`,
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
    millesime: `1er janvier ${resumeConstruction.annee_rpls} (extraction de ${formatMonthYear(generatedAt)})`,
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
    calcul: "part des prélèvements d'eau du robinet conformes aux limites sanitaires pour les bactéries, parmi ceux dont la bactériologie a été évaluée (${resumeEau.evalues_bact} sur ${resumeEau.prelevements} prélèvements ; les autres n'ont pas de conclusion bactériologique) ; comparaison : analyses E. coli de tout le département",
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
  eau_pompage: {
    titre: 'Eau puisée sous Luynes',
    source: BNPE,
    calcul: "somme des volumes (m³) déclarés par les préleveurs pour les ouvrages situés sur la commune (code INSEE 37139), par année ; seuls les prélèvements « réalisés » sont retenus ; eau potable = ouvrages d'alimentation en eau potable, irrigation = arrosage agricole",
    millesime: `${resumePompage.annee_debut}-${resumePompage.annee} (dernière année déclarée)`,
  },
  eau_pompage_piscines: {
    titre: "Eau puisée, en piscines olympiques",
    source: BNPE,
    calcul: `volume d'eau potable prélevé la dernière année déclarée (${formatNumber(resumePompage.potable_m3)} m³) divisé par ${formatNumber(resumePompage.m3_piscine_olympique)} m³ (une piscine olympique : 50 m × 25 m × 2 m) ; l'eau puisée sous la commune n'est pas forcément consommée à Luynes (réseau partagé avec d'autres communes)`,
    millesime: String(resumePompage.annee),
  },
  eau_pompage_ouvrages: {
    titre: 'Ouvrages de prélèvement',
    source: BNPE,
    calcul: "liste des ouvrages (forages, puits, prises) situés à Luynes ; dernier volume déclaré pour chacun, avec son année (un volume de 0 = ouvrage déclaré mais non utilisé cette année-là)",
    millesime: `${resumePompage.annee_debut}-${resumePompage.annee}`,
  },
  objets_proteges: {
    titre: 'Objets mobiliers protégés',
    source: PALISSY,
    calcul: "nombre de notices de la base Palissy rattachées à Luynes (code INSEE 37139 de la commune d'origine de la notice) ; une notice décrit un objet ou un ensemble (ex. « quinze verrières ») : ce n'est donc pas un compte de pièces",
    millesime: `protections de ${resumeObjets.premiere_protection} à ${resumeObjets.derniere_protection} ; base consultée en ${formatMonthYear(generatedAt)}`,
  },
  objets_siecles: {
    titre: 'Siècle de création des objets protégés',
    source: PALISSY,
    calcul: "nombre de notices par siècle de création (premier siècle cité quand l'objet en couvre deux) ; les objets sans siècle renseigné ne sont pas comptés",
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  objets_liste: {
    titre: 'Liste des objets protégés',
    source: PALISSY,
    calcul: "une tuile par notice : intitulé, siècle de création, lieu de conservation (édifice) et année de protection (première date citée) ; « classé » = protection la plus forte, « inscrit » = protection moindre",
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  mediatheque_prets: {
    titre: 'Prêts de la médiathèque',
    source: SLL,
    calcul: "prêts de documents de l'année (livres, CD, DVD…) déclarés par la médiathèque municipale ; « par habitant » = prêts divisés par la population légale de Luynes (API Géo) ; emprunteurs en % = emprunteurs actifs divisés par la même population",
    millesime: `enquête ${mediatheque?.annee ?? 'la plus récente'} (année lue dans la description du jeu)`,
  },
  mediatheque_collections: {
    titre: 'Collections et accueil de la médiathèque',
    source: SLL,
    calcul: "nombre de livres, CD et DVD des collections, surface, places assises, postes informatiques et heures d'ouverture hebdomadaires habituelles, tels que déclarés par la médiathèque",
    millesime: `enquête ${mediatheque?.annee ?? 'la plus récente'}`,
  },
  cantines_bio: {
    titre: 'Cantines : produits bio et durables',
    source: MA_CANTINE_SOURCE,
    calcul: "part, dans les achats alimentaires déclarés, des produits bio et des produits « durables et de qualité » (bio + autres labels EGalim), moyenne des cuisines qui servent les écoles de Luynes ; une cuisine centrale qui approvisionne plusieurs écoles compte pour une ; objectifs de la loi EGalim : 50 % de produits durables et de qualité dont 20 % de bio",
    millesime: `télédéclaration ${cantinesEcoles?.annee ?? 'la plus récente'}`,
  },
  cantines_liste: {
    titre: 'Liste des cantines de Luynes',
    source: MA_CANTINE_SOURCE,
    calcul: "une ligne par cantine de Luynes ayant télédéclaré ; une cantine servie par une cuisine centrale déclare les chiffres de cette cuisine, d'où des valeurs identiques pour plusieurs sites",
    millesime: `télédéclaration ${cantinesEcoles?.annee ?? 'la plus récente'}`,
  },
  elus_indemnites: {
    titre: 'Indemnités des élus',
    source: BALANCES + ', compte 6531 (M14) puis 65311 (M57)',
    calcul: `indemnités versées aux élus dans l'année, divisées par la ${POPULATION_DGFIP} ; comparaison : total des indemnités des communes de même taille (strate DGFiP, toute la France) divisé par leur population, et médiane des communes d'Indre-et-Loire (communes ayant une écriture sur ce compte)`,
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
    calcul: `nombre de marchés publiés (version à jour de chaque marché). Le montant affiché est le plafond du contrat : jamais une dépense, jamais additionné. Certains plafonds sont des valeurs techniques d'accord-cadre (nombre composé uniquement de 9, ou un million divisé par 1,1), sans lien avec la dépense réelle. La base ne contient que les marchés dont la commune a publié les données, à partir ${deMois(new Date(premierePublication))} : les marchés plus anciens n'y figurent pas`,
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
    calcul: `âge des élus à la date de construction du site (la date de naissance n'est jamais publiée), regroupé en trois tranches ; comparaison : habitants de 18 ans et plus (recensement ${conseil.annee_recensement}, âge en années entières comme pour les élus ; les élus sont donc plus récents de quelques années)`,
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
  nature_protege: {
    titre: 'Part de la commune classée ou inventoriée',
    source: INPN,
    calcul: `hectares de Luynes situés dans au moins une ZNIEFF (inventaire scientifique, sans valeur réglementaire) ou un site Natura 2000 (réseau européen de sites gérés par contrat), divisés par la surface de la commune (${formatNumber(resumeNature.surface_commune_ha)} ha, calculés en projection Lambert 93 ; l'API Géo indique ${formatOneDecimal(commune.surface_km2)} km², arrondi à l'hectomètre carré) ; ${DECOUPE}`,
    millesime: `zonages consultés en ${formatMonthYear(generatedAt)}`,
  },
  nature_zonages: {
    titre: 'Zones naturelles de Luynes',
    source: INPN,
    calcul: `pour chaque zone qui touche la commune : hectares situés à Luynes (et non la surface totale de la zone, qui déborde sur d'autres communes) et part de la commune ; les zones de moins d'un hectare à Luynes sont écartées ; ${DECOUPE}`,
    millesime: `zonages consultés en ${formatMonthYear(generatedAt)}`,
  },
  nature_agricole: {
    titre: 'Terres agricoles déclarées',
    source: RPG,
    calcul: `surface des parcelles déclarées à Luynes (parcelles découpées au contour de la commune), divisée par la surface de la commune ; seules les parcelles déclarées par les exploitants au titre des aides agricoles sont connues : le registre ne couvre pas toutes les terres cultivées. Comparaison avec ${resumeNature.annee_rpg_ancienne}`,
    millesime: String(resumeNature.annee_rpg),
  },
  nature_cultures: {
    titre: 'Cultures déclarées',
    source: RPG,
    calcul: `surface de chaque famille de cultures (nomenclature du RPG) à Luynes ; part de la surface agricole déclarée. Les cultures tournent d'une année sur l'autre : comparer ${resumeNature.annee_rpg_ancienne} et ${resumeNature.annee_rpg} montre des équilibres, pas des choix individuels. La surface totale déclarée varie surtout avec les surfaces gelées (jachères, famille « Gel ») : ${resumeNature.gel_ancienne_ha} ha en ${resumeNature.annee_rpg_ancienne}, ${resumeNature.gel_ha} ha en ${resumeNature.annee_rpg} ; hors gel, la surface déclarée passe de ${resumeNature.agricole_hors_gel_ancienne_ha} à ${resumeNature.agricole_hors_gel_ha} ha`,
    millesime: `${resumeNature.annee_rpg_ancienne} et ${resumeNature.annee_rpg}`,
  },
  nature_aoc: {
    titre: 'Vignobles AOC',
    source: INAO_AOC,
    calcul: `hectares de Luynes situés dans les parcelles délimitées pour produire l'appellation (découpés au contour de la commune) ; cela désigne un droit de produire, pas des vignes plantées (voir les vignes déclarées au RPG) ; une même parcelle peut porter plusieurs appellations`,
    millesime: `délimitation consultée en ${formatMonthYear(generatedAt)}`,
  },
  nature_especes: {
    titre: 'Espèces observées',
    source: GBIF,
    calcul: `espèces différentes observées dans le contour de la commune (simplifié à ≈ 20 m près) ; ce sont des observations rapportées, qui reflètent surtout les lieux fréquentés et les observateurs actifs, pas un inventaire complet. ${formatNumber(resumeBiodiversite.observations)} observations au total (les enregistrements GBIF d'« absence », où l'espèce a été cherchée sans être retrouvée, sont écartés), dont ${formatNumber(resumeBiodiversite.observations_humaines_pct, 1)} % par des personnes (le reste : spécimens de collections, capteurs…)`,
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  nature_groupes: {
    titre: 'Groupes observés',
    source: GBIF,
    calcul: 'observations regroupées par classe taxonomique (oiseaux, insectes, plantes à fleurs…) ; une observation = un signalement, pas un individu ; les plantes sont davantage observées car elles ne bougent pas',
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  nature_top: {
    titre: 'Espèces les plus observées',
    source: GBIF,
    calcul: 'espèces classées par nombre d\'observations (noms scientifiques, sans le nom de l\'auteur) : les plus fréquentes sont les plus faciles à voir ou à reconnaître',
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  nature_menacees: {
    titre: 'Espèces classées sur la liste rouge mondiale',
    source: GBIF + ' ; statut : liste rouge mondiale de l\'UICN',
    calcul: 'espèces observées à Luynes et classées vulnérables, en danger ou en danger critique à l\'échelle du monde ; ce statut mondial ne dit rien de leur situation locale (une espèce peut être courante à Luynes), ni du statut en France',
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  nature_carte: {
    titre: 'Carte de la nature',
    source: INPN + ' ; ' + RPG + ' ; ' + INAO_AOC + ' ; fond de carte OpenFreeMap (© OpenStreetMap)',
    calcul: 'formes découpées à la limite de la commune et légèrement allégées (≈ 5 m) pour la carte ; prairies = prairies permanentes du RPG',
    millesime: `zonages et délimitation consultés en ${formatMonthYear(generatedAt)} ; cultures ${resumeNature.annee_rpg}`,
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
  quotidien_fibre: {
    titre: 'Locaux raccordables à la fibre',
    source: ARCEP,
    calcul: `locaux (logements, entreprises, équipements…) que l'ARCEP recense à Luynes et qui peuvent être raccordés à la fibre jusqu'au domicile (FttH), divisés par l'ensemble des locaux recensés (${formatNumber(resumeFibre.locaux)}) ; « raccordable » ne veut pas dire « raccordé » : l'abonnement reste un choix de chaque occupant. Même calcul pour l'Indre-et-Loire (somme des communes) et rang parmi les ${formatNumber(resumeFibre.nb_communes)} communes`,
    millesime: dernierTrimestreFibre + ' (état au ' + resumeFibre.date_fin.split('-').reverse().join('/') + ')',
  },
  quotidien_fibre_evolution: {
    titre: 'Évolution de la fibre',
    source: ARCEP,
    calcul: 'part de locaux raccordables à la fibre à chaque publication : le même trimestre chaque année au début de la série, puis chaque trimestre ; une part qui recule d\'une publication à l\'autre peut venir de la mise à jour du recensement des locaux',
    millesime: `${premierTrimestreFibre} à ${dernierTrimestreFibre}`,
  },
  quotidien_dae: {
    titre: 'Défibrillateurs',
    source: GEODAE,
    calcul: `défibrillateurs fixes en fonctionnement situés à Luynes (doublons signalés par la base et appareils mobiles écartés), pour 1 000 habitants (population légale) ; les communes sans défibrillateur comptent pour 0 dans le classement parmi les ${formatNumber(resumeDae.nb_communes)} communes. La base dépend des déclarations des exploitants : un appareil non déclaré n'y figure pas, et inversement un appareil retiré peut y rester`,
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  quotidien_dae_acces: {
    titre: 'Accès aux défibrillateurs',
    source: GEODAE,
    calcul: 'position « extérieur » ou « intérieur » déclarée par l\'exploitant ; accès 24 h/24 quand les horaires de la base valent « 24/7 » (l\'autre valeur courante, « off », signifie que l\'accès permanent n\'est pas déclaré : ce n\'est pas la preuve que l\'appareil est inaccessible)',
    millesime: `base consultée en ${formatMonthYear(generatedAt)}`,
  },
  quotidien_covoiturage: {
    titre: 'Covoiturage',
    source: RPC,
    calcul: `trajets effectués en covoiturage par l'intermédiaire de plateformes numériques (couples conducteur/passager enregistrés au registre) dont Luynes est la commune de départ ; ne comprend pas le covoiturage organisé entre connaissances. Les volumes varient beaucoup d'une année à l'autre selon les opérateurs et les incitations : à lire comme un ordre de grandeur. Pour 1 000 habitants : population légale actuelle (${formatNumber(derniereAnneeCovoiturage.trajets_37)} trajets dans le département en ${derniereAnneeCovoiturage.annee})`,
    millesime: `${derniereAnneeCovoiturage.annee} (série depuis 2022)`,
  },
  quotidien_verre: {
    titre: 'Points d\'apport volontaire du verre',
    source: TOURS_OPEN_DATA,
    calcul: `conteneurs à verre recensés à Luynes ; habitants par point = population légale ÷ nombre de points, comparé à l'ensemble des ${formatNumber(resumeMobilier.verre_nb_communes)} communes de la métropole recensées (${formatNumber(resumeMobilier.verre_points_metropole)} points). Un point peut compter plusieurs conteneurs ; le dernier ramassage ou la taille des conteneurs ne sont pas connus`,
    millesime: `inventaire consulté en ${formatMonthYear(generatedAt)}`,
  },
  quotidien_mobilier: {
    titre: 'Bancs et autres équipements',
    source: TOURS_OPEN_DATA,
    calcul: 'bancs publics et point d\'apport volontaire du textile recensés à Luynes ; pas de comparaison : l\'inventaire des bancs est très inégal d\'une commune à l\'autre de la métropole (certaines en comptent quelques unités), il ne dit donc pas combien de bancs existent réellement',
    millesime: `inventaire consulté en ${formatMonthYear(generatedAt)}`,
  },
  quotidien_carte: {
    titre: 'Carte de la vie quotidienne',
    source: GEODAE + ' ; ' + TOURS_OPEN_DATA + ' ; fond de carte OpenFreeMap (© OpenStreetMap)',
    calcul: 'un point par défibrillateur, point d\'apport volontaire ou banc recensé ; positions telles que publiées par les producteurs',
    millesime: `bases consultées en ${formatMonthYear(generatedAt)}`,
  },
} as const satisfies Record<string, Methode>;

export type CleMethode = keyof typeof METHODES;

export function methode(cle: CleMethode): Methode {
  return METHODES[cle];
}

/** Méthodes affichées dans la section « Sources et méthode » de chaque page (dans l'ordre des chiffres clés). */
const PAR_PAGE: Record<string, readonly CleMethode[]> = {
  accueil: ['population', 'age_median', 'naissances', 'superficie', 'densite', 'monuments', 'cavites', 'prix_m2_maison', 'ventes', 'depenses', 'niveau_vie', 'accidents_taux', 'voitures_electriques', 'equipements', 'eleves', 'participation_pres', 'delinquance_bilan', 'eau_conformite', 'logements_commences', 'elus_indemnites', 'conseil_parite', 'sport_licences', 'sport_equipements', 'nature_protege', 'nature_especes', 'rues_noms', 'quotidien_fibre', 'quotidien_dae'],
  population: ['population', 'multiplie_1968', 'age_median', 'part_65', 'naissances'],
  territoire: ['superficie', 'densite'],
  'patrimoine-risques': ['monuments', 'objets_proteges', 'objets_siecles', 'objets_liste', 'cavites', 'catnat', 'mouvements'],
  immobilier: ['prix_m2_maison', 'prix_maison', 'ventes', 'loyer_maison'],
  budget: ['depenses', 'budget_flux', 'budget_series', 'dette', 'equipement', 'taxe_fonciere', 'subventions_associations', 'elus_indemnites', 'marches_plafonds', 'appels_offres', 'conseil_parite', 'conseil_ages', 'conseil_professions'],
  'revenus-emploi': ['niveau_vie', 'pauvrete', 'chomage', 'salaire'],
  accidents: ['accidents', 'accidents_taux', 'accidents_annees_sans'],
  equipements: ['equipements', 'medecins', 'eleves', 'etablissements', 'mediatheque_prets', 'mediatheque_collections', 'cantines_bio', 'cantines_liste'],
  'energie-mobilite': ['voitures_electriques', 'solaire', 'electricite', 'bornes'],
  elections: ['inscrits', 'participation_pres', 'participation_muni', 'au_dessus_france'],
  delinquance: ['delinquance_bilan', 'delinquance_cambriolages', 'delinquance_degradations'],
  eau: ['eau_conformite', 'eau_physico', 'eau_prelevements', 'eau_nitrates', 'eau_durete', 'eau_pompage', 'eau_pompage_piscines', 'eau_pompage_ouvrages'],
  construction: ['logements_commences', 'logements_sociaux'],
  sport: ['sport_licences', 'sport_federations', 'sport_parite', 'sport_ages', 'sport_evolution', 'sport_equipements', 'sport_types', 'sport_frise', 'sport_carte'],
  nature: ['nature_protege', 'nature_agricole', 'nature_aoc', 'nature_especes', 'nature_zonages', 'nature_cultures', 'nature_groupes', 'nature_top', 'nature_menacees', 'nature_carte'],
  quotidien: ['quotidien_fibre', 'quotidien_fibre_evolution', 'quotidien_dae', 'quotidien_dae_acces', 'quotidien_covoiturage', 'quotidien_verre', 'quotidien_mobilier', 'quotidien_carte'],
  rues: ['rues_noms', 'rues_femmes', 'rues_types', 'rues_classement', 'rues_personnes', 'rues_jumelage', 'rues_curiosites', 'rues_carte'],
};

export function methodesDePage(page: string): Methode[] {
  return (PAR_PAGE[page] ?? []).map(methode);
}

/** Toutes les méthodes (utilisé par les tests de cohérence). */
export const TOUTES_LES_METHODES: readonly Methode[] = Object.values(METHODES);
