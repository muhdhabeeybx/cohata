import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isNetlify = process.env.NETLIFY === "true";

export default defineConfig({
	...(isNetlify ? { cloudflare: false } : {}),
	server: {
		allowedHosts: ["1569-102-91-4-70.ngrok-free.app"],
	},
});
