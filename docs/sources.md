# Sources de données

| Source | Contenu utilisé | Producteur | Licence | Mise à jour | Fichier |
|---|---|---|---|---|---|
| [API Géo — commune 37139](https://geo.api.gouv.fr/communes/37139) | Nom, codes, population, surface, centre, département, région | Etalab / DINUM (population : INSEE, populations légales ; géométries : IGN) | [Licence Ouverte 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/) | Population : chaque année (millésime INSEE en vigueur au 1er janvier) | `data/raw/commune.json` |
| [API Géo — communes du 37](https://geo.api.gouv.fr/departements/37/communes) | Population, surface et centre des 272 communes d'Indre-et-Loire | idem | Licence Ouverte 2.0 | idem | `data/raw/communes_37.json` |

Les données sont téléchargées à nouveau à chaque construction du site (au moins une fois par semaine).
La liste technique des sources est dans `data/sources.ts`.
