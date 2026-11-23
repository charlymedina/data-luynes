# 📊 Luynes en chiffres (data-luynes)

Site de **données ouvertes sur Luynes** (Indre-et-Loire, code INSEE `37139`) : rassembler, vérifier et présenter
simplement les données publiques de la commune.

Site en ligne : **https://luynes.pages.dev** — 17 thèmes + une page d'accueil, reconstruits chaque lundi (et à chaque
modification) à partir des dernières données publiées.

---

## 🎯 Principes

- Rendre les données publiques sur Luynes **lisibles par tous** : chiffres clés, graphiques, cartes, « Le saviez-vous ? ».
- **Citer chaque source** : sous chaque chiffre clé, une bulle ⓘ donne la source, le calcul et l'année ; chaque page a
  une section « Sources et méthode » et ses sources en pied de page.
- Garder les transformations de données **en SQL lisible** (DuckDB), faciles à relire et à modifier.
- **Aucun chiffre écrit à la main** dans les textes : tout est recalculé à partir des données à chaque construction.
- Ton neutre, uniquement des données rattachées à Luynes (pas de station ou de capteur situé ailleurs).

## 🗂️ Les thèmes

| Thème | Adresse | Principales sources |
|---|---|---|
| Population | `/population` | INSEE (recensement, état civil), Tours Métropole |
| Territoire | `/territoire` | IGN / API Géo |
| Patrimoine & risques | `/patrimoine-risques` | Base Mérimée, Palissy, BD TOPO (IGN, âge du bâti), INSEE (logements par période), Géorisques (BRGM, GASPAR, zones inondables) |
| Immobilier | `/immobilier` | DVF (DGFiP), carte des loyers, DPE (ADEME) |
| Budget & vie municipale | `/budget` | DGFiP (comptes individuels, balances comptables), DECP, BOAMP, répertoire national des élus |
| Revenus & emploi | `/revenus-emploi` | INSEE (Filosofi, recensement, base Tous salariés, SIDE), CAF (foyers allocataires par prestation) |
| Accidents de la route | `/accidents` | ONISR (fichiers BAAC) |
| Écoles, santé & services | `/equipements` | INSEE (BPE), Éducation nationale |
| Énergie & mobilité | `/energie-mobilite` | Agence ORE, ODRÉ, SDES, base IRVE |
| Élections | `/elections` | Ministère de l'Intérieur (données agrégées data.gouv.fr) |
| Délinquance | `/delinquance` | SSMSI (ministère de l'Intérieur) |
| Eau du robinet | `/eau` | Hub'eau (contrôle sanitaire des ARS) |
| Construction & logement social | `/construction` | SDES (Sitadel, RPLS) |
| Sport | `/sport` | INJEP (licences par commune), ministère des Sports (recensement des équipements, RES) |
| Nature & paysages | `/nature` | INPN (ZNIEFF, Natura 2000), RPG (IGN), AOC viticoles (INAO), GBIF (observations d'espèces) |
| Les rues de Luynes | `/rues` | Base Adresse Nationale (IGN / DINUM), table de correspondance des noms écrite à la main |
| Vie quotidienne | `/quotidien` | ARCEP (fibre), Géo'DAE (défibrillateurs), Registre de preuve de covoiturage, Tours Métropole (verre, textile, bancs) |

Le détail (producteur, licence, fréquence de mise à jour) est dans [`docs/sources.md`](docs/sources.md) ;
l'inventaire des données disponibles et leur statut dans [`docs/catalogue-donnees.md`](docs/catalogue-donnees.md).

## 🛠️ Comment ça marche

```
Sources publiques ──► data/raw/ ──► requêtes SQL (DuckDB) ──► src/data/generated/*.json ──► pages Astro ──► dist/
 (data/sources*.ts)   (téléchargé)   (data/sql/*.sql)           (un .sql = un .json)        (src/pages/)
```

1. `scripts/build-data.ts` télécharge chaque source listée dans `data/sources.ts` (et `data/sources-<thème>.ts`).
   Si une source ne répond pas après 3 essais, sa version précédente est réutilisée et signalée en pied de page.
   Le téléchargement est **incrémental** (`scripts/telechargement.ts`) : `data/raw/_manifest.json` retient pour chaque source son
   ETag / Last-Modified et sa taille ; une source inchangée n'est pas retéléchargée, et une source sans signature est réutilisée
   `validiteJours` jours (7 par défaut, réglable dans `data/sources*.ts`). `--force` retélécharge tout.
   Si le nombre de lignes d'une source varie de plus de `seuilAlertePct` (10 % par défaut), la construction continue mais
   `data/raw/_alertes.json` est écrit et le workflow ouvre (ou met à jour) l'issue GitHub « Alerte sources de données ».
   Une source peut aussi être de type « parquet-extrait » (gros Parquet en ligne dont DuckDB ne lit que les lignes utiles)
   ou « csv-extrait » (gros CSV lus en continu, seules les lignes du filtre sont gardées).
2. Les **archives** (`data/archive/`) gardent ce que les producteurs ne publient plus ou qui est trop lourd à
   retélécharger : ventes DVF anciennes (`dvf/`), accidents de l'Indre-et-Loire (`baac/`), résultats électoraux
   (`elections/`). Elles sont mises à jour par `scripts/archive-*.ts` et enregistrées automatiquement dans le dépôt
   par GitHub Actions quand elles changent (commit « chore: archives de données… » du robot).
3. Les requêtes `data/sql/*.sql` produisent les JSON du site :
   - un fichier `<nom>.sql` = un fichier `src/data/generated/<nom>.json` ;
   - les fichiers `_*.sql` préparent des vues partagées (ils ne produisent pas de JSON) ;
   - les sous-dossiers `data/sql/baac/` et `data/sql/elections/` servent à **fabriquer les archives** (pas de JSON).
4. Les **tests** (`npm test`) vérifient les données et le site avant chaque publication ; s'ils échouent, rien n'est
   publié et le site en ligne reste inchangé.

## 📁 Structure

```
data-luynes/
├── data/
│   ├── sources.ts, sources-<thème>.ts   # sources téléchargées (→ data/raw/, non versionné)
│   ├── sql/*.sql                        # requêtes DuckDB : un .sql = un .json (_*.sql = vues partagées)
│   ├── sql/baac/, sql/elections/        # requêtes de fabrication des archives
│   ├── archive/{dvf,baac,elections}/    # archives versionnées (Parquet + manifest.json)
│   ├── reference/                       # petites tables de référence (libellés des équipements INSEE, noms de rues)
│   └── tests/*.sql                      # tests de cohérence en SQL (zéro ligne = OK)
├── scripts/
│   ├── build-data.ts                    # téléchargement + requêtes SQL
│   ├── archive-{dvf,baac,elections}.ts  # archives (+ manifest.ts, outils communs)
│   ├── telechargement.ts                # téléchargement incrémental + alerte de variation (testé dans tests/)
│   ├── veille.ts                        # veille mensuelle des nouvelles données ouvertes (issue « Veille données »)
│   ├── signaler-alertes.sh              # issue GitHub « Alerte sources de données » (appelé par le workflow)
│   └── test-data.ts, test-site.ts, test-archives.ts  # tests des données, du site construit et des archives
├── src/
│   ├── pages/                           # une page par thème + formulaire /signaler + accueil + À propos + 404 ; og/[slug].png.ts = images de partage
│   ├── components/ (charts/)            # chiffres clés, bulles ⓘ, cartes, graphiques
│   ├── data/                            # types + lecture des JSON ; themes.ts (registre), credits.ts, methodes.ts
│   └── lib/                             # og-pages.ts / og-image.ts (images d'aperçu), formats, anecdotes « Le saviez-vous ? » (faits*.ts), cartes, navigation
├── functions/api/signalement.ts         # Pages Function : reçoit le formulaire (/api/signalement)
├── tests/*.test.ts                      # tests unitaires (formats, adresses)
├── docs/                                # sources, catalogue des données, revues
└── .github/workflows/                   # deploy.yml (construction, tests, publication, archives), veille.yml (veille mensuelle)
```

## 🚀 Commandes

```bash
npm install
npm run data                          # télécharge les données et exécute les requêtes SQL
npm run data -- --sources=id1,id2     # ne traite que ces sources (les autres fichiers de data/raw/ sont réutilisés)
npm run data -- --force               # retélécharge toutes les sources (sinon : seulement celles qui ont changé)
npm run dev                           # site en local (relance aussi les données)
npm run build                         # version finale dans dist/
npm run preview                       # affiche dist/ en local
npm run check                         # vérification TypeScript
npm test                              # tests : unitaires, données (SQL), archives, site construit
npm run test:archives                 # simule la disparition d'une année à la source (DVF, BAAC, élections) dans une copie
```

⚠️ `npm run build` en local peut modifier `data/archive/` (nouvelles années DVF ou accidents) : committer ces fichiers
volontairement, ou les annuler (`git checkout data/archive`), pour ne pas entrer en conflit avec le robot.

## ➕ Ajouter un thème

1. **Sources** : un fichier `data/sources-<thème>.ts` (ajouté à la liste de `data/sources.ts`) ; filtrer toujours par
   code INSEE `37139` (le code postal 37230 est partagé avec Fondettes).
2. **Requêtes** : `data/sql/<thème>_*.sql`, commentées en français ; comparaison avec l'Indre-et-Loire et rang
   « sur N communes d'Indre-et-Loire » quand c'est possible.
3. **Données** : `src/data/<thème>.ts` (types + lecture des JSON).
4. **Anecdotes** : `src/lib/faits-<thème>.ts` (« Le saviez-vous ? » calculés, jamais écrits à la main).
5. **Page** : `src/pages/<slug>.astro` ; chiffres clés avec `info={methode('…')}` (bulle ⓘ) et `<SourcesMethode page="<slug>" />`.
6. **Registre et documentation** : une ligne dans `src/data/themes.ts` (menu), un chiffre clé sur l'accueil, les sources
   dans `src/data/credits.ts`, les méthodes dans `src/data/methodes.ts`, une section dans `docs/sources.md`.
7. `npm run build && npm test` : les tests signalent un lien cassé, un chiffre sans bulle ou un thème oublié.

> L'ancienne page `/transparence` a été fusionnée dans `/budget` ; `public/_redirects` la redirige (301).

## 🌐 Publication

Chaque push sur `main` (et chaque lundi) lance `.github/workflows/deploy.yml` : données → construction → tests →
publication sur **Cloudflare Pages** (projet `luynes`) → enregistrement des archives si elles ont changé.

## 🔭 Veille mensuelle

Le 1ᵉʳ de chaque mois (6 h UTC), `.github/workflows/veille.yml` lance `scripts/veille.ts` : **aucun coût d'IA**, uniquement des API publiques sans clé.

- **Où elle cherche** : data.gouv.fr (jeux citant « Luynes » ; zone `fr:commune:37139` ; Tours Métropole, Indre-et-Loire avec granularité communale ; nouvelles API « dataservices »), les catalogues Opendatasoft de `data.tours-metropole.fr`, `data.centrevaldeloire.fr` et `data.education.gouv.fr`, le catalogue **INSEE Melodi** (`api.insee.fr/melodi/catalog/all`) et **ADEME data-fair** (`data.ademe.fr`). `culture.data.gouv.fr` n'a plus d'API propre : ses jeux sont sur data.gouv.fr, déjà couvert.
- **Filtres du bruit** : jeux archivés ou sans ressource écartés ; jeux nationaux sans granularité communale ignorés (la recherche exige la zone ou la granularité communale) ; Tours Métropole : seulement les jeux avec une colonne commune/INSEE (hors Ville de Tours seule) ou citant Luynes ; Région : seulement ceux citant l'Indre-et-Loire ; Éducation nationale : seulement les jeux citant Luynes / 37139 ou ayant une colonne « code INSEE de la commune » stricte (`MOTS_CODE_COMMUNE`) ; Melodi : seulement les jeux ayant la commune (`COM`) parmi leurs résolutions géographiques ; ADEME : seulement les colonnes typées « code commune » (concept INSEE `geo#codeCommune`) ou citant Luynes, jeux finalisés ; doublons fusionnés.
- **Ce qui est « connu »** (donc jamais remonté) : `data/veille/connus.json`, tout identifiant cité dans `data/sources*.ts` ou `docs/catalogue-donnees*.md`, et ce qu'une issue « veille » précédente a déjà signalé.
- **Résultat** : s'il y a du neuf, une issue « Veille données — <mois année> » (étiquette `veille`) liste chaque jeu (titre, producteur, lien, date, raison, statut « à examiner ») ; GitHub envoie l'e-mail. Relancée dans le mois, elle ajoute seulement un commentaire avec les compléments. Rien de nouveau : seul le journal du run en témoigne. Une source en panne n'empêche pas les autres (3 essais, 30 s de délai) ; elle est citée dans l'issue.
- **Ajouter un jeu « connu »** : citer son identifiant data.gouv / Opendatasoft dans `data/sources*.ts` ou le catalogue, **ou** ajouter une ligne `"gouv:<id>": "titre"` (ou `"ods:tours:<dataset_id>"`, `"melodi:<id>"`, `"ademe:<id>"`) dans `data/veille/connus.json`, **ou** tout marquer connu d'un coup : `npx tsx scripts/veille.ts --init`.
- **À la main** : `npx tsx scripts/veille.ts --dry-run` (affiche l'issue sans rien publier) ; sur GitHub, onglet Actions → « Veille mensuelle » → Run workflow.
- **Analyse** : l'examen des nouveautés par Claude se fait **seulement à la demande de Charly** (pour économiser les crédits).

---

## 📮 Formulaire de signalement (anonyme)

Le site n'affiche aucun lien vers GitHub ni le nom de l'auteur (un test de `npm test` le vérifie dans `dist/`). Le lien « Signaler une erreur ou proposer une idée » ouvre la page **/signaler** (page d'origine pré-remplie par `?page=`). Le formulaire envoie un JSON à la **Pages Function** `functions/api/signalement.ts` (déployée avec le site, car `functions/` est à la racine du projet, là où `wrangler pages deploy dist` est lancé), qui valide les champs puis crée une **issue** (étiquette `signalement`) dans le dépôt, via l'API REST de GitHub.

- **Aucune adresse e-mail n'est demandée** (le dépôt est public : on ne peut donc pas répondre, et la page le dit). Seuls la page et le message sont transmis.
- **Anti-spam, sans service tiers** : champ piège caché (`piege`), délai minimal de 3 s entre l'affichage et l'envoi, message de 10 à 2 000 caractères, corps limité à 10 Ko, `@` neutralisés dans l'issue. Un robot reçoit une réponse « ok » sans qu'aucune issue soit créée.
- **Si le jeton manque** : la Function répond 503 et le formulaire affiche « momentanément indisponible ».
- Code : `src/lib/signalement.ts` (règles partagées), `src/lib/signalement-serveur.ts` (traitement, testé avec un `fetch` simulé dans `tests/signalement.test.ts`), `src/lib/formulaire-signalement.ts` (navigateur).

**À faire une fois (par le propriétaire du dépôt) :**

1. Sur GitHub : *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token*. Accès aux dépôts : **« Only select repositories » → ce dépôt seulement** ; permission **Issues : Read and write** (rien d'autre) ; une date d'expiration (la renouveler ensuite). Copier le jeton.
2. Le déclarer comme secret du projet Cloudflare Pages (invites interactives, la valeur n'est jamais écrite dans un fichier) :
   ```bash
   npx wrangler pages secret put GITHUB_ISSUES_TOKEN --project-name=luynes   # coller le jeton
   npx wrangler pages secret put GITHUB_REPO --project-name=luynes           # « propriétaire/nom-du-dépôt »
   ```
3. Les secrets s'appliquent au déploiement suivant (relancer le workflow « Construire et publier »). Tant qu'ils manquent, le formulaire affiche le message de repli.

---

*Projet personnel de [Charly Medina](https://charlymedina.fr). Données sous Licence Ouverte 2.0 (sauf mention).*
