import type { APIRoute } from 'astro';
import { getRobotsTxt } from '../lib/robots.js';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return new Response(getRobotsTxt(sitemapURL));
};
