/**
 * Kapable auth context — provides userId, orgId, etc. to client-side hooks.
 *
 * Replaces `supabase.auth.getUser()` pattern.
 * Values come from the _app.tsx layout loader (which reads the session cookie server-side).
 */
import { createContext, useContext, type ReactNode } from "react";

interface KapableAuthContext {
  userId: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  orgName: string;
}

const AuthContext = createContext<KapableAuthContext | null>(null);

interface KapableAuthProviderProps {
  children: ReactNode;
  value: KapableAuthContext;
}

export function KapableAuthProvider({ children, value }: KapableAuthProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const EMPTY_AUTH: KapableAuthContext = {
  userId: "",
  email: "",
  name: "",
  role: "",
  orgId: "",
  orgName: "",
};

export function useKapableAuth(): KapableAuthContext {
  const ctx = useContext(AuthContext);
  // Return empty context when outside provider (e.g., RegionContext in root.tsx)
  // Hooks check for empty userId before making API calls
  return ctx ?? EMPTY_AUTH;
}
