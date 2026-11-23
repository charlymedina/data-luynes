/** Sources citées en pied de page, par thème (voir aussi docs/sources.md). */
import type { FooterSource } from '../components/SiteFooter.astro';

const API_GEO: FooterSource = {
  nom: 'API Géo',
  url: 'https://geo.api.gouv.fr',
  detail: 'populations légales INSEE et contours IGN — Licence Ouverte 2.0',
};

const INSEE_RECENSEMENT: FooterSource = {
  nom: 'INSEE — recensement et état civil (API Melodi)',
  url: 'https://www.insee.fr/fr/information/8193036',
  detail: 'population par âge et sexe, naissances, décès — Licence Ouverte 2.0',
};

const TOURS_METROPOLE: FooterSource = {
  nom: 'Tours Métropole Val de Loire — open data',
  url: 'https://data.tours-metropole.fr/explore/?q=population+1876',
  detail: 'population historique depuis 1876 (source INSEE) — Licence Ouverte 2.0',
};

const MERIMEE: FooterSource = {
  nom: 'Ministère de la Culture — base Mérimée (monuments historiques)',
  url: 'https://www.data.gouv.fr/datasets/5af120e5b595087cfabcde81/',
  detail: 'via l’API tabulaire de data.gouv.fr — Licence Ouverte 2.0',
};

const PALISSY: FooterSource = {
  nom: 'Ministère de la Culture — base Palissy (objets mobiliers protégés)',
  url: 'https://www.pop.culture.gouv.fr/search/list?base=%5B%22Patrimoine%20mobilier%20%28Palissy%29%22%5D',
  detail: 'plateforme ouverte du patrimoine (POP) — Licence Ouverte 2.0',
};

const BD_TOPO: FooterSource = {
  nom: 'IGN — BD TOPO (bâtiments)',
  url: 'https://geoservices.ign.fr/bdtopo',
  detail: 'bâtiments, usage, hauteur et date d’apparition estimée, via la Géoplateforme — Licence Ouverte 2.0',
};

const INSEE_LOGEMENTS: FooterSource = {
  nom: 'INSEE — recensement de la population (API Melodi)',
  url: 'https://www.insee.fr/fr/statistiques/8581474',
  detail: 'résidences principales selon la période d’achèvement de la construction — Licence Ouverte 2.0',
};

const CAF: FooterSource = {
  nom: 'CAF (CNAF) — foyers allocataires par prestation et par commune',
  url: 'https://data.caf.fr/explore/dataset/s_ben_com_f/',
  detail: 'prestations légales, nombres arrondis à 5 (secret statistique) — Licence Ouverte',
};

const GEORISQUES: FooterSource = {
  nom: 'Géorisques (ministère de la Transition écologique, BRGM)',
  url: 'https://www.georisques.gouv.fr',
  detail: 'cavités souterraines, mouvements de terrain, arrêtés de catastrophe naturelle (GASPAR), zones inondables (directive inondation, TRI de Tours) — Licence Ouverte 2.0',
};

const PPRI_DDT: FooterSource = {
  nom: 'DDT d’Indre-et-Loire — PPRi de la Loire, Val de Tours – Val de Luynes',
  url: 'https://www.data.gouv.fr/datasets/plan-de-prevention-des-risques-naturels-previsibles-dinondation-de-la-loire-sur-le-val-de-tours-val-de-luynes-2016-dans-lindre-et-loire-1/',
  detail: 'zonage réglementaire du plan de prévention du risque d’inondation — Licence Ouverte 2.0',
};

const DVF: FooterSource = {
  nom: 'Demandes de valeurs foncières géolocalisées (DGFiP, Etalab)',
  url: 'https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/',
  detail: 'ventes immobilières (années publiées + archive du site) — Licence Ouverte 2.0',
};

const ADEME_DPE: FooterSource = {
  nom: 'ADEME — diagnostics de performance énergétique (DPE)',
  url: 'https://data.ademe.fr/datasets/dpe03existant',
  detail: 'logements existants, DPE depuis juillet 2021 — Licence Ouverte 2.0',
};

