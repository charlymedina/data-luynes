-- Le budget de Luynes la dernière année publiée : montants, répartition, comparaison avec la strate
-- (communes de même taille) et classement parmi les communes d'Indre-et-Loire.
-- Rang 1 = la valeur la plus élevée du département.
-- Résultat : src/data/generated/budget_resume.json (une ligne).
WITH derniere AS (
  SELECT * FROM budget_luynes ORDER BY an DESC LIMIT 1
),

-- Classement des communes du département (euros par habitant et taux de taxe foncière)
classement AS (
  SELECT
    icom::INTEGER                           AS icom,
    rank() OVER (ORDER BY fcharge DESC)     AS rang_depenses,
    rank() OVER (ORDER BY fdette DESC)      AS rang_dette,
    rank() OVER (ORDER BY tfb DESC)         AS rang_taux_foncier,
    rank() OVER (ORDER BY fequip DESC)      AS rang_equipement,
    count(*) OVER ()                        AS nb_communes
  FROM budget_communes_37
),

departement AS (
  SELECT
    median(fcharge)                AS depenses_hab_mediane,
    median(fdette)                 AS dette_hab_mediane,
    median(tfb)                    AS taux_foncier_median,
    median(fequip)                 AS equipement_hab_mediane,
    count(*) FILTER (fdette = 0)   AS communes_sans_dette
  FROM budget_communes_37
),

-- Part des dépenses d'équipement qui sont des subventions d'équipement versées à d'autres organismes
-- (comptes 204…, ex. 2046 : mouvement de l'année). La définition DGFiP de « dépenses d'équipement » les inclut.
subventions_equipement AS (
  SELECT coalesce(sum(mouvement_net), 0) AS euros
  FROM balance_luynes
  WHERE compte LIKE '204%' AND annee = (SELECT an FROM derniere)
),

-- Sur les 10 dernières années : total investi en équipements, et pic de la dette par habitant
historique AS (
  SELECT
    sum(equip) FILTER (an > (SELECT an FROM derniere) - 10) AS equipement_10_ans,
    max(fdette)                                            AS dette_hab_max,
    arg_max(an, fdette)                                    AS annee_dette_max,
    min(an)                                                AS premiere_annee
  FROM budget_luynes
)

SELECT
  d.an::INTEGER                                      AS annee,
  d.pop1::INTEGER                                    AS population,
  -- « 5000 à 10 000 hab » → « 5 000 à 10 000 hab » (la DGFiP n'écrit pas l'espace de « 5000 »)
  regexp_replace(d.nomsst1, '\b(\d)(\d{3})\b', '\1 \2', 'g') AS strate,
  -- Montants totaux en euros (la DGFiP les donne en milliers d'euros)
  round(d.prod * 1000)::INTEGER                      AS recettes,
  round(d.charge * 1000)::INTEGER                    AS depenses,
  round(d.depinv * 1000)::INTEGER                    AS investissement,
  round(d.equip * 1000)::INTEGER                     AS equipement,
  round(se.euros)::INTEGER                           AS equipement_subventions,
  round((d.equip * 1000 - se.euros) / d.pop1)::INTEGER AS equipement_hors_subventions_hab,
  round(d.caf * 1000)::INTEGER                       AS caf,
  round(d.dette * 1000)::INTEGER                     AS dette,
  round(d.annu * 1000)::INTEGER                      AS annuite,
  -- Sur 100 € de dépenses de fonctionnement
  round(100 * d.perso / d.charge, 1)::DOUBLE          AS part_personnel,
  round(100 * d.achat / d.charge, 1)::DOUBLE          AS part_achats,
  round(100 * d.subv / d.charge, 1)::DOUBLE           AS part_subventions,
  round(100 * d.cont / d.charge, 1)::DOUBLE           AS part_contingents,
  round(100 * d.fin / d.charge, 1)::DOUBLE            AS part_interets,
  round(100 * (d.charge - d.perso - d.achat - d.subv - d.cont - d.fin) / d.charge, 1)::DOUBLE AS part_autres_depenses,
  -- Sur 100 € de recettes de fonctionnement
  round(100 * d.impo1 / d.prod, 1)::DOUBLE            AS part_impots_locaux,
  round(100 * d.dgf / d.prod, 1)::DOUBLE              AS part_dotation_etat,
  round(100 * (d.prod - d.impo1 - d.dgf) / d.prod, 1)::DOUBLE AS part_autres_recettes,
  -- Par habitant : Luynes / moyenne de la strate
  round(d.fcharge)::INTEGER AS depenses_hab,   round(d.mcharge)::INTEGER AS depenses_hab_strate,
  round(d.fprod)::INTEGER   AS recettes_hab,   round(d.mprod)::INTEGER   AS recettes_hab_strate,
  round(d.fequip)::INTEGER  AS equipement_hab, round(d.mequip)::INTEGER  AS equipement_hab_strate,
  round(d.fdette)::INTEGER  AS dette_hab,      round(d.mdette)::INTEGER  AS dette_hab_strate,
  round(d.fcaf)::INTEGER    AS caf_hab,        round(d.mcaf)::INTEGER    AS caf_hab_strate,
  round(d.fimpo1)::INTEGER  AS impots_hab,     round(d.mimpo1)::INTEGER  AS impots_hab_strate,
  round(d.tfb, 2)::DOUBLE   AS taux_foncier,   round(d.tmfb, 2)::DOUBLE  AS taux_foncier_strate,
  -- Années de dette : combien d'années d'autofinancement il faudrait pour tout rembourser
  round(d.dette / nullif(d.caf, 0), 1)::DOUBLE        AS annees_desendettement,
  -- Département
  k.nb_communes::INTEGER                    AS nb_communes,
  k.rang_depenses::INTEGER                  AS rang_depenses,
  k.rang_dette::INTEGER                     AS rang_dette,
  k.rang_taux_foncier::INTEGER              AS rang_taux_foncier,
  k.rang_equipement::INTEGER                AS rang_equipement,
  round(dep.depenses_hab_mediane)::INTEGER  AS depenses_hab_37,
  round(dep.dette_hab_mediane)::INTEGER     AS dette_hab_37,
  round(dep.taux_foncier_median, 2)::DOUBLE AS taux_foncier_37,
  round(dep.equipement_hab_mediane)::INTEGER AS equipement_hab_37,
  dep.communes_sans_dette::INTEGER          AS communes_sans_dette_37,
  -- Historique
  round(h.equipement_10_ans * 1000)::INTEGER AS equipement_10_ans,
  round(h.dette_hab_max)::INTEGER           AS dette_hab_max,
  h.annee_dette_max::INTEGER                AS annee_dette_max,
  h.premiere_annee::INTEGER                 AS premiere_annee
FROM derniere d
CROSS JOIN departement dep
CROSS JOIN historique h
CROSS JOIN subventions_equipement se
JOIN classement k ON k.icom = 139;
