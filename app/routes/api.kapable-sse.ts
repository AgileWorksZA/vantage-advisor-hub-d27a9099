/**
 * BFF SSE proxy for Kapable real-time updates.
 * GET /api/kapable-sse?tables=advisor_notifications
 *
 * Proxies the Kapable platform SSE endpoint, adding auth server-side.
 * Clients connect to this route and receive real-time change events.
 */
import type { LoaderFunctionArgs } from "react-router";
import { requireAuth } from "@/lib/session.server";

const KAPABLE_API = process.env["KAPABLE_API_URL"] || "https://api.kapable.dev";
const DATA_KEY = process.env["KAPABLE_DATA_KEY"] || "";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);

  const url = new URL(request.url);
  const tables = url.searchParams.get("tables") || "";

  const sseUrl = `${KAPABLE_API}/v1/sse?tables=${encodeURIComponent(tables)}`;

  const upstream = await fetch(sseUrl, {
    headers: {
      "x-api-key": DATA_KEY,
      "Accept": "text/event-stream",
    },
    signal: request.signal,
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("SSE connection failed", { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
