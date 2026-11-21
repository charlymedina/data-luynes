-- Indemnités des élus et subventions de Luynes comparées aux communes de même taille (même strate DGFiP, toute la France)
-- et aux communes d'Indre-et-Loire, dernière année. Euros par habitant.
--  - « strate » : total des dépenses divisé par le total des habitants des communes de la strate (moyenne pondérée) ;
--  - « médiane 37 » : la moitié des communes du département est au-dessus, la moitié en dessous ;
--  - rang 1 = la valeur la plus élevée du département.
-- Seules les communes qui ont une écriture sur le compte sont comparées (une commune sans écriture n'est pas un « 0 »).
-- Résultat : src/data/generated/budget_comparaison.json (une ligne par indicateur).
WITH luynes AS (
  SELECT * FROM communes_france WHERE dep = '037' AND icom = '139'
),

indicateurs AS (
  SELECT 'indemnites' AS indicateur, dep, icom, population, strate, indemnites AS montant FROM communes_france
  UNION ALL SELECT 'associations', dep, icom, population, strate, associations FROM communes_france
  UNION ALL SELECT 'ccas', dep, icom, population, strate, ccas FROM communes_france
),

valides AS (
  SELECT * FROM indicateurs WHERE montant > 0 AND population > 0
),

classement AS (
  SELECT
    indicateur, icom,
    rank() OVER (PARTITION BY indicateur ORDER BY montant / population DESC) AS rang,
    count(*) OVER (PARTITION BY indicateur)                                 AS nb_communes
  FROM valides
  WHERE dep = '037'
),

strates AS (
  SELECT
    v.indicateur,
    round(sum(v.montant) / sum(v.population), 1)::DOUBLE AS strate_par_habitant,
    count(*)                                              AS nb_communes_strate
  FROM valides v, luynes l
  WHERE v.strate = l.strate
  GROUP BY v.indicateur
),

departement AS (
  SELECT indicateur, round(median(montant / population), 1)::DOUBLE AS mediane_37
  FROM valides WHERE dep = '037' GROUP BY indicateur
)

SELECT
  i.indicateur,
  (SELECT max(annee) FROM balance_luynes) AS annee,
  l.strate,
  round(CASE i.indicateur WHEN 'indemnites' THEN l.indemnites WHEN 'associations' THEN l.associations ELSE l.ccas END
        / l.population, 1)::DOUBLE AS luynes_par_habitant,
  s.strate_par_habitant,
  s.nb_communes_strate::INTEGER AS nb_communes_strate,
  d.mediane_37,
  c.rang::INTEGER AS rang,
  c.nb_communes::INTEGER AS nb_communes
FROM (VALUES ('indemnites'), ('associations'), ('ccas')) i(indicateur)
CROSS JOIN luynes l
JOIN strates s USING (indicateur)
JOIN departement d USING (indicateur)
JOIN classement c ON c.indicateur = i.indicateur AND c.icom = l.icom
ORDER BY i.indicateur;
