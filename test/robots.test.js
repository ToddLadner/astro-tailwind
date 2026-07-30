import assert from "node:assert/strict";
import test from "node:test";
import { getRobotsTxt } from "../src/lib/robots.js";

test("renders the sitemap URL in the robots response", () => {
	assert.equal(
		getRobotsTxt(new URL("https://example.com/sitemap.xml")),
		"User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n",
	);
});

test("preserves sitemap paths, ports, and query parameters", () => {
	assert.equal(
		getRobotsTxt(new URL("http://localhost:4321/nested/sitemap.xml?preview=true")),
		"User-agent: *\nAllow: /\n\nSitemap: http://localhost:4321/nested/sitemap.xml?preview=true\n",
	);
});
