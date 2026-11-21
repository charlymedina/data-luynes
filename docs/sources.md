# Sources de données

Pour chaque chiffre clé du site, la source, le calcul et l'année affichés dans la bulle ⓘ et la section
« Sources et méthode » viennent de `src/data/methodes.ts` (années lues dans les données, jamais écrites à la main).

## Commune et classements (accueil, Territoire, Population)

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [API Géo — commune 37139](https://geo.api.gouv.fr/communes/37139) | Nom, codes, population, surface, centre, département, région | Etalab / DINUM (population : INSEE, populations légales ; géométries : IGN) | [Licence Ouverte 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/) | Population : chaque année (millésime INSEE en vigueur au 1er janvier) | `data/raw/commune.json` |
| [API Géo — communes du 37](https://geo.api.gouv.fr/departements/37/communes) | Population, surface et centre des 272 communes d'Indre-et-Loire (classements en population, superficie, densité) | idem | Licence Ouverte 2.0 | idem | `data/raw/communes_37.json` |
| [INSEE Melodi — `DS_RP_POPULATION_PRINC`, 272 communes](https://api.insee.fr/melodi/data/DS_RP_POPULATION_PRINC?GEO=COM-37139) | Population totale, moins de 20 ans, 65 ans et plus de chaque commune d'Indre-et-Loire en 2012, 2017, 2023 (classements en croissance et en âge ; un paramètre `GEO=COM-xxxxx` par commune, liste lue dans le fichier API Géo) | INSEE, recensement | Licence Ouverte 2.0 | Annuelle | `data/raw/ages_communes_37.json` |

Requêtes : `data/sql/_departement.sql` (vues partagées), `rang_departement.sql` (rangs de Luynes), `territoire_communes.sql` (les 272 communes par densité).

## Thème Population

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Tours Métropole — Population depuis 1876](https://data.tours-metropole.fr/explore/?q=population+1876) (jeu « population-1876-<année>-… », le plus récent est retrouvé dans le catalogue à chaque construction) | Population de Luynes à chaque recensement depuis 1876 (filtre `code_geographique = 37139`) | INSEE, publié par Tours Métropole Val de Loire (portail Opendatasoft) | Licence Ouverte 2.0 (données INSEE) | Annuelle (dernière mise à jour du jeu : 19/12/2025) | `data/raw/population_historique.json` |
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
| [Géorisques — arrêtés CatNat (GASPAR)](https://georisques.gouv.fr/api/v1/gaspar/catnat?code_insee=37139) | Reconnaissances de catastrophe naturelle de Luynes et de toutes les communes du 37 (une ligne par événement reconnu ; un même arrêté peut en couvrir plusieurs : le site affiche les deux nombres, le classement porte sur les reconnaissances) | Ministère de l'Intérieur / DGPR | Licence Ouverte 2.0 | Continue | `data/raw/catnat_luynes.json`, `catnat_37.json` |
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
| [Carte des loyers](https://www.data.gouv.fr/datasets/?q=carte+des+loyers+indicateurs+de+loyers+d%27annonce+par+commune) — le jeu le plus récent (« … par commune en <année> ») est retrouvé via l'API data.gouv à chaque construction, puis lu via l'API tabulaire (fichiers « Indicateurs de loyer maison » et « … appartement ») ; l'année est lue dans son titre (`loyers_millesime`) | Loyer d'annonce prédit au m² charges comprises, fourchette, nombre d'annonces, pour les 272 communes du 37 | Ministère de la Transition écologique (DHUP), annonces SeLoger / Leboncoin / PAP | Licence Ouverte 2.0 | Annuelle (un nouveau jeu chaque décembre) | `data/raw/loyers_maisons_37.json`, `loyers_appartements_37.json` |

Notes :
- **DVF ne garde que ~5 ans glissants** : à chaque mise à jour, l'année la plus ancienne disparaît (2021 partira en 2027). La liste des années est recalculée à chaque construction (`data/sources.ts`, fonction `dvfDepartement37`).
- **Archive DVF** (`data/archive/dvf/`, versionnée dans le dépôt) : à chaque construction, les **2 années publiées les plus anciennes** (celles qui vont disparaître, et que DVF ne révise plus guère) sont copiées en Parquet compressé (colonnes utiles, ventes classiques et sur plan d'Indre-et-Loire, ~0,8 Mo par année). Un fichier n'est réécrit que si son contenu a changé (empreinte dans `manifest.json`). Une année qui n'est plus publiée reste dans l'archive pour toujours. `data/sql/_dvf.sql` lit les fichiers publiés **+** les années archivées qui ne sont plus publiées (aucun doublon). La construction automatique (GitHub Actions) enregistre elle-même l'archive dans le dépôt quand elle change (environ deux fois par an). Code : `scripts/archive-dvf.ts`. Taille : 1,9 Mo aujourd'hui (2021-2022), +0,8 Mo par an environ.
- Une vente DVF occupe plusieurs lignes (parcelles, locaux, natures de terrain) : `data/sql/_dvf.sql` regroupe tout par `id_mutation` et définit le type de bien (maison seule, appartement seul, terrain, autre). Prix au m² seulement pour une maison ou un appartement vendu seul, surface ≥ 15 m², entre 300 et 15 000 €/m² ; ventes < 1 000 € écartées. Échanges, adjudications et expropriations exclus.
- Le classement des prix au m² ne retient que les communes avec au moins 30 ventes de maisons sur la période.
- Carte des loyers : le jeu le plus récent est retrouvé automatiquement ; le test `data/tests/04_fraicheur.sql` signale si l'année affichée devient trop ancienne.
- **Fenêtre des prix** : les prix (médianes, prix au m², classement, département) portent sur les **5 dernières années disponibles** (vue `dvf_ventes_prix_recentes` de `_dvf.sql`) ; le nombre de ventes, la carte et les courbes utilisent toutes les années (fichiers publiés + archive).
- **Ventes** : une vente = une mutation (`id_mutation`) ; « autres » = plusieurs logements, locaux d'activité, dépendances seules ; quelques ventes n'ont pas de coordonnées et n'apparaissent pas sur la carte (le site l'indique).
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
| [Bases annuelles des accidents corporels de la circulation (BAAC)](https://www.data.gouv.fr/datasets/53698f4ca3a729239d2036df/) | Accidents corporels 2005 → dernière année : date et heure, lumière, météo, agglomération, intersection, type de collision, commune, coordonnées (pas l’adresse) ; usagers (rôle, gravité, sexe, année de naissance, équipement de sécurité) ; catégorie des véhicules ; type et numéro de route, vitesse maximale autorisée (depuis 2019), état de la chaussée | ONISR (Observatoire national interministériel de la sécurité routière), d'après les forces de l'ordre | Licence Ouverte 2.0 | Annuelle (automne, année N-1) | Archive `data/archive/baac/<année>-<table>.parquet` |

Notes :
- **Archive** : les 4 fichiers nationaux de chaque année (~25 Mo) ne sont pas retéléchargés à chaque construction. `scripts/archive-baac.ts` lit la liste des fichiers dans l'API data.gouv, et ne télécharge une année que si sa publication a changé (adresses notées dans `data/archive/baac/manifest.json`). Seule l'Indre-et-Loire est gardée (~0,6 Mo pour 2005-2025). Si data.gouv.fr ne répond pas pour la **liste** des fichiers, l'archive existante est utilisée ; au plus 3 années sont retéléchargées par construction (l'archive se complète sur plusieurs semaines si toutes les adresses changent). Une modification des requêtes `data/sql/baac/*.sql` refait l'archive (empreinte « sql » de `manifest.json`).
- **Harmonisation** (`data/sql/baac/*.sql`) : avant 2019, département « 370 » + commune « 139 », heures « 1930 », coordonnées sans virgule (souvent à 0 avant 2010) et fichiers en Windows-1252 ; le fichier 2022 nomme `Accident_Id` la colonne `Num_Acc`.
- **Rupture 2018** : la définition du « blessé hospitalisé » a changé (plus de 24 h à l'hôpital) ; les années antérieures ne sont pas strictement comparables sur la gravité.
- 12 des 35 accidents de Luynes (surtout avant 2010) n'ont pas de coordonnées : absents de la carte, comptés partout ailleurs.
- **2025 vérifié** (19/11/2026) : fichiers publiés le 30/10/2026, 517 accidents en Indre-et-Loire (523 en 2024, 585 en 2023) donc millésime complet ; aucun accident codé 37139 ni situé dans le contour de la commune. La page cite la date de publication du fichier de la dernière année (lue dans `manifest.json`).
- Taux « pour 1 000 habitants » calculés avec la population légale actuelle (API Géo).
- Requêtes : `data/sql/_accidents.sql` et `data/sql/accidents_*.sql`.

## Thème Écoles, santé & services

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [INSEE Melodi — `DS_BPE`](https://api.insee.fr/melodi/data/DS_BPE?GEO=COM-37139) | Nombre d'équipements par type (commerces, services, santé, enseignement, sport, tourisme) — Luynes, Indre-et-Loire, et totaux par domaine des 272 communes | INSEE, base permanente des équipements | Licence Ouverte 2.0 | Annuelle | `data/raw/bpe_luynes.json`, `bpe_37.json`, `bpe_communes_37.json` |
| Référentiel des codes BPE (`https://api.insee.fr/melodi/range/DS_BPE`) | Libellés des codes d'équipements (ex. D265 = médecin généraliste) | INSEE | Licence Ouverte 2.0 | Avec la BPE | `data/reference/bpe_libelles.csv` (extrait une fois ; le fichier source fait 13 Mo) |
| [Annuaire de l'éducation](https://data.education.gouv.fr/explore/dataset/fr-en-annuaire-education/) | Écoles et collège de Luynes : nom, public/privé, niveaux, position | Ministère de l'Éducation nationale | Licence Ouverte 2.0 | Quotidienne | `data/raw/ecoles_luynes.json` |
| [Effectifs d'élèves par école](https://data.education.gouv.fr/explore/dataset/fr-en-ecoles-effectifs-nb_classes/) | Élèves et classes de chaque école à chaque rentrée depuis 2009 — Luynes et total Indre-et-Loire | Ministère de l'Éducation nationale | Licence Ouverte 2.0 | Annuelle | `data/raw/effectifs_ecoles_luynes.json`, `effectifs_ecoles_37.json` |
| [Effectifs des collèges par niveau](https://data.education.gouv.fr/explore/dataset/fr-en-college-effectifs-niveau-sexe-lv/) | Élèves du collège Lucie-et-Raymond-Aubrac par niveau (6ᵉ → 3ᵉ), rentrées 2019 → dernière | Ministère de l'Éducation nationale | Licence Ouverte 2.0 | Annuelle | `data/raw/effectifs_college_luynes.json` |
| [IPS des écoles](https://data.education.gouv.fr/explore/dataset/fr-en-ips-ecoles-ap2022/) et [IPS des collèges](https://data.education.gouv.fr/explore/dataset/fr-en-ips-colleges-ap2023/) | Indice de position sociale de chaque établissement + moyennes départementales et nationales par secteur (public / privé) | Ministère de l'Éducation nationale (DEPP) | Licence Ouverte 2.0 | Annuelle | `data/raw/ips_ecoles_luynes.json`, `ips_college_luynes.json` |

Notes :
- ⚠️ Dans les effectifs, la colonne `code_commune_insee` contient le code postal (37230, partagé avec Fondettes) : filtre sur `commune = "LUYNES"` et le département.
- Collège et IPS : filtrés par les identifiants (UAI) des établissements ouverts de l'annuaire, en plus du code commune. L'IPS n'est pas publié pour les écoles maternelles seules ; chaque établissement est affiché à sa dernière rentrée publiée (pour l'école Pasteur, 2022-2023). Le nombre de classes du collège n'est pas publié dans ce jeu.
- Les moyennes « pour 1 000 habitants » du département incluent Tours et les villes, où se concentrent commerces et services.
- Si l'INSEE change la nomenclature des équipements, régénérer `data/reference/bpe_libelles.csv` (codes inconnus affichés tels quels en attendant).
- Requêtes : `data/sql/_equipements.sql`, `data/sql/equipements_*.sql`, `data/sql/ecoles_*.sql`.

## Thème Énergie & mobilité

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Consommation annuelle d'électricité et de gaz par commune](https://opendata.agenceore.fr/explore/dataset/consommation-annuelle-d-electricite-et-gaz-par-commune/) | Luynes : toutes les années (2011 → dernière), par filière, secteur et catégorie ; Indre-et-Loire : les 272 communes, dernière année | Agence ORE (gestionnaires de réseaux : Enedis, GRDF…) | Licence Ouverte 2.0 | Annuelle | `data/raw/energie_ore_luynes.json`, `energie_ore_37.json` |
| [Registre national des installations de production d'électricité (agrégé)](https://odre.opendatasoft.com/explore/dataset/registre-national-installation-production-stockage-electricite-agrege/) | Installations raccordées à Luynes ; puissance solaire et nombre d'installations par commune du 37 | ODRÉ (RTE, Enedis, ELD) | Licence Ouverte 2.0 | Mensuelle | `data/raw/solaire_luynes.json`, `solaire_communes_37.json` |
| [Parc de véhicules au niveau communal](https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/1582861b-e042-4490-9161-6429d8229703) (plateforme DiDo) | Véhicules au 1er janvier 2011 → dernière année, par carburant, Crit'Air, catégorie — Luynes (tout) et voitures particulières des communes du 37 (3 années) | SDES, ministère de la Transition écologique | Licence Ouverte 2.0 | Annuelle | `data/raw/parc_vehicules_luynes.json`, `parc_vp_37.json` |
| [Fichier consolidé des bornes de recharge (IRVE)](https://www.data.gouv.fr/datasets/fichier-consolide-des-bornes-de-recharge-pour-vehicules-electriques/) via l'API tabulaire | Points de charge dans un rectangle autour de Luynes, puis filtrés par le contour de la commune | Etalab / data.gouv.fr, d'après les aménageurs | Licence Ouverte 2.0 | Quotidienne | `data/raw/bornes_recharge.json` |

Notes :
- Uniquement des données de la commune (pas de station ni de capteur situé ailleurs).
- ORE : les lignes « secrétisées » (trop peu de clients) n'ont pas de valeur et sont ignorées ; la consommation dépend de la météo et la méthode a évolué : tendance plutôt que petites variations. « Par logement » = MWh divisés par le nombre de points de livraison résidentiels.
- Parc auto : le fichier a une colonne par année (`PARC_2011` … ) dépliée en SQL (`UNPIVOT`) ; il contient d'anciens codes de communes fusionnées, exclus des classements (272 communes actuelles). « HR » = hybride rechargeable, « HNR » = hybride non rechargeable.
- IRVE : le code commune est souvent vide → filtre par position + contour (`ST_Contains`) ; une station = les points de charge à la même adresse. La puissance est parfois non renseignée (0).
- GTFS Fil Bleu (bus) : écarté (choix éditorial).
- Requêtes : `data/sql/_energie.sql`, `data/sql/energie_*.sql`, `data/sql/mobilite_*.sql`.

## Thème Élections

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Données des élections agrégées](https://www.data.gouv.fr/datasets/donnees-des-elections-agregees) (`general_results.parquet`, `candidats_results.parquet`) | Inscrits, votants, voix par bureau de vote, tous scrutins 1999 → dernier (Luynes, Indre-et-Loire, France) | data.gouv.fr, d'après les résultats du ministère de l'Intérieur | Licence Ouverte 2.0 | À chaque nouvelle élection | archive `data/archive/elections/*.parquet` |
| [Municipales 2026 — résultats du 1er tour](https://www.data.gouv.fr/datasets/elections-municipales-2026-resultats-du-premier-tour/) et [du second tour](https://www.data.gouv.fr/datasets/elections-municipales-2026-resultats-du-second-tour/) (fichiers « Résultats - Communes », via l'API tabulaire) | Listes, têtes de liste, voix, sièges au conseil municipal et communautaire à Luynes | Ministère de l'Intérieur | Licence Ouverte 2.0 | Ponctuelle | `data/raw/municipales_2026_t1.json`, `municipales_2026_t2.json` |

Notes :
- **Archive** : DuckDB lit les fichiers nationaux à distance (seulement les colonnes utiles) et n'en garde que de petits extraits (≈ 60 Ko) : participation de Luynes / du 37 / de la France à chaque scrutin, participation des communes du 37 (classements), voix des candidats (Luynes partout ; 37 et France pour la présidentielle et les européennes). L'archive n'est refaite que si la source change (date ou « etag » des fichiers distants dans `manifest.json`) ou si les requêtes d'extraction changent (empreinte « sql ») ; si la source est injoignable, l'archive existante sert. Requêtes d'extraction : `data/sql/elections/*.sql`, script `scripts/archive-elections.ts`.
- **Neutralité** : candidats ou listes dans l'ordre des voix obtenues à Luynes, une seule couleur pour tous, aucune nuance politique reprise ; les « Le saviez-vous ? » ne portent que sur la participation. Les candidats sous 3 % partout sont regroupés dans « Autres ».
- **Référence « France »** : somme des bureaux du fichier national (avant 2012, sans les Français de l'étranger : écart possible d'environ un point avec le taux officiel). Quand le fichier ne couvre qu'une partie du territoire (municipales 2008 : communes de 3 500 habitants et plus), les références « Indre-et-Loire » et « France » sont laissées vides (`_elections.sql`) et ce scrutin n'est pas compté dans « Luynes a voté plus que la France ».
- Participation = votants / inscrits. Les comparaisons utilisent les 1ers tours (au 2nd tour, seules certaines communes ou circonscriptions votent). Les cantonales (jusqu'en 2011) sont rangées avec les départementales.
- Les fichiers officiels des municipales sont « larges » (une série de colonnes par liste) : dépliés en SQL (`elections_municipales.sql`).
- Requêtes : `data/sql/_elections.sql`, `data/sql/elections_*.sql`.

## Thème Délinquance

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Bases statistiques communale et départementale de la délinquance enregistrée](https://www.data.gouv.fr/datasets/bases-statistiques-communale-departementale-et-regionale-de-la-delinquance-enregistree-par-la-police-et-la-gendarmerie-nationales/) (fichiers « COM » Parquet et « DEP » CSV) | Faits enregistrés par indicateur et par année, 2016 → dernière année : Luynes, Indre-et-Loire, France (somme des départements) | SSMSI, ministère de l'Intérieur | Licence Ouverte 2.0 | Annuelle (juillet) | `data/raw/delinquance_communes/`, `data/raw/delinquance_departements/` |

Notes :
- Les adresses des fichiers changent à chaque publication : elles sont retrouvées via l'API data.gouv (`data/sources-delinquance.ts`).
- **Secret statistique** : quand trop peu de faits sont enregistrés, le SSMSI ne publie pas la valeur communale de l'année (`est_diffuse = 'ndiff'`) ; elle reste vide, jamais estimée (la colonne `complement_info_nombre` n'est pas utilisée). La page indique précisément les années manquantes et les faits publiés.
- Taux = moyenne des 3 dernières années (faits / population ou logements × 1 000) ; le taux de Luynes n'est calculé que si les 3 années sont publiées. Les cambriolages se rapportent aux logements, le reste aux habitants.
- Indicateurs « stupéfiants » non repris (ils mesurent l'activité des services, pas des victimes). Pas de classement départemental (trop instable avec si peu de faits).
- Requêtes : `data/sql/_delinquance.sql`, `data/sql/delinquance_*.sql`.

## Thème Eau potable

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Hub'eau — qualité de l'eau potable](https://hubeau.eaufrance.fr/page/api-qualite-eau-potable) | Toutes les analyses de l'eau distribuée à Luynes (réseau « FONDETTES (LUYNES) ») depuis 2016 : paramètres, résultats, conformité de chaque prélèvement | Agences régionales de santé (contrôle sanitaire), ministère de la Santé ; API Hub'eau (OFB, BRGM) | Licence Ouverte 2.0 | Mensuelle | `data/raw/eau_luynes.json` |
| Idem, Indre-et-Loire | Nitrates (1340), dureté (1345) et E. coli (1449) de toutes les communes, années récentes (Hub'eau limite une requête à 20 000 résultats) | idem | Licence Ouverte 2.0 | Mensuelle | `data/raw/eau_37_*.json` |

Notes : un prélèvement = un échantillon analysé pour plusieurs paramètres ; conformité « C / N / S » (conforme, non conforme, sans objet). Les valeurs sous le seuil de détection (« <0,5 ») sont publiées à 0. Requêtes : `data/sql/_eau.sql`, `data/sql/eau_*.sql`.

## Thème Construction & logement social

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Sitadel — logements autorisés et commencés, séries mensuelles communales](https://www.statistiques.developpement-durable.gouv.fr/catalogue?page=dataset&datasetId=660432ce0b8987ef5dd9465d) | Logements autorisés et commencés à Luynes par mois depuis 2002, total et collectifs | SDES (ministère de la Transition écologique) | Licence Ouverte 2.0 | Mensuelle | `data/raw/sitadel_luynes.json` |
| [RPLS — répertoire des logements locatifs des bailleurs sociaux](https://www.statistiques.developpement-durable.gouv.fr/catalogue?page=datafile&datafileRid=f3c2f2cb-8fb1-40fd-8733-964247744c9a) | Logements sociaux de Luynes : pièces, surface, année de construction, DPE (sans l'adresse) | SDES | Licence Ouverte 2.0 | Annuelle (1er janvier) | `data/raw/rpls_luynes.json` |

Notes : l'API DiDo du SDES est lente (≈ 20 s par page de 100 lignes) : seuls Luynes et deux types de logements (total, collectif) sont téléchargés, d'où l'absence de comparaison départementale. Sitadel est en date de prise en compte administrative (pas la date réelle du chantier) ; l'année en cours, incomplète, n'est pas affichée. Requêtes : `data/sql/_construction.sql`, `data/sql/construction_*.sql`.

## Thème Transparence

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [Balances comptables des communes](https://data.economie.gouv.fr/explore/?q=balances-comptables-des-communes) (un jeu par année, 2010 → dernière année) | Solde de chaque compte du budget principal de Luynes (SIREN 213701394) : dépenses par nature, indemnités des élus (6531 puis 65311), subventions (6574 puis 65748 ; CCAS 657362 puis 657363) | DGFiP (ministère de l'Économie) | Licence Ouverte 2.0 | Annuelle | `data/raw/balances_luynes/` |
| Idem, toutes les communes de France | Seuls les comptes d'indemnités et de subventions, dernière année : moyenne des communes de même taille et médiane d'Indre-et-Loire | DGFiP | Licence Ouverte 2.0 | Annuelle | `data/raw/balances_communes_france/` |
| Comptes individuels des communes (population et strate) | Population retenue par la DGFiP et strate de chaque commune | DGFiP | Licence Ouverte 2.0 | Annuelle | `data/raw/populations_communes_france/` |
| [Données essentielles de la commande publique consolidées](https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-consolidees-format-tabulaire/) | Marchés attribués par la mairie (SIRET 21370139400016) : objet, titulaire, date, plafond du contrat | data.gouv.fr (consolidation des DECP) | Licence Ouverte 2.0 | Quotidienne | `data/raw/decp_luynes.parquet` |
| [BOAMP](https://boamp-datadila.opendatasoft.com/explore/dataset/boamp/) | Avis d'appel d'offres publiés par « Mairie Luynes » | DILA | Licence Ouverte 2.0 | Quotidienne | `data/raw/boamp_luynes/` |
| [Répertoire national des élus](https://www.data.gouv.fr/datasets/repertoire-national-des-elus-1/) | Conseillers municipaux : sexe, date de naissance (utilisée seulement pour l'âge), catégorie socioprofessionnelle, fonction ; nom et prénom du **maire seul** | Ministère de l'Intérieur | Licence Ouverte 2.0 | Quotidienne | `data/raw/rne_conseil.json`, `rne_maire.json` |

Notes : plan comptable M14 jusqu'en 2023, M57 depuis 2024 : les comptes sont rapprochés par leurs premiers chiffres (6531 → 65311, 6574 → 65748, 657362 → 657363) ; les amortissements et provisions (68) et les cessions (675, 676) sont écartés, ce sont des écritures sans sortie d'argent. **Les montants des marchés sont des plafonds de contrat, jamais des dépenses : ils ne sont pas additionnés.** La commune ne publie ses marchés dans la base nationale que depuis fin 2025. Le fichier des élus est téléchargé sans nom ni prénom (colonnes choisies dans l'adresse de l'API) ; seule la fonction « Maire » est téléchargée avec son nom ; aucun PDF de la commune n'est utilisé. Le gros fichier DECP (≈ 280 Mo) n'est pas téléchargé : DuckDB n'en lit à distance que les lignes de Luynes (source de type « parquet-extrait »). Requêtes : `data/sql/_transparence.sql`, `data/sql/transparence_*.sql`.

## Mise à jour et pannes

Les données sont téléchargées à nouveau à chaque construction du site (au moins une fois par semaine), avec 3 tentatives
par source. Si une source ne répond toujours pas, sa version précédente (gardée d'une construction à l'autre par le cache
GitHub Actions de `data/raw/`) est réutilisée et signalée en pied de page (« données du … ») ; la construction n'échoue
que si aucune version n'existe. Les tests `data/tests/*.sql` (dont la fraîcheur des millésimes) sont lancés avant chaque
publication.

La liste technique des sources est dans `data/sources.ts` et `data/sources-<thème>.ts`.
