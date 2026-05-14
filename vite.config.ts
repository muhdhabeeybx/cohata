import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isNetlify = process.env.NETLIFY === "true";

export default defineConfig(isNetlify ? { cloudflare: false } : {});