const CARTE_LOYERS: FooterSource = {
  nom: 'Carte des loyers (ministère de la Transition écologique)',
  url: 'https://www.data.gouv.fr/datasets/?q=carte+des+loyers+indicateurs+de+loyers+d%27annonce+par+commune',
  detail: 'loyers d’annonce charges comprises, par commune — Licence Ouverte 2.0',
};

const DGFIP_COMPTES: FooterSource = {
  nom: 'DGFiP — comptes individuels des communes',
  url: 'https://data.economie.gouv.fr/explore/?q=comptes-individuels-des-communes',
  detail: 'budgets communaux 2000 → dernière année, moyennes de strate — Licence Ouverte 2.0',
};

const INSEE_REVENUS_EMPLOI: FooterSource = {
  nom: 'INSEE — Filosofi, recensement, base Tous salariés, SIDE (API Melodi)',
  url: 'https://www.insee.fr/fr/information/8193036',
  detail: 'niveau de vie, pauvreté, activité, trajets domicile-travail, salaires, créations d’entreprises, ménages — Licence Ouverte 2.0',
};

const ONISR_BAAC: FooterSource = {
  nom: 'ONISR — bases annuelles des accidents corporels de la circulation (BAAC)',
  url: 'https://www.data.gouv.fr/datasets/53698f4ca3a729239d2036df/',
  detail: 'accidents 2005 → dernière année publiée, archive du site pour l’Indre-et-Loire — Licence Ouverte 2.0',
};

const INSEE_BPE: FooterSource = {
  nom: 'INSEE — base permanente des équipements (API Melodi)',
  url: 'https://www.insee.fr/fr/metadonnees/source/serie/s1161',
  detail: 'commerces, services, santé, enseignement, sport, tourisme — Licence Ouverte 2.0',
};

const EDUCATION_NATIONALE: FooterSource = {
  nom: 'Éducation nationale — annuaire de l’éducation, effectifs d’élèves par école',
  url: 'https://data.education.gouv.fr',
  detail: 'écoles et collèges, élèves et classes à chaque rentrée — Licence Ouverte 2.0',
};

const AGENCE_ORE: FooterSource = {
  nom: 'Agence ORE — consommation annuelle d’électricité et de gaz par commune',
  url: 'https://opendata.agenceore.fr/explore/dataset/consommation-annuelle-d-electricite-et-gaz-par-commune/',
  detail: 'données des gestionnaires de réseaux (Enedis, GRDF…), par secteur — Licence Ouverte 2.0',
};

const ODRE_SOLAIRE: FooterSource = {
  nom: 'ODRÉ — registre national des installations de production d’électricité',
  url: 'https://odre.opendatasoft.com/explore/dataset/registre-national-installation-production-stockage-electricite-agrege/',
  detail: 'installations solaires raccordées (RTE, Enedis…) — Licence Ouverte 2.0',
};

const SDES_PARC: FooterSource = {
  nom: 'SDES — parc de véhicules par commune (ministère de la Transition écologique)',
  url: 'https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/1582861b-e042-4490-9161-6429d8229703',
  detail: 'véhicules au 1er janvier par carburant et vignette Crit’Air — Licence Ouverte 2.0',
};

const IRVE: FooterSource = {
  nom: 'Base nationale des infrastructures de recharge (IRVE, data.gouv.fr)',
  url: 'https://www.data.gouv.fr/datasets/fichier-consolide-des-bornes-de-recharge-pour-vehicules-electriques/',
  detail: 'bornes de recharge publiques, fichier consolidé — Licence Ouverte 2.0',
};

const ELECTIONS_AGREGEES: FooterSource = {
  nom: 'Données des élections agrégées (data.gouv.fr, à partir des résultats du ministère de l’Intérieur)',
  url: 'https://www.data.gouv.fr/datasets/donnees-des-elections-agregees/',
  detail: 'participation et voix par bureau de vote, 1999 → dernier scrutin, archive du site — Licence Ouverte 2.0',
};

