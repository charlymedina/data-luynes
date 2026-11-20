# Revue des chiffres publiés — « Luynes en chiffres »

*Revue faite le 20/11/2026 sur le site construit (`dist/` du 20/11 à 09:25, identique au site en ligne pour les chiffres) et les JSON de `src/data/generated/`. Lecture seule : aucun fichier du projet n'a été modifié.*

**Méthode.** Le texte de chaque page a été extrait de `dist/*.html`. Chaque chiffre a ensuite été recalculé **avec mes propres requêtes SQL** (DuckDB, scripts dans le scratchpad), à partir :
- des **API officielles interrogées directement** : INSEE Melodi (série historique du recensement, population par âge, Filosofi, emploi, BPE, état civil), geo.api.gouv.fr, OFGL (comptes des communes), Géorisques (catastrophes naturelles, cavités, mouvements de terrain), ADEME (DPE), Agence ORE (énergie) ;
- ou des **fichiers bruts** déjà téléchargés par le site (DVF, SSMSI, BAAC, DGFiP, résultats électoraux), en refaisant le calcul **sans réutiliser la requête du site**. Exemple : le fichier BAAC 2008 brut a été retéléchargé depuis data.gouv pour contrôler le total du département.

Les résultats nationaux connus (présidentielle 2022, européennes 2024, participation officielle des scrutins passés) ont servi de référence externe.

---

## 1. Résumé

- **Environ 190 chiffres inventoriés**, hors longs tableaux (classement des 272 communes, 404 ventes, détail des résultats électoraux). **environ 135 contre-vérifiés**, dont tous les chiffres clés, tous les rangs et toutes les comparaisons avec le département.
- **≈ 120 OK**, **5 erreurs avérées**, **≈ 12 écarts ou doutes** (définitions, dénominateurs, millésimes) et quelques chiffres non vérifiables de façon indépendante (séries anciennes, loyers modélisés, solaire, parc auto).
- Les calculs du site sont **globalement très solides**. Population, âges, rangs, revenus, budget, DVF, accidents, délinquance et énergie se retrouvent à l'unité près.

