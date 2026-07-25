const LOCAL_SITE_URL = "http://localhost:4321";

export function getSiteUrl(environment = process.env) {
	return new URL(environment.SITE_URL ?? LOCAL_SITE_URL);
}
