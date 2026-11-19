# Catalogue des données ouvertes exploitables pour Luynes (37139)

> Inventaire réalisé le **19/11/2026**. Commune : Luynes, INSEE **37139**, code postal **37230** (partagé avec Fondettes !),
> département 37, région 24 (Centre-Val de Loire), EPCI **243700754** (Tours Métropole Val de Loire).
>
> Contrainte du projet : build hebdomadaire GitHub Actions + DuckDB → sources **téléchargeables par URL, sans authentification**.
> « Vérifié = oui » signifie : appel réel effectué le 19/11/2026 et **présence de Luynes constatée** dans la réponse
> (sauf mention contraire). Les chiffres cités dans les fiches sont des relevés bruts du jour, à recalculer proprement en SQL.

## 0. Outils d'accès transverses (à connaître avant tout)

| Outil | Ce qu'il permet | Remarque |
|---|---|---|
| **INSEE Melodi** `https://api.insee.fr/melodi/data/<DS>?GEO=COM-37139` | ~160 jeux INSEE (recensement, Filosofi, BPE, état civil, SIDE, Flores, salaires…) filtrés sur la commune, en JSON | **Sans clé**. Remplacer `COM-37139` par `DEP-37`, `EPCI-243700754`, `FRANCE`… pour les comparaisons. Catalogue : `https://api.insee.fr/melodi/catalog/all`. Pagination `maxResult`/`page`. Rate limit non documenté dans les en-têtes → rester sobre (≈30 req/min). |
| **API tabulaire data.gouv** `https://tabular-api.data.gouv.fr/api/resources/<resource_id>/data/?<col>__exact=<val>` | Filtrer côté serveur n'importe quel CSV hébergé sur data.gouv (ex. Mérimée, IRVE) sans télécharger 100 Mo | Sans clé. Pagination `page_size` (max 50). |
| **SDES DiDo** `https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/<rid>/rows?millesime=<m>&<COL>=eq:<val>&pageSize=100` | Sitadel, RPLS, parc de véhicules, énergie… filtrés par commune | Sans clé. `pageSize` ∈ {10,20,50,100}. ⚠️ l'export `/csv` avec filtre renvoie souvent une erreur 503 → utiliser `/rows` (JSON paginé). |
| **Opendatasoft (ODS)** `…/api/explore/v2.1/catalog/datasets/<id>/records?where=…` et `/exports/csv?where=…` | data.economie.gouv.fr (DGFiP), data.education.gouv.fr, data.tours-metropole.fr, data.centrevaldeloire.fr, odre.opendatasoft.com, data.drees… | Sans clé. Export CSV filtré = idéal pour DuckDB. |
| **data-fair** `…/data-fair/api/v1/datasets/<id>/lines?qs=<col>:<val>&format=csv` | ADEME (DPE), Agence ORE (énergie) | Sans clé. |
| **DuckDB httpfs** sur Parquet distant | Lire seulement les colonnes/lignes utiles d'un gros Parquet (élections agrégées, SSMSI, SIRENE) | Les serveurs testés acceptent `Range` (`Accept-Ranges: bytes`). |

## 1. Tableau récapitulatif

Légende granularité : **GPS** (point géolocalisé), **IRIS**, **COM** (commune), **EPCI**, **DEP**.

