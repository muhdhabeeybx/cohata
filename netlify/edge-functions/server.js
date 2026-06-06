import server from "../../dist/server/server.js";

export default async (request, context) => {
  return server.fetch(request, { context });
};

export const config = {
  path: "/*",
  excludedPath: ["/_next/*", "/favicon.ico"],
};
