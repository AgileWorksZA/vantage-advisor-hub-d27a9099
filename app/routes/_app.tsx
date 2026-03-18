import { Outlet, useLoaderData } from "react-router";
import { requireAuth } from "@/lib/session.server";

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
  return <Outlet />;
}
