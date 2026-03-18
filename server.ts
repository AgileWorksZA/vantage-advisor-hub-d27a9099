import { createRequestHandler } from "react-router";

const BUILD_DIR = "./build";
const PORT = Number(process.env["PORT"] || "3000");

const build = await import(`${BUILD_DIR}/server/index.js`);
const handler = createRequestHandler(build as any);

const server = Bun.serve({
  port: PORT,
  idleTimeout: 120,

  async fetch(req) {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === "/health") {
      return new Response("ok", { status: 200 });
    }

    // Static assets from build/client
    const staticPath = `${BUILD_DIR}/client${url.pathname}`;
    const file = Bun.file(staticPath);
    if (await file.exists()) {
      return new Response(file);
    }

    // React Router SSR
    return handler(req);
  },
});

console.log(`Vantage Advisor Hub running on http://localhost:${server.port}`);
