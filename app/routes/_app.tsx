import { Outlet, useLoaderData } from "react-router";
import { requireAuth } from "@/lib/session.server";
import { useEffect, useState } from "react";
import { KapableAuthProvider } from "@/integrations/kapable/auth-context";

export async function loader({ request }: { request: Request }) {
  const auth = await requireAuth(request);
  return {
    userName: auth.name,
    userEmail: auth.email,
    userRole: auth.role,
    orgId: auth.orgId,
    orgName: auth.orgName,
    userId: auth.userId,
  };
}

export default function AppLayout() {
  const loaderData = useLoaderData<typeof loader>();

  // Child routes are SPA components that use localStorage, supabase.auth, etc.
  // They cannot render during SSR. Wait for client hydration before rendering.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading Vantage...</p>
        </div>
      </div>
    );
  }

  return (
    <KapableAuthProvider
      value={{
        userId: loaderData.userId,
        email: loaderData.userEmail,
        name: loaderData.userName,
        role: loaderData.userRole,
        orgId: loaderData.orgId,
        orgName: loaderData.orgName,
      }}
    >
      <Outlet />
    </KapableAuthProvider>
  );
}
