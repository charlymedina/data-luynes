-- Vues partagées du thème « Transparence » (balances comptables DGFiP, marchés publics, répertoire des élus).
-- Unités : euros. Une balance comptable donne, pour chaque compte, le solde de l'année :
-- « sd » = solde débiteur (dépenses pour un compte de charges), « sc » = solde créditeur.

-- Balance de Luynes (budget principal) : un solde net par année et par compte.
-- Dépense nette d'un compte de charges (classe 6) = débit − crédit (les remboursements viennent en déduction).
CREATE OR REPLACE VIEW balance_luynes AS
SELECT
  exer::INTEGER                    AS annee,
  compte,
  sum(sd::DOUBLE - sc::DOUBLE)     AS depense_nette
FROM read_csv('data/raw/balances_luynes/*', delim = ';', header = true, all_varchar = true, union_by_name = true)
GROUP BY ALL;

-- Regroupement des comptes de dépenses de fonctionnement en « postes » (plan comptable M14 jusqu'en 2023, M57 depuis 2024).
-- Les deux plans se retrouvent par leurs premiers chiffres : par exemple 6531 (M14) devient 65311 (M57),
-- 6574 devient 65748, 657362 devient 657363.
-- Sont écartés : 68 (amortissements et provisions) et 675-676 (valeur des biens vendus) : ce sont des écritures
-- sans sortie d'argent. Les chiffres de ce thème sont donc des dépenses réellement payées dans l'année.
CREATE OR REPLACE VIEW depenses_par_poste AS
SELECT
  annee,
  CASE
    WHEN compte LIKE '64%' OR compte LIKE '631%' OR compte LIKE '633%' OR compte LIKE '621%' THEN 'personnel'
    WHEN compte LIKE '60%'                                                                     THEN 'achats'
    WHEN compte LIKE '61%'                                                                     THEN 'entretien'
    WHEN compte LIKE '62%' OR compte LIKE '63%'                                                THEN 'services'
    WHEN compte LIKE '6574%' OR compte LIKE '65736%'                                           THEN 'subventions'
    WHEN compte LIKE '655%'                                                                    THEN 'contributions'
    WHEN compte LIKE '653%'                                                                    THEN 'elus'
    WHEN compte LIKE '66%'                                                                     THEN 'interets'
    ELSE 'autres'
  END AS poste,
  sum(depense_nette) AS montant
FROM balance_luynes
WHERE compte LIKE '6%'
  AND compte NOT LIKE '68%'
  AND compte NOT LIKE '675%'
  AND compte NOT LIKE '676%'
GROUP BY ALL;

-- Population retenue par la DGFiP chaque année (comptes individuels, vue du thème Budget) : sert aux « € par habitant ».
CREATE OR REPLACE VIEW population_dgfip AS
SELECT an::INTEGER AS annee, pop1::INTEGER AS population FROM budget_luynes;

-- Toutes les communes de France, dernière année : population, strate (communes de même taille) et trois dépenses.
-- Les communes qui n'ont rien enregistré sur un compte ne sont pas comptées pour ce compte (valeur 0 écartée).
CREATE OR REPLACE VIEW communes_france AS
WITH comptes AS (
  SELECT
    lpad(ndept, 3, '0')  AS dep,
    lpad(insee, 3, '0')  AS icom,
    sum(sd::DOUBLE - sc::DOUBLE) FILTER (compte IN ('65311', '6531'))     AS indemnites,
    sum(sd::DOUBLE - sc::DOUBLE) FILTER (compte IN ('65748', '6574'))     AS associations,
    sum(sd::DOUBLE - sc::DOUBLE) FILTER (compte IN ('657363', '657362'))  AS ccas
  FROM read_csv('data/raw/balances_communes_france/*', delim = ';', header = true, all_varchar = true)
  GROUP BY ALL
)
SELECT
  lpad(p.dep, 3, '0')       AS dep,
  lpad(p.icom, 3, '0')      AS icom,
  p.pop1::INTEGER           AS population,
  p.nomsst1                 AS strate,
  c.indemnites,
  c.associations,
  c.ccas
FROM read_csv('data/raw/populations_communes_france/*', delim = ';', header = true, all_varchar = true) p
LEFT JOIN comptes c ON c.dep = lpad(p.dep, 3, '0') AND c.icom = lpad(p.icom, 3, '0');

-- Marchés publics attribués par la mairie (données essentielles de la commande publique) : version à jour de chaque marché.
CREATE OR REPLACE VIEW marches AS
SELECT *
FROM read_parquet('data/raw/decp_luynes.parquet')
WHERE donneesActuelles IS NOT false;

-- Avis d'appel d'offres de la commune (BOAMP). On écarte l'avis du centre hospitalier, qui n'est pas la mairie,
-- les avis rectificatifs et les avis d'attribution (un appel d'offres = un avis initial).
CREATE OR REPLACE VIEW appels_offres AS
SELECT
  idweb,
  dateparution::DATE AS date_parution,
  objet,
  famille_libelle    AS famille
FROM read_csv('data/raw/boamp_luynes/*', delim = ';', header = true, all_varchar = true)
WHERE (nomacheteur ILIKE '%mairie luynes%' OR nomacheteur ILIKE '%commune de luynes%' OR nomacheteur ILIKE '%ville de luynes%')
  AND nature = 'APPEL_OFFRE'
  AND etat = 'INITIAL';

-- Conseil municipal (répertoire national des élus) : le fichier téléchargé ne contient ni nom ni prénom.
-- L'âge est calculé à la date de construction du site ; la date de naissance n'est jamais publiée.
CREATE OR REPLACE VIEW conseil AS
SELECT
  "Code sexe"                                              AS sexe,
  date_diff('year', "Date de naissance"::DATE, current_date) AS age,
  "Code de la catégorie socio-professionnelle"::INTEGER // 10 AS groupe_csp,
  "Libellé de la fonction"                                 AS fonction,
  "Date de début du mandat"::DATE                          AS debut_mandat
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/rne_conseil.json'));
