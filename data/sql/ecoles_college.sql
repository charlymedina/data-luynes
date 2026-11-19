-- Élèves du collège de Luynes à chaque rentrée, par niveau (6ᵉ, 5ᵉ, 4ᵉ, 3ᵉ).
-- Filtre par UAI de l'annuaire (le collège ouvert de Luynes) en plus du code commune de la source.
-- Résultat : src/data/generated/ecoles_college.json (une ligne par rentrée).
WITH college AS (
  SELECT identifiant_de_l_etablissement AS uai
  FROM read_json('data/raw/ecoles_luynes.json')
  WHERE etat = 'OUVERT' AND type_etablissement = 'Collège'
)
SELECT
  rentree_scolaire::INTEGER           AS rentree,
  sum(nombre_eleves_total)::INTEGER   AS eleves,
  sum(nombre_total_de_6emes)::INTEGER AS sixiemes,
  sum(nombre_total_de_5emes)::INTEGER AS cinquiemes,
  sum(nombre_total_de_4emes)::INTEGER AS quatriemes,
  sum(nombre_total_de_3emes)::INTEGER AS troisiemes
FROM read_json('data/raw/effectifs_college_luynes.json')
WHERE numero_college IN (SELECT uai FROM college)
GROUP BY rentree
ORDER BY rentree;
