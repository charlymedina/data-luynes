-- Mise en service des équipements de Luynes, par période (année exacte si le RES la donne, sinon sa période).
-- Une ligne par période du RES (0 si aucun équipement) ; « sans_date » compte les équipements sans date connue.
-- Résultat : src/data/generated/sport_equipements_periodes.json
SELECT
  p.periode,
  count(e.id)::INTEGER AS nombre,
  min(e.annee_service)::INTEGER AS annee_la_plus_ancienne
FROM sport_periodes p
LEFT JOIN sport_equipements e ON e.ordre_periode = p.ordre
GROUP BY p.ordre, p.periode
ORDER BY p.ordre;
