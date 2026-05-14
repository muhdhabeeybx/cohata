import server from "../../dist/server/server.js";

export default async (request) => {
  const url = new URL(request.url);
  // Let Netlify's CDN serve static assets — this function should never see them,
  // but guard just in case a rule leaks through.
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".map") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  ) {
    return new Response("Not found", { status: 404 });
  }

  return server.fetch(request);
};

export const config = {
  path: "/*",
};
