-- Chiffres clés du thème « Écoles, santé & services ».
-- Résultat : src/data/generated/equipements_resume.json (une ligne).
-- Les requêtes s'exécutent par ordre alphabétique : ce fichier relit les résultats déjà produits par
-- ecoles_effectifs.sql, ecoles_liste.sql et equipements_domaines.sql.
WITH total AS (SELECT * FROM read_json('src/data/generated/equipements_domaines.json') WHERE domaine = '_T'),
pop AS (
  SELECT
    max(population) FILTER (territoire = 'Luynes')         AS luynes,
    max(population) FILTER (territoire = 'Indre-et-Loire') AS dep
  FROM populations_equipements
),
-- Professionnels et lieux de santé (codes BPE) : médecins généralistes, infirmiers, kinés, dentistes, pharmacies
sante AS (
  SELECT
    sum(nombre) FILTER (territoire = 'Luynes' AND type = 'D265')         AS medecins,
    sum(nombre) FILTER (territoire = 'Indre-et-Loire' AND type = 'D265') AS medecins_37,
    sum(nombre) FILTER (territoire = 'Luynes' AND type = 'D307')         AS pharmacies,
    sum(nombre) FILTER (territoire = 'Luynes' AND type IN ('D101', 'D102', 'D103', 'D104', 'D105', 'D106')) AS etablissements_sante,
    sum(nombre) FILTER (territoire = 'Luynes' AND sous_domaine = 'D2' AND type <> '_T')   AS professionnels_sante
  FROM bpe
),
ecoles AS (SELECT * FROM read_json('src/data/generated/ecoles_effectifs.json')),
premiere AS (SELECT * FROM ecoles ORDER BY rentree LIMIT 1),
derniere AS (SELECT * FROM ecoles ORDER BY rentree DESC LIMIT 1)
SELECT
  (SELECT max(annee) FROM bpe)::INTEGER                    AS annee_bpe,
  t.nombre::INTEGER                                        AS equipements,
  t.pour_1000_luynes::DOUBLE                               AS equipements_pour_1000,
  t.pour_1000_37::DOUBLE                                   AS equipements_pour_1000_37,
  t.rang::INTEGER                                          AS rang_equipements,
  t.nb_communes::INTEGER                                   AS nb_communes,
  s.medecins::INTEGER                                      AS medecins,
  round(10000 * s.medecins / p.luynes, 1)::DOUBLE          AS medecins_pour_10000,
  round(10000 * s.medecins_37 / p.dep, 1)::DOUBLE          AS medecins_pour_10000_37,
  coalesce(s.pharmacies, 0)::INTEGER                       AS pharmacies,
  coalesce(s.etablissements_sante, 0)::INTEGER             AS etablissements_sante,
  coalesce(s.professionnels_sante, 0)::INTEGER             AS professionnels_sante,
  f.rentree::INTEGER                                       AS premiere_rentree,
  f.eleves::INTEGER                                        AS eleves_premiere_rentree,
  l.rentree::INTEGER                                       AS derniere_rentree,
  l.eleves::INTEGER                                        AS eleves,
  round(100.0 * (l.eleves / f.eleves - 1), 1)::DOUBLE      AS evolution_eleves_pct,
  round(100.0 * (l.eleves_37 / f.eleves_37 - 1), 1)::DOUBLE AS evolution_eleves_37_pct,
  l.eleves_par_classe::DOUBLE                              AS eleves_par_classe,
  l.eleves_par_classe_37::DOUBLE                           AS eleves_par_classe_37,
  (SELECT count(*) FROM read_json('src/data/generated/ecoles_liste.json'))::INTEGER AS etablissements_scolaires
FROM total t, pop p, sante s, premiere f, derniere l;
