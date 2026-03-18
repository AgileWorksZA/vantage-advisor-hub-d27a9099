import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";

const PORT = parseInt(process.env["PORT"] || "3000", 10);
const DIST = join(import.meta.dir, "dist");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
};

const indexHtml = readFileSync(join(DIST, "index.html"), "utf-8");

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Try serving static file from dist/
    const filePath = join(DIST, pathname);
    if (pathname !== "/" && existsSync(filePath)) {
      const ext = extname(pathname);
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
        },
      });
    }

    // SPA fallback — serve index.html for all non-file routes
    return new Response(indexHtml, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache",
      },
    });
  },
});

console.log(`Vantage Advisor Hub running on http://localhost:${PORT}`);
