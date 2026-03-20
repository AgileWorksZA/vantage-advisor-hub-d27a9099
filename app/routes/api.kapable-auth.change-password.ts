/**
 * BFF proxy for Kapable auth password change.
 * PUT /api/kapable-auth/change-password
 *
 * Reads the session token from the httpOnly cookie and forwards
 * to PUT /v1/auth/password on the Kapable API.
 */
import type { ActionFunctionArgs } from "react-router";
import { getSession } from "@/lib/session.server";

const KAPABLE_API = process.env["KAPABLE_API_URL"] || "https://api.kapable.dev";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  const sessionToken = session.get("sessionToken");

  if (!sessionToken) {
    return Response.json(
      { error: { message: "Not authenticated" } },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { current_password, new_password } = body as {
    current_password?: string;
    new_password: string;
  };

  // If no current_password provided, we can't call the API
  // TODO: Add current password field to the account settings form
  if (!current_password) {
    return Response.json(
      { error: { message: "Current password is required. Please add it to the form." } },
      { status: 400 },
    );
  }

  const res = await fetch(`${KAPABLE_API}/v1/auth/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-session-token": sessionToken,
    },
    body: JSON.stringify({ current_password, new_password }),
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