const MUNICIPALES_2026: FooterSource = {
  nom: 'Ministère de l’Intérieur — élections municipales 2026',
  url: 'https://www.data.gouv.fr/datasets/elections-municipales-2026-resultats-du-premier-tour/',
  detail: 'résultats des deux tours et sièges attribués, par commune — Licence Ouverte 2.0',
};

const SSMSI: FooterSource = {
  nom: 'SSMSI — bases statistiques communale et départementale de la délinquance enregistrée',
  url: 'https://www.data.gouv.fr/datasets/bases-statistiques-communale-departementale-et-regionale-de-la-delinquance-enregistree-par-la-police-et-la-gendarmerie-nationales/',
  detail: 'faits enregistrés par la police et la gendarmerie, 2016 → dernière année — Licence Ouverte 2.0',
};

const OPENFREEMAP: FooterSource = {
  nom: 'OpenFreeMap',
  url: 'https://openfreemap.org',
  detail: 'fond de carte, données © contributeurs OpenStreetMap (ODbL)',
};

const HUBEAU_EAU: FooterSource = {
  nom: "Hub'eau — qualité de l'eau potable (ARS, ministère de la Santé)",
  url: 'https://hubeau.eaufrance.fr/page/api-qualite-eau-potable',
  detail: 'contrôle sanitaire de l’eau distribuée, 2016 → aujourd’hui — Licence Ouverte 2.0',
};

const HUBEAU_PRELEVEMENTS: FooterSource = {
  nom: "Hub'eau — prélèvements en eau (BNPE, OFB)",
  url: 'https://hubeau.eaufrance.fr/page/api-prelevements-eau',
  detail: 'volumes prélevés par ouvrage et par an, 2008 → dernière année déclarée — Licence Ouverte 2.0',
};

const MA_CANTINE: FooterSource = {
  nom: 'Ministère de l’Agriculture — Ma Cantine (télédéclarations EGalim)',
  url: 'https://ma-cantine.agriculture.gouv.fr/',
  detail: 'résultats des campagnes de télédéclaration des cantines — Licence Ouverte 2.0',
};

const BIBLIOTHEQUES: FooterSource = {
  nom: 'Ministère de la Culture — bibliothèques des collectivités territoriales',
  url: 'https://www.data.gouv.fr/datasets/5c3538da9ce2e7459c6d765a/',
  detail: 'enquête annuelle du Service du livre et de la lecture (adresses et données d’activité) — Licence Ouverte 2.0',
};

const SDES_SITADEL: FooterSource = {
  nom: 'SDES — Sitadel (logements autorisés et commencés)',
  url: 'https://www.statistiques.developpement-durable.gouv.fr/catalogue?page=dataset&datasetId=660432ce0b8987ef5dd9465d',
  detail: 'séries mensuelles communales depuis 2002 — Licence Ouverte 2.0',
};

const SDES_RPLS: FooterSource = {
  nom: 'SDES — répertoire des logements sociaux (RPLS)',
  url: 'https://www.statistiques.developpement-durable.gouv.fr/catalogue?page=datafile&datafileRid=f3c2f2cb-8fb1-40fd-8733-964247744c9a',
  detail: 'logements des bailleurs sociaux au 1er janvier — Licence Ouverte 2.0',
};

const DGFIP_BALANCES: FooterSource = {
  nom: 'DGFiP — balances comptables des communes',
  url: 'https://data.economie.gouv.fr/explore/?q=balances-comptables-des-communes',
  detail: 'comptes de la commune compte par compte, 2010 → dernière année — Licence Ouverte 2.0',
};

const DECP: FooterSource = {
  nom: 'Données essentielles de la commande publique consolidées (data.gouv.fr)',
  url: 'https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-consolidees-format-tabulaire/',
  detail: 'marchés publics attribués par la mairie — Licence Ouverte 2.0',
};

