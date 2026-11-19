-- Consommation d'énergie des logements de Luynes, chaque année : électricité et gaz, en tout et par logement
-- raccordé (MWh par point de livraison). 1 MWh = 1 000 kWh.
-- Attention : la consommation varie avec la météo (hivers doux ou froids, surtout pour le gaz) et l'Agence ORE a
-- révisé sa méthode en cours de série : regarder la tendance plutôt que les petites variations d'une année.
-- Résultat : src/data/generated/energie_annees.json (une ligne par année).
SELECT
  annee,
  round(sum(mwh) FILTER (filiere = 'Electricité'), 0)::INTEGER                                            AS elec_mwh,
  round(sum(mwh) FILTER (filiere = 'Gaz'), 0)::INTEGER                                                    AS gaz_mwh,
  round(sum(mwh) FILTER (filiere = 'Electricité' AND secteur = 'RESIDENTIEL')
      / sum(sites) FILTER (filiere = 'Electricité' AND secteur = 'RESIDENTIEL'), 2)::DOUBLE               AS elec_mwh_par_logement,
  round(sum(mwh) FILTER (filiere = 'Gaz' AND secteur = 'RESIDENTIEL')
      / sum(sites) FILTER (filiere = 'Gaz' AND secteur = 'RESIDENTIEL'), 2)::DOUBLE                       AS gaz_mwh_par_logement
FROM ore_luynes
GROUP BY annee
-- On ne garde que les années où le résidentiel est publié (sinon la comparaison n'a pas de sens)
HAVING sum(sites) FILTER (secteur = 'RESIDENTIEL') > 0
ORDER BY annee;
