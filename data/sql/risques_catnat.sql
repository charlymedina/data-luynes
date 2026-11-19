-- Arrêtés de catastrophe naturelle reconnus pour Luynes (Géorisques, base GASPAR), un par événement.
-- Résultat : src/data/generated/risques_catnat.json (du plus ancien au plus récent).
WITH arretes AS (
  SELECT unnest(data) AS a FROM read_json('data/raw/catnat_luynes.json')
)

SELECT
  strftime(strptime(a.date_debut_evt, '%d/%m/%Y'), '%Y-%m-%d') AS date_evenement,
  year(strptime(a.date_debut_evt, '%d/%m/%Y'))::INTEGER AS annee,
  -- Libellés harmonisés pour l'affichage
  CASE
    WHEN a.libelle_risque_jo ILIKE 'Sécheresse%'      THEN 'Sécheresse'
    WHEN a.libelle_risque_jo ILIKE 'Inondation%'      THEN 'Inondation / coulée de boue'
    WHEN a.libelle_risque_jo ILIKE 'Mouvement%'       THEN 'Mouvement de terrain'
    ELSE a.libelle_risque_jo
  END                                                 AS risque
FROM arretes
ORDER BY date_evenement;
