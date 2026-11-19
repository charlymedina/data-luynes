# 📊 data-luynes

Site de **données ouvertes sur Luynes** (Indre-et-Loire, code INSEE `37139`) : rassembler, nettoyer et présenter simplement les données publiques de la commune (population, logement, environnement, équipements, etc.).

> 🚧 **v0 en ligne** : stack DuckDB (SQL) + Astro + GitHub Actions + Cloudflare Pages.

---

## 🎯 Objectifs

- Rendre les données publiques sur Luynes **lisibles par tous les habitants** (graphiques, cartes, chiffres clés).
- **Citer systématiquement les sources** : origine, date de mise à jour et licence de chaque jeu de données.
- Garder des transformations de données **en SQL lisible**, faciles à relire et à faire évoluer.

## 🗂️ Sources de données envisagées

| Source | Exemples de données |
|---|---|
| [data.gouv.fr](https://www.data.gouv.fr) | Jeux de données nationaux filtrés sur la commune |
| [INSEE](https://www.insee.fr) | Population, logement, emploi |
| [API Géo](https://geo.api.gouv.fr) | Contours et informations administratives |
| [DVF](https://explore.data.gouv.fr/fr/immobilier) | Transactions immobilières |

Le détail de chaque source sera documenté dans `docs/sources.md`.

## 🛠️ Principes techniques

- **Site statique**, simple et économique à héberger.
- **Données transformées en SQL** (par exemple avec DuckDB) avant d'être affichées.
- Code du site en **TypeScript**.

## 📁 Structure

```
data-luynes/
├── data/
│   ├── sources.ts       # Liste des sources téléchargées (→ data/raw/)
│   └── sql/*.sql        # Requêtes DuckDB : un fichier .sql = un fichier JSON pour le site
├── scripts/build-data.ts  # Télécharge les sources et exécute les requêtes SQL
├── src/                 # Site Astro (pages, composants, styles)
├── docs/sources.md      # Origine, licence et mise à jour de chaque source
└── .github/workflows/   # Construction + publication sur Cloudflare Pages (push + chaque lundi)
```

## 🚀 Commandes

```bash
npm install
npm run data   # télécharge les données et exécute les requêtes SQL
npm run dev    # site en local (relance aussi les données)
npm run build  # version finale dans dist/
```

Site en ligne : **https://luynes.pages.dev**

---

*Projet personnel de [Charly Medina](https://charlymedina.fr).*
