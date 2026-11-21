/**
 * Icônes au trait du site (SVG 24×24, épaisseur 1,75), dessinées pour Luynes en chiffres.
 * Chaque icône est un seul tracé `d` ; elle est rendue par src/components/Icon.astro.
 */
export const ICON_PATHS = {
  pieces: 'M9 7.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z M15 6.2a5.5 5.5 0 1 1 1.6 10.6 M7.2 13H10.5 M7.2 11h3.3 M11 10.2a2.4 2.4 0 1 0 0 3.6',
  banque: 'M3.5 9.5 12 4l8.5 5.5 M5 9.5h14 M6.5 10v7 M10 10v7 M14 10v7 M17.5 10v7 M4 19.5h16',
  maison: 'M4 11 12 4.5l8 6.5 M6 9.5V19.5h12V9.5 M10 19.5v-5h4v5',
  outils: 'M14.5 5.5a3.5 3.5 0 0 0 4.4 4.4l-8.8 8.8a1.8 1.8 0 0 1-2.6-2.6l8.8-8.8a3.5 3.5 0 0 0-1.8-1.8Z M4.5 4.5l4 4 M3.8 6.8l2.9-2.9',
  personnes: 'M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M3 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5 M16 11.2a2.6 2.6 0 1 0-.9-5 M17 14.6c2.2.4 3.6 2 4 4.9',
  mallette: 'M4 8h16v11H4Z M9 8V5.5h6V8 M4 12.5h16 M11 12.5v1.5h2v-1.5',
  boutique: 'M4.5 9.5 6 4.5h12l1.5 5 M4.5 9.5c0 1.5 1.2 2.5 2.5 2.5s2.5-1 2.5-2.5c0 1.5 1.2 2.5 2.5 2.5s2.5-1 2.5-2.5c0 1.5 1.2 2.5 2.5 2.5s2.5-1 2.5-2.5 M6 12v7.5h12V12 M10 19.5v-4h4v4',
  graphique: 'M4 19.5h16 M6.5 16l4-5 3 3 4.5-6.5 M15.5 7.5H18V10',
  tirelire: 'M5 12.5c0-3.3 3-5.5 7-5.5 3.2 0 5.6 1.3 6.6 3.4l1.9.4v3.2l-1.8.6a6 6 0 0 1-2.2 2.5V19h-2.4v-1.4a9 9 0 0 1-3.3 0V19H8.4v-1.9A5.4 5.4 0 0 1 5 12.5Z M10.5 4.5h3 M15.5 11h.01',
  cle: 'M14.5 4a5.5 5.5 0 1 1-4.4 8.8L4.5 18.4V20h2.5v-1.5h1.5V17h1.5l1.9-1.9A5.5 5.5 0 0 1 14.5 4Z M16 8.5h.01',
  /** Deux arches sous un tablier : l'aqueduc gallo-romain de Luynes (patrimoine). */
  aqueduc: 'M3 6.5h18v3H3Z M3 20h18 M4.5 20v-6a2.75 2.75 0 0 1 5.5 0v6 M14 20v-6a2.75 2.75 0 0 1 5.5 0v6',
  carte: 'M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2Z M9 4.5v13 M15 6.5v13',
  regle: 'M4 16.5 16.5 4 20 7.5 7.5 20Z M8 12.5l1.5 1.5 M10.5 10l1.5 1.5 M13 7.5l1.5 1.5',
  immeuble: 'M4 20.5h16 M5.5 20.5V9h5v11.5 M10.5 20.5V4.5h8v16 M13 8h.01 M16 8h.01 M13 11.5h.01 M16 11.5h.01 M13 15h.01 M16 15h.01 M7.5 12.5h.01 M7.5 16h.01',
  /** Entrée de cave creusée dans le coteau de tuffeau. */
  cave: 'M3 20.5h18 M4 20.5V9c3-3.2 13-3.2 16 0v11.5 M9 20.5v-5a3 3 0 0 1 6 0v5',
  eboulement: 'M3 19.5 9.5 8l4 6.5 2.5-3.5 5 8.5Z M15.5 5.5l1.5-1 M18.5 7.5l1.2-.3 M17 9.5l1.5.5',
  vague: 'M3 9c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0 M3 14c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0 M3 19c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0',
  alerte: 'M12 4 2.8 19.5h18.4Z M12 10v4.5 M12 17h.01',
  sablier: 'M7 3.5h10 M7 20.5h10 M8 3.5c0 4 8 5 8 8.5s-8 4.5-8 8.5 M16 3.5c0 4-8 5-8 8.5s8 4.5 8 8.5',
  bebe: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z M9 10.5h.01 M15 10.5h.01 M9.5 14.5c1.4 1.2 3.6 1.2 5 0 M12 3.5c-1 1.2-.6 2.5.8 2.5',
  feuille: 'M5 19.5c0-8 5-13.5 14.5-14.5C19 14 13.5 19 5 19.5Z M5 19.5l7-7',
  /** Goutte d'eau (eau potable). */
  goutte: 'M12 3.5c3.2 4.2 6 7.4 6 10.8a6 6 0 0 1-12 0c0-3.4 2.8-6.6 6-10.8Z M9 14.5a3 3 0 0 0 2.5 2.8',
  /** Verre d'eau avec dépôt (calcaire). */
  calcaire: 'M6 4.5h12l-1.5 15h-9Z M7 9h10 M9 16.5h.01 M12 17.5h.01 M15 16.5h.01 M10.5 15h.01 M13.5 15h.01',
  /** Grue de chantier (construction). */
  grue: 'M6 20.5V5.5 M4 20.5h6 M6 5.5h14 M6 9.5l4-4 M17 5.5v4 M15.5 9.5h3v2.5h-3Z M6 9.5h1.5 M6 13.5h1.5 M6 17.5h1.5',
  calendrier: 'M4.5 6h15v14h-15Z M4.5 10h15 M8.5 3.5v4 M15.5 3.5v4',
  voiture: 'M5 16.5h14 M6.5 11l1.5-4h8l1.5 4 M4.5 11h15v5.5h-15Z M7 19v-2.5 M17 19v-2.5 M7.5 13.8h.01 M16.5 13.8h.01',
  ecole: 'M3 9 12 4.5 21 9l-9 4.5Z M6.5 11v4.5c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2V11 M21 9v5',
  eclair: 'M13 3.5 5.5 13.5h6l-1 7 7.5-10h-6Z',
  pieton: 'M13 3.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z M12 8.8 9.8 13.5l2.7 2-1 5 M12 8.8l2 3.4 2.8.9 M9.8 13.5 7.5 20.5 M11 9.5l-3 1.4-1 2.8',
  velo: 'M6 12.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z M18 12.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z M6 16l3.5-6.5h5.5L18 16 M9.5 9.5 12.5 16H6 M12.5 16l2.5-6.5 M8.5 7h2.5 M15 9.5l-.6-2.5h2.1',
  moto: 'M5.5 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M18.5 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M5.5 16h4.5l2.5-3.5h3.5l2.5 3.5 M12.5 12.5 11 9.5H8 M15.5 12.5l-1.2-4h2.7',
  camion: 'M3.5 6.5h10.5v10H3.5Z M14 10h3.5l3 3.5v3H14 M7 19.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z M17 19.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z',
  trottinette: 'M6.5 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M17.5 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M8.5 18h7 M15.5 18 13 5h-2.5',
  soleil: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M12 2.5V5 M12 19v2.5 M2.5 12H5 M19 12h2.5 M5.3 5.3l1.8 1.8 M16.9 16.9l1.8 1.8 M5.3 18.7l1.8-1.8 M16.9 7.1l1.8-1.8',
  sante: 'M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5Z',
  /** Flamme : le gaz (chauffage). */
  flamme: 'M12 3.5c.8 3 4.8 5 4.8 9.6a4.8 4.8 0 0 1-9.6 0c0-2.2 1.1-3.6 2.2-4.6.2 1.7 1 2.7 2.1 3-.6-2.7-.2-5.6.5-8Z',
  /** Borne de recharge : un boîtier, son câble et un éclair. */
  borne: 'M6 20.5V5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 14 5v15.5 M4.5 20.5h11 M14 9h1.5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 0 3 0V8l-1.5-2 M10.5 7 8.5 10.5h3l-2 3.5',
  livre: 'M4 5.5c2.7-1 5.3-1 8 .8 2.7-1.8 5.3-1.8 8-.8v13c-2.7-1-5.3-1-8 .8-2.7-1.8-5.3-1.8-8-.8Z M12 6.3v13',
  /** Mairie : un fronton, une horloge et un drapeau (municipales). */
  mairie: 'M3.5 20.5h17 M5 20.5V11h14v9.5 M3.5 11 12 6.5l8.5 4.5 M12 6.5V3 M12 3h3v1.8h-3 M12 13.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z M8 20.5v-3 M16 20.5v-3',
  /** Cercle d'étoiles (européennes). */
  etoiles: 'M12 3.5v.01 M16.25 4.64v.01 M19.36 7.75v.01 M20.5 12v.01 M19.36 16.25v.01 M16.25 19.36v.01 M12 20.5v.01 M7.75 19.36v.01 M4.64 16.25v.01 M3.5 12v.01 M4.64 7.75v.01 M7.75 4.64v.01',
  /** Urne : une boîte avec sa fente et un bulletin qui y entre (élections). */
  urne: 'M4.5 11.5h15v8h-15Z M8 11.5h8 M9.5 3.5h5v6.5h-5Z M11 6h2',
  /** Bouclier : la sécurité (délinquance). */
  bouclier: 'M12 3.5 19 6v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6Z M9 12l2 2 4-4',
  /** Carte bancaire : escroqueries et fraudes aux moyens de paiement. */
  carte_bancaire: 'M3.5 6.5h17v11h-17Z M3.5 10h17 M6.5 14.5h4',
  /** Sac à main : vols sans violence. */
  sac: 'M5 9h14l-1.2 11H6.2Z M9 9V7a3 3 0 0 1 6 0v2',
  /** Vitre fêlée : destructions et dégradations. */
  vitre: 'M4.5 4.5h15v15h-15Z M11 4.5l1.5 5-3 2.5 2 7.5 M12.5 9.5l4 1.5 M9.5 12l-5 .5',
  /** Famille : deux adultes et un enfant (violences intrafamiliales). */
  famille: 'M7.5 8.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z M16.5 8.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z M3.5 18.5c.4-3.6 1.8-6.5 4-6.5s3.6 2.9 4 6.5 M12.5 18.5c.4-3.6 1.8-6.5 4-6.5s3.6 2.9 4 6.5 M12 14.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z',
  /** Ballon : sports collectifs. */
  ballon: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z M12 3.5v17 M3.5 12h17 M5.5 6.5c3 2 3 9 0 11 M18.5 6.5c-3 2-3 9 0 11',
  /** Médaille au bout de son ruban (podium, classement). */
  medaille: 'M9 10.5 6.5 3.5h4L12 7l1.5-3.5h4L15 10.5 M12 10.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z M12 13.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3Z',
  /** Boule et cochonnet (boule de fort, pétanque). */
  boule: 'M10.5 8a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z M8 13h.01 M11.5 12.5h.01 M9.5 16.5h.01 M13.5 16h.01 M19 6.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z',
  /** Raquette et balle (tennis, tennis de table). */
  raquette: 'M9.5 3.5a5.5 6.5 0 1 0 0 13 5.5 6.5 0 0 0 0-13Z M13.5 15.5l6 5 M6.5 7.5l6 7 M12.5 7.5l-6 7 M18.5 5.5h.01',
  /** Nageur sur les vagues (bassins). */
  nage: 'M16.5 5.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z M4 13.5l5-3 4 2 3.5-3 M3 17c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0 M3 21c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0',
  /** Cible et flèche (tir). */
  cible: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M12 12 20.5 3.5 M17 3.5h3.5V7',
  /** Pièce d'échecs (jeux de réflexion). */
  pion: 'M12 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z M10 8.5h4l1 4.5H9Z M8 13h8 M7 20.5h10l-1.2-4.5H8.2Z',
  /** Haltère (gymnastique, salles). */
  haltere: 'M3.5 9.5v5 M6.5 7v10 M17.5 7v10 M20.5 9.5v5 M6.5 12h11',
  /** Piste d'athlétisme (ovale à deux couloirs). */
  piste: 'M7 5h10a7 7 0 0 1 0 14H7A7 7 0 0 1 7 5Z M8 9h8a3 3 0 0 1 0 6H8a3 3 0 0 1 0-6Z',
  /** Panneau de rue : thème « Les rues de Luynes ». */
  /** Signal : fibre et internet (Vie quotidienne). */
  wifi: 'M3.5 9.5a12 12 0 0 1 17 0 M6.5 12.8a7.7 7.7 0 0 1 11 0 M9.5 16a3.4 3.4 0 0 1 5 0 M12 19.2h.01',
  /** Tasse : thème Vie quotidienne. */
  tasse: 'M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z M16 10.5h1.5a2.2 2.2 0 0 1 0 4.5H16 M8 4.5v2 M11 4.5v2',
  panneau: 'M12 3.5v17 M7.5 20.5h9 M12 6h6.5l2 2.2-2 2.3H12 M12 12.5H5.5l-2 2.2 2 2.3H12',
} as const;

export type IconName = keyof typeof ICON_PATHS;