| Thème | Jeu de données | Producteur | URL de téléchargement / endpoint | Format | Granularité pour Luynes | Période | MAJ | Licence | Vérifié |
|---|---|---|---|---|---|---|---|---|---|
| Accidents | Bases annuelles des accidents corporels (BAAC) – caractéristiques, lieux, véhicules, usagers | Ministère de l'Intérieur / ONISR | Dataset `53698f4ca3a729239d2036df` ; ex. `https://static.data.gouv.fr/resources/bases-de-donnees-annuelles-des-accidents-corporels-de-la-circulation-routiere-annees-de-2005-a-2025/20261030-141517/caract-2025.csv` (URL différente par fichier et par année, à lire via l'API data.gouv) | CSV `;` | **GPS** (lat/long) + COM | 2005–2025 | annuelle (oct.-nov.) | Licence Ouverte | oui 19/11/2026 (2018, 2019, 2023, 2024, 2025) |
| Immobilier | Géo-DVF (ventes immobilières géolocalisées) | DGFiP / Etalab | `https://files.data.gouv.fr/geo-dvf/latest/csv/<année>/communes/37/37139.csv` | CSV `,` | **GPS** (parcelle) | 2021–2025 (5 ans glissants) | semestrielle | Licence Ouverte 2.0 | oui 19/11/2026 |
| Immobilier | Carte des loyers (indicateurs de loyers d'annonce) | Ministère Transition écologique (ANIL / SeLoger / Leboncoin) | Un dataset par millésime (2018, 2022–2025) ; ex. 2025 maison : `https://static.data.gouv.fr/resources/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025/20251211-145039/pred-mai-mef-dhup.csv` (+ appart, appart T1-T2, T3+) | CSV `;` | COM | 2018, 2022–2025 | annuelle (déc.) | Licence Ouverte 2.0 | oui 19/11/2026 |
| Immobilier | RPLS – logements sociaux (détail au logement) | SDES | DiDo `rows` sur datafile `f3c2f2cb-8fb1-40fd-8733-964247744c9a`, filtre `DEPCOM_CODE=eq:37139` | JSON/CSV | **adresse/GPS** (X,Y Lambert) | 2022–2024 (millésimes) | annuelle | Licence Ouverte | oui 19/11/2026 (348 logements au 1/1/2024) |
| Immobilier | Sitadel – logements autorisés/commencés, séries mensuelles communales | SDES | DiDo datafile `577a8a66-4157-4787-b00a-031b61afea61`, filtre `CODE_INSEE=eq:37139` | JSON | COM (mensuel) | 2002 → 2026-10 | mensuelle | Licence Ouverte | oui 19/11/2026 |
| Immobilier | Sitadel – liste des permis (logements, locaux, aménager, démolir) | SDES | DiDo datafiles `8b35affb-…` (logements), `f8f0700f-…` (locaux), `96883f50-…` (PA), `1a9a2f0c-…` (démolir), filtre `COMM=eq:37139` | JSON | adresse + parcelle | ~2013 → 2026 | mensuelle | Licence Ouverte | oui 19/11/2026 |
| Immobilier | DPE logements existants (depuis 07/2021) | ADEME | `https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?qs=code_insee_ban:37139&format=csv&size=10000` | CSV/JSON | **adresse/GPS** | 07/2021 → | quotidienne | Licence Ouverte 2.0 | oui 19/11/2026 (1 017 DPE) |
| Immobilier | DPE logements neufs (depuis 07/2021) | ADEME | idem avec `dpe02neuf` | CSV/JSON | adresse | 07/2021 → | quotidienne | Licence Ouverte 2.0 | oui 19/11/2026 (7 DPE) |
| Population | Séries historiques du recensement (1968→2023) | INSEE | Melodi `DS_RP_SERIE_HISTORIQUE` (et `DS_POPULATIONS_HISTORIQUES`) | JSON | COM | 1968, 75, 82, 90, 99, 2007, 12, 17, 23 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Population | Populations communales depuis 1876 | INSEE (repris par Tours Métropole) | `https://data.tours-metropole.fr/api/explore/v2.1/catalog/datasets/population-1876-2023-tours-metropole-val-de-loire/exports/csv?where=libelle_geographique%3D%22Luynes%22` | CSV | COM | 1876–2023 | annuelle | INSEE (réutilisation libre) | oui 19/11/2026 (23 points) |
| Population | Population par sexe et âge détaillé (POP1) | INSEE | Melodi `DS_RP_TD_POPULATION_AGESEX_PRINC` | JSON | COM (IRIS dispo via `_IRIS`) | 2023 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Population | Indicateurs « dossier complet » : population, ménages, familles, logement, diplômes, emploi, navettes, migrations | INSEE | Melodi `DS_RP_POPULATION_PRINC`, `DS_RP_MENAGES_PRINC`, `DS_RP_LOGEMENT_PRINC`, `DS_RP_DIPLOMES_PRINC`, `DS_RP_EMPLOI_LR_PRINC`, `DS_RP_NAVETTES_PRINC`, `DS_RP_MIGRES_PRINC`… | JSON | COM (+ IRIS) | 2012, 2017, 2023 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Population | Naissances et décès annuels domiciliés | INSEE (état civil) | Melodi `DS_ETAT_CIVIL_NAIS_COMMUNES`, `DS_ETAT_CIVIL_DECES_COMMUNES` | JSON | COM | 2008–2025 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Population | Corps électoral (inscrits par âge, sexe, nationalité) | INSEE (REU) | Melodi `DS_ELECTORAL` | JSON | COM | 2020–2026 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Population | Prénoms des naissances | INSEE | Melodi `DS_PRENOM?GEO=DEP-37` | JSON | **DEP seulement** | 1900 → | annuelle | Licence Ouverte | oui (DEP) ; COM absente |
| Revenus | Filosofi : niveau de vie médian, pauvreté, composition du revenu | INSEE | Melodi `DS_FILOSOFI_CC` ; par âge/statut : `DS_FILOSOFI_SAGE_LOG_TP_NIVVIE` | JSON | COM | 2023 | annuelle | Licence Ouverte | oui 19/11/2026 (médiane 28 830 €) |
| Revenus | Impôt sur le revenu par commune (IRCOM) : foyers fiscaux, RFR, salaires, retraites | DGFiP | data.gouv `536998cba3a729239d20505e` ; version filtrable : `data.tours-metropole.fr/.../revenus-2024-des-foyers-fiscaux-tours-metropole-val-de-loire` et `data.centrevaldeloire.fr/.../revenus-20XX-des-foyers-fiscaux-en-region-centre-val-de-loire` (2018→2023) | CSV/XLSX | COM | ~2018–2024 | annuelle | Licence Ouverte 2.0 | oui 19/11/2026 (TM 2024) |
| Emploi | Salaires du privé par sexe/âge et par PCS (base tous salariés) | INSEE | Melodi `DS_BTS_SAL_EQTP_SEX_AGE`, `DS_BTS_SAL_EQTP_SEX_PCS` | JSON | COM | 2023–2024 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Emploi | Chômage, activité, emploi au lieu de travail (recensement) | INSEE | Melodi `DS_RP_EMPLOI_LR_PRINC`, `DS_RP_EMPLOI_LT_PRINC`, `DS_RP_ACTIVITE_PRINC` | JSON | COM | 2012, 2017, 2023 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Emploi | Établissements et effectifs salariés (Flores) | INSEE | Melodi `DS_FLORES_A17` (aussi A5/A38/A88, `DS_FLORES_PE` = particuliers employeurs) | JSON | COM | 2024 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Entreprises | Créations d'entreprises (SIDE) | INSEE | Melodi `DS_SIDE_CREA_COM` | JSON | COM | 2012→ (≥1000 obs., paginer) | annuelle | Licence Ouverte | oui 19/11/2026 |
| Entreprises | Stocks d'entreprises/établissements (SIDE) | INSEE | Melodi `DS_SIDE_STOCKS_COM` | JSON | COM | 2014–2024 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Entreprises | Annuaire des entreprises (SIRENE enrichi) | DINUM | `https://recherche-entreprises.api.gouv.fr/search?code_commune=37139&per_page=25&page=N` (`&est_association=true` pour les associations) | JSON | **GPS/adresse** | stock actuel | quotidienne | Licence Ouverte | oui 19/11/2026 (951 unités) |
| Entreprises | SIRENE consolidé région CVL (établissements actifs) | INSEE via Tours Métropole | `https://data.tours-metropole.fr/api/explore/v2.1/catalog/datasets/sirene-v3-consolidee-rcvl/exports/csv?where=search(%22luynes%22)` | CSV | GPS | stock actuel | ? | Licence Ouverte | oui 19/11/2026 (751 lignes « luynes ») |
| Équipements | BPE – dénombrement des équipements (commerces, santé, services, sport, éducation) | INSEE | Melodi `DS_BPE`, `DS_BPE_EDUCATION`, `DS_BPE_SPORT_CULTURE` | JSON | COM | 2025 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Tourisme | Capacités d'hébergement touristique | INSEE | Melodi `DS_TOUR_CAP` | JSON | COM | 2026 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Éducation | Annuaire de l'éducation | Éducation nationale | `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/exports/csv?where=code_commune%3D%2237139%22` | CSV | **GPS** | actuel | quotidienne | Licence Ouverte 2.0 | oui 19/11/2026 (4 écoles + collège) |
| Éducation | Effectifs d'élèves par école | Éducation nationale | `…/fr-en-ecoles-effectifs-nb_classes/records?where=numero_ecole in (…)` | CSV/JSON | école | 2011–2025 | annuelle | Licence Ouverte 2.0 | oui 19/11/2026 |
| Éducation | IPS (indice de position sociale) écoles / collèges | Éducation nationale | `fr-en-ips-ecoles-ap2022`, `fr-en-ips-colleges-ap2022` (filtre `code_insee_de_la_commune`) | CSV | établissement | 2022–2025 | annuelle | Licence Ouverte 2.0 | oui 19/11/2026 |
| Éducation | Résultats au brevet / valeur ajoutée du collège | Éducation nationale | `fr-en-dnb-par-etablissement`, `fr-en-indicateurs-valeur-ajoutee-colleges` (UAI `0371378X`) | CSV | établissement | 2006–2024 | annuelle | Licence Ouverte 2.0 | oui 19/11/2026 |
| Santé | FINESS – établissements sanitaires et sociaux (géolocalisés) | Ministère de la Santé | `https://static.data.gouv.fr/resources/finess-extraction-du-fichier-des-etablissements/20260512-091152/etalab-cs1100507-stock-20260512-0339.csv` (URL change à chaque extraction) | CSV `;` | **GPS** | stock | ~bimestrielle | Licence Ouverte | oui 19/11/2026 (CH, EHPAD, ESAT, pharmacie…) |
| Santé | APL – accessibilité potentielle localisée aux médecins, etc. | DREES | Pièces jointes `https://data.drees.solidarites-sante.gouv.fr/api/explore/v2.1/catalog/datasets/530_l-accessibilite-potentielle-localisee-apl/attachments` | ZIP/7z (xlsx) | COM | 2015–2022+ | annuelle | Licence Ouverte | partiel (accès OK, contenu commune non ouvert) |
| Santé | Annuaire Santé (RPPS) – professionnels | ANS | `ps-libreacces-personne-activite.txt` (830 Mo) sur data.gouv `69025e6c73d1f9b79ca3c365` | TXT `|` | adresse | actuel | quotidienne | Licence Ouverte 2.0 | accès oui ; Luynes non vérifié (fichier trop gros) |
| Élections | Municipales 2026 (T1) – résultats par commune et par bureau | Ministère de l'Intérieur | dataset `69b82a7de5d58cc06ad35ce0` ; ex. `…/municipales-2026-resultats-communes-2026-03-20.csv` | CSV `;` (format large) | COM + bureau | 2026 | ponctuelle | Licence Ouverte 2.0 | oui 19/11/2026 |
| Élections | Données des élections agrégées (toutes élections 1999→2024, par bureau) | data.gouv.fr | `https://data-pipeline-open.s3.sbg.io.cloud.ovh.net/elections/general_results.parquet` et `candidats_results.parquet` | Parquet | bureau de vote | 1999–07/2024 | ponctuelle | Licence Ouverte 2.0 | accès oui (Range OK) ; filtre Luynes non testé |
| Finances | Comptes individuels des communes (budget, dette, impôts, par habitant + moyenne de strate) | DGFiP | `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/comptes-individuels-des-communes-fichier-global-2025/exports/csv?where=dep%3D%22037%22%20and%20icom%3D%22139%22` (un dataset par année/groupe d'années, 2000→2025) | CSV | COM | 2000–2025 | annuelle | Licence Ouverte 2.0 | oui 19/11/2026 |
| Finances | Fiscalité locale des particuliers (taux TFB, TFNB, TH…) | DGFiP | data.gouv `66512b67b8c9abb821e5a98b` ; taux aussi dans les comptes individuels (`tfb`, `tmfb`) | CSV | COM | ~2010→ | annuelle | Licence Ouverte 2.0 | taux via comptes : oui (TFB 43,8 % en 2023-2025) |
| Délinquance | Base statistique communale de la délinquance enregistrée | Ministère de l'Intérieur / SSMSI | `https://static.data.gouv.fr/resources/bases-statistiques-communale-departementale-et-regionale-de-la-delinquance-enregistree-par-la-police-et-la-gendarmerie-nationales/20260709-120017/donnee-comm-data.gouv-parquet-2025-geographie2026-produit-le2026-06-25.parquet` (+ csv.gz) | Parquet / CSV.gz | COM | 2016–2025 | annuelle (juillet) | Licence Ouverte 2.0 | oui 19/11/2026 |
| Risques | Arrêtés CatNat | Géorisques (MTE/BRGM) | `https://georisques.gouv.fr/api/v1/gaspar/catnat?code_insee=37139&page_size=100` | JSON | COM | 1982 → | continue | Licence Ouverte | oui 19/11/2026 (19 arrêtés) |
| Risques | Cavités souterraines | Géorisques / BRGM | `…/api/v1/cavites?code_insee=37139&page_size=100` | JSON | **GPS** | inventaire | continue | Licence Ouverte | oui 19/11/2026 (193 cavités) |
| Risques | Mouvements de terrain | Géorisques / BRGM | `…/api/v1/mvt?code_insee=37139` | JSON | **GPS** | historique (dès 1943) | continue | Licence Ouverte | oui 19/11/2026 (23 événements) |
| Risques | Risques recensés, AZI, TRI, radon, sismicité | Géorisques | `…/gaspar/risques`, `…/gaspar/azi`, `…/gaspar/tri`, `…/radon`, `…/zonage_sismique` (`?code_insee=37139`) | JSON | COM | actuel | continue | Licence Ouverte | oui 19/11/2026 |
| Risques | Retrait-gonflement des argiles (exposition) | Géorisques | `…/api/v1/rga?latlon=<lon>,<lat>` | JSON | point | actuel | ponctuelle | Licence Ouverte | oui 19/11/2026 (centre : « moyenne ») |
| Risques | ICPE (installations classées) et CASIAS (anciens sites industriels) | Géorisques | `…/installations_classees?code_insee=37139`, `…/ssp/casias?code_insee=37139` | JSON | **GPS** | actuel | continue | Licence Ouverte | oui 19/11/2026 (7 ICPE, 9 CASIAS) |
| Climat | Données climatologiques quotidiennes Météo-France (station TOURS 37179001 et autres du 37) | Météo-France | `https://meteofrance.s3.sbg.io.cloud.ovh.net/data/synchro_ftp/BASE/QUOT/Q_37_previous-1950-2024_RR-T-Vent.csv.gz` + `Q_37_latest-2025-2026_RR-T-Vent.csv.gz` | CSV.gz `;` | station (pas à Luynes) | 1950 → J-1 | quotidienne | Licence Ouverte 2.0 | oui 19/11/2026 (16 stations dans le 37, aucune à Luynes) |
| Climat | Archive météo réanalyse (ERA5) au point de Luynes | Open-Meteo | `https://archive-api.open-meteo.com/v1/archive?latitude=47.385&longitude=0.555&start_date=1940-01-01&end_date=…&daily=…` | JSON | maille ~10–25 km | 1940 → J-2 | quotidienne | CC BY 4.0, usage non commercial gratuit | oui 19/11/2026 |
| Air | Indice ATMO quotidien par commune | Atmo France / Lig'Air | `https://data.atmo-france.org/geoserver/ind/ows?service=WFS&version=2.0.0&request=GetFeature&TypeNames=ind_atmo_2021&outputformat=csv&CQL_FILTER=code_zone='37139'` | CSV | COM | **J-1 à J+2 seulement** (historique : API avec compte) | quotidienne | ODbL | oui 19/11/2026 |
| Eau | Qualité de l'eau potable (contrôle sanitaire) | Hub'eau (ARS / Min. Santé) | `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_commune=37139&date_min_prelevement=…` | JSON/CSV | réseau (UDI) desservant la commune | ~2016 → | mensuelle | Licence Ouverte | oui 19/11/2026 (743 résultats en 2026 ; réseau « FONDETTES (LUYNES) ») |
| Eau | Hauteur/débit de la Loire (stations Tours K490003010 et Langeais K683002001) | Hub'eau hydrométrie | `https://hubeau.eaufrance.fr/api/v2/hydrometrie/obs_elab?code_entite=K490003010&grandeur_hydro_elab=QmJ` | JSON | station | temps réel + séries élaborées | continue | Licence Ouverte | stations oui ; séries non testées |
| Occupation du sol | Corine Land Cover 1990→2018 | SDES / IGN | WFS `https://data.geopf.fr/wfs/ows?…&typeNames=LANDCOVER.CLC18_FR:clc18_fr&bbox=…` | GeoJSON | polygones (≥25 ha) | 1990, 2000, 2006, 2012, 2018 | 6 ans | Licence Ouverte | oui 19/11/2026 |
| Énergie | Consommation annuelle électricité & gaz par commune et secteur | Agence ORE | `https://opendata.agenceore.fr/data-fair/api/v1/datasets/consommation-annuelle-d-electricite-et-gaz-par-commune/lines?qs=code_commune:37139&format=csv&size=1000` | CSV | COM × secteur | 2011–2024 | annuelle | Licence Ouverte 2.0 | oui 19/11/2026 (289 lignes) |
| Énergie | Consommation électricité/gaz à l'adresse et à l'IRIS | SDES | DiDo datasets `6102466697d9291fc5ce2d70` (adresse) / `610244c9e436671e84ec5da8` (IRIS) | CSV | adresse / IRIS | 2018–2025 | annuelle | Licence Ouverte | accès oui ; filtre Luynes non testé |
| Énergie | Registre national des installations de production (solaire…) | ODRÉ (RTE/Enedis…) | `https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/registre-national-installation-production-stockage-electricite-agrege/exports/csv?where=codeinseecommune%3D%2237139%22` | CSV | COM (agrégé <36 kW) | stock | annuelle | Licence Ouverte 2.0 | oui 19/11/2026 (5 lignes, solaire) |
| Énergie | Consommation de gaz (TM) | GRDF via Tours Métropole | `data.tours-metropole.fr/.../consommation-de-gaz-tmvl` | CSV | COM/IRIS | ? | ? | ? | oui (397 lignes « luynes ») |
| Mobilité | Bornes de recharge IRVE (base nationale consolidée) | data.gouv.fr (Etalab) | resource `eb76d20a-8501-400e-b336-d85724de5435` via API tabulaire ; fichier complet 118 Mo | CSV | **GPS** | stock | quotidienne | Licence Ouverte | oui 19/11/2026 (⚠️ `code_insee_commune` souvent vide) |
| Mobilité | Parc de véhicules par commune (carburant, Crit'Air) | SDES | DiDo datafile `1582861b-e042-4490-9161-6429d8229703`, filtre `COMMUNE_CODE=eq:37139` | JSON | COM | 2011–2026 (au 1er janvier) | annuelle | Licence Ouverte | oui 19/11/2026 (101 lignes) |
| Mobilité | GTFS Fil Bleu (horaires théoriques) | Syndicat des Mobilités de Touraine / TMVL | `https://data.tours-metropole.fr/api/v2/catalog/datasets/horaires-temps-reel-gtfsrt-reseau-filbleu-tmvl/alternative_exports/filbleu_gtfszip` | ZIP GTFS | arrêt GPS | en cours | hebdo | Licence Ouverte 2.0 | référencé sur transport.data.gouv (MAJ 16/11/2026) ; zip non ouvert |
| Mobilité | Arrêts Fil Bleu, aménagements cyclables, stationnement vélo, limitations de vitesse | Tours Métropole | `data.tours-metropole.fr` : `arrets-fil-bleu-…`, `amenagementcyclable_smt`, `stationnement-velo-tours-metropole`, `limitation-vitesse-…` | CSV/GeoJSON | GPS / tronçon | actuel | variable | ODbL (cyclable) / Licence Ouverte | oui 19/11/2026 (24 arrêts, 6 tronçons cyclables…) |
| Mobilité | Navettes domicile-travail (mode de transport, lieu de travail) | INSEE | Melodi `DS_RP_NAVETTES_PRINC`, `DS_RP_TD_NAVETTES_SEXTRANSPORT_COMP` | JSON | COM | 2012, 2017, 2023 | annuelle | Licence Ouverte | oui 19/11/2026 |
| Patrimoine | Immeubles protégés Monuments historiques (Mérimée) | Ministère de la Culture | `https://ministere-culture.s3.sbg.io.cloud.ovh.net/POP/merimee.csv` (100 Mo) ; filtré : API tabulaire resource `3a52af4a-f9da-4dcc-8110-b07774dfb3bc` `?Commune_forme_index__exact=Luynes` | CSV | **GPS** | 1840 → | hebdomadaire | Licence Ouverte 2.0 | oui 19/11/2026 (8 monuments) |
| Société | Associations (RNA) | Ministère de l'Intérieur | `https://media.interieur.gouv.fr/rna/rna_waldec_<AAAAMMJJ>.zip` (410 Mo, un CSV par département) | ZIP/CSV | adresse | 1901 → | mensuelle | Licence Ouverte | accès oui ; Luynes non vérifié (zip trop lourd) |
| Adresses | Base Adresse Nationale (BAN) | IGN / DINUM | `https://adresse.data.gouv.fr/data/ban/adresses/latest/csv/adresses-37.csv.gz` (10 Mo, filtrer `code_insee`) ; BAL TM : `base-adresse-locale-tours-metropole-val-de-loire` | CSV | **GPS** | actuel | hebdo | Licence Ouverte 2.0 | fichier oui ; 2 389 adresses Luynes dans la BAL TM |
| Cadastre | Cadastre Etalab (parcelles, bâtiments, sections…) | DGFiP / Etalab | `https://cadastre.data.gouv.fr/data/etalab-cadastre/latest/geojson/communes/37/37139/cadastre-37139-parcelles.json.gz` (et `-batiments`, `-sections`, `-lieux_dits`) | GeoJSON.gz | parcelle | actuel | trimestrielle | Licence Ouverte 2.0 | oui 19/11/2026 (640 Ko / 180 Ko) |
| Géographie | API Géo (contour, centre, surface, population légale) | Etalab / IGN / INSEE | `https://geo.api.gouv.fr/communes/37139?fields=contour,centre,surface,population&format=geojson` | GeoJSON | COM | actuel | annuelle | Licence Ouverte 2.0 | oui (déjà utilisé) |
| Métropole | Divers TM : PLU (zonage), arbres, points lumineux, délibérations, boîtes à livres, marchés, antennes 2G-5G, effectifs scolaires, naissances/décès | Tours Métropole Val de Loire | `https://data.tours-metropole.fr/api/explore/v2.1/catalog/datasets/<id>/exports/csv?where=search(%22luynes%22)` | CSV/GeoJSON | GPS / COM | variable | variable | majoritairement Licence Ouverte (vérifier par jeu) | oui 19/11/2026 (comptages en §2.13) |

**Total : 52 jeux retenus** (lignes ci-dessus, en comptant les familles Melodi/Géorisques comme indiqué), dont 44 vérifiés avec présence de Luynes.

---

## 2. Fiches par jeu

### 2.1 Accidents de la route — BAAC (ONISR)
- **Structure** : 4 fichiers par an reliés par `Num_Acc` : `caract` (date, heure, luminosité, météo, commune `com`, adresse, **lat/long**), `lieux` (catégorie de route, vitesse max, surface), `vehicules` (catégorie, manœuvre), `usagers` (gravité, âge, place, sexe, équipement de sécurité). Depuis 2023 il existe aussi `vehicules-immatricules-baac-AAAA.csv`.
- **Filtrage** : 2019+ : `dep = '37' AND com = '37139'`. **Avant 2019** : `dep = '370'` et `com = '139'` (code à 3 chiffres), séparateur `,`, encodage **Latin-1**, lat/long sans virgule (`4738753` = 47,38753) et parfois à 0.
- **Chiffres relevés** : 2018 : 5 accidents ; 2019 : 5 ; 2022 : 0 ; 2023 : 2 (D3) ; 2024 : 1 (D6) ; **2025 : aucun accident corporel** recensé à Luynes.
- **Idées** : carte des accidents 2005–2025 (points), « route la plus accidentogène » (D952 ? D6 ? D3 ?), heure/jour des accidents, comparaison taux pour 1 000 hab. vs métropole ; « Le saviez-vous : aucun accident corporel en 2025 ».
- **Visualisation** : carte de points + barres annuelles. **Difficulté : moyen** (19 années × 4 fichiers, formats changeants).
- **Pièges** : noms de fichiers incohérents (`carcteristiques-2021/2022.csv` avec faute, `caracteristiques_2016.csv`), URL différente à chaque publication → récupérer les URL via `https://www.data.gouv.fr/api/1/datasets/53698f4ca3a729239d2036df/` ; changement de méthode en 2018 sur la gravité (« blessé hospitalisé ») → ne pas comparer 2005–2018 et 2019+ sans précaution ; décimales à la virgule ; petits effectifs (0 à 5/an) → agréger sur plusieurs années.

### 2.2 Géo-DVF (ventes immobilières)
- **Chiffres relevés** : 2021→2025 : 349, 344, 308, 252, 180 lignes ; prix médian d'une maison seule ≈ 210 k€ (2021) → 225 k€ (2025), ≈ 2 200–2 600 €/m² (calcul indicatif).
- **Idées** : carte des ventes, prix médian au m² maison vs Fondettes/Saint-Étienne-de-Chigny/métropole (les fichiers voisins sont à la même URL), « la vente la plus chère », volume en baisse depuis 2021 (taux d'intérêt).
- **Visualisation** : carte + courbe des prix médians + histogramme. **Difficulté : facile/moyen**.
- **Pièges** : une mutation = plusieurs lignes (dépendances, lots, parcelles) → agréger par `id_mutation` avant de calculer un prix ; la `valeur_fonciere` est répétée sur chaque ligne ; seulement **5 ans glissants** (les années anciennes disparaissent) → archiver localement ; pas de données Alsace-Moselle (sans objet ici) ; le serveur `files.data.gouv.fr` a renvoyé une page d'indisponibilité (`sorry.data.gouv.fr`) pendant quelques minutes le 19/11 → prévoir des retries et garder la dernière version.

### 2.3 Carte des loyers
- **Chiffres** : 2025, maison : **10,53 €/m²** charges comprises (intervalle 8,2–13,5), 159 observations dans la commune ; disponible aussi pour appartements, T1-T2, T3+.
- **Idées** : loyer type d'une maison de 100 m², évolution 2018→2025, comparaison avec Tours.
- **Visualisation** : chiffre clé + barres. **Difficulté : facile**.
- **Pièges** : encodage **Latin-1**, `;`, décimales à la virgule ; `TYPPRED` = « commune » ou « maille » (si peu d'annonces, valeur estimée sur un regroupement de communes → l'afficher) ; un dataset distinct par année (pas 2019–2021).

### 2.4 RPLS (logements sociaux)
- **Chiffres** : 348 logements sociaux au 1/1/2024 (soit ≈ 15 % des ~2 250 résidences principales — à recalculer) avec adresse, nombre de pièces, surface, DPE, année de construction, bailleur.
- **Idées** : carte des résidences (Clos Mignot…), part des logements sociaux vs obligation SRU (Luynes > 3 500 hab. dans une agglomération → objectif légal), DPE du parc social.
- **Difficulté : moyen** (API paginée par 100, coordonnées en Lambert 93 → reprojeter avec l'extension `spatial` de DuckDB).
- **Pièges** : millésimes au 1er janvier ; colonne `EPSG` à lire ; le taux SRU officiel (inventaire préfectoral) diffère du simple ratio RPLS/RP.

### 2.5 Sitadel (constructions)
- **Séries mensuelles** depuis 2002 (`LOG_AUT` logements autorisés, `LOG_COM` commencés, surfaces) ; **liste des permis** avec adresse, parcelle, nb de logements, présence de piscine (`I_PISCINE`) !
- **Idées** : « combien de logements construits depuis 2002 », pics de construction (lotissements), « nombre de piscines déclarées dans les permis ».
- **Visualisation** : barres annuelles. **Difficulté : facile** (séries) / **moyen** (liste).
- **Pièges** : séries « en date de prise en compte » (≠ date réelle) ; secret pour les permis de particuliers (pas de nom) ; la liste plafonne-t-elle à 100 résultats par filtre ? (le `total` renvoyé valait exactement 100 → **à vérifier en paginant**).

### 2.6 DPE (ADEME)
- **Chiffres** : 1 017 DPE de logements existants + 7 neufs depuis juillet 2021.
- **Idées** : répartition des étiquettes A→G à Luynes vs France, part de « passoires » (F-G), mode de chauffage dominant.
- **Visualisation** : barres empilées des étiquettes. **Difficulté : facile** (export CSV direct).
- **Pièges** : un logement peut avoir plusieurs DPE ; échantillon biaisé (seuls les logements vendus/loués) ; ancien DPE (avant 07/2021, dataset `dpe-france`) non comparable ; le filtre doit utiliser `code_insee_ban`.

### 2.7 Recensement INSEE (population, âges, ménages, diplômes, logement, emploi, navettes)
- **Chiffres** : population 1876 : 1 970 hab. → creux 1 517 (1931) → décollage après 1968 (1 948) → max 5 259 (2012) → **5 062 (2023)** ; recul depuis 2012.
- **Idées** : courbe 150 ans, pyramide des âges vs France, part des résidences secondaires, voiture (nb de ménages à 2 voitures), mode de transport domicile-travail, part des diplômés du supérieur, « Luynes a été multipliée par 2,6 depuis 1968 ».
- **Visualisation** : courbe, pyramide, barres comparatives. **Difficulté : facile** (Melodi + JSON → DuckDB `read_json`).
- **Pièges** : codes de dimensions SDMX (`RP_MEASURE`, `AGE`, `OCS`…) à décoder avec `https://api.insee.fr/melodi/range/<DS>` ; le préfixe de géographie change (`2025-COM-…` / `2026-COM-…`) ; séries 1876–1962 = populations « totales/municipales » selon l'époque (méthodes différentes) ; recensement 2023 = moyenne des enquêtes 2021–2025.

### 2.8 État civil (naissances, décès)
- 2008–2025 (ex. 48 naissances en 2008, 44 en 2009). **Idées** : solde naturel annuel, « année record ». **Facile.**
- **Piège** : lieu de domicile de la mère / du défunt (pas lieu de l'événement) ; le CH de Luynes (EHPAD) peut gonfler les décès domiciliés.

### 2.9 Revenus (Filosofi, IRCOM)
- **Chiffres** : niveau de vie médian 2023 = **28 830 €/an/UC** ; 2 758 foyers fiscaux en 2024 dont 1 514 imposés (55 %).
- **Idées** : comparaison métropole/département/France, part des retraites dans les revenus, évolution IRCOM 2018→2024.
- **Difficulté : facile.** **Pièges** : Filosofi = un seul millésime en ligne via Melodi (garder les anciens) ; certains indicateurs vides (secret statistique, `CONF_STATUS`) ; IRCOM en milliers d'euros.

### 2.10 Emploi, salaires, entreprises (BTS, Flores, SIDE, SIRENE)
- **Idées** : salaire net moyen en EQTP femmes/hommes, nombre d'établissements par grand secteur, créations d'entreprises par an (pic micro-entrepreneurs 2020-2021), carte des entreprises (API recherche-entreprises : 951 unités actives).
- **Difficulté : facile** (Melodi) / **moyen** (API recherche-entreprises : ~40 pages de 25, limite ≈ 7 req/s).
- **Pièges** : salaires = lieu de **travail** ; Flores ≠ SIRENE (effectifs vs unités) ; SIDE_CREA_COM dépasse 1 000 observations → paginer ; `geo-sirene` d'Etalab a été **arrêté en avril 2026** (remplacé par le fichier INSEE géolocalisé de 1,2 Go → trop lourd).

### 2.11 Équipements & tourisme (BPE, DS_TOUR_CAP)
- 97 observations BPE 2025 (commerces, santé, services), 264 lignes éducation, 38 sport-culture ; capacités touristiques 2026 (hôtels, campings, gîtes).
- **Idées** : « Luynes compte X boulangeries, Y médecins… » vs moyenne des communes de même taille ; fiche équipements par domaine. **Facile.**
- **Piège** : codes équipements (`FACILITY_TYPE`, ex. B207 = boulangerie) → table de libellés via `/range`.

### 2.12 Éducation (annuaire, effectifs, IPS, brevet)
- **Établissements** : écoles Camus (élém.), Pasteur (élém.), Suzanne Herbinière-Lebert (mat.), Sainte-Geneviève (privée), collège Lucie et Raymond Aubrac (`0371378X`).
- **Chiffres** : IPS 2024-25 : Camus 119,3 ; Sainte-Geneviève 135,4 ; collège 116,3 (2022-23) ; brevet 2023 : 96 % de réussite (112 candidats), taux d'accès 6e→3e 92 %.
- **Idées** : effectifs scolaires 2011→2025 (baisse démographique ?), réussite au brevet sur 20 ans. **Facile.**
- **Pièges** : ⚠️ dans `fr-en-ecoles-effectifs-nb_classes`, la colonne `code_commune_insee` contient le **code postal 37230** (partagé avec Fondettes) → filtrer par `numero_ecole` (UAI) ; IPS = sujet sensible (comparaisons public/privé) → présentation neutre.

### 2.13 Tours Métropole (portail data.tours-metropole.fr) — ce qui concerne Luynes
Comptage d'enregistrements contenant « luynes » (19/11/2026) : arrêts Fil Bleu 24 · aménagements cyclables 6 · stationnement vélo 2 · limitations de vitesse 15 · zonage PLU 144 · points lumineux 1 018 · consommation de gaz 397 · effectif scolaire 76 · naissances/décès 18 · population 1876–2023 : 23 · revenus 2024 : 1 · monuments historiques 8 · bornes VE 4 (+1 au schéma directeur) · circuits de randonnée 2 · boîtes à livres 3 · marchés 2 · pharmacies 2 · antennes 2G-5G 35 · délibérations 83 · arbres 11 · BAL 2 389 adresses · SIRENE régional 751.
- **Idées** : carte « vivre à Luynes » (arrêts de bus, pistes cyclables, boîtes à livres, marché, antennes), PLU (part de zones naturelles/agricoles), éclairage public (1 018 points lumineux = 1 pour 5 habitants !).
- **Difficulté : facile** (export CSV/GeoJSON filtré). **Pièges** : `search("luynes")` attrape aussi des voies nommées « rue de Luynes » dans d'autres communes → filtrer sur le champ commune/INSEE ; licences variables (ODbL pour les aménagements cyclables) ; certains jeux ne sont plus mis à jour (MH : 2020 → préférer Mérimée national).
- Hors Luynes mais utiles : « Observation météorologique historique Tours (SYNOP) » (48 918 lignes), « Fréquentations par ligne Fil Bleu depuis 2018 », « Comptage vélo » (aucun compteur à Luynes).

### 2.14 Région Centre-Val de Loire (data.centrevaldeloire.fr)
383 jeux. Utiles pour Luynes : **revenus des foyers fiscaux 2018→2023** (série annuelle filtrable), effectifs salariés privés 2009–2019 par commune, créations d'établissements depuis 2013, Journées du patrimoine (JEP), patrimoine naturel Tourinsoft, réservoirs de biodiversité/corridors (SRCE), GTFS agrégé régional Rémi/JVMalin (ODbL). **Difficulté : facile.**

### 2.15 Santé (FINESS, APL, RPPS)
- **FINESS** à Luynes : Centre hospitalier de Luynes, EHPAD Le Clos Mignot, SSIAD, ESAT Les Vallées, foyer Gilbert Lelord, pharmacie Titier.
- **Idées** : « Luynes a un hôpital » (rare pour 5 000 hab.), APL médecins généralistes vs département. **Difficulté : moyen** (FINESS : fichier à 2 types de lignes `structureet`/`geolocalisation`, coordonnées Lambert ; APL : xlsx dans des archives 7z).
- **Pièges** : ⚠️ ne pas filtrer FINESS par code postal (37230 = Fondettes aussi) → utiliser département + code commune (`139`) ; fichier en UTF-8 malgré son ancienneté ; RPPS 830 Mo → à éviter (la BPE donne déjà le nombre de médecins, dentistes, infirmiers…).

### 2.16 Élections
- **Municipales 2026 T1** : 4 135 inscrits, participation 66,8 %, 3 listes (« Luynes la nouvelle dynamique » 43,9 %, « Luynes avec vous » 32,7 %, « Luynes Avenir » 23,4 % des exprimés).
- **Idées** : participation par élection depuis 1999 vs France, carte des bureaux de vote (si contours disponibles), abstention. **Difficulté : moyen** (format « large » : une colonne par candidat → `UNPIVOT` en SQL ; Parquet agrégé de 70 Mo/160 Mo lisible en partiel par DuckDB).
- **Pièges** : nuances politiques changeantes → rester factuel ; résultats « par bureau » : numérotation des bureaux non stable ; agrégé data.gouv s'arrête à 07/2024 (ajouter municipales 2026 à part).

### 2.17 Finances locales (DGFiP)
- **Chiffres 2025** : produits de fonctionnement 5,87 M€, charges 5,46 M€, dette 3,31 M€, annuité 0,62 M€ ; taux de taxe foncière bâti **43,80 %** (moyenne de strate 40,04 %), stable 2023-2025.
- **Idées** : « combien dépense la commune par habitant vs les communes de même taille » (colonnes `f…` par habitant et `m…` moyenne de strate déjà fournies !), encours de dette par habitant sur 25 ans.
- **Difficulté : facile.** **Pièges** : montants en **milliers d'euros** ; un dataset ODS par année ou paire d'années (2019-2020, 2023-2024) avec des noms irréguliers (`…-20090`) ; codes `dep`=`037`, `icom`=`139` (3 chiffres) ; taux TFB 2021+ incluent l'ancien taux départemental (réforme TH) → rupture de série en 2021.

### 2.18 Délinquance (SSMSI)
- **Chiffres 2025** : cambriolages de logement 22 (9,8 ‰ logements), escroqueries 39, dégradations 24, violences sexuelles 26, violences intrafamiliales 8…
- **Idées** : évolution 2016–2025, taux pour 1 000 vs département/France (fichier DEP fourni). **Difficulté : facile** (Parquet 16 Mo).
- **Pièges** : `est_diffuse = 'ndiff'` → valeur masquée (moins de 5 faits sur 3 ans) ; `NA` texte ; décimales à virgule ; sujet sensible → toujours rapporter au taux et à la moyenne, petits nombres = forte volatilité.

### 2.19 Risques (Géorisques) — **pépite**
- **Chiffres** : 19 arrêtés CatNat (inondations, mouvements de terrain/sécheresse depuis 1982…), **193 cavités souterraines** recensées (caves troglodytiques du coteau !), 23 mouvements de terrain (dont éboulement au « Roc Samson », 1943), Atlas des zones inondables « Vallée de la Loire », TRI de Tours (inondation), radon catégorie 1, sismicité 2 (faible), argiles : exposition moyenne au centre-bourg, 7 ICPE, 9 anciens sites industriels (CASIAS).
- **Idées** : carte des cavités et des éboulements le long du coteau, frise des catastrophes naturelles, « Luynes est-elle inondable ? ».
- **Visualisation** : carte + frise chronologique. **Difficulté : facile.**
- **Pièges** : pagination (`page`, `page_size`) ; `gaspar/pprn` ignore le filtre commune (renvoie toute la France) ; dates au format `JJ/MM/AAAA`.

### 2.20 Météo / climat — **écarté** (pas de station à Luynes, voir §3)
- **Météo-France** : aucune station à Luynes ; la plus pertinente = **TOURS (37179001, aéroport de Parçay-Meslay, ~15 km)** avec données depuis 1950 (+ fichier « avant 1949 »). Records de chaleur/froid, jours de gel, pluie annuelle, réchauffement depuis 1950.
- **Open-Meteo** : réanalyse ERA5 au point de Luynes depuis 1940 ; pratique mais modèle (≠ mesure) et licence non commerciale.
- **Visualisation** : « warming stripes » de Tours, courbe des températures, calendrier des jours de gel. **Difficulté : moyen** (fichier départemental de 9 Mo compressé, filtrer `NUM_POSTE = 37179001` ; colonnes de qualité `Q…`).
- **Pièges** : `;` ; dates `AAAAMMJJ` ; fichiers `previous` (jusqu'à N-2) et `latest` (N-1→J-1) à concaténer ; Open-Meteo renvoie le point de grille le plus proche (47,42 / 0,59), pas Luynes exactement.

### 2.21 Qualité de l'air (Atmo France / Lig'Air)
- Indice ATMO calculé **pour la commune de Luynes** (source Lig'Air) ; ex. 19/11/2026 : « Moyen ».
- **Idée** : widget « qualité de l'air aujourd'hui » (mais site rebuildé chaque semaine → peu pertinent) ou, mieux, archiver chaque semaine pour construire un historique (« nombre de jours dégradés en 2027 »). **Difficulté : moyen.**
- **Piège** : le WFS ne garde que quelques jours ; l'historique complet passe par l'API Atmo Data (inscription gratuite → **clé**).

### 2.22 Eau
- **Eau potable** : la commune est desservie notamment par le réseau « FONDETTES (LUYNES) » (11 UDI/quartiers listés) ; 743 résultats d'analyse en 2026. **Idées** : nitrates, calcaire (dureté / TH), conformité bactériologique. **Facile.** Piège : API paginée (max 20 000 résultats), unités hétérogènes, plusieurs réseaux.
- **Loire** : stations Tours-Pont Mirabeau et Langeais encadrent Luynes ; idée « la Loire aujourd'hui / plus haute crue récente ». Séries élaborées (`obs_elab`) non testées.

### 2.23 Énergie
- **ORE** : 289 lignes 2011–2024 (électricité + gaz, par secteur : résidentiel, tertiaire, agriculture, industrie). **Idées** : consommation électrique résidentielle moyenne par foyer vs France, part du gaz. **Facile.** Piège : changement de méthode en 2022 ; secret statistique (`nombre_de_mailles_secretisees`).
- **ODRÉ** : solaire installé : 40 petites installations (<36 kW) ≈ 173 kW + 2 plus grosses (89 kW, 250 kW). Idée : « puissance solaire par habitant ». Piège : agrégation sous 36 kW, noms « Confidentiel ».
- **IRVE** : au moins 1 station (Modulo, allée Aimé Richardeau) ; TM en signale 4. Piège : `code_insee_commune` souvent vide → filtrer par coordonnées (bbox/polygone communal) plutôt que par code.

### 2.24 Mobilité
- **Parc automobile** au 1er janvier 2011→2026 par carburant et Crit'Air : idée « part de voitures électriques à Luynes vs France », « évolution du diesel ». **Facile.** Piège : format « large » (`PARC_2011` … `PARC_2026`) → `UNPIVOT` ; libellé `Professionel` (faute d'origine).
- **GTFS Fil Bleu** : lignes desservant Luynes, nombre de passages par jour, premier/dernier bus vers Tours. **Difficulté : moyen** (GTFS = plusieurs CSV dans un zip, DuckDB les lit très bien).

### 2.25 Patrimoine (Mérimée) — **pépite**
- 8 monuments : **vestiges de l'aqueduc romain (classé MH dès 1862)**, vieille halle (classée 1930), maison à pans de bois (classée 1978), château (inscrit 1926), chapelle des Chanoinesses, prieuré de Saint-Venant, La Mignonnerie, manoir de Malitourne (2013), tous avec coordonnées GPS.
- **Idées** : carte patrimoniale, frise des protections 1862→2013. **Facile** (API tabulaire). Piège : fichier complet 100 Mo ; certains champs multi-valeurs séparés par `;`.

### 2.26 Adresses, cadastre, occupation du sol
- **BAN / cadastre** : fond de carte, nombre de rues, « la rue la plus longue », nombre de bâtiments, taille moyenne des parcelles. **Moyen** (géométries → extension `spatial` de DuckDB).
- **Corine Land Cover** : 10 types d'occupation dans l'emprise de Luynes en 2018 (terres arables 211, prairies 231, cultures complexes 242/243, forêts 311-313, cours d'eau 511, tissu urbain discontinu 112…) → évolution 1990→2018 de l'artificialisation. **Moyen.** Piège : résolution grossière (25 ha) ; OCS GE (IGN, très fin) pas encore publiée pour l'Indre-et-Loire d'après les couches WFS listées (à confirmer).

---

## 3. Écartés (ou à surveiller)

| Jeu | Raison |
|---|---|
| Prénoms à la commune | INSEE ne publie les prénoms qu'au département (`DS_PRENOM` vide pour COM-37139) ; Luynes ne publie pas d'état civil en open data. |
| Fichier des personnes décédées (INSEE) | Données nominatives → hors du périmètre éthique d'un site grand public. |
| Chômage « France Travail » (DEFM) à la commune | Aucun jeu communal trouvé en accès direct sur data.gouv ; seul le chômage au sens du recensement (Melodi) est disponible. |
| Indice ATMO historique / Lig'Air brut | Historique seulement via l'API Atmo Data **avec compte** (clé gratuite) ; le portail ArcGIS Lig'Air renvoie « Subscription is disabled » (401). |
| ZNIEFF / Natura 2000 via API Carto IGN | L'API `apicarto.ign.fr/api/nature/*` répond mais renvoie 0 objet partout (même sur la Loire) le 19/11/2026 → non fiable ; alternative : téléchargements INPN (shapefiles nationaux), non vérifiés. |
| OCS GE (occupation du sol grande échelle) | Pas de couche Indre-et-Loire visible dans le WFS Géoplateforme (seulement Gers, DOM…) ; à re-vérifier plus tard. |
| Geo-SIRENE Etalab | Service **arrêté en avril 2026** ; le remplaçant INSEE fait 1,2 Go (zip) / 0,8 Go (Parquet) → disproportionné ; utiliser l'API recherche-entreprises ou le SIRENE régional TM. |
| Annuaire Santé RPPS | 830 Mo par fichier, mis à jour quotidiennement → trop lourd pour un build hebdo ; la BPE suffit pour compter les professionnels. |
| RNA (associations) complet | Zip de 410 Mo ; possible mais coûteux ; préférer `recherche-entreprises?est_association=true` (seules les associations ayant un SIREN) — à arbitrer. |
| DVF avant 2021 | Retiré de data.gouv (5 ans glissants). DV3F/DVF+ du Cerema = accès sur demande. → **archiver chaque année** nous-mêmes. |
| Consommation électrique Enedis par commune (portail Enedis) | Le portail ODS d'Enedis a déménagé (301) ; doublon avec l'Agence ORE, qui fonctionne. |
| Comptage vélo, trafic routier | Aucun compteur (Syndicat des Mobilités) ni comptage routier départemental trouvé à Luynes. |
| Repères de crues (TM) | 0 repère à Luynes dans le jeu métropolitain. |
| Exposition inondation/argiles du SDES (DiDo) | Granularité EPCI seulement. |
| Achats de phytosanitaires par commune (SDES) | Jeu listé mais sans fichier publié au 19/11/2026. |
| Bruit (cartes stratégiques) | Rien trouvé en accès direct pour le 37. |
| Arbres (TM) | Inventaire essentiellement sur Tours (11 lignes « luynes » seulement). |
| Météo / climat (Météo-France, Open-Meteo) | **Écarté : pas de station à Luynes** (la plus proche est à Tours, ~15 km ; Open-Meteo = modèle, pas une mesure). Choix éditorial du 19/11/2026 : ne publier que des données de la commune. |

---

## 4. Ordre de priorité proposé (intérêt / effort)

| # | Thème | Pourquoi | Effort |
|---|---|---|---|
| 1 | **Population 1876→2023 + pyramide des âges** (Melodi + TM) | Le socle du site, très parlant, API simple | faible |
| 2 | **Patrimoine (Mérimée)** + **risques Géorisques** (cavités, CatNat, mouvements de terrain) | Identité de Luynes (aqueduc, coteau troglodytique, Loire) ; cartes spectaculaires ; API JSON directes | faible |
| 3 | **Immobilier DVF + loyers + DPE** | Thème le plus consulté par le grand public | moyen (agrégation des mutations) |
| 4 | **Finances communales (DGFiP)** | Comparaison « strate » déjà calculée par la DGFiP ; intérêt citoyen fort | faible |
| 5 | **Revenus (Filosofi + IRCOM) & emploi (BTS, Flores, SIDE)** | Chiffres clés + comparaisons métropole/France | faible |
| 6 | **Accidents (BAAC)** | Carte des accidents, records ; formats hétérogènes | moyen |
| 7 | ~~Climat à Tours (Météo-France)~~ | Écarté : pas de station à Luynes | — |
| 8 | **Équipements, écoles, santé** (BPE, annuaire éducation, IPS/brevet, FINESS) | Utile au quotidien ; « Luynes a un hôpital » | faible/moyen |
| 9 | **Énergie & mobilité** (ORE, ODRÉ solaire, parc auto Crit'Air, IRVE, GTFS) | Transition écologique ; bon potentiel de comparaisons | moyen |
| 10 | **Élections, délinquance, eau potable, construction (Sitadel)** | Intéressant mais sensible (élections, délinquance) ou plus technique (Hub'eau) | moyen |

## 5. Points de vigilance généraux
- **Code postal 37230 partagé avec Fondettes** : ne jamais filtrer par code postal ; toujours par code INSEE 37139 (ou `dep=037/icom=139`, `dep=370/com=139` selon les formats).
- **URL instables** : data.gouv change l'URL des fichiers à chaque mise à jour (BAAC, FINESS, carte des loyers, SSMSI) → résoudre l'URL au build via `https://www.data.gouv.fr/api/1/datasets/<id>/` plutôt que la coder en dur.
- **Disponibilité** : pendant l'inventaire, le MCP datagouv répondait 503 et `files.data.gouv.fr` redirigeait temporairement vers une page « sorry » ; l'API Hub'eau a renvoyé un 502 ponctuel → retries + conservation de la dernière version téléchargée (le build ne doit pas casser).
- **Formats** : Latin-1 (loyers, BAAC < 2019), séparateur `;`, décimales à la virgule, formats « larges » à dépivoter (municipales, parc auto).
- **Secret statistique / petits nombres** : délinquance, accidents, créations d'entreprises → afficher des moyennes pluriannuelles et des taux.
- **Licences** : presque tout en Licence Ouverte 2.0 (mention de la source obligatoire) ; **ODbL** pour Atmo, aménagements cyclables TM et GTFS régional (partage à l'identique des données dérivées) ; Open-Meteo = CC BY 4.0 non commercial.
- Une seule **clé gratuite** serait utile : Atmo Data (historique qualité de l'air). Tout le reste est sans clé.
