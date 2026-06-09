import server from "../../dist/server/server.js";

export default async (request) => {
  return server.fetch(request);
};