const BOAMP: FooterSource = {
  nom: 'BOAMP — bulletin officiel des annonces de marchés publics (DILA)',
  url: 'https://boamp-datadila.opendatasoft.com/explore/dataset/boamp/',
  detail: "avis d'appel d'offres publiés par la mairie — Licence Ouverte 2.0",
};

const RNE: FooterSource = {
  nom: 'Répertoire national des élus (ministère de l’Intérieur)',
  url: 'https://www.data.gouv.fr/datasets/repertoire-national-des-elus-1/',
  detail: 'conseillers municipaux : sexe, âge, profession, fonction (sans les noms, hors maire) — Licence Ouverte 2.0',
};

const INJEP_LICENCES: FooterSource = {
  nom: 'INJEP / ministère des Sports — recensement des licences et clubs',
  url: 'https://www.data.gouv.fr/datasets/donnees-geocodees-issues-du-recensement-des-licences-et-clubs-aupres-des-federations-sportives-agreees-par-le-ministere-charge-des-sports/',
  detail: 'licences sportives par commune de résidence et fédération, années récentes — Licence Ouverte',
};

const RES_SPORT: FooterSource = {
  nom: 'Ministère des Sports — recensement des équipements sportifs (RES, Data ES)',
  url: 'https://equipements.sports.gouv.fr',
  detail: 'équipements sportifs, installations, mise en service, position — Licence Ouverte',
};

const BAN: FooterSource = {
  nom: 'Base Adresse Nationale (IGN / DINUM)',
  url: 'https://adresse.data.gouv.fr',
  detail: 'adresses, noms de voies et de lieux-dits — Licence Ouverte 2.0',
};

const INPN_ZONAGES: FooterSource = {
  nom: 'INPN / MNHN — espaces protégés et inventoriés (via API Carto IGN)',
  url: 'https://inpn.mnhn.fr',
  detail: 'ZNIEFF et sites Natura 2000 — Licence Ouverte 2.0',
};

const RPG_IGN: FooterSource = {
  nom: 'IGN — registre parcellaire graphique (RPG)',
  url: 'https://geoservices.ign.fr/rpg',
  detail: 'parcelles agricoles déclarées et cultures — Licence Ouverte 2.0',
};

const INAO_AIRES: FooterSource = {
  nom: 'INAO — délimitation parcellaire des AOC viticoles',
  url: 'https://www.data.gouv.fr/datasets/delimitation-parcellaire-des-aoc-viticoles-de-linao/',
  detail: 'parcelles délimitées pour produire une appellation, via la Géoplateforme de l\'IGN — Licence Ouverte',
};

const GBIF_OBSERVATIONS: FooterSource = {
  nom: 'GBIF — Global Biodiversity Information Facility',
  url: 'https://www.gbif.org',
  detail: 'observations d\'espèces, comptages seulement (jeux de données sous licences CC0 ou CC BY ; citation : GBIF.org)',
};

const ARCEP_FIBRE: FooterSource = {
  nom: 'ARCEP — Ma connexion internet',
  url: 'https://www.data.gouv.fr/datasets/ma-connexion-internet',
  detail: 'locaux éligibles à la fibre par commune et par trimestre — Licence Ouverte 2.0',
};

const GEODAE: FooterSource = {
  nom: 'Géo’DAE — base nationale des défibrillateurs (ministère de la Santé)',
  url: 'https://www.data.gouv.fr/datasets/geodae-base-nationale-des-defibrillateurs-automatises-externes-dae',
  detail: 'défibrillateurs automatisés externes déclarés par leurs exploitants — Licence Ouverte',
};

const COVOITURAGE_RPC: FooterSource = {
  nom: 'Registre de preuve de covoiturage (tableau de bord des mobilités durables)',
  url: 'https://www.data.gouv.fr/datasets/nombre-de-trajets-realises-en-covoiturage-intermedie',
  detail: 'trajets de covoiturage intermédié par commune de départ — ODbL (Open Database License)',
};

