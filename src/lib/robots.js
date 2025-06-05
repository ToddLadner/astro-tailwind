export function getRobotsTxt(sitemapURL) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`;
}
