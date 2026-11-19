/**
 * Fichier /donnees/ventes-immobilieres.json, généré à la construction du site : toutes les ventes de Luynes
 * pour la carte de la page Immobilier. Servi à part (et non dans la page) pour que la page reste légère :
 * la carte ne le télécharge que lorsqu'elle s'affiche.
 */
import type { APIRoute } from 'astro';
import { ventes } from '../../data/immobilier';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(ventes), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
