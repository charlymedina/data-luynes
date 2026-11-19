# Sources de données

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [API Géo — commune 37139](https://geo.api.gouv.fr/communes/37139) | Nom, codes, population, surface, centre, département, région | Etalab / DINUM (population : INSEE, populations légales ; géométries : IGN) | [Licence Ouverte 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/) | Population : chaque année (millésime INSEE en vigueur au 1er janvier) | `data/raw/commune.json` |
| [API Géo — communes du 37](https://geo.api.gouv.fr/departements/37/communes) | Population, surface et centre des 272 communes d'Indre-et-Loire (classements en population, superficie, densité) | idem | Licence Ouverte 2.0 | idem | `data/raw/communes_37.json` |
| [INSEE Melodi — `DS_RP_POPULATION_PRINC`, 272 communes](https://api.insee.fr/melodi/data/DS_RP_POPULATION_PRINC?GEO=COM-37139) | Population totale, moins de 20 ans, 65 ans et plus de chaque commune d'Indre-et-Loire en 2012, 2017, 2023 (classements en croissance et en âge ; un paramètre `GEO=COM-xxxxx` par commune, liste lue dans le fichier API Géo) | INSEE, recensement | Licence Ouverte 2.0 | Annuelle | `data/raw/ages_communes_37.json` |

Requêtes : `data/sql/_departement.sql` (vues partagées), `rang_departement.sql` (rangs de Luynes), `territoire_communes.sql` (les 272 communes par densité).

## Thème Population

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Tours Métropole — Population 1876-2023](https://data.tours-metropole.fr/explore/dataset/population-1876-2023-tours-metropole-val-de-loire/) | Population de Luynes à chaque recensement depuis 1876 (filtre `code_geographique = 37139`) | INSEE, publié par Tours Métropole Val de Loire (portail Opendatasoft) | Licence Ouverte 2.0 (données INSEE) | Annuelle (dernière mise à jour du jeu : 19/12/2025) | `data/raw/population_historique.json` |
| [INSEE Melodi — `DS_RP_TD_POPULATION_AGESEX_PRINC`](https://api.insee.fr/melodi/data/DS_RP_TD_POPULATION_AGESEX_PRINC?GEO=COM-37139) | Population par âge détaillé (0 à 100 ans et +) et sexe, dernier recensement — Luynes, Indre-et-Loire (`DEP-37`), France (`FRANCE`, on garde « France » hors seule métropole) | INSEE, recensement de la population | Licence Ouverte 2.0 | Annuelle (millésime 2023 au 19/11/2026) | `data/raw/age_sexe_luynes.json`, `age_sexe_37.json`, `age_sexe_france.json` |
| [INSEE Melodi — `DS_RP_POPULATION_PRINC`](https://api.insee.fr/melodi/data/DS_RP_POPULATION_PRINC?GEO=COM-37139) | Grandes tranches d'âge (moins de 20 ans, 65 ans et +) en 2012, 2017, 2023 | INSEE, recensement | Licence Ouverte 2.0 | Annuelle | `data/raw/grandes_tranches_luynes.json` |
| [INSEE Melodi — `DS_ETAT_CIVIL_NAIS_COMMUNES`](https://api.insee.fr/melodi/data/DS_ETAT_CIVIL_NAIS_COMMUNES?GEO=COM-37139) | Naissances domiciliées à Luynes (lieu de résidence de la mère), 2008-2025 | INSEE, état civil | Licence Ouverte 2.0 | Annuelle | `data/raw/naissances_luynes.json` |
| [INSEE Melodi — `DS_ETAT_CIVIL_DECES_COMMUNES`](https://api.insee.fr/melodi/data/DS_ETAT_CIVIL_DECES_COMMUNES?GEO=COM-37139) | Décès domiciliés à Luynes (lieu de résidence du défunt), 2008-2025 | INSEE, état civil | Licence Ouverte 2.0 | Annuelle | `data/raw/deces_luynes.json` |

Notes :
- L'API Melodi est sans clé. Chaque appel demande jusqu'à 10 000 lignes (`maxResult=10000`), largement assez pour une commune (306 lignes pour la pyramide).
- Les valeurs du recensement sont des estimations (avec décimales) : elles sont arrondies à l'affichage.
- Les requêtes SQL correspondantes sont `data/sql/_melodi.sql` (vue partagée) et `data/sql/population_*.sql`.

## Thème Patrimoine & risques

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Base Mérimée — monuments historiques](https://www.data.gouv.fr/datasets/5af120e5b595087cfabcde81/) via l'[API tabulaire data.gouv](https://tabular-api.data.gouv.fr/api/resources/3a52af4a-f9da-4dcc-8110-b07774dfb3bc/data/?COG_Insee_lors_de_la_protection__exact=37139) | Les 8 monuments de Luynes (nom, époque, protection, propriétaire, coordonnées) ; nombre de monuments par commune du 37 (`__groupby` sur le code INSEE) | Ministère de la Culture | Licence Ouverte 2.0 | Hebdomadaire | `data/raw/monuments_luynes.json`, `monuments_37.json` |
| [Géorisques — cavités souterraines](https://georisques.gouv.fr/api/v1/cavites?code_insee=37139) | Position et type des 193 cavités de Luynes ; toutes les cavités du 37 (par paquets de 20 communes, limite de l'API) | BRGM / ministère de la Transition écologique | Licence Ouverte 2.0 | Continue | `data/raw/cavites_luynes.json`, `cavites_37.json` |
| [Géorisques — mouvements de terrain](https://georisques.gouv.fr/api/v1/mvt?code_insee=37139) | Type et année des mouvements de terrain (adresses non reprises) | BRGM | Licence Ouverte 2.0 | Continue | `data/raw/mouvements_terrain_luynes.json` |
| [Géorisques — arrêtés CatNat (GASPAR)](https://georisques.gouv.fr/api/v1/gaspar/catnat?code_insee=37139) | Arrêtés de catastrophe naturelle de Luynes et de toutes les communes du 37 | Ministère de l'Intérieur / DGPR | Licence Ouverte 2.0 | Continue | `data/raw/catnat_luynes.json`, `catnat_37.json` |
| [Géorisques — risques recensés (GASPAR)](https://georisques.gouv.fr/api/v1/gaspar/risques?code_insee=37139) | Liste des risques naturels officiellement recensés pour la commune | DGPR | Licence Ouverte 2.0 | Continue | `data/raw/risques_luynes.json` |
| [API Géo — contour](https://geo.api.gouv.fr/communes/37139?format=geojson&geometry=contour) | Limite de la commune sur la carte | IGN / Etalab | Licence Ouverte 2.0 | Annuelle | `data/raw/commune_contour.json` |
| [Géorisques — zones inondables (directive inondation, WFS)](https://www.georisques.gouv.fr/services?service=WFS&version=2.0.0&request=GetCapabilities) | Couche `ALEA_SYNT_01_02MOY_FXX` : surfaces inondables par débordement de cours d'eau, scénario « probabilité moyenne » (période de retour 100 à 300 ans) du TRI de Tours, dans un rectangle autour de Luynes ; découpée à la limite communale en SQL | DGPR / DDT, directive inondation | Licence Ouverte 2.0 | Révision tous les 6 ans (cycle directive inondation) | `data/raw/zones_inondables.json` |
| [OpenFreeMap](https://openfreemap.org) | Fond de carte (styles « positron » et « dark »), chargé par le navigateur du visiteur | OpenFreeMap, données OpenStreetMap | ODbL (données OSM) | — | — |

Notes :
- Les réponses paginées (Géorisques, API tabulaire) sont fusionnées par `scripts/build-data.ts` en un seul fichier `{ "data": [...] }`.
- Les codes INSEE « lors de la protection » de Mérimée peuvent être d'anciens codes de communes fusionnées : celles-ci comptent alors 0 monument dans le classement.
- Zones inondables : le scénario « extrême » (`ALEA_SYNT_01_04FAI_FXX`) a été comparé le 19/11/2026 ; il couvre exactement la même surface à Luynes (389 ha, 11,4 % de la commune), on ne garde donc que le scénario de référence. Le découpage et les surfaces utilisent l'extension `spatial` de DuckDB (téléchargée automatiquement), en Lambert 93. Pas de classement départemental (il faudrait les zones de tous les TRI du 37).
- Requêtes : `data/sql/patrimoine_*.sql` et `data/sql/risques_*.sql` (+ `_spatial.sql`).

## Thème Immobilier

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Géo-DVF — demandes de valeurs foncières géolocalisées](https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/) (`https://files.data.gouv.fr/geo-dvf/latest/csv/<année>/departements/37.csv.gz`) | Toutes les ventes d'Indre-et-Loire des années publiées (2021 → 2025 au 19/11/2026) : prix, date, surfaces, pièces, type de local, position de la parcelle, rue. Luynes = `code_commune = '37139'` | DGFiP, géolocalisé par Etalab | Licence Ouverte 2.0 | Semestrielle (avril, octobre) | `data/raw/dvf_37/*.csv.gz` |
| [ADEME — DPE logements existants](https://data.ademe.fr/datasets/dpe03existant) (API data-fair, agrégat `values_agg?field=etiquette_dpe`) | Nombre de DPE par étiquette A → G à Luynes (`code_insee_ban:37139`), en Indre-et-Loire et en France, depuis juillet 2021 | ADEME | Licence Ouverte 2.0 | Quotidienne | `data/raw/dpe_luynes.json`, `dpe_37.json`, `dpe_france.json` |
| [Carte des loyers 2025](https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025/) via l'API tabulaire data.gouv (fichiers « maison » et « appartement ») | Loyer d'annonce prédit au m² charges comprises, fourchette, nombre d'annonces, pour les 272 communes du 37 | Ministère de la Transition écologique (DHUP), annonces SeLoger / Leboncoin / PAP | Licence Ouverte 2.0 | Annuelle (un nouveau jeu chaque décembre) | `data/raw/loyers_maisons_37.json`, `loyers_appartements_37.json` |

Notes :
- **DVF ne garde que ~5 ans glissants** : à chaque mise à jour, l'année la plus ancienne disparaît (2021 partira en 2027). La liste des années est recalculée à chaque construction (`data/sources.ts`, fonction `dvfDepartement37`).
- **Archive DVF** (`data/archive/dvf/`, versionnée dans le dépôt) : à chaque construction, les **2 années publiées les plus anciennes** (celles qui vont disparaître, et que DVF ne révise plus guère) sont copiées en Parquet compressé (colonnes utiles, ventes classiques et sur plan d'Indre-et-Loire, ~0,8 Mo par année). Un fichier n'est réécrit que si son contenu a changé (empreinte dans `manifest.json`). Une année qui n'est plus publiée reste dans l'archive pour toujours. `data/sql/_dvf.sql` lit les fichiers publiés **+** les années archivées qui ne sont plus publiées (aucun doublon). La construction automatique (GitHub Actions) enregistre elle-même l'archive dans le dépôt quand elle change (environ deux fois par an). Code : `scripts/archive-dvf.ts`. Taille : 1,9 Mo aujourd'hui (2021-2022), +0,8 Mo par an environ.
- Une vente DVF occupe plusieurs lignes (parcelles, locaux, natures de terrain) : `data/sql/_dvf.sql` regroupe tout par `id_mutation` et définit le type de bien (maison seule, appartement seul, terrain, autre). Prix au m² seulement pour une maison ou un appartement vendu seul, surface ≥ 15 m², entre 300 et 15 000 €/m² ; ventes < 1 000 € écartées. Échanges, adjudications et expropriations exclus.
- Le classement des prix au m² ne retient que les communes avec au moins 30 ventes de maisons sur la période.
- Carte des loyers : identifiants des fichiers 2025 codés dans `data/sources.ts` ; à mettre à jour quand le jeu 2026 sortira.
- Les DPE ne concernent que les logements vendus, loués ou rénovés depuis juillet 2021 : ce n'est pas un portrait de tout le parc.
- Les ventes de Luynes sont aussi publiées en `/donnees/ventes-immobilieres.json` (fichier lu par la carte).
- Requêtes : `data/sql/_dvf.sql` et `data/sql/immobilier_*.sql`.

## Thème Budget de la commune

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Comptes individuels des communes](https://data.economie.gouv.fr/explore/?q=comptes-individuels-des-communes) (data.economie.gouv.fr) | Comptes de Luynes 2000 → dernière année (fonctionnement, investissement, dette, autofinancement, taux de taxe foncière), par habitant et moyenne de la strate | DGFiP (ministère de l'Économie) | Licence Ouverte 2.0 | Annuelle (un jeu par année ou groupe d'années ; 2025 publié en 2026) | `data/raw/budget_luynes/` |
| idem, dernière année, filtre `dep = 037` | Dépenses, dette, équipement par habitant et taux de taxe foncière des 272 communes d'Indre-et-Loire (classements, médianes) | DGFiP | Licence Ouverte 2.0 | Annuelle | `data/raw/budget_communes_37/` |

Notes :
- La DGFiP publie un jeu par année ou paire d'années, aux noms irréguliers (`…-2008` contient 2000-2008, `…-20090` contient 2009, `…-2023-2024`) : la liste est retrouvée à chaque build via le catalogue du portail (`data/sources-budget.ts`), rien n'est codé en dur.
- Montants DGFiP en milliers d'euros ; colonnes `f…` = euros par habitant, `m…` = moyenne de la strate (communes de même taille en France : 3 500-5 000 habitants jusqu'en 2005, 5 000-10 000 ensuite).
- Taxe foncière : depuis 2021, le taux communal inclut l'ancienne part départementale (réforme de la taxe d'habitation) → saut de série en 2021 qui n'est pas une hausse votée.
- « Médiane 37 » = médiane des 272 communes du département (non pondérée par la population).
- Requêtes : `data/sql/_budget.sql` et `data/sql/budget_*.sql`.

## Thème Revenus & emploi

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [INSEE Melodi — `DS_FILOSOFI_CC`](https://api.insee.fr/melodi/data/DS_FILOSOFI_CC?GEO=COM-37139) | Niveau de vie médian et taux de pauvreté 2023 — Luynes, Indre-et-Loire, France métropolitaine ; niveau de vie médian des communes du 37 (classement) | INSEE, Filosofi | Licence Ouverte 2.0 | Annuelle | `data/raw/filosofi.json`, `filosofi_communes_37.json` |
| [INSEE Melodi — `DS_RP_EMPLOI_LR_PRINC`](https://api.insee.fr/melodi/data/DS_RP_EMPLOI_LR_PRINC?GEO=COM-37139) | Situation des 15-64 ans (emploi, chômage, études, retraite…), 2012-2017-2023 ; chômage des communes du 37 (classement) | INSEE, recensement | Licence Ouverte 2.0 | Annuelle | `data/raw/activite.json`, `chomage_communes_37.json` |
| [INSEE Melodi — `DS_RP_NAVETTES_PRINC`](https://api.insee.fr/melodi/data/DS_RP_NAVETTES_PRINC?GEO=COM-37139) | Lieu de travail et moyen de transport des actifs en emploi | INSEE, recensement | Licence Ouverte 2.0 | Annuelle | `data/raw/navettes.json` |
| [INSEE Melodi — `DS_BTS_SAL_EQTP_SEX_AGE`](https://api.insee.fr/melodi/data/DS_BTS_SAL_EQTP_SEX_AGE?GEO=COM-37139) | Salaire net mensuel moyen en équivalent temps plein, secteur privé, par sexe (2023-2024) | INSEE, base Tous salariés | Licence Ouverte 2.0 | Annuelle | `data/raw/salaires.json` |
| [INSEE Melodi — `DS_SIDE_CREA_COM`](https://api.insee.fr/melodi/data/DS_SIDE_CREA_COM?GEO=COM-37139) | Créations d'entreprises par année, 2012 → 2025 | INSEE, SIDE | Licence Ouverte 2.0 | Annuelle | `data/raw/creations_entreprises.json` |

Notes :
- Filosofi : seuls le niveau de vie médian et le taux de pauvreté sont publiés pour Luynes ; les déciles et la composition du revenu sont sous secret statistique (valeurs absentes, non extrapolées). 2 communes du 37 n'ont pas de niveau de vie publié (classement sur 270).
- Chômage « au sens du recensement » (déclaratif), différent du chômage au sens du BIT.
- Codes de lieu de travail et de transport du recensement décodés dans `data/sql/_revenus.sql` (nomenclature INSEE standard, non revérifiée via l'API `range`).
- Salaires : base Tous salariés, secteur privé ; Melodi ne précise pas dans le jeu s'il s'agit du lieu de résidence ou de travail (le catalogue indique « lieu de travail ») — à confirmer.
- Requêtes : `data/sql/_revenus.sql` et `data/sql/revenus_*.sql`.

## Thème Accidents de la route

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Bases annuelles des accidents corporels de la circulation (BAAC)](https://www.data.gouv.fr/datasets/53698f4ca3a729239d2036df/) | Accidents corporels 2005 → dernière année : date (mois, jour de la semaine, heure), lumière, météo, commune, coordonnées ; gravité et catégorie des usagers (ni âge ni sexe) ; catégorie des véhicules ; type et numéro de route | ONISR (Observatoire national interministériel de la sécurité routière), d'après les forces de l'ordre | Licence Ouverte 2.0 | Annuelle (automne, année N-1) | Archive `data/archive/baac/<année>-<table>.parquet` |

Notes :
- **Archive** : les 4 fichiers nationaux de chaque année (~25 Mo) ne sont pas retéléchargés à chaque construction. `scripts/archive-baac.ts` lit la liste des fichiers dans l'API data.gouv, et ne télécharge une année que si sa publication a changé (adresses notées dans `data/archive/baac/manifest.json`). Seule l'Indre-et-Loire est gardée (~0,6 Mo pour 2005-2025). Si data.gouv.fr ne répond pas, l'archive existante est utilisée.
- **Harmonisation** (`data/sql/baac/*.sql`) : avant 2019, département « 370 » + commune « 139 », heures « 1930 », coordonnées sans virgule (souvent à 0 avant 2010) et fichiers en Windows-1252 ; le fichier 2022 nomme `Accident_Id` la colonne `Num_Acc`.
- **Rupture 2018** : la définition du « blessé hospitalisé » a changé (plus de 24 h à l'hôpital) ; les années antérieures ne sont pas strictement comparables sur la gravité.
- 12 des 35 accidents de Luynes (surtout avant 2010) n'ont pas de coordonnées : absents de la carte, comptés partout ailleurs.
- Taux « pour 1 000 habitants » calculés avec la population légale actuelle (API Géo).
- Requêtes : `data/sql/_accidents.sql` et `data/sql/accidents_*.sql`.

## Thème Climat

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Données climatologiques de base quotidiennes](https://www.data.gouv.fr/datasets/donnees-climatologiques-de-base-quotidiennes/) — fichiers « RR-T-Vent » de l'Indre-et-Loire (`Q_37_previous-…` et `Q_37_latest-…`) | Températures minimale et maximale, pluie, chaque jour, station de **Tours** (n° 37179001, aéroport de Parçay-Meslay, ~15 km de Luynes), depuis novembre 1959 | Météo-France | Licence Ouverte 2.0 | Quotidienne (fichier « latest ») | `data/raw/meteo_37/` |

Notes :
- Il n'y a pas de station à Luynes : la page le dit clairement. Fondettes a eu une station de 1992 à 2021 seulement.
- Les noms de fichiers changent chaque année : leurs adresses sont relues dans l'API data.gouv (`data/sources-climat.ts`).
- Une année n'est comptée que si elle a au moins 350 jours mesurés (températures et pluie) : 1961-1964 et l'année en cours sont écartées des moyennes ; les records journaliers portent sur tous les jours mesurés.
- Référence des « bandes du réchauffement » : moyenne 1971-2000 ; normales mensuelles : 1991-2020.
- Requêtes : `data/sql/_climat.sql` et `data/sql/climat_*.sql`.

## Thème Écoles, santé & services

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [INSEE Melodi — `DS_BPE`](https://api.insee.fr/melodi/data/DS_BPE?GEO=COM-37139) | Nombre d'équipements par type (commerces, services, santé, enseignement, sport, tourisme) — Luynes, Indre-et-Loire, et totaux par domaine des 272 communes | INSEE, base permanente des équipements | Licence Ouverte 2.0 | Annuelle | `data/raw/bpe_luynes.json`, `bpe_37.json`, `bpe_communes_37.json` |
| Référentiel des codes BPE (`https://api.insee.fr/melodi/range/DS_BPE`) | Libellés des codes d'équipements (ex. D265 = médecin généraliste) | INSEE | Licence Ouverte 2.0 | Avec la BPE | `data/reference/bpe_libelles.csv` (extrait une fois ; le fichier source fait 13 Mo) |
| [Annuaire de l'éducation](https://data.education.gouv.fr/explore/dataset/fr-en-annuaire-education/) | Écoles et collège de Luynes : nom, public/privé, niveaux, position | Ministère de l'Éducation nationale | Licence Ouverte 2.0 | Quotidienne | `data/raw/ecoles_luynes.json` |
| [Effectifs d'élèves par école](https://data.education.gouv.fr/explore/dataset/fr-en-ecoles-effectifs-nb_classes/) | Élèves et classes de chaque école à chaque rentrée depuis 2009 — Luynes et total Indre-et-Loire | Ministère de l'Éducation nationale | Licence Ouverte 2.0 | Annuelle | `data/raw/effectifs_ecoles_luynes.json`, `effectifs_ecoles_37.json` |

Notes :
- ⚠️ Dans les effectifs, la colonne `code_commune_insee` contient le code postal (37230, partagé avec Fondettes) : filtre sur `commune = "LUYNES"` et le département.
- Collège : présent dans l'annuaire, mais ses effectifs (autre jeu de données) ne sont pas encore repris.
- Les moyennes « pour 1 000 habitants » du département incluent Tours et les villes, où se concentrent commerces et services.
- Si l'INSEE change la nomenclature des équipements, régénérer `data/reference/bpe_libelles.csv` (codes inconnus affichés tels quels en attendant).
- Requêtes : `data/sql/_equipements.sql`, `data/sql/equipements_*.sql`, `data/sql/ecoles_*.sql`.

Les données sont téléchargées à nouveau à chaque construction du site (au moins une fois par semaine),
avec 3 tentatives par source en cas de panne passagère.
La liste technique des sources est dans `data/sources.ts`.
