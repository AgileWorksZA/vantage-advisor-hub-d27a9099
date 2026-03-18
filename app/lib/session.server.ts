import { createCookieSessionStorage, redirect } from "react-router";

const sessionSecret = process.env["SESSION_SECRET"] || "vantage-dev-secret-change-in-production";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__vantage_session",
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env["NODE_ENV"] === "production",
  },
});

export interface AuthContext {
  sessionToken: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  orgName: string;
}

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function requireAuth(request: Request): Promise<AuthContext> {
  const session = await getSession(request);
  const sessionToken = session.get("sessionToken");
  const userId = session.get("userId");

  if (!sessionToken || !userId) {
    throw redirect("/login");
  }

  return {
    sessionToken,
    userId,
    email: session.get("email") ?? "",
    name: session.get("name") ?? "",
    role: session.get("role") ?? "member",
    orgId: session.get("orgId") ?? "",
    orgName: session.get("orgName") ?? "Organization",
  };
}

export async function createSessionAuth(
  sessionToken: string,
  userId: string,
  email: string,
  name: string,
  role: string,
  orgId: string,
  orgName: string,
  redirectTo: string,
) {
  const session = await sessionStorage.getSession();
  session.set("sessionToken", sessionToken);
  session.set("userId", userId);
  session.set("email", email);
  session.set("name", name);
  session.set("role", role);
  session.set("orgId", orgId);
  session.set("orgName", orgName);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function destroySession(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
