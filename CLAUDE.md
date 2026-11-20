# Projet data-luynes — « Luynes en chiffres », site de données ouvertes sur Luynes (37)

Site web présentant des données publiques sur la commune de **Luynes (Indre-et-Loire, code INSEE 37139)**.
En ligne : https://luynes.pages.dev (11 thèmes + accueil). Fonctionnement détaillé : `README.md`.

## Rôles
- Charly : idées, choix éditoriaux, maîtrise du **SQL** → il doit pouvoir lire/modifier les requêtes de données.
- Claude : tout le reste du code (front, scripts, déploiement), en expliquant simplement les choix.

## Stack (figée)
- Données : sources dans `data/sources*.ts` → `data/raw/` → requêtes **DuckDB** `data/sql/*.sql` → `src/data/generated/*.json`.
- Site : **Astro 7 + Tailwind 4**, TypeScript strict, pages construites en `.html` (`build.format: 'file'`, liens sans « / » final).
- Publication : **GitHub Actions** (push sur `main` + chaque lundi) → tests → **Cloudflare Pages** (projet `luynes`, mode Pages classique).
- Cartes : MapLibre GL chargé à la demande, fonds OpenFreeMap.
- Les règles ECC `typescript` et `web` sont chargées depuis `.claude/rules/`.

## Conventions
- Un fichier `<nom>.sql` = un fichier `<nom>.json` ; `_*.sql` = vues partagées ; `data/sql/baac/` et `data/sql/elections/` = fabrication des archives.
- SQL commenté en français, lisible par Charly. Toujours filtrer par **code INSEE 37139** (le code postal 37230 est partagé avec Fondettes).
- **Aucun chiffre ni année écrits à la main** dans les textes : tout vient des données (anecdotes dans `src/lib/faits*.ts`).
- Chaque chiffre clé a sa bulle ⓘ « Source · Calcul · Année » (`info={methode('…')}`, `src/data/methodes.ts`) et chaque page sa section `<SourcesMethode>`.
- Rangs toujours avec leur ensemble : « 19ᵉ sur 272 communes d'Indre-et-Loire » (`formatRankOf`, `formatCommunes`).
- Sources citées : `src/data/credits.ts` (pied de page) et `docs/sources.md` (producteur, licence, fréquence).
- Ajouter un thème : liste de contrôle « Ajouter un thème » du README ; `npm run build && npm test` avant de publier.

## Règles éditoriales de Charly
- Uniquement des données **propres à Luynes** (pas de station/capteur situé ailleurs : la météo de Tours a été retirée).
- Ton **neutre** (ni « tu » ni « vous »), factuel ; pages Élections et Délinquance strictement neutres (couleurs non partisanes).
- **Pas d'anecdote anxiogène** (ex. gravité des accidents) ; présenter les comparaisons de façon équilibrée (ce qui est au-dessus ET en dessous).
- Style « plus graphique, moins de chiffres » : icônes, pictogrammes, jauges, un chiffre fort par bloc, tableaux en repliable.
- Thème du navigateur par défaut + bouton clair/sombre ; responsive obligatoire (320 → 1440 px).
- Vérifier toute valeur surprenante (ex. 0 accident une année) avant de la publier.

## Publication
- Tant que le site n'a pas de public : on publie **directement sur `main`**.
- Le `git push` (= mise en ligne) reste **validé par Charly** à chaque fois.

## Sources de données
- MCP **datagouv** en priorité (data.gouv.fr) ; aussi INSEE (Melodi), API Géo, Géorisques, etc. Inventaire : `docs/catalogue-donnees.md`.
- Toujours noter la source, la date de mise à jour et la licence de chaque jeu de données (dans `docs/sources.md`).
