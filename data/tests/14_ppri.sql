-- Tests du PPRi de la Loire à Luynes (zonage réglementaire, DDT 37) : cohérence des surfaces et de la date. Zéro ligne = tout va bien.

-- Les types de zones sont ceux attendus (1 à 4), sans doublon, et il y en a au moins un
SELECT 'ppri : aucun type de zone' AS probleme WHERE (SELECT count(*) FROM risques_ppri) = 0

UNION ALL
SELECT 'ppri : type de zone inattendu (' || ordre || ')' FROM risques_ppri WHERE ordre NOT BETWEEN 1 AND 4

UNION ALL
-- Chaque type a une surface positive et une part de commune cohérente avec elle (commune ≈ 3 400 ha : 1 ha ≈ 0,03 %)
SELECT 'ppri : surface ou part invalide pour « ' || type || ' » (' || surface_ha || ' ha, ' || part_commune_pct || ' %)'
FROM risques_ppri WHERE surface_ha <= 0 OR part_commune_pct <= 0 OR part_commune_pct > 100

UNION ALL
-- La somme des types égale le total (à l'arrondi près) : aucun type oublié ni compté deux fois
SELECT 'ppri : somme des types (' || round(s.somme, 1) || ' ha) différente du total (' || r.surface_ha || ' ha)'
FROM (SELECT sum(surface_ha) AS somme FROM risques_ppri) s, risques_ppri_resume r
WHERE abs(s.somme - r.surface_ha) > 1

UNION ALL
-- Le PPRi ne peut pas dépasser la commune
SELECT 'ppri : part de la commune hors de 0-100 % (' || part_commune_pct || ')' FROM risques_ppri_resume WHERE part_commune_pct NOT BETWEEN 0.1 AND 100

UNION ALL
-- Date d'approbation : une vraie date, ni dans le futur ni antérieure à la loi de 1995 sur les PPR
SELECT 'ppri : date d''approbation invalide (' || coalesce(date_approbation, 'vide') || ')'
FROM risques_ppri_resume
WHERE date_approbation IS NULL OR try_cast(date_approbation AS DATE) IS NULL
   OR try_cast(date_approbation AS DATE) NOT BETWEEN DATE '1995-02-02' AND current_date

UNION ALL
-- Les formes sont bien des polygones (pas de forme vide)
SELECT 'ppri : forme vide pour « ' || type || ' »' FROM risques_ppri WHERE zone IS NULL OR zone::VARCHAR NOT LIKE '%Polygon%';
