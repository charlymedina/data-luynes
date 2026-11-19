-- Extrait archivé : voix de chaque candidat ou liste, à chaque scrutin où Luynes a voté.
--  - voix à Luynes pour tous les scrutins ;
--  - voix en Indre-et-Loire et en France seulement pour la présidentielle et les européennes, les deux scrutins où
--    les mêmes candidats (ou listes) se présentent partout : ailleurs (législatives, municipales, régionales,
--    départementales), les candidats changent d'un territoire à l'autre et la comparaison n'aurait pas de sens.
-- Le nom affiché est celui de la liste, du binôme, ou « Prénom NOM » du candidat (tel que publié).
-- Exécuté par scripts/archive-elections.ts → data/archive/elections/candidats.parquet
WITH voix AS (
  SELECT
    id_election,
    code_commune,
    code_departement,
    no_panneau,
    voix,
    coalesce(libelle_etendu_liste, liste, binome, nullif(trim(concat_ws(' ', prenom, nom)), '')) AS libelle,
    split_part(id_election, '_', 2) IN ('pres', 'euro') AS national
  FROM read_parquet('{candidats}')
),

-- Scrutins où Luynes a des résultats
scrutins_luynes AS (
  SELECT DISTINCT id_election FROM voix WHERE code_commune = '37139'
)

SELECT
  v.id_election,
  v.no_panneau,
  -- Nom lu à Luynes ; à défaut (rare), celui publié ailleurs pour le même panneau d'un scrutin national
  coalesce(
    any_value(v.libelle) FILTER (v.code_commune = '37139'),
    any_value(v.libelle) FILTER (v.national)
  )                                                                  AS libelle,
  sum(v.voix) FILTER (v.code_commune = '37139')                      AS voix_luynes,
  sum(v.voix) FILTER (v.national AND v.code_departement = '37')      AS voix_37,
  sum(v.voix) FILTER (v.national)                                    AS voix_france
FROM voix v
JOIN scrutins_luynes USING (id_election)
GROUP BY v.id_election, v.no_panneau
HAVING sum(v.voix) FILTER (v.code_commune = '37139') IS NOT NULL
ORDER BY v.id_election, v.no_panneau;