**Les 5 points les plus importants :**
1. **Délinquance, « Vols dans les véhicules »** : le texte affirme « moins de 5 faits sur 3 ans ». C'est **faux** : 7 faits en 2024 et 5 en 2025. Le taux n'est pas calculable parce que **2023 n'est pas diffusé**, pas parce qu'il y aurait moins de 5 faits.
2. **Élections, participation « France » aux municipales 2008 = 59 %** : le fichier ne couvre que les communes de 3 500 habitants et plus. La participation officielle est de **66,5 %**. Plusieurs années anciennes mélangent aussi des périmètres différents (avec ou sans Français de l'étranger), avec des écarts de 0,6 à 1,4 point.
3. **« 19 arrêtés de catastrophe naturelle »** : ce sont **19 reconnaissances (événements)** mais seulement **16 arrêtés distincts**. Un arrêté de 2002 couvre 3 événements de 2001, celui de 1999 en couvre 2.
4. **Accueil, carte « Délinquance 8 sur 9 sous la moyenne »** : le chiffre est exact mais le cadrage est flatteur. Deux des 8 indicateurs sont à 0 fait. Les violences sexuelles sont **50 % au-dessus** du département, et 2025 montre une hausse nette : 22 cambriolages, soit 9,8 ‰ contre 7,3 ‰ dans le 37, et 26 violences sexuelles.
5. **Définitions à afficher** : le **chômage** affiché est celui du recensement (11,4 % en France), pas le taux officiel du BIT (≈ 7,3 %). Les **« dépenses courantes » (1 044 €/hab.)** incluent des écritures comptables d'ordre : en dépenses réelles (OFGL), c'est 992 €/hab. Le budget divise par **5 226 habitants (DGFiP)**, le reste du site par **5 062**.

Autres erreurs avérées, plus mineures : une **coquille** dans une anecdote de délinquance (« Luynes :3,2 ») et une **note inexacte** sur la définition de « blessé hospitalisé » (page accidents).

---

## 2. Tableau par page

Légende des statuts : **OK** = identique ; **écart** = petite différence ou définition différente ; **erreur** = faux ; **n.v.** = non vérifiable indépendamment.

### Accueil (`index.html`)
| Chiffre affiché | Valeur vérifiée | Source de vérification | Statut | Commentaire |
|---|---|---|---|---|
| 5 062 habitants | 5 062 | geo.api + INSEE série historique (POP 2023) | OK | Population municipale 2023 (en vigueur au 01/01/2026) |
| 19ᵉ plus peuplée / 272 | 19ᵉ | geo.api, 272 communes | OK | |
| Âge médian 49,2 ans (France 42,5) | 49,2 (interpolation dans la tranche 45-49 ans) | recalcul depuis la pyramide | OK | Âge médian estimé par interpolation, à signaler |
| Naissances 2025 : 22 / décès 76 | 22 / 76 | Melodi état civil | OK | Petits nombres, fortes variations d'une année à l'autre |
| Superficie 34,1 km², 46ᵉ | 34,12 km² (IGN), 46ᵉ | geo.api | OK | L'INSEE donne 34,01 km² (voir territoire) |
| Densité 148 · « Moyenne 37 » 101 | 148 ; 100,6 | geo.api | OK / libellé | 101 est la **densité du département**, pas une « moyenne » : la moyenne des densités communales est de 119,7 |
| Monuments 8 (11ᵉ) · Cavités 193 (7ᵉ) | 8 ; 193 | Mérimée (via le site) ; Géorisques `cavites` = 193 | OK | |
| Prix m² maison 2 439 € vs 2 176 € | 2 439 ; 2 176 | DVF brut, recalcul indépendant | OK | Médiane **2021-2025 regroupée** : la période n'est pas indiquée sur l'accueil |
| Ventes 413 (2021-2025) | 413 | DVF brut | OK | Mais la carte en affiche 404 (voir immobilier) |
| Dépenses 1 044 €/hab. vs 1 227 € | 1 044 ; 1 227 | DGFiP (fichier brut) ; OFGL : 992 €/hab. | écart de définition | Voir budget |
| Niveau de vie 2 400 €/mois ; 37 et France 2 160 € | 28 830/12 = 2 403 ; 2 161 ; 2 160 | Melodi Filosofi 2023 | OK | « France » ici, « France métro. » sur la page : harmoniser. Année absente sur l'accueil |
| Accidents 0,3 / 1 000 hab. ; 37 : « 1 » | 0,33 ; 1,0 | BAAC (archive) | OK | Afficher « 1,0 » |
| Voitures électriques 4,7 % vs 3,6 % | 156 / 3 321 = 4,70 % | arithmétique (SDES) | OK (n.v. pour la source) | |
| Équipements 152, 199ᵉ | 152 | Melodi BPE 2025 | OK | |
| Élèves 385 (2025) | 133+86+64+102 = 385 | somme par école | OK | |
| Participation présidentielle 2022 : 77,9 / 76 / 73,7 % | 77,91 / 76,04 / 73,69 | fichiers du ministère (archive) + résultat officiel | OK | |
| Délinquance « 8 sur 9 » | 8 sur 9 | SSMSI (recalcul) | OK, mais formulation | Voir § 3 |
| Le saviez-vous : 1 970 hab. en 1876 ; ×2,6 depuis 1968 | 5 062 / 1 948 = 2,60 | INSEE série historique | OK / n.v. (1876) | La donnée d'avant 1968 vient de Tours Métropole (Cassini/EHESS), non recontrôlée |

### Population
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| Série 1968-2023 (1 948 … 5 062) | identique | Melodi `DS_RP_SERIE_HISTORIQUE` | OK | |
| Série 1876-1962 | — | — | n.v. | Source secondaire (Tours Métropole) |
| Creux 1931 : 1 517 ; record 2012 : 5 259 | 5 259 en 2012 | INSEE | OK | |
| Grand boom +174/an (1975-1982) | (3 834 − 2 614) / 7 = 174 | INSEE | OK | |
| 147 ans de recensements | 2023 − 1876 | — | OK | |
| 65 ans et plus 26,5 % / 37 22,9 % / France 21,2 % | 26,49 / 22,86 / 21,17 | Melodi `DS_RP_POPULATION_PRINC` | OK | France = y compris DOM |
| Moins de 20 ans 22,2 / 22,8 / 23,2 % | 22,20 / 22,81 / 23,21 | idem | OK | |
| Âge médian 37 : 43,4 ans | n.v. | — | n.v. | Même méthode d'interpolation |
| 65+ en 2012 : 20,1 % ; moins de 20 ans : 26,6 % | — | — | n.v. | Cohérent avec la tendance |
| Pyramide (ex. 90 ans et + : 31 H / 129 F) | total 80 ans et + : 430 contre 429 (Melodi) | Melodi | OK | Écart d'arrondi |
| Naissances / décès 2008-2025 | identiques (sondage 2020-2025) | Melodi état civil | OK | |
| Naissances − décès 2017-2023 = −258 ; migrations +223 ; total −35 | 212 − 470 = −258 ; 5 062 − 5 097 = −35 | INSEE (BRTH/DEATH de la série historique) | OK | |
| Rangs : population 19ᵉ, croissance 184ᵉ, 65+ 88ᵉ | 19 / 184 / 88 | recalcul sur 272 communes | OK | |
| Croissance 2012-2023 : −3,7 % vs +3,8 % | −3,75 % ; 596 937 → 619 362 = +3,76 % | INSEE | OK | |
| « 27 sur 100 ont 65 ans ou plus » | 26,5 % | — | OK | Arrondi |

### Territoire
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| 34,1 km² | 34,12 (IGN) ; **34,01 (INSEE)** | geo.api ; Melodi SUP | écart mineur | Avec la surface INSEE, la densité serait de 148,8, soit **149** |
| Moyenne 22,6 km² ; médiane 19,3 km² | 22,6 ; 19,3 | geo.api | OK | |
| Densité 148 ; 37 : 101 | 148,4 ; 100,6 | geo.api | OK | |
| Rang densité 46ᵉ ; rang superficie 46ᵉ | 46 et 46 | recalcul | OK | Coïncidence réelle (vérifiée), pas une erreur de copie |
| « 1,5 fois plus dense » | 148 / 101 = 1,47 | — | OK | |
| « Plus grande que 83 % des communes » | (272 − 46) / 272 = 83 % | — | OK | |

### Patrimoine & risques
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| 193 cavités | 193 | Géorisques `/cavites` | OK | |
| 23 mouvements de terrain « depuis 1863 » | 23 | Géorisques `/mvt` | OK | Le dernier recensé date de **1988** (voir § 3) |
| **19 arrêtés** CatNat (sécheresse 10, terrain 7, inondation 2) | **19 reconnaissances, 16 arrêtés distincts** | Géorisques `/gaspar/catnat` | **erreur de libellé** | « Mouvement de terrain 7 » = 5 arrêtés (2001 : 5 événements) ; l'arrêté de 1999 couvre 2 risques |
| Années des sécheresses (1990, 1990, 1992…) | identiques (date de début d'événement) | Géorisques | OK | |
| 8 monuments, 1ᵉʳ protégé en 1862 | 8 | Mérimée (source du site) | OK / n.v. | API culture inaccessible, non recontrôlé ailleurs |
| Rangs : monuments 11ᵉ, cavités 7ᵉ, CatNat 10ᵉ ; moyennes 3,2 / 21,4 / 8 | — | — | n.v. | Le rang CatNat compte aussi des reconnaissances : cohérent entre communes |
| « 9 fois plus de cavités que la moyenne » | 193 / 21,4 = 9,0 | — | OK | |
| Zone inondable 11,4 % | — | — | n.v. | Calcul spatial non refait |

### Immobilier
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| 413 ventes (maisons 241, terrains 101, appart. 22) | 413 / 241 / 101 / 22 | DVF brut, ma propre agrégation par mutation | OK | **49 « autres » non affichées** dans la carte chiffre (241+101+22 = 364) |
| « 404 ventes affichées » (carte et tableau) | 413 − 9 sans coordonnées | — | **incohérence** | À expliquer : « 404 ventes localisées sur 413 » |
| Prix m² maison 2 439 € ; 37 : 2 176 € | 2 439 ; 2 175,6 | DVF brut | OK | |
| Prix maison 225 100 € ; 37 : 205 000 € | 225 100 ; 205 000 | DVF brut | OK | |
| 33ᵉ sur 198 communes comparables | 33ᵉ / 198 | DVF brut (seuil : 30 ventes de maisons) | OK | |
| Série annuelle 2 359 / 2 609 / 2 571 / 2 536 / 2 426 | identique | DVF brut | OK | 36 à 60 ventes par an : médianes fragiles |
| Ventes par an 98 / 98 / 77 / 78 / 62 | — | — | OK (somme = 413) | |
| Histogramme (somme 241) | 6+13+…+12 = 241 | — | OK | |
| Maison la plus chère 1 271 250 € | 1 271 250 | DVF brut | OK | |
| Loyers maison 10,5 € (32ᵉ), appart. 11,2 € (35ᵉ) ; médianes 37 : 8,5 et 9,8 | 10,53 ; 11,16 | fichier brut « carte des loyers » | OK | Valeurs **modélisées** (prédiction), pas des moyennes d'annonces |
| DPE A…G (1 017 DPE, D = 48,1 %) | 1 017, D = 489 | API ADEME interrogée directement | OK | |
| Passoires 4,8 % vs 7,8 % | 3,1 + 1,7 ; 5,2 + 2,6 | — | OK | |

### Budget
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| Dépenses courantes 2025 : 5,5 M€ ; 1 044 €/hab. ; strate 1 227 € | DGFiP 5 457 k€ ; **OFGL 5 183 k€ = 992 €/hab.** | DGFiP brut ; API OFGL | **écart de définition** | Le total DGFiP inclut des écritures d'ordre (amortissements) |
| Dette 634 €/hab. ; strate 761 € | OFGL 3 313 314 € → 634,0 €/hab. | OFGL | OK | |
| Pic de dette 979 € en 2017 | — | DGFiP | OK | |
| Taxe foncière 43,8 % ; strate 40,04 % ; médiane 37 : 34,97 % ; 9ᵉ | 43,8 ; 9ᵉ ; médiane 34,97 | DGFiP brut, mon propre classement | OK | |
| Équipement 88 €/hab. ; strate 479 € ; 240ᵉ ; médiane 37 : 244 € | 88,33 ; 240ᵉ ; OFGL : 65,7 €/hab. | DGFiP / OFGL | OK / écart de définition | Une seule année : chiffre volatil |
| Dépenses courantes 43ᵉ ; médiane 37 : 758 € ; dette 82ᵉ ; médiane 438 € | 43 / 757,6 / 82 / 438 | DGFiP brut | OK | |
| Répartition : personnel 62,6 %, achats 22,9 %… | 3 415,6 / 5 457,3 = 62,6 % | DGFiP | OK | Rapporté au total DGFiP ; en dépenses réelles, ce serait 65,9 % |
| Recettes : impôts locaux 51,6 %, dotation 14,2 % | 3 028 / 5 870 = 51,6 % | DGFiP | OK | |
| 8,4 M€ d'équipement en 10 ans | 8 386 330 € (2016-2025) | DGFiP (somme) | OK | Dire « 2016-2025 » |
| Population de référence | 5 226 (DGFiP) contre 5 062 ailleurs | — | écart de dénominateur | Population DGFiP ≠ population municipale INSEE |

### Revenus & emploi
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| Niveau de vie 28 830 € ; 25 930 € ; 25 920 € (France métro.) | identiques | Melodi Filosofi 2023 | OK | |
| Pauvreté 7 % ; 14,1 % ; 15,9 % | identiques | Melodi | OK | |
| 24ᵉ sur 270 | 24ᵉ / 270 (2 communes sous secret statistique) | Melodi, 272 communes | OK | |
| Chômage 7,2 % ; 10,5 % ; 11,4 % ; 153ᵉ | 7,17 % ; 153ᵉ | Melodi `DS_RP_EMPLOI_LR_PRINC` | OK | **Chômage au sens du recensement**, à préciser (le BIT France est ≈ 7,3 %) |
| 15-64 ans : emploi 72,9 / chômage 5,6 / études 10 / autres 11,4 | 72,9 / 5,6 / 10,0 / 11,4 | Melodi | OK | |
| Navettes 76,1 / 17,8 / 6,1 ; « 8 sur 10 ailleurs » | 82,2 % | site (arithmétique) | OK / n.v. | |
| Voiture 83,3 % ; TC 7 % ; … | — | — | n.v. | Même source INSEE |
| Salaire 2 427 € ; 2 457 € ; 2 733 € ; F 2 000 / H 2 675 ; écart −25 % | (2 675 − 2 000) / 2 675 = 25,2 % | arithmétique | OK / n.v. | |
| Créations d'entreprises (record 2021 : 71) | — | — | n.v. | |

### Accidents
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| 35 accidents 2005-2025 ; série annuelle | identique ; 2008 = 4 confirmé dans le **fichier BAAC brut** | BAAC | OK | |
| 5 années sans accident sur 21 | 2009, 2012, 2020, 2022, 2025 | — | OK | |
| 0,3 / 1 000 hab. ; 37 : 1 ; « 3 fois moins » | 0,33 ; 12 956 accidents / 21 ans ≈ 1,0 ; ratio 3,0 | BAAC | OK, avec réserve | Série du 37 hétérogène : 291 accidents en 2008 (confirmé dans le brut) contre 803 en 2010 |
| 3 mortels / 23 avec hospitalisés / 9 légers (8,6 / 65,7 / 25,7 %) | 3 / 23 / 9 | BAAC usagers, gravité maximale par accident | OK | |
| 3 tués, 25 hospitalisés, 19 blessés légers | 3 / 25 / 19 | BAAC | OK | |
| 23 accidents localisés (6 / 14 / 3), 12 sans coordonnées | 23 avec coordonnées ≠ 0 | BAAC | OK | |
| Week-end 22,9 % vs 24,3 % | 8 / 35 | BAAC | OK | |
| Routes : D49 9, D952 8… (somme 35) | — | — | OK (somme) | |
| Rang 221ᵉ / 272 | — | — | n.v. | 275 codes communes dans le BAAC (communes fusionnées) |
| Note « depuis 2018, hospitalisé = plus de 24 h » | La définition « plus de 24 h » s'applique **depuis 2005** ; en 2018, l'ONISR a cessé de labelliser cet indicateur | doc. ONISR | **erreur probable** | Reformuler |

### Écoles, santé & services
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| 152 équipements ; 30 / 1 000 hab. | 152 | Melodi BPE 2025 | OK | |
| Médecins 6 ; 11,9 / 10 000 hab. | 6 ; 11,85 | BPE D265 | OK | |
| Infirmiers 7,9 ; pharmacie 2 ; piscine 1 | 4 → 7,9 ; 1 → 2,0 ; F101 = 1 | BPE | OK | |
| 2 établissements de soins | D101 + D102 | BPE | OK | |
| Domaines (63 / 15 / 5 / 35 / 6 / 25 / 3) | somme = 152 | — | OK | |
| Élèves 593 → 385 (−35 %) ; 37 : −7 % | −35,1 % | arithmétique | OK / n.v. (37) | |
| 22,6 élèves par classe | 385 / 17 classes | — | OK | |
| Collège 387 (94 + 103 + 99 + 91) | 387 | — | OK | |
| IPS (Sainte-Geneviève 135,4 ; Camus 119,3 ; Pasteur 118,3 ; collège 116,5) | — | — | n.v. | **Millésimes différents** : Pasteur en 2022-2023, les autres en 2024-2026 |

### Énergie & mobilité
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| Électricité 5 860 kWh par logement (2 314 logements) | 5,864 MWh ; 2 314 points | API Agence ORE (directe) | OK | « Logement » = point de livraison résidentiel |
| Gaz 9 630 kWh ; 813 logements ; 35 sur 100 | 9,631 ; 813 / 2 314 = 35,1 % | API ORE | OK | |
| 37 : 4 570 / 8 260 kWh | — | — | n.v. | |
| Rang électricité 179ᵉ alors que Luynes = 1,3 × la moyenne du 37 | — | — | cohérent mais déroutant | La moyenne du 37 est tirée vers le bas par les appartements de Tours |
| Solaire 1 062 kW, 44 installations, 210 kW / 1 000 hab. | 1 062 / 5,062 = 209,8 | arithmétique | OK / n.v. | |
| Voitures 3 321 ; électriques 156 = 4,7 % ; 1 sur 21 ; 40ᵉ | 156 / 3 321 = 4,70 % | arithmétique | OK / n.v. | |
| Diesel 59,9 % (2016) → 40,7 % (2026) ; 37 : 46 % | 1 351 / 3 321 = 40,7 % | arithmétique | OK | |
| Tableau 2011-2025 en MWh **entiers** (7, 6…) | 5,86 arrondi à 6 | — | arrondi trop grossier | Mettre une décimale |
| 1 borne, 2 points de charge | — | — | n.v. | |

### Élections
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| 4 135 inscrits, 5 bureaux (2026) | 4 135 / 5 | fichier du ministère (archive) | OK | |
| 49 tours, 29 premiers tours ; 27 sur 29 au-dessus de la France | 27 (en dessous : régionales et départementales 2021) | recalcul tour par tour | OK | Régionales 2015 : +0,3 point seulement |
| Présidentielle 2022 T1 : 77,9 / 76,0 / 73,7 % | 77,91 / 76,04 / 73,69 | ministère | OK | |
| Présidentielle 2022 : Macron 33 % / 27,8 % France, Le Pen 19,9 / 23,2… ; T2 65,2 / 34,8 (France 58,5 / 41,5) | France conforme aux résultats officiels ; Luynes : somme des voix = 3 075 exprimés | ministère | OK | |
| Européennes 2024 France : Bardella 31,4 ; Hayer 14,6 ; Glucksmann 13,8 ; LFI 9,9 | conforme | officiel | OK | |
| Législatives 2024 : 72,9 / 69,3 / 66,7 % ; Thillaye 64,6 % au T2 | 2 987 / 4 100 = 72,85 ; somme = exprimés | ministère | OK | |
| Municipales 2026 : 66,8 % ; 37 : 56,6 % ; France 57,1 % ; 66ᵉ sur **271** | 2 763 / 4 135 = 66,82 ; 56,65 ; 57,12 | ministère | OK (n.v. externe) | N = 271 et non 272 : expliquer pourquoi |
| Municipales 2026 : 43,9 / 32,7 / 23,4 % puis 51 / 35 / 13,9 % ; sièges 22 / 5 / 2 | sièges recalculés (prime majoritaire de 15 + 14 à la proportionnelle) : **22 / 5 / 2** | calcul selon le code électoral | OK | |
| Record 88,9 % (présidentielle 2007) | 2 980 / 3 351 = 88,93 | ministère | OK | |
| Séries « France » : **municipales 2008 = 59** | officiel **66,5 %** | ministère (taux officiel) | **erreur** | Le fichier ne couvre que les communes de 3 500 habitants et plus (26,3 M d'inscrits) ; idem pour le 37 |
| Présidentielle 2007 France = 85 ; législatives 2002 = 65 ; 2007 = 61 ; régionales 2004 = 59 | officiel 83,8 / 64,4 / 60,4 / 60,8 | ministère | **écart** | Périmètre variable (hors Français de l'étranger avant 2012, etc.) |

### Délinquance
| Chiffre affiché | Valeur vérifiée | Source | Statut | Commentaire |
|---|---|---|---|---|
| Cambriolages 6,1 ‰ logements ; 37 : 6,8 ; France 5,7 | (7 + 12 + 22) / 3 / 2 251 = 6,07 ; 6,80 ; 5,73 | SSMSI brut (communal + départemental) | OK | France = y compris DOM |
| Vols sans violence 3,2 / 7,1 / 9,1 | 3,16 / 7,12 / 9,13 | SSMSI | OK | |
| Dégradations 5,5 / 6,8 / 7,9 | 5,47 / 6,78 / 7,90 | SSMSI | OK | |
| Escroqueries 6,3 / 6,8 / 6,2 | 6,32 / 6,78 / 6,19 | SSMSI | OK | |
| Violences hors famille 2 / 2,6 / 3,1 ; intrafamiliales 3 / 3,7 / 3,6 | 2,04 / 2,57 / 3,06 ; 2,96 / 3,69 / 3,61 | SSMSI | OK | |
| Violences sexuelles 3,2 / 2,1 / 1,8 | 3,16 / 2,13 / 1,80 | SSMSI | OK | 2025 = 26 faits (5,1 ‰ contre 2,3 ‰ dans le 37) |
| Vols violents et vols avec arme = 0 chaque année ; anecdote « aucun fait de 2016 à 2025 » | 0, statut « diff » (publié) | SSMSI | OK | |
| **Vols dans les véhicules « moins de 5 faits sur 3 ans »** | 2023 non diffusé ; **2024 = 7 ; 2025 = 5** | SSMSI | **erreur** | Le taux 2023-2025 n'est pas calculable, mais il y a au moins 12 faits |
| Vols de véhicules non publiés (2016-2025) | ndiff | SSMSI | OK | |
| « 8 sur 9 sous la moyenne » | 8 / 9 | SSMSI | OK | Formulation, voir § 3 |
| Anecdote « …sont rares à Luynes :3,2 pour 1 000 » | — | — | **coquille** | Espace manquant (`faits-delinquance.ts`, l. 34) |

---

## 3. Incohérences internes et formulations à revoir

| # | Problème | Où | Correction proposée |
|---|---|---|---|
| 1 | « Moins de 5 faits sur 3 ans » est faux pour les vols dans les véhicules | Délinquance | Distinguer deux cas : « Une année de la période (2023) n'est pas publiée par le ministère : le taux sur 3 ans ne peut pas être calculé » et « moins de 5 faits » (vrai secret statistique). Afficher quand même 2024 (7) et 2025 (5). |
| 2 | Participation « France » mal définie pour les anciens scrutins (municipales 2008 : 59 % au lieu de 66,5 %) | Élections | Pour 2008 : masquer la courbe France ou écrire « communes de 3 500 hab. et plus ». Pour les autres années : utiliser le taux officiel du ministère ou indiquer « hors Français de l'étranger ». |
| 3 | « 19 arrêtés » alors qu'il y a 16 arrêtés | Patrimoine (carte chiffre, légende, anecdote) | « 19 reconnaissances de catastrophe naturelle (16 arrêtés) ». Ou compter des `code_national_catnat` distincts (à faire de la même façon pour le rang départemental). |
| 4 | « 8 sur 9 sous la moyenne » mis en avant sur l'accueil | Accueil + Délinquance | Plus neutre : « Délinquance enregistrée 2023-2025 : sous la moyenne du 37 pour 8 indicateurs sur 9, au-dessus pour les violences sexuelles ». Signaler aussi la hausse de 2025 (cambriolages 22, violences sexuelles 26), visible dans les mini-graphiques mais absente des textes. Préciser que 2 des 8 indicateurs sont à zéro. |
| 5 | Chômage du recensement présenté comme « Chômage 2023 » | Revenus | « Chômage déclaré au recensement 2023 (15-64 ans) — différent du taux officiel BIT ». |
| 6 | Dénominateurs différents : 5 226 (DGFiP) contre 5 062 (INSEE) | Budget | Ajouter « par habitant (population DGFiP 2025 : 5 226) ». |
| 7 | « Dépenses courantes » = total DGFiP avec écritures d'ordre ; « Équipements 88 € » sur une seule année | Budget | Libellé « Charges de fonctionnement (comptabilité DGFiP) ». Pour l'équipement, préférer une moyenne sur 5 ou 10 ans (159 €/hab./an en 2016-2025 d'après les données) : comparer une seule année faible à la strate peut prêter à polémique. |
| 8 | 413 ventes contre « 404 ventes affichées » ; « Autres » (49) invisible dans la carte chiffre | Immobilier, accueil | « 413 ventes (dont 49 autres : lots, locaux, dépendances) ; 404 localisées sur la carte ». |
| 9 | Prix médians sur 5 ans regroupés, sans période sur l'accueil | Accueil | « Prix au m² d'une maison (2021-2025) ». |
| 10 | Libellé « Moyenne 37 » pour une densité départementale | Accueil (Densité) | Remplacer par « Indre-et-Loire » comme sur la page Territoire. |
| 11 | « France » (accueil) contre « France métro. » (page) pour le niveau de vie | Accueil | Harmoniser en « France métro. » ; ajouter « 2023 ». |
| 12 | « Indre-et-Loire 1 » (accidents) | Accueil, Accidents | Afficher « 1,0 ». |
| 13 | « 3 fois moins d'accidents » sans dire que 74 % sont graves à Luynes (46 % dans le 37) | Accidents | Ajouter : « …mais 3 sur 4 y font au moins un blessé hospitalisé ou un mort (moins d'1 sur 2 dans le département) ». Signaler que la série départementale 2005-2009 est incomplète. |
| 14 | Note « Depuis 2018, hospitalisé = plus de 24 h » | Accidents | « Blessé hospitalisé = plus de 24 h à l'hôpital (définition depuis 2005). Depuis 2018, ce chiffre n'est plus labellisé statistique publique : à lire avec prudence. » |
| 15 | « Ce sont les nouveaux arrivants qui compensent » alors que le total est −35 | Population | « Les arrivées compensent presque les décès ». |
| 16 | « Pourquoi autant de décès ? » : explication non démontrée par les données ; les patients du court séjour ne sont pas des résidents | Population | « Probablement : Luynes accueille un EHPAD et des unités de long séjour (centre hospitalier Jean-Pagès), dont les résidents sont comptés comme habitants. » |
| 17 | « Le coteau qui bouge » : 23 mouvements recensés, le dernier en **1988** (inventaire BRGM ancien), alors que des arrêtés CatNat « mouvement de terrain » existent en 2001 | Patrimoine | « 23 mouvements recensés entre 1863 et 1988 dans l'inventaire du BRGM (non exhaustif, peu mis à jour) ». |
| 18 | IPS de Pasteur en 2022-2023, les autres en 2024-2026 | Écoles | Mettre le millésime en évidence ou expliquer l'absence de données récentes. |
| 19 | Électricité : 179ᵉ sur 272 alors que la valeur est 1,3 × la moyenne départementale | Énergie | Ajouter : « la moyenne du département est tirée vers le bas par les appartements de Tours ; Luynes est sous la commune médiane ». |
| 20 | Tableau énergie en MWh entiers | Énergie | Une décimale (5,9 au lieu de 6). |
| 21 | Municipales 2026 « sur 271 communes » contre 272 ailleurs | Élections | Note : « une commune sans résultat publié ». |
| 22 | Noms de listes en minuscules incohérentes (« La france revient ! avec jordan bardella… ») ; « Autres (1 candidats ou listes) » | Élections | Rétablir les majuscules des noms propres ; accorder « 1 candidat ou liste ». |
| 23 | Densité 148 (surface IGN) contre 149 (surface INSEE 34,01 km²) | Territoire | Garder 148 mais citer « surface IGN (API Géo) ». |
| 24 | Coquille « Luynes :3,2 » | Délinquance (anecdote) | Ajouter l'espace. |
| 25 | « France » = France entière y compris DOM pour la délinquance et les âges | Délinquance, Population | Mentionner « France entière (y c. DOM) ». |

---

## 4. Proposition de libellés « Source · Calcul · Millésime » (chiffres clés)

| Chiffre | Libellé proposé |
|---|---|
| Habitants 5 062 | Source : INSEE, recensement · Calcul : population municipale · Millésime : 2023 (en vigueur au 1ᵉʳ janv. 2026) |
| Rang population 19ᵉ | Source : INSEE · Calcul : classement des 272 communes d'Indre-et-Loire, 1 = la plus peuplée · Millésime : 2023 |
| Âge médian 49,2 ans | Source : INSEE, recensement (âge quinquennal) · Calcul : interpolation dans la tranche d'âge médiane · Millésime : 2023 |
| 65 ans et plus 26,5 % | Source : INSEE, recensement · Calcul : 65 ans et plus / population totale · Millésime : 2023 |
| Naissances 22 / décès 76 | Source : INSEE, état civil · Calcul : naissances et décès domiciliés à Luynes · Millésime : 2025 |
| Superficie 34,1 km² | Source : IGN via API Géo · Calcul : surface du contour communal · Millésime : 2026 |
| Densité 148 hab./km² | Source : INSEE + IGN · Calcul : population 2023 / surface · Millésime : 2023 |
| Monuments historiques 8 | Source : Ministère de la Culture, base Mérimée · Calcul : immeubles protégés (classés ou inscrits) · Millésime : extraction nov. 2026 |
| Cavités 193 | Source : BRGM / Géorisques · Calcul : cavités recensées dans la commune · Millésime : nov. 2026 |
| Catastrophes naturelles 19 | Source : Géorisques (GASPAR) · Calcul : reconnaissances CatNat (16 arrêtés) · Millésime : 1983-2022 |
| Prix au m² d'une maison 2 439 € | Source : DGFiP, DVF · Calcul : médiane prix / surface habitable, ventes d'une seule maison, 300 à 15 000 €/m² · Millésime : 2021-2025 |
| Ventes 413 | Source : DGFiP, DVF · Calcul : mutations « vente » d'au moins 1 000 € · Millésime : 2021-2025 |
| Loyer maison 10,5 €/m² | Source : ANIL / ministère du Logement, carte des loyers · Calcul : loyer prédit charges comprises, à partir d'annonces · Millésime : 2025 |
| Passoires 4,8 % | Source : ADEME, DPE logements existants · Calcul : étiquettes F + G / DPE réalisés · Millésime : juil. 2021 – nov. 2026 |
| Dépenses 1 044 €/hab. | Source : DGFiP, comptes individuels · Calcul : charges de fonctionnement / population DGFiP (5 226) · Millésime : 2025 |
| Dette 634 €/hab. | Source : DGFiP · Calcul : encours au 31/12 / population DGFiP · Millésime : 2025 |
| Taxe foncière 43,8 % | Source : DGFiP · Calcul : taux voté sur le bâti (inclut l'ancienne part départementale) · Millésime : 2025 |
| Niveau de vie 2 400 €/mois | Source : INSEE, Filosofi · Calcul : niveau de vie médian annuel / 12 · Millésime : revenus 2023 |
| Pauvreté 7 % | Source : INSEE, Filosofi · Calcul : part sous 60 % du niveau de vie médian national · Millésime : 2023 |
| Chômage 7,2 % | Source : INSEE, recensement · Calcul : chômeurs déclarés / actifs 15-64 ans (≠ taux BIT) · Millésime : 2023 |
| Salaire net 2 427 € | Source : INSEE, Base tous salariés · Calcul : salaire net mensuel moyen en EQTP, secteur privé · Millésime : 2024 |
| Accidents 0,3 / 1 000 hab. | Source : ONISR, fichiers BAAC · Calcul : accidents corporels par an / population 2023 · Millésime : 2005-2025 |
| Équipements 152 | Source : INSEE, Base permanente des équipements · Calcul : nombre d'équipements recensés · Millésime : 2025 |
| Médecins 11,9 / 10 000 hab. | Source : INSEE, BPE · Calcul : médecins généralistes / population 2023 × 10 000 · Millésime : 2025 |
| Élèves 385 | Source : Éducation nationale · Calcul : élèves des écoles maternelles et élémentaires publiques et privée · Millésime : rentrée 2025 |
| Électricité 5 860 kWh | Source : Agence ORE (Enedis) · Calcul : consommation résidentielle / points de livraison · Millésime : 2025 |
| Solaire 1 062 kW | Source : ODRÉ, registre national des installations · Calcul : puissance raccordée cumulée · Millésime : 2025 |
| Voitures électriques 4,7 % | Source : SDES, parc automobile · Calcul : VP électriques / VP immatriculées au 1ᵉʳ janvier · Millésime : 2026 |
| Participation présidentielle 77,9 % | Source : ministère de l'Intérieur · Calcul : votants / inscrits, 1ᵉʳ tour · Millésime : 2022 |
| Municipales 66,8 % | Source : ministère de l'Intérieur · Calcul : votants / inscrits, 1ᵉʳ tour · Millésime : 2026 |
| Délinquance (taux) | Source : SSMSI (ministère de l'Intérieur) · Calcul : moyenne annuelle des faits 2023-2025 / population 2023 (ou logements 2022) × 1 000 · Millésime : 2023-2025 |

*Scripts de vérification : `q.mts` (exécuteur DuckDB) et `*.sql` dans le même dossier scratchpad ; téléchargements dans `dl/`.*
