// @ts-check

import alpinejs from "@astrojs/alpinejs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
	site: "https://sites-deployed.url",
	vite: {
		plugins: [tailwindcss()],
	},
	integrations: [
		mdx(),
		sitemap(),
		alpinejs({ entrypoint: "/src/scripts/alpine-entry" }),
		icon(),
	],
	image: {
		// allow Astro to fetch & optimize images from GitHub’s avatar CDN
		domains: ["avatars.githubusercontent.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				port: "",
				// match any /u/123456… path
				pathname: "/u/**",
			},
		],
	},
	experimental: {
		preserveScriptOrder: true,
	},
});
