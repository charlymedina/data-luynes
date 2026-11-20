# Revue technique — data-luynes (« Luynes en chiffres »)

*Revue en lecture seule, 20/11/2026. Aucun fichier du projet modifié. Vérifications faites : `git status`/`log`, historique GitHub Actions (via l'API publique GitHub, `gh run` ayant été bloqué par une demande d'autorisation restée sans réponse), `npm run build` (OK, 12 pages, 53 requêtes SQL), `npx astro check` (0 erreur, 0 avertissement), analyse de `dist/`, en-têtes du site en ligne (curl).*

---

## 1. Résumé

- **État global : bon.** Le site se construit sans erreur, les 10 derniers déploiements GitHub Actions ont tous réussi (≈ 1 min 30 à 2 min chacun) et le dépôt est propre (rien en attente). Le SQL est lisible et bien commenté, le code TypeScript est typé strictement (aucun `any`, aucun `console.log` dans le site, aucun fichier de plus de 311 lignes). Rien de dangereux côté sécurité.
- **Les faiblesses** viennent de la vitesse d'écriture : restes de code inutile, documentation en retard, petites incohérences entre pages, et surtout **aucun garde-fou automatique** contre les données qui « vieillissent » ou changent de forme sans faire planter le build.
- **Note : 7/10.**
- **3 urgences :**
  1. **L'accueil affiche un titre « Bientôt sur le site » suivi d'une liste vide** (visible en ligne aujourd'hui). Correction : 5 minutes.
  2. **`.gitignore` n'est pas dans le dépôt** (il est exclu via `.git/info/exclude`). Sur un autre ordinateur, ou après un nouveau clone, les 42 Mo de `data/raw/` et les fichiers générés apparaîtront comme « à enregistrer » et risquent d'être versionnés par erreur.
  3. **Une seule source en panne (sur ~60) bloque toute mise à jour**, et plusieurs millésimes sont **figés dans le code** (recensement 2023 pour le chômage, jeu Tours Métropole « 1876-2023 », loyers 2025). D'ici 6 à 12 mois, certaines pages mélangeront des années sans que rien ne le signale. Il faut des **tests de cohérence des JSON** (proposition au §2, I-10).

---

## 2. Constats

Légende de l'effort : **S** = moins d'une heure, **M** = une demi-journée, **L** = un jour ou plus.

### Critique

Aucun constat critique : pas de faille de sécurité, pas de perte de données, et le site en ligne fonctionne.

### Important

**I-1. Bloc « Bientôt sur le site » vide sur l'accueil** — S
- *Où :* `src/pages/index.astro:5,12,234`, `src/components/ComingSoon.astro:13-33`, `src/data/themes.ts:8,17,35`.
- *Quoi :* les 11 thèmes sont « disponible ». La liste `themesBientot` est donc vide, mais le composant affiche quand même son titre et sa phrase d'introduction. Le problème est visible dans `dist/index.html` et sur https://luynes.pages.dev.
- *Correction :* soit `{themesBientot.length > 0 && <ComingSoon … />}`, soit supprimer `ComingSoon.astro`, `themesBientot` et le champ `statut` (rien n'est prévu « bientôt »).

**I-2. `.gitignore` non versionné** — S
- *Où :* `.git/info/exclude:12-14` exclut `CLAUDE.md`, `.gitignore` et `.claude/`.
- *Quoi :* exclure `.claude/` (réglages locaux de Claude) et `CLAUDE.md` peut se défendre, puisque le dépôt est **public**. En revanche, exclure `.gitignore` est sans doute une erreur. Ce fichier ne contient rien de privé et c'est lui qui protège le dépôt contre `data/raw/` (42 Mo), `src/data/generated/`, `.playwright-mcp/` (28 Mo de captures) et `dist/`.
- *Pourquoi c'est un problème :* sur un nouveau clone (autre poste, conteneur recréé), un `git add .` enregistrerait tout cela.
- *Correction :* retirer la ligne `.gitignore` de `.git/info/exclude` et versionner `.gitignore`. Garder `.claude/` exclu. Pour `CLAUDE.md`, c'est un choix : son contenu est anodin, et le versionner le sauvegarde.

**I-3. L'archivage automatique n'a jamais été testé en conditions réelles, et il peut tourner en boucle** — M
- *Où :* `.github/workflows/deploy.yml:24,45-59`, `scripts/archive-baac.ts:29,54-76,129-134`.
- *Quoi :*
  - Les archives ont toutes été enregistrées depuis le poste local. L'étape « commit + push par le robot » n'a donc jamais réellement poussé quoi que ce soit (aucun commit `github-actions[bot]` dans l'historique). La première exécution planifiée (lundi) n'a pas encore eu lieu.
  - L'étape porte un nom et un message de commit « DVF » (lignes 48 et 57) alors qu'elle enregistre aussi les accidents (BAAC) et les élections.
  - **Piège :** si data.gouv change les adresses de *toutes* les années BAAC (migration de serveur, ce qui arrive), le script retélécharge 21 années × 4 fichiers d'environ 25 Mo. Le job est limité à 15 minutes. Si le temps est dépassé, le build échoue, l'archive à moitié refaite n'est **pas** enregistrée (le commit n'a lieu qu'après un déploiement réussi), et la semaine suivante tout recommence. Le site ne se met alors plus jamais à jour.
  - Les 3 nouvelles tentatives de `telecharger()` s'enchaînent sans pause (lignes 55-75).
- *Correction :*
  - Renommer l'étape et le message de commit (« archives de données mises à jour »).
  - Limiter le nombre d'années BAAC retéléchargées par build (par exemple 3) : l'archive se complète sur plusieurs semaines.
  - Ajouter une pause entre les essais.
  - Ou bien enregistrer l'archive même si le déploiement échoue (`if: always()` sur l'étape, avec prudence).
  - Lancer une fois le workflow à la main (`workflow_dispatch`) après avoir modifié une archive pour vérifier le push.

**I-4. Une source en panne = aucune mise à jour du site, sans alerte claire** — M
- *Où :* `scripts/build-data.ts:124-139` (3 essais à 2 s puis 4 s d'intervalle, puis arrêt), `deploy.yml:3`.
- *Quoi :* le choix « le site en ligne reste inchangé » est sûr. Mais avec environ 60 sources chez une quinzaine de producteurs, une panne un lundi matin est probable : la mise à jour hebdomadaire saute, et seul un e-mail générique de GitHub prévient. Le catalogue (`docs/catalogue-donnees.md:280`) recommandait au contraire de « conserver la dernière version téléchargée (le build ne doit pas casser) ».
- *Correction (au choix) :*
  - (a) mettre `data/raw/` en cache dans GitHub Actions (`actions/cache`) et, si une source échoue après 3 essais, réutiliser la version en cache en l'écrivant dans le journal (et dans `meta.json`, pour l'afficher « données de X au JJ/MM ») ;
  - (b) a minima, espacer davantage les essais (30 s, 2 min).

**I-5. Échec silencieux possible sur DVF** — S
- *Où :* `data/sources.ts:111-120` (`dvfDepartement37`).
- *Quoi :* les années disponibles sont détectées par une requête HEAD par année, **sans nouvel essai**. Si le serveur répond une erreur passagère pour 2024, cette année est simplement **absente** : pas d'erreur, et le site publie des prix et une carte sans 2024. Seules les années déjà archivées (2021-2022) sont protégées.
- *Correction :* refaire la requête 2 ou 3 fois avant de conclure qu'une année n'existe pas. Vérifier aussi que les années trouvées sont **consécutives** jusqu'à l'année N-1 ; sinon, arrêter le build.

**I-6. Millésimes figés dans le code : points de rupture dans 6 à 12 mois** — M
- `data/sources-revenus.ts:38` : `TIME_PERIOD=2023` pour le classement du chômage. Quand l'INSEE publiera le recensement 2024 (mi-2027), Luynes sera en 2024 et le classement restera en 2023, **sans erreur**.
- `data/sources.ts:158` et `src/data/credits.ts:18-19` : jeu Tours Métropole `population-1876-2023-…`. Le prochain millésime aura probablement un autre identifiant : soit la page reste en 2023, soit l'adresse disparaît et le build casse.
- `data/sources.ts:125-133` et `credits.ts:46-48` : identifiants des loyers **2025**. Le jeu 2026 sort en décembre et devra être changé à la main (c'est noté dans `docs/sources.md:58`, mais rien ne le rappelle automatiquement).
- `credits.ts:66` : lien BAAC dont l'adresse contient « 2005-a-2024 » (fragile). `credits.ts:96` pointe vers une adresse d'API brute, pas vers une page lisible.
- `data/sources-elections.ts:12-15` : municipales 2026 (sans souci jusqu'en 2032).
- *Correction :* comme pour SSMSI et BAAC, retrouver l'adresse via l'API data.gouv ou le catalogue (recherche du jeu « le plus récent »). Pour `TIME_PERIOD`, le lire dans le fichier `activite` déjà téléchargé (même principe que `derniereAnneeOre()` dans `sources-energie.ts:21`). Ajouter un test « l'année la plus récente de chaque série ≥ année en cours − N » (voir I-10).

**I-7. Le prix médian de l'immobilier sera calculé sur une période qui s'allonge sans fin** — S
- *Où :* `data/sql/immobilier_resume.sql:22,51-52` (et la vue `_dvf.sql`).
- *Quoi :* l'archive DVF ajoute les années que la source ne publie plus. C'est très bien pour la carte. Mais le prix médian, le prix au m² et le classement (« ≥ 30 ventes sur la période ») portent sur **toutes** les années : 5 ans aujourd'hui, 6 en 2027, 10 en 2031. Les prix affichés deviendront des moyennes de plus en plus anciennes.
- *Correction (SQL, facile à relire) :* filtrer les statistiques de prix sur les 5 dernières années (`WHERE year(date_vente) > (SELECT max(year(date_vente)) FROM …) - 5`), garder toutes les années pour la carte et le nombre de ventes, et l'écrire sur la page.

**I-8. Une modification du SQL d'extraction ne refait pas l'archive** — S
- *Où :* `scripts/archive-baac.ts:104-108`, `scripts/archive-elections.ts:78`.
- *Quoi :* l'archive n'est refaite que si la *source* change. Si Charly corrige `data/sql/baac/caract.sql` ou `data/sql/elections/*.sql`, l'ancienne archive reste utilisée et la correction n'a **aucun effet**, sans message.
- *Correction :* ajouter dans `manifest.json` une empreinte du texte des fichiers SQL d'extraction, et refaire l'archive si elle change.
- *Bonus :* pour les élections, l'« etag » du serveur peut changer à chaque republication, même identique. Il vaudrait mieux comparer le contenu extrait (comme DVF) pour ne pas créer un commit d'environ 70 Ko chaque semaine pour rien.

**I-9. Liens internes sans « / » final : redirection à chaque clic, et pas de page 404** — S
- *Où :* `src/components/SiteHeader.astro:37,95`, liens de l'accueil, `astro.config.mjs`.
- *Quoi :*
  - Les liens pointent vers `/population`, mais le site sert `/population/` : Cloudflare répond **308** puis recharge, ce qui fait un aller-retour de plus à chaque navigation (vérifié avec curl). L'adresse « canonique » déclarée est `/population/` (`Base.astro:14`) : les deux ne concordent pas.
  - Il n'y a pas de `src/pages/404.astro`. Une adresse inexistante (`/page-qui-nexiste-pas`) renvoie l'accueil avec un code **200** au lieu d'une vraie page d'erreur.
- *Correction :* `build: { format: 'file' }` dans `astro.config.mjs`, ou ajouter le « / » final à tous les liens (un seul helper `href(slug)`). Créer une page 404 simple qui renvoie vers l'accueil et les thèmes.

**I-10. Aucun test : les erreurs de données passent sans bruit** — M
- *Où :* `package.json` (pas de script `test`), `src/data/*.ts` (ex. `accidents.ts:85-89` : `rows as AnneeAccidents[]`).
- *Quoi :* les JSON générés par le SQL sont « déclarés » au bon format mais jamais **vérifiés**. Une colonne renommée dans un `.sql` ou une valeur devenue vide donne au mieux un chiffre faux (0, « undefined »), au pire rien de visible. Aujourd'hui aucune page ne contient « NaN » ou « undefined » (vérifié), mais rien ne le garantit pour demain.
- *Correction minimale et utile (sans nouvelle dépendance, avec `node:test` et `tsx`, déjà installés) :*
  1. **`npm run test:data`** sur `src/data/generated/*.json` :
     - chaque fichier contient au moins une ligne ;
     - les champs attendus existent et ne sont pas vides ;
     - `nb_communes` est entre 260 et 280 ;
     - chaque rang est compris entre 1 et le total ;
     - chaque pourcentage est entre 0 et 100 ;
     - **fraîcheur** : la dernière année de chaque série est au moins égale à l'année en cours moins N (N par source : 2 pour l'état civil, 3 pour le recensement…).

     Ce dernier test aurait signalé I-6.
  2. **Vérifications en SQL**, lisibles par Charly : dans un fichier `_controles.sql`, des lignes comme `SELECT error('DVF : année manquante') WHERE (SELECT count(DISTINCT year(date_vente)) FROM dvf_ventes) < 5;`.
  3. **`npm run test:site`** après `astro build` :
     - tous les `href` internes de `dist/` existent ;
     - aucun « NaN », « undefined » ou « null » dans les pages ;
     - chaque thème de `themes.ts` a une page et une carte sur l'accueil ;
     - chaque page a au moins une source en pied de page.
  4. Lancer ces scripts dans `deploy.yml` **avant** `wrangler pages deploy`.

  Plus tard : un test Playwright de base (chaque page s'ouvre, la carte se charge) sur le navigateur browserless déjà disponible.

**I-11. Crédits incomplets sur l'accueil** — S
- *Où :* `src/data/credits.ts:130`.
- *Quoi :* les anecdotes de l'accueil citent les loyers et les DPE (`src/lib/faits.ts:89-94`), mais `CREDITS_ACCUEIL` ne contient ni `CARTE_LOYERS` ni `ADEME_DPE`. La Licence Ouverte impose de citer la source.
- *Correction :* construire `CREDITS_ACCUEIL` comme l'**union automatique** des crédits de tous les thèmes (sans doublon), au lieu d'une liste tenue à la main.

**I-12. « Données mises à jour le… » est en fait la date de construction** — S
- *Où :* `src/components/SiteFooter.astro:16,31`, `scripts/build-data.ts:186-189`.
- *Quoi :* chaque lundi, la date change même si aucune source n'a bougé. Le visiteur croit que tout vient d'être actualisé, alors que certaines séries datent de 2023.
- *Correction :* écrire « Site reconstruit le… ». Mieux : indiquer pour chaque thème le millésime réel (« recensement 2023 », « DVF jusqu'à juin 2026 »).

### Mineur

| # | Où | Quoi / pourquoi | Correction | Effort |
|---|---|---|---|---|
| m-1 | `src/components/SiteHeader.astro:13-14,30-48` | Avec 11 thèmes (> 7), la barre de liens « en ligne » ne s'affiche jamais : code mort. | Le supprimer, ou le garder volontairement avec un commentaire. | S |
| m-2 | `src/lib/icons.ts` (ex. l.31 `meteo`) | Icônes probablement inutilisées, restes du thème Climat : `meteo`, `thermometre`, `goutte`, `flocon`, et sans doute `horloge`, `route`. | À confirmer avec `npx knip`, puis supprimer. | S |
| m-3 | `data/raw/meteo_37/`, `data/raw/grandes_tranches_37.json` (local) | Fichiers périmés sur le poste (Climat, ancienne source). Sans effet en CI, mais trompeur si une requête les relit par erreur en local. | Vider `data/raw/` de temps en temps (ou que `build-data` supprime les fichiers qui ne sont plus listés). | S |
| m-4 | `src/lib/faits.ts:42,67`, `src/pages/territoire.astro:64` | Rangs sans leur total (« 3ᵉ commune la plus touchée du département »), alors que partout ailleurs `formatRankOf` écrit « sur 272 communes d'Indre-et-Loire ». | Utiliser `formatRankOf` partout. | S |
| m-5 | `src/pages/delinquance.astro:74,77` et `index.astro:224` | En cas d'égalité stricte avec le département, le texte dit « au-dessus de la moyenne ». | Ajouter le cas « égal ». | S |
| m-6 | `src/lib/map.ts:2-4`, `src/lib/map-base.ts:4`, `src/pages/donnees/ventes-immobilieres.json.ts:3` | Commentaires périmés : `map.ts` sert aussi aux Accidents ; MapLibre pèse ≈ 1 Mo (≈ 280 Ko compressé) et non 250 Ko ; « page légère » alors que la page Immobilier contient aussi le tableau des 400 ventes (267 Ko de HTML). | Mettre à jour les commentaires. | S |
| m-7 | `src/lib/map-base.ts:24` et `src/lib/theme.ts:12` | Même fonction « thème actuel » écrite deux fois. | Une seule fonction exportée par `theme.ts`. | S |
| m-8 | `data/sources-revenus.ts:13-16`, `data/sources-equipements.ts:16-19`, `data/sources.ts:50-54,77-87` | Lecture de `communes_37.json` écrite 4 fois ; constante `MELODI` déclarée 3 fois ; `lireManifest()` copiée dans les 3 scripts d'archive. | Un petit module `data/sources/commun.ts` (helpers Melodi, liste des communes du 37) et `scripts/manifest.ts`. | S |
| m-9 | 11 pages, ex. `src/pages/territoire.astro:40-46` | En-tête de thème (icône, « Thème · X », h1, texte d'intro) copié dans chaque page, avec des tailles de titre légèrement différentes (`text-[2.4rem]`, `[2.6rem]`, `5xl`). Les constantes `titreH2` et `carte` sont redéclarées dans 11 pages. | Composant `ThemeHero.astro` qui lit titre et icône dans `themes.ts`, plus `SectionTitle.astro`. | M |
| m-10 | `data/sql/energie_resume.sql:105-115` et `data/sql/mobilite_bornes.sql` | Même calcul « bornes situées dans le contour » écrit deux fois. | Une vue partagée dans `_energie.sql`. | S |
| m-11 | `data/sql/_spatial.sql:3-4` | `INSTALL spatial` télécharge l'extension depuis extensions.duckdb.org à chaque build CI : une dépendance réseau de plus. L'ordre alphabétique des fichiers `_*.sql` décide aussi de l'ordre d'exécution : `_spatial` passe en dernier, alors qu'une future vue partagée pourrait en avoir besoin. | Mettre en cache `~/.duckdb/extensions` dans le workflow ; charger `spatial` dans `build-data.ts` avant les fichiers partagés, ou renommer en `_0_spatial.sql`. | S |
| m-12 | `data/sources.ts:41-43`, `sources-revenus.ts`, `sources-equipements.ts` | `maxResult=10000` (Melodi), `size=10000` (ORE) : au-delà, la réponse est **tronquée sans erreur**. Exemple : `ages_communes_37` ≈ 2 500 lignes ; c'est OK aujourd'hui, mais ça peut grossir avec les nouveaux recensements. | Vérifier dans `build-data.ts` que le nombre de lignes reçues est inférieur à la limite, sinon arrêter le build. | S |
| m-13 | `src/styles/global.css:13` | Couleur `--muted` (#6f7f82) sur fond clair : contraste ≈ 3,7:1, sous le minimum de 4,5:1 pour le petit texte (légendes de cartes en `text-xs`). Le mode sombre est correct. | Foncer vers environ #5d6c6f. | S |
| m-14 | `src/lib/theme.ts:28-29` | Bouton clair/sombre : `aria-pressed` *et* libellé qui change. Les lecteurs d'écran annoncent alors un état contradictoire. | Garder l'un ou l'autre (libellé qui change, sans `aria-pressed`). | S |
| m-15 | `src/layouts/Base.astro:44-45` | Pas de lien « Aller au contenu » pour les utilisateurs du clavier. | Ajouter un lien caché qui apparaît au focus, vers `<main id="contenu">`. | S |
| m-16 | `public/_headers:7` | CSP avec `script-src 'unsafe-inline'`, nécessaire uniquement pour le petit script du thème (`Base.astro:23-29`). | Remplacer par l'empreinte `'sha256-…'` de ce script. Le reste de la CSP correspond bien à ce qui est chargé (OpenFreeMap seulement). Les JSON dans les pages sont bien échappés (`<` → `<`) et les infobulles utilisent `textContent` / `setText` : pas de risque XSS. | S |
| m-17 | Racine du site | Ni `sitemap.xml` ni `robots.txt`. | `@astrojs/sitemap` ou un petit endpoint statique. | S |
| m-18 | `src/pages/delinquance.astro:19-30` | Icônes associées au **libellé exact** des indicateurs SSMSI : si le libellé change, l'icône par défaut s'affiche sans rien signaler. | Associer les icônes au code de l'indicateur, ou tester que chaque libellé est connu (I-10). | S |
| m-19 | Nommage | `src/lib/faits.ts` regroupe 4 thèmes, alors que les autres sont dans `faits-<thème>.ts`. Préfixes SQL hétérogènes (`ecoles_` pour Équipements, `mobilite_` pour Énergie, `risques_` / `patrimoine_`, `rang_departement` / `commune` pour Territoire). | Voir §4. | M |
| m-20 | `package.json` | Pas de formateur ni de linter (Prettier / ESLint) ; pas de script `test`. | Ajouter Prettier (déjà implicite dans le style), puis `test` (I-10). | S |

**Points vérifiés et satisfaisants :**
- Tous les liens internes de `dist/` mènent à une page existante.
- Les 11 thèmes sont présents dans le menu **et** sur l'accueil.
- Chaque page a un « Le saviez-vous ? » et ses sources en pied de page.
- Le JavaScript est léger (≈ 5 Ko communs ; MapLibre chargé seulement sur 3 pages et seulement quand la carte approche de l'écran).
- CSS commun ≈ 48 Ko (≈ 9 Ko compressé). Polices auto-hébergées, une seule écriture chargée grâce aux sous-ensembles.
- Les cartes ont une alternative accessible (tableau ou liste), les graphiques des `aria-label`, les animations respectent « réduire les animations ».
- Aucun secret dans le dépôt.

**État git / GitHub :**
- Branche `main` propre.
- 12 runs au total, les 10 derniers réussis.
- Dépôt : 5,8 Mo d'historique. Archives : DVF 1,8 Mo, BAAC 0,56 Mo, élections 72 Ko.
- Croissance attendue : environ 0,8 Mo par an (DVF), plus environ 70 Ko à chaque nouvelle élection. Raisonnable.
- Volume téléchargé par build CI : environ 35 Mo (zones inondables 4 Mo, délinquance 18 Mo, DVF 5,5 Mo, et le reste).

---

## 3. Mises à jour de documentation

**README.md**
- Ligne 5 : « 🚧 v0 en ligne » → décrire l'état réel (11 thèmes + accueil, mise à jour chaque lundi).
- Lignes 15-24 : « Sources envisagées » (4 lignes) → renvoyer vers `docs/sources.md` et ajouter la **liste des 11 thèmes** avec leur adresse.
- Lignes 32-45, structure :
  - `data/sources.ts` + `data/sources-*.ts` ;
  - `data/archive/{dvf,baac,elections}` ;
  - `data/sql/baac/` et `data/sql/elections/` (requêtes d'extraction des archives, **qui ne produisent pas de JSON**) ;
  - `data/reference/` ;
  - `scripts/archive-*.ts` ;
  - `docs/catalogue-donnees.md` ;
  - `src/data/themes.ts`, `credits.ts`, `src/lib/faits-*.ts`, `src/components/charts/`.
- Commandes : ajouter `npm run check`, l'option `npm run data -- --sources=id1,id2`, `npm run preview`, et le fait que **`npm run build` en local peut modifier `data/archive/`** (à committer ou annuler sciemment, sinon conflit avec le commit automatique du robot).
- Ajouter une section **« Ajouter un thème »** (liste de contrôle, voir §4).
- Expliquer le commit automatique des archives par GitHub Actions.

**CLAUDE.md** (non versionné)
- « Principes techniques (à valider avec Charly avant de figer la stack) » → la stack est figée : DuckDB + Astro 7 + Tailwind 4 + GitHub Actions + Cloudflare Pages.
- Ajouter les conventions :
  - un `.sql` = un `.json` ;
  - `_*.sql` = vues partagées ;
  - sous-dossiers = extraction des archives ;
  - toujours un rang « sur N communes d'Indre-et-Loire » (`formatRankOf`) ;
  - crédits dans `credits.ts` ;
  - aucun chiffre écrit à la main dans les textes ;
  - neutralité des pages Élections et Délinquance ;
  - pas de Climat (choix éditorial).

**docs/sources.md**
- Le premier tableau (lignes 3-9) n'a pas de titre de section : ajouter « ## Commune et classements (accueil, Territoire) ».
- Lignes 123 et 126 : « Requêtes : » en double dans la section Écoles.
- Ligne 101 : « Si data.gouv.fr ne répond pas, l'archive existante est utilisée » est vrai pour la liste des fichiers, **pas** si le téléchargement d'une nouvelle année échoue (le build s'arrête alors).
- Ligne 153 : « empreinte dans manifest.json » → en réalité date ou etag du fichier source.
- Lignes 172-174 : « La liste technique des sources est dans `data/sources.ts` » → `data/sources.ts` **et** `data/sources-*.ts`.
- Ajouter pour chaque source la **date du millésime affiché**, et une ligne « à mettre à jour à la main » pour Tours Métropole (identifiant « 1876-2023 ») et `TIME_PERIOD=2023` (chômage).

**docs/catalogue-donnees.md**
- §4 « Ordre de priorité » : marquer ce qui est **réalisé** (thèmes 1 à 6 et 8 à 10 en partie) ; Sitadel, eau potable, qualité de l'air, RPLS, FINESS restent à faire.
- §5 lignes 279-280 : les principes (« résoudre l'URL au build », « conserver la dernière version, le build ne doit pas casser ») ne sont pas appliqués partout. Soit corriger le code (I-4, I-6), soit corriger le texte.

**Commentaires de code périmés**
- `src/data/themes.ts:2-4` : « créer ses sources (data/sources.ts), ses requêtes (data/sql/<theme>_*.sql)… ». Il manque `sources-*.ts`, `credits.ts`, `faits-*.ts`, `src/data/<thème>.ts`, la carte sur l'accueil et `docs/sources.md`. Le statut « bientot » ne sert plus.
- `data/sources.ts:2-4` : « enregistrée dans data/raw/<id>.json » → ou dans le dossier `data/raw/<id>/` pour le format « fichiers ».
- `.github/workflows/deploy.yml:14,45-48,57` : « archive DVF » → archives DVF, BAAC et élections.
- `src/lib/map.ts:2-4`, `map-base.ts:4`, `donnees/ventes-immobilieres.json.ts:3` (voir m-6).
- Commentaires « 272 communes » en dur dans `sources-*.ts` et `rang_departement.sql:1` : sans gravité, mais le nombre change en cas de fusion de communes. Le code, lui, calcule `nb_communes`, ce qui est bien.

---

## 4. Organisation cible (courte)

```
data/
  sources/            index.ts (liste ordonnée) + un fichier par thème
                      (population.ts, patrimoine.ts, immobilier.ts… sortis de sources.ts)
                      + commun.ts (Melodi, communes du 37, recherche d'URL via l'API data.gouv)
  sql/                préfixe = slug du thème, partout :
                      territoire_*, population_*, patrimoine_*, immobilier_*, budget_*,
                      revenus_*, accidents_*, equipements_*, energie_*, elections_*, delinquance_*
                      _*.sql = vues partagées ; _controles.sql = vérifications (error(...))
  sql-archives/       baac/, elections/ (aujourd'hui dans data/sql/, source de confusion)
  archive/  reference/
scripts/              build-data.ts, archive-*.ts, manifest.ts (commun), check-data.ts, check-site.ts
src/
  data/themes.ts      registre unique : slug, titre, icône, résumé, crédits, préfixe SQL
  data/<thème>.ts     types + lecture des JSON (validés par check-data)
  lib/faits/<thème>.ts
  components/theme/   ThemeHero, SectionTitle, Card (fin des copier-coller d'en-têtes)
  components/charts/  (inchangé)
```

**Ajouter un thème** deviendrait une liste de contrôle de 6 étapes :
1. Sources : `data/sources/<thème>.ts`.
2. Requêtes : `data/sql/<thème>_*.sql`.
3. Données : `src/data/<thème>.ts`.
4. Anecdotes : `src/lib/faits/<thème>.ts`.
5. Page : `src/pages/<slug>.astro` avec `ThemeHero`.
6. Registre et documentation : une ligne dans `themes.ts` (menu, crédits et carte d'accueil en découlent) et une section dans `docs/sources.md`.

Les tests (I-10) vérifient que rien n'a été oublié.

**Ordre conseillé :**
1. I-1, I-2, I-11, I-9 (une heure en tout).
2. I-10 (tests), qui sécurise tout le reste.
3. I-5, I-6, I-7, I-8 (fiabilité des données).
4. I-3 et I-4 (CI).
5. Documentation.
6. Réorganisation (m-8, m-9, m-19) au fil de l'eau.
