-- Où se situe Luynes parmi les 272 communes d'Indre-et-Loire ?
-- Rang 1 = la plus grande valeur (la plus peuplée, la plus grande, la plus dense, la plus âgée…).
-- Résultat : src/data/generated/rang_departement.json (une ligne).
WITH annees AS (
  SELECT min(annee) AS annee_debut, max(annee) AS annee_fin FROM ages_communes_37
),

-- Âges et évolution de chaque commune entre le premier et le dernier recensement disponibles
ages AS (
  SELECT
    a.code,
    100 * a.plus_65 / a.population                     AS part_65_plus,
    100 * a.moins_20 / a.population                    AS part_moins_20,
    100 * (a.population / d.population - 1)            AS evolution_pct
  FROM ages_communes_37 a
  JOIN ages_communes_37 d ON d.code = a.code AND d.annee = (SELECT annee_debut FROM annees)
  WHERE a.annee = (SELECT annee_fin FROM annees)
),

classement AS (
  SELECT
    c.code,
    rank() OVER (ORDER BY c.population DESC)      AS rang_population,
    rank() OVER (ORDER BY c.surface_km2 DESC)     AS rang_surface,
    rank() OVER (ORDER BY c.densite_hab_km2 DESC) AS rang_densite,
    rank() OVER (ORDER BY a.evolution_pct DESC)   AS rang_evolution,
    rank() OVER (ORDER BY a.part_65_plus DESC)    AS rang_65_plus,
    rank() OVER (ORDER BY a.part_moins_20 DESC)   AS rang_moins_20,
    a.evolution_pct,
    count(*) OVER ()                              AS nb_communes
  FROM communes_37 c
  JOIN ages a USING (code)
),

-- Le département dans son ensemble (somme de toutes les communes)
departement AS (
  SELECT
    sum(population) / sum(surface_km2) AS densite,
    sum(surface_km2) / count(*)        AS surface_moyenne,
    median(surface_km2)                AS surface_mediane
  FROM communes_37
),

departement_ages AS (
  SELECT
    100 * (sum(population) FILTER (annee = (SELECT annee_fin FROM annees))
         / sum(population) FILTER (annee = (SELECT annee_debut FROM annees)) - 1) AS evolution_pct,
    100 * sum(plus_65) FILTER (annee = (SELECT annee_fin FROM annees))
        / sum(population) FILTER (annee = (SELECT annee_fin FROM annees))         AS part_65_plus
  FROM ages_communes_37
)

SELECT
  k.nb_communes::INTEGER                       AS nb_communes,
  k.rang_population::INTEGER                   AS rang_population,
  k.rang_surface::INTEGER                      AS rang_surface,
  k.rang_densite::INTEGER                      AS rang_densite,
  k.rang_evolution::INTEGER                    AS rang_evolution,
  k.rang_65_plus::INTEGER                      AS rang_65_plus,
  k.rang_moins_20::INTEGER                     AS rang_moins_20,
  round(d.densite)::INTEGER                    AS densite_departement,
  round(d.surface_moyenne, 1)::DOUBLE          AS surface_moyenne_km2,
  round(d.surface_mediane, 1)::DOUBLE          AS surface_mediane_km2,
  (SELECT annee_debut FROM annees)             AS annee_debut,
  (SELECT annee_fin FROM annees)               AS annee_fin,
  round(k.evolution_pct, 1)::DOUBLE            AS evolution_pct,
  round(da.evolution_pct, 1)::DOUBLE           AS evolution_departement_pct,
  round(da.part_65_plus, 1)::DOUBLE            AS part_65_plus_departement
FROM classement k, departement d, departement_ages da
WHERE k.code = '37139';
