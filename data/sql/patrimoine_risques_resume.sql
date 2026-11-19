-- Chiffres clés « Patrimoine & risques » de Luynes et classement parmi les communes d'Indre-et-Loire.
-- Rang 1 = la commune qui en compte le plus. Les communes sans monument / cavité / arrêté comptent 0.
-- Résultat : src/data/generated/patrimoine_risques_resume.json (une ligne).
WITH monuments AS (
  SELECT unnest(data) AS m FROM read_json('data/raw/monuments_37.json')
),
nb_monuments AS (
  SELECT m.COG_Insee_lors_de_la_protection AS code, m.Reference__count AS nb FROM monuments
),

cavites AS (
  SELECT unnest(data) AS c FROM read_json('data/raw/cavites_37.json')
),
nb_cavites AS (
  SELECT c.code_insee AS code, count(*) AS nb FROM cavites GROUP BY ALL
),

arretes AS (
  SELECT unnest(data) AS a FROM read_json('data/raw/catnat_37.json')
),
nb_catnat AS (
  SELECT a.code_insee AS code, count(*) AS nb FROM arretes GROUP BY ALL
),

-- Une ligne par commune du département, avec ses trois compteurs
par_commune AS (
  SELECT
    c.code,
    coalesce(m.nb, 0)  AS monuments,
    coalesce(k.nb, 0)  AS cavites,
    coalesce(a.nb, 0)  AS catnat
  FROM communes_37 c
  LEFT JOIN nb_monuments m USING (code)
  LEFT JOIN nb_cavites   k USING (code)
  LEFT JOIN nb_catnat    a USING (code)
),

classement AS (
  SELECT
    *,
    rank() OVER (ORDER BY monuments DESC) AS rang_monuments,
    rank() OVER (ORDER BY cavites DESC)   AS rang_cavites,
    rank() OVER (ORDER BY catnat DESC)    AS rang_catnat,
    count(*) OVER ()                      AS nb_communes,
    avg(monuments) OVER ()                AS moyenne_monuments,
    avg(cavites) OVER ()                  AS moyenne_cavites,
    avg(catnat) OVER ()                   AS moyenne_catnat,
    count(*) FILTER (cavites > 0) OVER () AS nb_communes_avec_cavites
  FROM par_commune
),

-- Détail propre à Luynes
luynes_catnat AS (
  SELECT
    count(*) FILTER (risque = 'Sécheresse')                  AS catnat_secheresse,
    count(*) FILTER (risque = 'Mouvement de terrain')        AS catnat_mouvement,
    count(*) FILTER (risque = 'Inondation / coulée de boue') AS catnat_inondation,
    min(annee) AS catnat_premiere_annee,
    max(annee) AS catnat_derniere_annee
  FROM (
    SELECT
      year(strptime(a.date_debut_evt, '%d/%m/%Y')) AS annee,
      CASE
        WHEN a.libelle_risque_jo ILIKE 'Sécheresse%' THEN 'Sécheresse'
        WHEN a.libelle_risque_jo ILIKE 'Inondation%' THEN 'Inondation / coulée de boue'
        WHEN a.libelle_risque_jo ILIKE 'Mouvement%'  THEN 'Mouvement de terrain'
      END AS risque
    FROM (SELECT unnest(data) AS a FROM read_json('data/raw/catnat_luynes.json'))
  )
),
luynes_monuments AS (
  SELECT
    count(*) FILTER (m.Typologie_de_la_protection LIKE 'classé%') AS monuments_classes,
    min(left(m.Date_et_typologie_de_la_protection, 4)::INTEGER)    AS premiere_protection
  FROM (SELECT unnest(data) AS m FROM read_json('data/raw/monuments_luynes.json'))
),
luynes_mouvements AS (
  SELECT count(*) AS mouvements, min(year(m.date_debut::DATE)) AS mouvement_plus_ancien
  FROM (SELECT unnest(data) AS m FROM read_json('data/raw/mouvements_terrain_luynes.json'))
),
-- Risques naturels officiellement recensés pour la commune (ex. « Inondation, Mouvement de terrain, Séisme »)
luynes_risques AS (
  SELECT string_agg(r.libelle_risque_long, ', ' ORDER BY r.num_risque) AS risques_recenses
  FROM (
    SELECT unnest(d.risques_detail) AS r
    FROM (SELECT unnest(data) AS d FROM read_json('data/raw/risques_luynes.json'))
  )
)

SELECT
  k.nb_communes::INTEGER                    AS nb_communes,
  k.monuments::INTEGER                      AS monuments,
  k.rang_monuments::INTEGER                 AS rang_monuments,
  round(k.moyenne_monuments, 1)::DOUBLE     AS moyenne_monuments_departement,
  m.monuments_classes::INTEGER              AS monuments_classes,
  m.premiere_protection::INTEGER            AS premiere_protection,
  k.cavites::INTEGER                        AS cavites,
  k.rang_cavites::INTEGER                   AS rang_cavites,
  round(k.moyenne_cavites, 1)::DOUBLE       AS moyenne_cavites_departement,
  k.nb_communes_avec_cavites::INTEGER       AS nb_communes_avec_cavites,
  k.catnat::INTEGER                         AS catnat,
  k.rang_catnat::INTEGER                    AS rang_catnat,
  round(k.moyenne_catnat, 1)::DOUBLE        AS moyenne_catnat_departement,
  c.catnat_secheresse::INTEGER              AS catnat_secheresse,
  c.catnat_mouvement::INTEGER               AS catnat_mouvement,
  c.catnat_inondation::INTEGER              AS catnat_inondation,
  c.catnat_premiere_annee::INTEGER          AS catnat_premiere_annee,
  c.catnat_derniere_annee::INTEGER          AS catnat_derniere_annee,
  mv.mouvements::INTEGER                    AS mouvements,
  mv.mouvement_plus_ancien::INTEGER         AS mouvement_plus_ancien,
  r.risques_recenses                        AS risques_recenses
FROM classement k, luynes_catnat c, luynes_monuments m, luynes_mouvements mv, luynes_risques r
WHERE k.code = '37139';
