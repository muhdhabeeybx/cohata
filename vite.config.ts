import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isNetlify = process.env.NETLIFY === "true";

export default defineConfig({
	...(isNetlify ? { cloudflare: false } : {}),
	build: {
		rollupOptions: {
			external: ["react", "react/jsx-runtime", "react-dom"],
		},
	},
	server: {
		allowedHosts: ["1569-102-91-4-70.ngrok-free.app"],
	},
});
