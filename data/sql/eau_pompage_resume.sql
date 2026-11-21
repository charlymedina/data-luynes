-- Chiffres clés de l'eau puisée sous Luynes (dernière année où un forage d'eau potable a déclaré un volume).
-- Une piscine olympique = 50 m × 25 m × 2 m = 2 500 m³ (dimensions minimales du bassin de compétition).
-- Résultat : src/data/generated/eau_pompage_resume.json (une ligne)
WITH derniere AS (SELECT max(annee) AS annee FROM eau_pompage WHERE usage = 'potable'),
premiere AS (SELECT min(annee) AS annee FROM eau_pompage WHERE usage = 'potable')
SELECT
  (SELECT annee FROM derniere)                                                       AS annee,
  (SELECT annee FROM premiere)                                                       AS annee_debut,
  2500::INTEGER                                                                      AS m3_piscine_olympique,
  round(sum(volume_m3) FILTER (usage = 'potable' AND e.an = d.annee))::DOUBLE       AS potable_m3,
  round(sum(volume_m3) FILTER (usage = 'potable' AND e.an = p.annee))::DOUBLE       AS potable_m3_debut,
  round(sum(volume_m3) FILTER (usage <> 'potable' AND e.an = d.annee))::DOUBLE      AS autres_usages_m3,
  count(DISTINCT code_ouvrage) FILTER (usage = 'potable' AND e.an = d.annee AND volume_m3 > 0)::INTEGER AS ouvrages_potable,
  count(DISTINCT code_ouvrage)::INTEGER                                              AS ouvrages_total,
  count(DISTINCT code_ouvrage) FILTER (usage <> 'potable' AND e.an = d.annee AND volume_m3 > 0)::INTEGER AS ouvrages_autres_actifs
FROM (SELECT code_ouvrage, annee AS an, usage, volume_m3 FROM eau_pompage) e, derniere d, premiere p;
