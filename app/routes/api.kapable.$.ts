/**
 * BFF proxy for Kapable Data API.
 *
 * All client-side data requests route through here:
 *   GET  /api/kapable/clients?order=created_at.desc  →  GET  https://api.kapable.dev/v1/clients?order=created_at.desc
 *   POST /api/kapable/clients                         →  POST https://api.kapable.dev/v1/clients
 *
 * Auth: verifies session cookie, adds x-api-key header server-side.
 * The data key never reaches the browser.
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { requireAuth } from "@/lib/session.server";

const KAPABLE_API = process.env["KAPABLE_API_URL"] || "https://api.kapable.dev";
const DATA_KEY = process.env["KAPABLE_DATA_KEY"] || "";

async function proxyToKapable(request: Request, params: Record<string, string | undefined>) {
  // Verify the user is logged in
  await requireAuth(request);

  const path = params["*"] || "";
  const url = new URL(request.url);

  const headers: Record<string, string> = {
    "x-api-key": DATA_KEY,
  };

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "DELETE") {
    body = await request.text();
    if (body) headers["Content-Type"] = "application/json";
  }

  const targetUrl = `${KAPABLE_API}/v1/${path}${url.search}`;

  const res = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  });

  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  return proxyToKapable(request, params);
}

export async function action({ request, params }: ActionFunctionArgs) {
  return proxyToKapable(request, params);
}
