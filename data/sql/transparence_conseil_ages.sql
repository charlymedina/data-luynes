-- Âge des élus par tranche, comparé aux habitants de 18 ans et plus (dernier recensement), en % de chaque ensemble.
-- Trois tranches seulement : jamais de date de naissance ni d'âge individuel.
-- Résultat : src/data/generated/transparence_conseil_ages.json (une ligne par tranche)
WITH tranches(ordre, libelle, age_min, age_max) AS (
  VALUES (1, '18 à 39 ans', 18, 39), (2, '40 à 59 ans', 40, 59), (3, '60 ans et plus', 60, 200)
),

habitants AS (
  SELECT age, sum(habitants) AS habitants
  FROM age_sexe
  WHERE territoire = 'Luynes' AND annee = (SELECT max(annee) FROM age_sexe WHERE territoire = 'Luynes') AND age >= 18
  GROUP BY age
)

SELECT
  t.ordre,
  t.libelle,
  (SELECT count(*) FROM conseil c WHERE c.age BETWEEN t.age_min AND t.age_max)::INTEGER AS elus,
  round(100.0 * (SELECT count(*) FROM conseil c WHERE c.age BETWEEN t.age_min AND t.age_max)
        / (SELECT count(*) FROM conseil), 1)::DOUBLE                                    AS part_elus,
  round(100 * (SELECT sum(habitants) FROM habitants h WHERE h.age BETWEEN t.age_min AND t.age_max)
        / (SELECT sum(habitants) FROM habitants), 1)::DOUBLE                            AS part_habitants
FROM tranches t
ORDER BY t.ordre;
