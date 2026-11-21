-- La médiathèque de Luynes : activité, collections et ouverture (une ligne), avec les taux ramenés à la population.
-- « Prêts par habitant » = prêts de l'année ÷ population légale de Luynes (API Géo).
-- Résultat : src/data/generated/equipements_mediatheque.json
SELECT
  m.*,
  round(m.prets / p.population, 1)::DOUBLE               AS prets_par_habitant,
  round(100.0 * m.emprunteurs / p.population, 1)::DOUBLE AS emprunteurs_pct_population,
  round(m.livres / p.population, 1)::DOUBLE              AS livres_par_habitant
FROM mediatheque m,
     (SELECT population FROM populations_equipements WHERE territoire = 'Luynes') p;
