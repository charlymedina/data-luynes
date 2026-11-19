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
| [OpenFreeMap](https://openfreemap.org) | Fond de carte (styles « positron » et « dark »), chargé par le navigateur du visiteur | OpenFreeMap, données OpenStreetMap | ODbL (données OSM) | — | — |

Notes :
- Les réponses paginées (Géorisques, API tabulaire) sont fusionnées par `scripts/build-data.ts` en un seul fichier `{ "data": [...] }`.
- Les codes INSEE « lors de la protection » de Mérimée peuvent être d'anciens codes de communes fusionnées : celles-ci comptent alors 0 monument dans le classement.
- Requêtes : `data/sql/patrimoine_*.sql` et `data/sql/risques_*.sql`.

Les données sont téléchargées à nouveau à chaque construction du site (au moins une fois par semaine),
avec 3 tentatives par source en cas de panne passagère.
La liste technique des sources est dans `data/sources.ts`.
