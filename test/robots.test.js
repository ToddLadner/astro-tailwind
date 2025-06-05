import assert from 'assert';
import { getRobotsTxt } from '../src/lib/robots.js';

assert.strictEqual(
  getRobotsTxt(new URL('https://example.com/sitemap.xml')),
  `User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n`
);
