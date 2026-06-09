import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isNetlify = process.env.NETLIFY === "true";

export default defineConfig({
	...(isNetlify ? { cloudflare: false } : {}),
	server: {
		allowedHosts: ["1569-102-91-4-70.ngrok-free.app", "922a-102-91-105-116.ngrok-free.app"],
		proxy: {
			"/api": {
				target: "http://localhost:3001",
				changeOrigin: true,
			},
		},
	},
});
