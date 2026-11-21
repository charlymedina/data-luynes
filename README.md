# 📊 Luynes en chiffres (data-luynes)

Site de **données ouvertes sur Luynes** (Indre-et-Loire, code INSEE `37139`) : rassembler, vérifier et présenter
simplement les données publiques de la commune.

Site en ligne : **https://luynes.pages.dev** — 15 thèmes + une page d'accueil, reconstruits chaque lundi (et à chaque
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
| Patrimoine & risques | `/patrimoine-risques` | Base Mérimée, Géorisques (BRGM, GASPAR, zones inondables) |
| Immobilier | `/immobilier` | DVF (DGFiP), carte des loyers, DPE (ADEME) |
| Budget communal | `/budget` | DGFiP, comptes individuels des communes |
| Revenus & emploi | `/revenus-emploi` | INSEE (Filosofi, recensement, base Tous salariés, SIDE) |
| Accidents de la route | `/accidents` | ONISR (fichiers BAAC) |
| Écoles, santé & services | `/equipements` | INSEE (BPE), Éducation nationale |
| Énergie & mobilité | `/energie-mobilite` | Agence ORE, ODRÉ, SDES, base IRVE |
| Élections | `/elections` | Ministère de l'Intérieur (données agrégées data.gouv.fr) |
| Délinquance | `/delinquance` | SSMSI (ministère de l'Intérieur) |
| Eau du robinet | `/eau` | Hub'eau (contrôle sanitaire des ARS) |
| Construction & logement social | `/construction` | SDES (Sitadel, RPLS) |
| Transparence | `/transparence` | DGFiP (balances comptables), DECP, BOAMP, répertoire national des élus |
| Sport | `/sport` | INJEP (licences par commune), ministère des Sports (recensement des équipements, RES) |

Le détail (producteur, licence, fréquence de mise à jour) est dans [`docs/sources.md`](docs/sources.md) ;
l'inventaire des données disponibles et leur statut dans [`docs/catalogue-donnees.md`](docs/catalogue-donnees.md).

## 🛠️ Comment ça marche

```
Sources publiques ──► data/raw/ ──► requêtes SQL (DuckDB) ──► src/data/generated/*.json ──► pages Astro ──► dist/
 (data/sources*.ts)   (téléchargé)   (data/sql/*.sql)           (un .sql = un .json)        (src/pages/)
```

1. `scripts/build-data.ts` télécharge chaque source listée dans `data/sources.ts` (et `data/sources-<thème>.ts`).
   Si une source ne répond pas après 3 essais, sa version précédente est réutilisée et signalée en pied de page.
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
│   ├── reference/                       # petites tables de référence (libellés des équipements INSEE)
│   └── tests/*.sql                      # tests de cohérence en SQL (zéro ligne = OK)
├── scripts/
│   ├── build-data.ts                    # téléchargement + requêtes SQL
│   ├── archive-{dvf,baac,elections}.ts  # archives (+ manifest.ts, outils communs)
│   └── test-data.ts, test-site.ts       # tests des données et du site construit
├── src/
│   ├── pages/                           # une page par thème + accueil + 404
│   ├── components/ (charts/)            # chiffres clés, bulles ⓘ, cartes, graphiques
│   ├── data/                            # types + lecture des JSON ; themes.ts (registre), credits.ts, methodes.ts
│   └── lib/                             # formats, anecdotes « Le saviez-vous ? » (faits*.ts), cartes, navigation
├── tests/*.test.ts                      # tests unitaires (formats, adresses)
├── docs/                                # sources, catalogue des données, revues
└── .github/workflows/deploy.yml         # construction, tests, publication Cloudflare Pages, archives
```

## 🚀 Commandes

```bash
npm install
npm run data                          # télécharge les données et exécute les requêtes SQL
npm run data -- --sources=id1,id2     # ne retélécharge que ces sources (les autres sont réutilisées)
npm run dev                           # site en local (relance aussi les données)
npm run build                         # version finale dans dist/
npm run preview                       # affiche dist/ en local
npm run check                         # vérification TypeScript
npm test                              # tests : unitaires, données (SQL), site construit
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

## 🌐 Publication

Chaque push sur `main` (et chaque lundi) lance `.github/workflows/deploy.yml` : données → construction → tests →
publication sur **Cloudflare Pages** (projet `luynes`) → enregistrement des archives si elles ont changé.

---

Un lien « Signaler une erreur ou proposer une idée » (pied de page, `src/lib/signalement.ts`) ouvre une issue GitHub pré-remplie ; le modèle est dans `.github/ISSUE_TEMPLATE/signalement.md`.

---

*Projet personnel de [Charly Medina](https://charlymedina.fr). Données sous Licence Ouverte 2.0 (sauf mention).*
