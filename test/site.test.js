import assert from "node:assert/strict";
import test from "node:test";
import { getSiteUrl } from "../src/lib/site.js";

test("uses the local Astro origin when SITE_URL is absent", () => {
	assert.equal(getSiteUrl({}).href, "http://localhost:4321/");
});

test("uses the configured production origin", () => {
	assert.equal(getSiteUrl({ SITE_URL: "https://example.com/app" }).href, "https://example.com/app");
});

test("rejects an invalid configured origin", () => {
	assert.throws(() => getSiteUrl({ SITE_URL: "not a URL" }), {
		code: "ERR_INVALID_URL",
	});
});
