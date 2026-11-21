-- Le maire (information publique du répertoire national des élus) : prénom, nom, début du mandat.
-- Résultat : src/data/generated/budget_maire.json (une ligne)
SELECT
  "Prénom de l'élu"                    AS prenom,
  "Nom de l'élu"                       AS nom,
  "Date de début du mandat"            AS debut_mandat
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/rne_maire.json'))
LIMIT 1;
