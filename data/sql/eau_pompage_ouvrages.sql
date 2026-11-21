-- Les ouvrages de prélèvement situés à Luynes : usage et dernier volume déclaré (m³) avec son année.
-- Résultat : src/data/generated/eau_pompage_ouvrages.json
WITH dernier AS (
  SELECT code_ouvrage, max(annee) AS annee FROM eau_pompage GROUP BY code_ouvrage
)
SELECT
  p.nom_ouvrage,
  p.usage,
  d.annee,
  round(p.volume_m3)::DOUBLE AS volume_m3
FROM eau_pompage p
JOIN dernier d ON d.code_ouvrage = p.code_ouvrage AND d.annee = p.annee
ORDER BY p.volume_m3 DESC, p.nom_ouvrage;
