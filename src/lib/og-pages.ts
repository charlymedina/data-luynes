/**
 * Contenu des images d'aperçu pour le partage (Open Graph) : une par page (accueil + chaque thème).
 * Chaque image reprend le titre de la page et UN chiffre clé tiré des données (jamais écrit à la main).
 * Le dessin est fait dans src/lib/og-image.ts ; les images sont produites au build par src/pages/og/[slug].png.ts.
 */
import { commune } from '../data/commune';
import { faits as faitsPopulation } from '../data/population';
import { resumeRisques } from '../data/patrimoine';
import { resumeImmobilier } from '../data/immobilier';
import { resumeBudget } from '../data/budget';
import { resumeRevenus } from '../data/revenus';
import { resumeAccidents } from '../data/accidents';
import { resumeEquipements } from '../data/equipements';
import { resumeEnergie } from '../data/energie';
import { resumeElections } from '../data/elections';
import { indicateursPublies, periodeDelinquance } from '../data/delinquance';
import { resumeEau } from '../data/eau';
import { resumeConstruction } from '../data/construction';
import { resumeSport } from '../data/sport';
import { resumeNature } from '../data/nature';
import { resumeRues } from '../data/rues';
import { resumeFibre } from '../data/quotidien';
import { THEMES } from '../data/themes';
import { formatNumber, formatOneDecimal } from './format';

/** Dimensions recommandées pour l'aperçu d'un lien partagé. */
export const OG_LARGEUR = 1200;
export const OG_HAUTEUR = 630;

export interface OgPage {
  /** Nom du fichier : /og/<slug>.png ; « accueil » pour la page d'accueil */
  slug: string;
  /** Titre de la page en deux temps : début, puis fin mise en couleur (même découpage que le <h1>) */
  titre: readonly [string, string];
  chiffre: { valeur: string; legende: string };
  /** Texte alternatif de l'image (og:image:alt) */
  alt: string;
}

const pourcent = (v: number): string => `${formatOneDecimal(v)} %`;

function page(slug: string, titre: readonly [string, string], valeur: string, legende: string): OgPage {
  return { slug, titre, chiffre: { valeur, legende }, alt: `${titre[0]}${titre[1]} — ${valeur} ${legende}. Luynes en chiffres.` };
}

/** Les pages dans l'ordre du site ; le titre est celui du <h1> de chaque page. */
export const OG_PAGES: readonly OgPage[] = [
  page('accueil', ['Luynes, ', 'en chiffres'], formatNumber(faitsPopulation.population_derniere), `habitants en ${faitsPopulation.annee_derniere}`),
  page('population', ['Qui sont ', 'les Luynois ?'], formatNumber(faitsPopulation.population_derniere), `habitants en ${faitsPopulation.annee_derniere}`),
  page('territoire', ['Un coin ', 'de Touraine'], `${formatOneDecimal(commune.surface_km2)} km²`, 'de superficie'),
  page('patrimoine-risques', ['Arches ', '& caves'], formatNumber(resumeRisques.monuments), 'monuments historiques'),
  page('immobilier', ['Combien ', 'le m² ?'], `${formatNumber(resumeImmobilier.prix_m2_maison)} €/m²`, `pour une maison (${resumeImmobilier.annee_debut_prix}-${resumeImmobilier.annee_fin})`),
  page('budget', ['La mairie ', 'à livre ouvert'], `${formatNumber(resumeBudget.depenses_hab)} €`, `de charges de fonctionnement par habitant (${resumeBudget.annee})`),
  page('revenus-emploi', ['Gagner ', 'sa vie'], `${formatNumber(Math.round(resumeRevenus.niveau_vie / 12 / 10) * 10)} €`, `de niveau de vie médian par mois (${resumeRevenus.annee_revenus})`),
  page('accidents', ['Sur ', 'nos routes'], formatOneDecimal(resumeAccidents.taux_luynes), `accidents par an pour 1 000 habitants (${resumeAccidents.annee_debut}-${resumeAccidents.annee_fin})`),
  page('equipements', ['Au coin ', 'de la rue'], formatNumber(resumeEquipements.equipements), `commerces, services et équipements (${resumeEquipements.annee_bpe})`),
  page('energie-mobilite', ['Plein ', "d'énergie"], pourcent(resumeEnergie.part_electrique_pct), `de voitures électriques (${resumeEnergie.annee_parc})`),
  page('elections', ['Aux ', 'urnes'], formatNumber(resumeElections.nb_tours), `tours de scrutin depuis ${resumeElections.premiere_annee}`),
  page('delinquance', ['Sécurité ', 'au quotidien'], formatNumber(indicateursPublies.length), `catégories de faits suivies (${periodeDelinquance.debut}-${periodeDelinquance.fin})`),
  page('eau', ["L'eau ", 'du robinet'], pourcent(resumeEau.conformes_bact), `de prélèvements conformes (bactéries, ${resumeEau.annee_debut}-${resumeEau.annee_fin})`),
  page('construction', ['Ça ', 'construit ?'], formatNumber(resumeConstruction.commences_total), `logements mis en chantier (${resumeConstruction.annee_debut}-${resumeConstruction.annee_fin})`),
  page('sport', ['Luynes ', 'en jeu'], formatOneDecimal(resumeSport.licences_pour_100), `licences sportives pour 100 habitants (${resumeSport.annee_fin})`),
  page('nature', ['Côté ', 'nature'], pourcent(resumeNature.zonee_pct), 'de la commune en ZNIEFF ou Natura 2000'),
  page('rues', ['Au coin ', 'de la rue'], formatNumber(resumeRues.voies), 'voies recensées à Luynes'),
  page('quotidien', ['Au ', 'quotidien'], pourcent(resumeFibre.fibre_pct), 'de locaux raccordables à la fibre'),
  page('a-propos', ['Derrière ', 'les chiffres'], formatNumber(THEMES.length), 'thèmes de données ouvertes sur Luynes'),
];

export function ogPage(slug: string): OgPage {
  const trouvee = OG_PAGES.find((p) => p.slug === slug);
  if (!trouvee) throw new Error(`pas d'image d'aperçu pour « ${slug} »`);
  return trouvee;
}
