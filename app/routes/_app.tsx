import { Outlet, useLoaderData } from "react-router";
import { requireAuth } from "@/lib/session.server";
import { useEffect, useState } from "react";

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

  return <Outlet />;
}
