# Revue des chiffres publiés — « Luynes en chiffres » (pages récentes)

*Revue faite le 21/11/2026 sur le site construit (`dist/` du 21/11 à 10:39, commit `d065f38`) et les JSON de `src/data/generated/`. Lecture seule : aucun fichier du projet n'a été modifié, rien n'a été publié.*

**Pages couvertes :** `/budget` (fusion Budget + Transparence), `/sport`, `/rues`, `/nature`, `/quotidien`, `/eau` (dont « eau puisée »), `/construction`, `/equipements` (médiathèque, cantines, IPS, collège), `/patrimoine-risques` (objets Palissy) et les chiffres clés correspondants de l'accueil.

**Méthode (identique à la revue du 20/11).** Le texte de chaque page a été extrait de `dist/*.html`. Chaque chiffre principal a été recalculé **avec mes propres requêtes**, sans réutiliser les requêtes SQL du site, à partir des sources officielles :
- **API et fichiers officiels retéléchargés** : OFGL, balances comptables DGFiP (data.economie.gouv.fr), DECP (data.gouv.fr), BOAMP (DILA), répertoire national des élus (RNE), INSEE Melodi (BPE, population par âge et sexe), INJEP (licences 2020 et 2023), équipements sportifs (RES), BAN, API Carto IGN (ZNIEFF, Natura 2000), WFS Géoplateforme (RPG 2020 et 2025, AOC viticoles), GBIF, ARCEP (5 trimestres), Géo'DAE, registre de preuve de covoiturage, portail Tours Métropole, Hub'eau (qualité de l'eau potable, BNPE), Éducation nationale (effectifs, IPS), ministère de la Culture (bibliothèques, Mérimée, Palissy), Ma Cantine, SDES/DiDo (Sitadel, RPLS), Géorisques (CatNat).
- Les calculs géographiques (surfaces de zones, cultures, vignobles) sont refaits avec DuckDB (extension spatiale), à la limite exacte de la commune.

Scripts et téléchargements : dossier `scratchpad/r21/` (voir le chemin en fin de fichier).

---

## 1. Résumé

- **Environ 420 chiffres inventoriés** sur les 10 pages. **Environ 330 contre-vérifiés** (tous les chiffres clés, tous les rangs, toutes les comparaisons avec le département, les séries annuelles).
- **≈ 305 OK à l'identique, 1 erreur avérée, 1 jeu de données devenu périmé (sport), ≈ 14 écarts ou doutes** (définitions, libellés, arrondis), **≈ 15 chiffres non vérifiables** de façon indépendante (zone inondable, anecdotes sur les personnes honorées, rangs CatNat, classement des noms de rues).
- **Les 5 erreurs de la revue du 20/11 restent corrigées** (vols dans les véhicules, participation 2008, « 19 arrêtés », note « hospitalisé », coquille « Luynes :3,2 »), de même que la plupart des autres recommandations (libellés « Indre-et-Loire », « France métro. », chômage « au sens du BIT », 404 ventes localisées sur 413, millésimes IPS, population DGFiP expliquée).
- Les calculs du site sont de nouveau **très solides** : budget (indemnités, subventions, marchés, BOAMP, conseil municipal), licences sportives, rues, zones naturelles, cultures, espèces, fibre, covoiturage, eau, construction, IPS, médiathèque, CatNat se retrouvent à l'unité près.

**Les 5 points les plus importants :**
1. **Erreur : 2 objets Palissy n'appartiennent pas à Luynes.** « 3 pièces murales » et « lit », attribués au « Château », sont dans le château de **Condé-en-Brie (Aisne, INSEE 02209)**. La base Palissy leur donne par erreur le code « commune actuelle » 37139, et le filtre du site (`Code_INSEE_commune_actuelle = '37139' OR COG_Insee = '37139'`) les retient. Valeurs correctes : **9 notices (au lieu de 11), 1 classé et 8 inscrits (au lieu de 3 et 8), 4 lieux (au lieu de 5)**, et le 18ᵉ siècle disparaît de la frise.
2. **Sport : les données des équipements sont périmées.** Le fichier téléchargé à 01:13 contenait 2 980 équipements pour l'Indre-et-Loire ; l'API en contient **3 533** aujourd'hui. Résultat actuel : Luynes **29 équipements dans 14 installations (skate-park compris)** ; **5,7 pour 1 000 habitants contre 5,7 dans le département** (le site affiche 5,5 contre 4,8), **206ᵉ sur 272** (le site : 173ᵉ). La conclusion « au-dessus du département » devient « au même niveau ». À retélécharger puis reconstruire.
3. **Nature : « de 1 085 à 949 hectares (−136 ha) » se lit comme une perte de terres agricoles**, alors que l'essentiel est la baisse des **surfaces gelées déclarées (137 ha en 2020, 25 ha en 2025)**. Hors gel : 948 ha en 2020, 924 ha en 2025 (−24 ha). Ajouter la précision ou comparer hors gel.
4. **Budget, « Équipements par habitant » (88 €)** : le chiffre DGFiP (461 630 €) comprend 118 500 € de **subventions d'équipement versées à d'autres organismes** (compte 2046). Sans elles, 343 129 € soit **65,7 €/hab.** (valeur OFGL). Le libellé « travaux, bâtiments, voirie, matériel » n'est pas exact ; les comparaisons avec les communes de même taille restent cohérentes (même définition).
5. **Petites mises à jour de libellés** : RPLS « aujourd'hui » alors que le stock est celui du 1ᵉʳ janvier 2025 ; montants « plafond » de 999 999 € et 909 090 € (valeurs techniques) ; espaces manquants dans le texte construit (« les5 062 », « 2025(27,8 % », « à97,3 % ») ; 99,2 % d'eau conforme calculé sur 127 prélèvements et non 135.

Légende : **OK** = identique ; **écart** = petite différence, définition ou libellé ; **erreur** = faux ; **périmé** = la source a changé depuis le téléchargement ; **n.v.** = non vérifiable indépendamment.

---

## 2. Tableau par page

### Accueil (`index.html`) — chiffres des pages récentes

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| Charges de fonctionnement 1 044 €/hab. ; même taille 1 227 € | 5 457 310 € / 5 226 = 1 044 | balances et comptes DGFiP, OFGL (population 5 226) | OK | Reprise de la revue du 20/11 ; valeurs inchangées dans `budget_resume.json` |
| Indemnités des élus 24 €/hab. ; 16,8 € ; médiane 37 : 45 € | 125 467 / 5 226 = 24,0 ; strate 16,83 ; médiane 46,0 | balances DGFiP 2025 (compte 65311), moi-même sur toute la France | OK | Médiane 46,0 contre 45 : écart de population de référence (voir budget) |
| Conseil municipal 29 élus ; 51,7 % de femmes ; habitants 53 % | 29 ; 15/29 = 51,7 % ; 53,0 % | RNE (API tabulaire) ; Melodi `DS_RP_TD_POPULATION_AGESEX_PRINC` | OK | |
| Licences 31,4 pour 100 hab. ; 25,0 ; 1 588 ; 59 fédérations | 31,37 ; 25,03 ; 1 588 ; 59 | INJEP 2023, population API Géo | OK | |
| Équipements sportifs 5,5 / 1 000 hab. ; 37 : 4,8 ; 28 dans 13 installations | **29 dans 14 ; 5,7 ; 37 : 5,7** | API « Data ES » interrogée aujourd'hui | **périmé** | Voir page Sport |
| Zonages 3,5 % ; 119 ha ; 27,8 % de terres agricoles | 118,8 ha = 3,49 % ; 948,9 ha = 27,8 % | API Carto, WFS Géoplateforme (calcul spatial) | OK | |
| Espèces 1 626 ; 22 918 observations | 1 626 ; 22 918 (dont 208 « absences ») | GBIF (même polygone simplifié à 20 m) | OK / écart | 22 710 présences, voir Nature |
| Noms de voies 225 ; 100 voies, 125 lieux-dits, 2 332 adresses | 225 ; 100 ; 125 ; 2 332 | BAN, adresses-37.csv.gz | OK | |
| Fibre 94,7 % ; 37 : 97,3 % ; 210ᵉ | 94,75 % ; 97,28 % ; 210ᵉ | ARCEP T2 2026 | OK | |
| Défibrillateurs 3,0 ; 37 : 2,4 ; 15 appareils ; covoiturage 274 trajets (2025) | 15 ; 2,43 (hors DAE mobiles) ; 274 | Géo'DAE, registre de covoiturage | OK | |
| Eau conforme 99,2 % ; nitrates 0,3 / 9,5 mg/L | 126/127 = 99,2 % ; 0,30 / 9,49 | Hub'eau | OK | Base : 127 prélèvements évalués (voir Eau) |
| Logements mis en chantier 274 (2002-2025) ; 343 sociaux « aujourd'hui » | 274 ; 343 (au 1ᵉʳ janv. 2025) | SDES Sitadel et RPLS | OK / libellé | « Aujourd'hui » : le stock est celui du 01/01/2025 |
| Monuments 8 (11ᵉ) ; cavités 193 (7ᵉ) ; 19 événements CatNat | 8 ; 193 ; 19 | Mérimée, Géorisques | OK | |
| Élèves 385 ; équipements 152 (199ᵉ) | 385 ; 152 | Éducation nationale, Melodi BPE 2025 | OK | |

### `/budget` — Budget et vie municipale

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| Charges de fonctionnement 5,5 M€ ; 1 044 €/hab. ; 1 227 € (même taille) ; 43ᵉ ; médiane 37 : 758 € | 5 457 310 € ; 1 044,2 | DGFiP, OFGL | OK | Reprise 20/11, inchangé |
| Dette 634 €/hab. ; 761 € ; 82ᵉ ; médiane 438 € ; pic 2017 : 979 € | 3 313 310 / 5 226 = 634,0 | DGFiP, OFGL | OK | Reprise 20/11 |
| Taxe foncière 43,8 % ; 40 % ; 9ᵉ ; médiane 35 % | 43,8 ; rang 9 ; médiane 34,97 | DGFiP | OK | Reprise 20/11 |
| Population de référence 5 226 (« population légale totale ») | 5 226 (OFGL `ptot`) | OFGL | OK | Bien expliqué sur la page |
| Répartition 100 € : impôts 51,6 / dotation 14,2 / autres 34,2 ; personnel 62,6 / achats 22,9 / subv. 3,7 / autres 10,7 | 62,6 % = 3 415,6 / 5 457,3 | DGFiP | OK | La note « écritures sans sortie d'argent » est bien présente |
| **Équipements par habitant 88 € ; 479 € ; 240ᵉ ; 8,4 M€ sur 2016-2025 ; 160 €/hab./an** | 461 630 € dont **118 500 € de subventions d'équipement versées (compte 2046)** ; hors subventions : 343 129 € = **65,7 €/hab.** (OFGL) | balances DGFiP 2025 (comptes 20 et 21), OFGL | **écart de définition** | Libellé « travaux, bâtiments, voirie, matériel » trop étroit. Comparaison avec la strate cohérente (même définition DGFiP). |
| Indemnités des élus 125 467 € ; 24 €/hab. ; frais et cotisations 21 856 € | 125 466,96 (65311) ; frais : 65312 + 65313 + 65314 + 65315 + 653172 = 21 856,43 | balances comptables DGFiP 2025, budget principal | OK | |
| Indemnités : même taille 16,8 € ; médiane 37 : 45 € ; 237ᵉ ; « 1 215 communes » | 16,83 ; 46,0 ; 236ᵉ ; 1 213 | balances France entière + population API Géo | OK | Écarts ≤ 1 unité : population de référence (municipale chez moi, légale totale sur le site) |
| Subventions associations 108 541 € ; 20,8 €/hab. ; 33,7 € ; médiane 37 : 7,6 € | 108 541 (65748) ; 20,77 ; 34,2 ; 7,7 | idem | OK | Strate 33,7 contre 34,2 : même raison |
| CCAS 20 000 € ; 3,8 €/hab. ; 26,8 € ; médiane 4,2 € ; 57 communes | 20 000 (657363) ; 3,83 ; 26,5 ; 4,29 ; 57 | idem | OK | |
| Marchés attribués : 7 marchés, titulaires, dates, plafonds (909 090 ; 272 727 ; 45 455 ; 999 999 €) ; base depuis le 15 avril 2026 | 7 marchés ; mêmes montants ; 1ʳᵉ publication le 2026-04-15 | DECP consolidées (parquet data.gouv, SIRET 21370139400016) | OK | Montants 999 999 € et 909 090 € : plafonds techniques (voir corrections) |
| Appels d'offres BOAMP : 24 ; 2015 : 2 … 2026 : 1 (série de 12 années) | 24 avis initiaux (26 lignes − 1 résultat − 1 rectificatif) ; années identiques | API BOAMP (acheteur « Mairie Luynes ») | OK | Les 24 comprennent des MAPA : parler d'« avis de marché publiés » |
| Conseil : 29 élus ; 15 femmes / 14 hommes ; maire + adjoints 9 dont 4 femmes ; début du mandat 22/03/2026 ; maire Antoine MAQUIN | 29 ; 15/14 ; 9 / 4 ; 2026-03-22 ; MAQUIN Antoine | RNE (API tabulaire) | OK | |
| Âge des élus : 20,7 % (6) / 55,2 % (16) / 24,1 % (7) ; âge moyen 51,1 ans | 6 / 16 / 7 ; 51,1 | RNE (âge révolu au 21/11/2026) | OK | |
| Habitants 18 ans et plus : 22,7 / 35,8 / 41,5 % ; âge moyen 55,7 ans ; 53 % de femmes | 22,7 / 35,9 / 41,4 ; 55,6 (âge + 0,5) ; 53,0 | Melodi (recensement 2023) | OK / écart | Élus : âge en 2026, habitants : recensement 2023 (3 ans plus tôt) et âge + 0,5 : l'écart réel est un peu plus grand que celui affiché (≈ 5 ans). À préciser. |
| Professions : cadres 34,5 % (10) ; employés 20,7 % (6) ; retraités 20,7 % (6) ; artisans 10,3 % (3) ; ouvriers 6,9 % (2) ; agriculteur 3,4 % (1) ; prof. interm. 3,4 % (1) | mêmes effectifs par groupe | RNE (code CSP, 1ᵉʳ chiffre) | OK | |
| Séries 2000-2025 (charges, dette, équipements, taxe foncière, subventions, indemnités) | 2025 et tendances confirmées ; échantillon 2015 (dette 551 → 887 €) cohérent avec la médiathèque/La Grange | DGFiP, OFGL | OK (échantillon) | |

### `/sport`

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| 1 588 licences ; 59 fédérations ; 31,4 pour 100 hab. ; 36ᵉ sur 272 | 1 588 ; 59 ; 31,37 ; 36ᵉ (communes sans licence comprises) | INJEP `lic-data-2023.csv` | OK | |
| Indre-et-Loire 25,0 | 155 042 / 619 362 = 25,03 | idem | OK | |
| Podium : tennis 152, football 138, équitation 101 ; UFOLEP 100, rugby 99, … ; scolaire 343 | identiques | idem | OK | |
| Femmes 35,9 % ; 37 : 39,5 % | 35,9 ; 39,5 | idem | OK | |
| Âges 0-14 : 46,7 % (37 : 45,7 %) ; autres tranches | 46,7 | idem | OK (0-14 vérifié, autres tranches par somme) | |
| Évolution 2020-2023 : 1 665 → 1 588 (−4,6 %) ; 37 : +2,3 % | 1 665 ; −4,6 % ; 151 545 → 155 042 = +2,3 % | `lic-data-2020.csv` et 2023 | OK | |
| **28 équipements dans 13 installations ; 5,5 pour 1 000 hab. ; 37 : 4,8 ; 173ᵉ** | **29 équipements, 14 installations ; 5,73 ; 37 : 5,70 ; 206ᵉ** | API « Data ES » (`dep_code = 37`, 3 533 lignes aujourd'hui, 2 980 dans le fichier du site) | **périmé** | Le fichier du site (01:13) était antérieur à une mise à jour de la source : manque un **skate-park** (installation I371390009), et 10 équipements apparaissent « sans position / sans type » alors que l'API actuelle leur donne un nom et des coordonnées |
| Types d'équipements (6 terrains de grands jeux, 2 tennis…) ; périodes de mise en service ; 13 sans date ; 10 sans coordonnées ; liste de 28 | cohérents avec l'export du site, pas avec l'API actuelle | idem | **périmé** | À recalculer après retéléchargement |
| « Petite Bassin, 1973 » | nom tel quel dans la source (« Petite Bassin ») | RES | n.v. | Faute de la source ; peut être signalée comme telle |

### `/rues`

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| 225 noms ; 100 voies ; 125 lieux-dits ou quartiers | 225 ; 100 ; 125 | BAN `adresses-37.csv.gz`, code INSEE 37139 | OK | |
| 2 332 adresses ; 21,5 % en lieu-dit (501) | 2 332 ; 501 / 2 332 = 21,5 % | idem | OK | |
| Types : rue 70 (1 449 adr.), place 11 (92), impasse 8 (60), avenue 5 (162), allée 3 (28), chemin 1 (15), route 1 (14), square 1 (11) | identiques | idem | OK | |
| Plus « peuplées » : St-Venant 94, Victor Hugo 83, Joseph Thierry 82, Richardières 72, Grand Verger 65 … | identiques | idem | OK | « Vallée de Vaugareau » (62) est classée lieu-dit |
| Personnes honorées : 35 voies, 34 personnes, **0 femme**, 33 hommes, 2 sans sexe ; 9 voies non classées | aucune voie de la BAN ne porte un prénom ou nom de femme ; 2 sans sexe (Carnot, Docteur Caillet) | BAN + table `data/reference/noms-de-rues.csv` | OK / écart | Le texte dit « le sexe n'est indiqué que lorsqu'il est certain » : or 7 des 9 voies « non identifiées » (ex. Joseph Thierry, Aimé Richardeau) sont comptées « homme » d'après le prénom |
| Descriptions de personnes (dates, titres, lieux de naissance) | cohérentes avec ce que je connais (maréchaux, écrivains, Descartes né en Touraine, Balzac né à Tours…) | — | n.v. | Aucune source citée par voie ; peu risqué |
| Villes jumelles : Buntingford (38 adr.), Meßstetten (8), Ólvega (2) ; « Luynes (Provence) » (11) | adresses identiques | BAN | OK / écart | Luynes (Bouches-du-Rhône) est un **quartier d'Aix-en-Provence**, pas une commune : la phrase d'introduction (« une autre commune qui porte le même nom ») est à reformuler |

### `/nature`

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| Surface communale 3 408 ha | 3 408,2 ha (projection Lambert 93) | contour API Géo | OK | L'API Géo donne 3 411,97 ha (34,1 km² sur l'accueil) : écart de 0,1 %, à mentionner |
| ZNIEFF/Natura 119 ha = 3,5 % | 118,8 ha = 3,49 % (union) | API Carto nature + DuckDB spatial | OK | |
| Zones : Loire Tourangelle 118,6 ha ; La Loire de Candes à Mosnes 117,3 ; Vallée de la Loire d'I-et-L. 114,2 ; Île Quinquengrogne 45,7 ; Île Budan 24,7 | 118,6 ; 117,3 ; 114,2 ; 45,7 ; 24,7 (+ une 6ᵉ zone à 0,2 ha, écartée à raison) | idem | OK | |
| « Sur 100 ha : 4 ha / 97 ha » (libellés du graphique) | 3,5 / 96,5 | — | écart d'arrondi | Les deux libellés arrondis font 101 ; le tableau dit 3,5 et 96,5 |
| Terres agricoles 949 ha = 27,8 % ; dont prairies 200 ha | 948,9 ha ; 200,4 ha | WFS RPG LATEST (2025), clip à la commune | OK | |
| 2020 : 1 085 ha ; colza 4 → 152 ; blé 223 → 125 ; protéagineux 48 → 116 ; orge 42 → 98 ; autres céréales 174 → 48 ; prairies 206 → 200 | 1 084,9 ; blé 222,6 → 124,7 ; prairies 206,1 → 200,4 ; protéagineux 47,7 → 115,6 ; orge 42,3 → 97,6 ; colza 151,8 | WFS RPG 2020 et 2025 | OK | |
| **« De 1 085 ha à 949 ha (−136 ha) »** | Surfaces gelées : **137,4 ha en 2020, 25,2 ha en 2025** ; **hors gel : 947,5 → 923,7 ha (−24 ha)** | RPG | **écart (interprétation)** | La baisse vient surtout de l'évolution des jachères déclarées. À préciser pour ne pas laisser croire à une perte de terres agricoles |
| Vignes déclarées 6,5 ha (2025) ; 5,1 ha (2020) | 6,5 ; 5,1 | RPG | OK | |
| Vignobles AOC délimités 116 ha = 3,4 % ; Crémant de Loire, Rosé de Loire, Touraine | 116,3 ha ; mêmes appellations | WFS INAO `AOC-VITICOLES:aire_parcellaire` | OK | |
| 1 626 espèces ; 22 918 observations ; 94,4 % par des personnes | 1 626 ; 22 918 (22 710 en présence + 208 « absences ») ; 94,4 % | API GBIF, même polygone (169 sommets) | OK / écart | Les 208 enregistrements d'« absence » (0,9 %) sont comptés comme observations |
| Groupes : plantes à fleurs 13 689 ; oiseaux 5 163 ; insectes 1 869 ; mammifères 802 ; amphibiens 424 … | plantes à fleurs 13 689 (= 10 859 + 2 830) ; insectes 1 869 ; amphibiens 424 ; oiseaux 5 033 et mammifères 725 hors absences | GBIF | OK | Différences oiseaux/mammifères = absences |
| Les plus observées : Pipistrellus pipistrellus 270 ; Turdus merula 186 … | 270 ; 182 (présences) ; 178 ; 159 ; 150 ; 134 ; 131 ; 127 ; 113 ; 105 | GBIF | OK / écart | 4 « absences » incluses dans le merle noir (186 contre 182) |
| Liste rouge mondiale : 11 espèces (salamandre 81, tourterelle des bois 29, fuligule milouin 15 …) | 11 espèces, mêmes noms et comptes | GBIF `iucnRedListCategory` VU/EN/CR | OK | Statut tel que publié par GBIF/UICN (ex. vipère aspic classée vulnérable) |

### `/quotidien`

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| Fibre : 94,7 % ; 2 508 sur 2 647 locaux ; 139 sans ; 37 : 97,3 % ; 210ᵉ ; 3 communes à 100 % | 2 508 / 2 647 = 94,75 % ; 97,28 % ; 210ᵉ ; 3 | ARCEP `commune_techno.csv` T2 2026 | OK | |
| Historique : T2 2022 74,7 % (37 : 68,6) ; T2 2023 78,7 (84,0) ; T2 2024 87,1 (93,0) ; T2 2025 86,9 (96,1) | identiques | ARCEP T2 2022 à 2025 | OK | Luynes passe d'au-dessus à en dessous du département |
| Défibrillateurs 15 ; 3,0 / 1 000 ; 37 : 2,4 ; 70ᵉ ; 101 communes sans | 15 ; 2,43 ; 70ᵉ ; 101 (hors 72 DAE « mobiles ») | Géo'DAE (tabulaire) | OK | Mon calcul brut donne 2,55 ; 74ᵉ ; 98 (avec les DAE mobiles). Préciser « fixes » |
| 11 à l'extérieur ; 10 accessibles 24 h/24 ; 8 les deux | 11 ; 10 ; 8 | Géo'DAE | OK | |
| Covoiturage : 338 / 834 / 467 / 274 trajets ; 37 : 62,1 / 102,8 / 129,9 / 109,7 pour 1 000 | 338 / 834 / 467 / 274 ; totaux 37 : 38 483 / 63 682 / 80 450 / 67 951 | registre de preuve de covoiturage | OK | |
| Verre : 15 points ; 1 pour 337 hab. ; métropole 416 ; 6ᵉ sur 23 | 15 ; 337 ; 416 ; 6ᵉ sur 23 codes INSEE | portail Tours Métropole + API Géo | OK / doute | Le jeu liste 23 communes (dont Ville-aux-Dames, 1 point pour 5 606 hab.) ; à vérifier si la métropole en compte 22. Sans elle : 409 |
| 21 bancs ; 1 point textile | 21 ; 1 | portail Tours Métropole | OK | |

### `/eau`

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| 135 prélèvements depuis 2016 ; par année 12 / 12 / 13 / 11 / 13 / 11 / 19 / 12 / 12 / 13 / 7 | 135 ; mêmes années | Hub'eau `resultats_dis` (code_commune 37139) | OK | |
| Conformité bactériologique 99,2 % (« 1 non conforme » sur 135) | **126 conformes, 1 non conforme (2018-03-30), 8 sans conclusion : 126 / 127 = 99,2 %** | Hub'eau | OK / libellé | 134/135 serait 99,3 %. Préciser « parmi les 127 prélèvements évalués » |
| Physico-chimie 100 % | 135 conformes | Hub'eau | OK | |
| Nitrates 0,3 mg/L (max 1,1) ; 37 : 9,5 ; 250ᵉ sur 272 | 0,30 ; 1,1 ; 9,49 ; 250ᵉ | Hub'eau (département 37, 8 347 analyses) | OK | |
| Calcaire 20,8 °f ; 37 : 22,9 ; 100ᵉ sur 138 | 20,82 ; 22,88 ; 100ᵉ sur 138 | Hub'eau | OK | |
| Eau puisée 514 900 m³ (2024) ; 206 piscines olympiques ; série 2008-2024 (344 → 515 k m³) | 514 900 ; 514 900 / 2 500 = 205,96 ; série identique | Hub'eau BNPE `chroniques` (ouvrage « Pins F. ») | OK | |
| Irrigation 24 550 m³ (24 180 + 370) ; 8 autres ouvrages à 0 m³ | 24 180 (Malitourne) + 370 (Les Granges) | BNPE | OK | |
| Distributeur « Veolia EAU CGE » | VEOLIA EAU CGE ; réseau « FONDETTES (LUYNES) » | Hub'eau | OK / n.v. | L'unité de distribution porte le nom de Fondettes (réseau commun ?). À mentionner si c'est le cas |

### `/construction`

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| 274 logements commencés 2002-2025 ; série annuelle (18, 11, 19, 24, 24, 17, 32, 38, 17, 3, 2, 2, 5, 4, 14, 5, 11, 15, 7, 3, 2, 0, 1, 0) | 274 ; série identique | SDES Sitadel (DiDo, millésime 2026-10) | OK | « 0 » en 2023 et 2025 vérifiés : confirmés dans la source (autorisés : 2, 2, 5) |
| 4,4 % d'appartements | 12 / 274 = 4,4 % | Sitadel (type Collectif) | OK | |
| « 11 par an » | 274 / 24 = 11,4 | — | OK | |
| 343 logements sociaux ; 68 m² ; pièces 15 / 73 / 156 / 81 / 18 ; périodes 13,4 / 63,8 / 13,4 / 9,3 % | 343 ; 67,9 ; identiques ; 46 / 219 / 46 / 32 logements | SDES RPLS (millésime **2025-01**) | OK / libellé | Stock au 1ᵉʳ janvier 2025, présenté « aujourd'hui » et « extraction de novembre 2026 » |
| Année 2026 absente des graphiques | 2026 (jusqu'à septembre) : 7 commencés, 47 autorisés | Sitadel | OK | Choix éditorial cohérent (année incomplète) |

### `/equipements`

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| 152 équipements ; domaines 63 / 15 / 5 / 35 / 6 / 25 / 3 ; Indre-et-Loire 17 / 5,5 / 1,2 / 9,8 / 0,6 / 3,8 / 0,7 pour 1 000 | 152 ; département 10 555 / 3 395 / 713 / 6 095 / 401 / 2 367 / 426 sur 619 362 hab. : mêmes taux | Melodi `DS_BPE` | OK | |
| 24 professionnels de santé libéraux ; médecins 6 ; infirmiers 7,9 ; etc. | sous-domaine D2 : 3 + 6 + 1 + 1 + 3 + 2 + 4 + 4 = 24 ; D265 = 6 | Melodi BPE | OK | |
| Élèves 385 (593 en 2009) ; série 2009-2025 ; 22,6 élèves par classe (17 classes) | série identique ; 385 / 17 = 22,6 | Éducation nationale `fr-en-ecoles-effectifs-nb_classes` | OK | |
| Collège 387 (94 / 103 / 99 / 91) ; série 2019-2025 | identique | `fr-en-college-effectifs-niveau-sexe-lv` | OK | |
| IPS : Sainte-Geneviève 135,4 (2024-25) ; Camus 119,3 ; Pasteur 118,3 (2022-23) ; collège 116,5 (2025-26) | identiques ; comparaisons issues des colonnes officielles (département, France, par secteur) | `fr-en-ips-ecoles-ap2022`, `fr-en-ips-colleges-ap2023` | OK | Les millésimes sont désormais affichés |
| Médiathèque 2023 : 36 684 prêts (7,2/hab.) ; 1 140 emprunteurs (22,5 %) ; 13 290 livres ; 856 CD ; 684 DVD ; 332 m² ; 48 places ; 28,5 h ; 31 actions, 622 personnes | identiques (36 684 / 5 062 = 7,25) | enquête 2023 du ministère de la Culture (tabulaire, résource 806a8aa1…) | OK | |
| Cantines : bio 21,7 % ; durable 34,9 % (EGalim 20 % et 50 %) ; ESAT 1,6 / 14,1 ; foyer 2,2 / 9,7 | identiques | Ma Cantine, télédéclarations 2024 | OK / libellé | Valeurs de la **cuisine centrale du prestataire** (SIRET 57210217612784), pas de Luynes ; la page l'explique en bas. Libellé Ma Cantine « École maternelle publique Albert Camus », nom différent de l'Éducation nationale (maternelle Herbinière-Lebert, élémentaire Camus) |

### `/patrimoine-risques`

| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| 8 monuments historiques ; dates 1862, 1926, 1926, 1930, 1948, 1978, 1985, 2013 | 8 ; mêmes dates et statuts | Mérimée (`merimee.csv`, POP) | OK | |
| **11 objets protégés (Palissy) ; 3 classés, 8 inscrits ; 5 lieux ; 18ᵉ siècle : 2** | **9 notices ; 1 classé, 8 inscrits ; 4 lieux ; 18ᵉ siècle : 0** | `palissy.csv` (POP, fichier du 13/11/2026) | **erreur** | « 3 pièces murales » (PM02000303) et « lit » (PM02000307), « château », classés le 20/12/1966 : commune = **Condé-en-Brie (02209)**, mais « Code_INSEE_commune_actuelle » = 37139 par erreur dans la base |
| 19 événements CatNat (sécheresse 10, mouvement de terrain 7, inondation 2) ; 16 arrêtés ; années listées | 19 ; 16 arrêtés ; mêmes années | Géorisques `/gaspar/catnat` | OK | |
| 23 mouvements de terrain (1863-1988) ; 193 cavités ; zone inondable 11,4 % | 23 et 193 vérifiés le 20/11 ; zone inondable n.v. | Géorisques | OK / n.v. | |
| Rangs : 11ᵉ (monuments), 7ᵉ (cavités), 10ᵉ (CatNat) ; moyennes 3,2 / 21,4 / 8 | non refaits | — | n.v. | Reprise 20/11 |

---

## 3. Corrections proposées (par priorité)

### Priorité haute

1. **Palissy : retirer les 2 notices du château de Condé-en-Brie** (erreur).
   - Fichier : `data/sources-patrimoine.ts`, source `palissy_luynes`, ligne `filtre`.
   - Remplacer `(Code_INSEE_commune_actuelle = '37139' OR COG_Insee = '37139')` par `COG_Insee = '37139'` (la base fiabilise ce champ pour Luynes : les 9 autres notices l'ont, et `Code_INSEE_commune_actuelle` y est vide).
   - Après `npm run data` : 9 notices, 1 classé, 8 inscrits, 4 lieux, plus de 18ᵉ siècle (frise et phrases dérivées recalculées automatiquement ; vérifier `patrimoine_objets_siecles.json`).
2. **Sport : retélécharger et reconstruire les équipements sportifs** (source mise à jour depuis le fichier du site : 2 980 → 3 533 lignes pour le département ; 28 → 29 pour Luynes).
   - Fichiers : `data/raw/sport_equipements_luynes/` et `data/raw/sport_equipements_37/` (via `npm run data`), puis `npm run build` + `npm test`.
   - Valeurs attendues : 29 équipements, 14 installations, 5,7 ‰ contre 5,7 ‰, 206ᵉ ; plus de lignes « sans position » parmi les tennis, boules, randonnée, pétanque ; ajout du skate-park.
   - Reformuler ensuite la phrase de comparaison (« au même niveau que le département » au lieu de « au-dessus ») et le « Le saviez-vous » qui en dépend, le cas échéant.
   - Prévoir une règle : si le nombre de lignes d'un export varie de plus de 10 % entre deux téléchargements, le script signale l'écart.

### Priorité moyenne

3. **Nature, « de 1 085 à 949 hectares »** : `src/pages/nature.astro` (paragraphe sous les cultures) et `data/sql/nature_cultures*.sql`. Ajouter : « dont −112 ha de surfaces gelées (jachères) : hors gel, la surface déclarée passe de 948 à 924 ha (−24 ha) ». Éviter de présenter −136 ha comme une perte de terres agricoles (règle « pas d'anecdote anxiogène »).
4. **Budget, libellé « Équipements par habitant »** : `src/data/methodes.ts` (clé du chiffre « Équipements ») et `src/pages/budget.astro`. Remplacer « travaux, bâtiments, voirie, matériel » par « acquisitions et travaux d'équipement, y compris subventions d'équipement versées » ; ajouter la note « en 2025, 118 500 € sur 461 630 € sont des subventions d'équipement versées à d'autres organismes (65,7 €/hab. hors subventions, valeur OFGL) ».
5. **Marchés publics, plafonds techniques** : `src/pages/budget.astro`. Les montants 999 999 € (électricité, gaz) et 909 090 € (transports) sont des plafonds d'accords-cadres (1 000 000 € / 1,1 = 909 090 €), pas des estimations de dépense. Ajouter « montant maximum fixé au contrat, sans lien avec la dépense réelle », voire afficher « plafond non significatif » pour 999 999 €. Préciser HT/TTC si la source le permet.
6. **Eau, base du 99,2 %** : `src/pages/eau.astro` et `src/data/methodes.ts`. Écrire « 99,2 % des 127 prélèvements dont la bactériologie a été évaluée (135 prélèvements au total, dont 8 sans conclusion bactériologique) ».
7. **Construction, millésime des logements sociaux** : `src/pages/construction.astro` et accueil. « 343 logements sociaux au 1ᵉʳ janvier 2025 (RPLS) » au lieu de « aujourd'hui ».
8. **Âge des élus et des habitants** : `data/sql/budget_conseil_ages.sql` et `budget_conseil_resume.sql`. Préciser « élus : âge en 2026 ; habitants : recensement 2023 » ; harmoniser le calcul (âge révolu ou + 0,5 des deux côtés).

### Priorité basse

9. **Espaces manquants dans le HTML construit** (constatés dans `dist/`) : `src/pages/budget.astro` ligne 145 (« les5 062 habitants » : mettre `{' '}` ou rejoindre la ligne), `src/pages/nature.astro` ligne 151 (« 2025(27,8 % » et « 2025(−136 ha) »), `src/pages/quotidien.astro` lignes 149-150 (« à97,3 % », « ;3 communes »). Corriger aussi « à partir de avril 2026 » (`src/data/methodes.ts` ligne 606 : « à partir d'avril 2026 ») et « 5000 à 10 000 habitants » (écrire « 5 000 »).
10. **Nature, libellés arrondis** : le graphique « Sur 100 hectares » affiche 4 ha et 97 ha (somme 101) : afficher 3,5 et 96,5, ou arrondir de façon cohérente.
11. **GBIF** : préciser « 22 918 enregistrements, dont 208 signalent une espèce non retrouvée » (22 710 observations en présence), ou filtrer `occurrenceStatus = PRESENT` pour ne compter que les présences (les 1 626 espèces ne changent pas).
12. **Rues** : (a) « Luynes (Provence) » : écrire « Luynes, quartier d'Aix-en-Provence (Bouches-du-Rhône) » dans `data/reference/noms-de-rues.csv` et le texte d'introduction ; (b) sous « Qui est honoré ? », ne pas dire que le sexe n'est indiqué que « lorsqu'il est certain » : « déduit du prénom lorsqu'il est certain » ; aucun changement de chiffre.
13. **Défibrillateurs** : préciser « défibrillateurs fixes (hors appareils mobiles) » dans `src/data/methodes.ts` ; 72 DAE mobiles sont exclus du département (1 506 retenus sur 1 578).
14. **Verre, Tours Métropole** : vérifier si Ville-aux-Dames fait partie de la métropole (le jeu la liste avec 1 point pour 5 606 habitants) ; sinon la retirer (moyenne métropole 409 au lieu de 416, rang inchangé).
15. **Cantines** : dans la liste, ajouter la mention « chiffres de la cuisine centrale du prestataire » sous chaque ligne (déjà en note) et mentionner que le nom des écoles vient de Ma Cantine (ex. « École maternelle publique Albert Camus » = école maternelle Suzanne Herbinière-Lebert).
16. **Superficie** : noter « 3 408 ha (calcul en projection Lambert 93) ; 3 412 ha selon l'API Géo (34,1 km²) » dans le calcul de la page Nature.
17. **Eau** : si le réseau « FONDETTES (LUYNES) » est commun aux deux communes, l'écrire dans la phrase d'introduction (le code postal 37230 est partagé).

---

## 4. Contrôle des 5 erreurs de la revue du 20/11

| Erreur d'origine | État au 21/11 |
|---|---|
| Vols dans les véhicules « moins de 5 faits sur 3 ans » | Corrigé : « L'année 2023 n'a pas été publiée (secret statistique) : le taux ne peut pas être calculé. Faits publiés : 7 en 2024, 5 en 2025. » |
| Participation « France » aux municipales 2008 = 59 % | Corrigé : courbe France interrompue pour 2008 (tableau : « — »), note « grandes communes seulement » |
| « 19 arrêtés » de catastrophe naturelle | Corrigé : « 19 événements reconnus par 16 arrêtés » (vérifié : 19 / 16) |
| Note « depuis 2018, hospitalisé = plus de 24 h » | Corrigé : « définition en vigueur depuis 2005 ; depuis 2018, ce chiffre n'est plus labellisé » |
| Coquille « Luynes :3,2 » | Corrigé : « Luynes : 3,2 pour 1 000 habitants » |

*Scripts et fichiers de vérification : `/tmp/claude-0/-DATA-Projets-data-luynes/822ca1ec-3b77-4ec0-a72c-d824de0afd1c/scratchpad/r21/` (`*.sql` exécutés avec `q.mts`, `txt.mjs` pour l'extraction du texte, téléchargements bruts à côté). Ce dossier n'est pas conservé durablement.*
