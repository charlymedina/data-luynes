-- Licences de Luynes par fédération, dernière année (classement). Les fédérations du sport scolaire et universitaire
-- (UNSS, UGSEL, USEP…) sont marquées « scolaire » : le site les présente à part du podium des sports.
-- Résultat : src/data/generated/sport_federations.json
WITH luynes AS (
  SELECT code_federation, federation, scolaire, total, femmes, hommes
  FROM sport_licences
  WHERE code = '37139' AND annee = (SELECT max(annee) FROM sport_licences)
)
SELECT
  code_federation                                               AS code,
  federation                                                    AS federation,
  scolaire                                                      AS scolaire,
  total::INTEGER                                                AS licences,
  round(100 * femmes / nullif(femmes + hommes, 0), 1)::DOUBLE   AS femmes_pct,
  -- rang parmi les fédérations non scolaires (vide pour le sport scolaire)
  CASE WHEN scolaire THEN NULL ELSE rank() OVER (PARTITION BY scolaire ORDER BY total DESC) END::INTEGER AS rang
FROM luynes
ORDER BY total DESC, federation;
