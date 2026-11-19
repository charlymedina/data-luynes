-- Délinquance enregistrée : moyenne des 3 dernières années pour chaque indicateur, en taux pour 1 000
-- (habitants, ou logements pour les cambriolages), à Luynes, en Indre-et-Loire et en France.
-- Dans une commune de 5 000 habitants, quelques faits de plus ou de moins font varier fortement un taux annuel :
-- la moyenne sur 3 ans est plus fiable. Si une seule des 3 années n'est pas publiée à Luynes (secret statistique),
-- le taux de Luynes est laissé vide plutôt qu'estimé.
-- Résultat : src/data/generated/delinquance_indicateurs.json (une ligne par indicateur)
WITH periode AS (
  SELECT max(annee) - 2 AS debut, max(annee) AS fin FROM delinquance_luynes
),

luynes AS (
  SELECT
    l.indicateur,
    count(*) FILTER (l.diffuse)                      AS annees_publiees,
    sum(l.nombre)                                    AS faits,
    sum(l.population)                                AS habitants,
    sum(l.logements)                                 AS logements
  FROM delinquance_luynes l, periode p
  WHERE l.annee BETWEEN p.debut AND p.fin
  GROUP BY l.indicateur
),

territoires AS (
  SELECT
    t.territoire,
    t.indicateur,
    sum(t.nombre)                                    AS faits,
    sum(t.population)                                AS habitants,
    sum(t.logements)                                 AS logements
  FROM delinquance_territoires t, periode p
  WHERE t.annee BETWEEN p.debut AND p.fin
  GROUP BY t.territoire, t.indicateur
),

-- Taux pour 1 000 selon le bon dénominateur
taux AS (
  SELECT
    r.indicateur,
    r.libelle,
    r.rapporte_a,
    r.ordre,
    l.annees_publiees,
    CASE WHEN l.annees_publiees = 3 THEN l.faits END                       AS faits_luynes,
    CASE WHEN l.annees_publiees = 3
      THEN 1000.0 * l.faits / CASE r.rapporte_a WHEN 'logements' THEN l.logements ELSE l.habitants END
    END                                                                    AS taux_luynes,
    1000.0 * d.faits / CASE r.rapporte_a WHEN 'logements' THEN d.logements ELSE d.habitants END AS taux_37,
    1000.0 * f.faits / CASE r.rapporte_a WHEN 'logements' THEN f.logements ELSE f.habitants END AS taux_france
  FROM delinquance_indicateurs_retenus r
  LEFT JOIN luynes l USING (indicateur)
  LEFT JOIN territoires d ON d.indicateur = r.indicateur AND d.territoire = 'Indre-et-Loire'
  LEFT JOIN territoires f ON f.indicateur = r.indicateur AND f.territoire = 'France'
)

SELECT
  indicateur,
  libelle,
  rapporte_a,
  (SELECT debut FROM periode)                   AS annee_debut,
  (SELECT fin FROM periode)                     AS annee_fin,
  coalesce(annees_publiees, 0)::INTEGER         AS annees_publiees,
  faits_luynes::INTEGER                         AS faits_luynes,
  round(faits_luynes / 3.0, 1)::DOUBLE          AS faits_par_an_luynes,
  round(taux_luynes, 2)::DOUBLE                 AS taux_luynes,
  round(taux_37, 2)::DOUBLE                     AS taux_37,
  round(taux_france, 2)::DOUBLE                 AS taux_france
FROM taux
ORDER BY ordre;