const TOURS_MOBILIER: FooterSource = {
  nom: 'Tours Métropole Val de Loire — open data',
  url: 'https://data.tours-metropole.fr',
  detail: 'points d’apport volontaire (verre, textile), bancs publics — Licence Ouverte 2.0',
};

export const CREDITS_QUOTIDIEN: readonly FooterSource[] = [ARCEP_FIBRE, GEODAE, COVOITURAGE_RPC, TOURS_MOBILIER, API_GEO, OPENFREEMAP];
export const CREDITS_NATURE: readonly FooterSource[] = [INPN_ZONAGES, RPG_IGN, INAO_AIRES, GBIF_OBSERVATIONS, API_GEO, OPENFREEMAP];
export const CREDITS_RUES: readonly FooterSource[] = [BAN, API_GEO, OPENFREEMAP];
export const CREDITS_SPORT: readonly FooterSource[] = [INJEP_LICENCES, RES_SPORT, API_GEO, OPENFREEMAP];
export const CREDITS_EAU: readonly FooterSource[] = [HUBEAU_EAU, HUBEAU_PRELEVEMENTS];
export const CREDITS_CONSTRUCTION: readonly FooterSource[] = [SDES_SITADEL, SDES_RPLS];
export const CREDITS_ELECTIONS: readonly FooterSource[] = [ELECTIONS_AGREGEES, MUNICIPALES_2026];
export const CREDITS_DELINQUANCE: readonly FooterSource[] = [SSMSI];
export const CREDITS_EQUIPEMENTS: readonly FooterSource[] = [INSEE_BPE, EDUCATION_NATIONALE, BIBLIOTHEQUES, MA_CANTINE, API_GEO];
export const CREDITS_ENERGIE: readonly FooterSource[] = [AGENCE_ORE, ODRE_SOLAIRE, SDES_PARC, IRVE, API_GEO];
export const CREDITS_ACCIDENTS: readonly FooterSource[] = [ONISR_BAAC, API_GEO, OPENFREEMAP];
export const CREDITS_BUDGET: readonly FooterSource[] = [DGFIP_COMPTES, DGFIP_BALANCES, DECP, BOAMP, RNE, INSEE_RECENSEMENT, API_GEO];
export const CREDITS_REVENUS: readonly FooterSource[] = [INSEE_REVENUS_EMPLOI, CAF, API_GEO];
export const CREDITS_IMMOBILIER: readonly FooterSource[] = [DVF, CARTE_LOYERS, ADEME_DPE, API_GEO, OPENFREEMAP];
export const CREDITS_PATRIMOINE: readonly FooterSource[] = [MERIMEE, PALISSY, BD_TOPO, INSEE_LOGEMENTS, GEORISQUES, PPRI_DDT, API_GEO, OPENFREEMAP];
export const CREDITS_TERRITOIRE: readonly FooterSource[] = [API_GEO];
export const CREDITS_POPULATION: readonly FooterSource[] = [TOURS_METROPOLE, INSEE_RECENSEMENT, API_GEO];

/**
 * Accueil : union automatique des sources de tous les thèmes (sans doublon, hors fond de carte),
 * puisque les chiffres clés et les anecdotes de l'accueil viennent de tous les thèmes.
 */
export const CREDITS_ACCUEIL: readonly FooterSource[] = [
  ...new Set([
    CREDITS_POPULATION,
    CREDITS_TERRITOIRE,
    CREDITS_PATRIMOINE,
    CREDITS_IMMOBILIER,
    CREDITS_BUDGET,
    CREDITS_REVENUS,
    CREDITS_ACCIDENTS,
    CREDITS_EQUIPEMENTS,
    CREDITS_ENERGIE,
    CREDITS_ELECTIONS,
    CREDITS_DELINQUANCE,
    CREDITS_EAU,
    CREDITS_CONSTRUCTION,
    CREDITS_SPORT,
    CREDITS_NATURE,
    CREDITS_RUES,
    CREDITS_QUOTIDIEN,
  ].flat()),
].filter((source) => source !== OPENFREEMAP);
