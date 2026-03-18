import { destroySession } from "@/lib/session.server";

export async function action({ request }: { request: Request }) {
  return destroySession(request);
}

export async function loader({ request }: { request: Request }) {
  return destroySession(request);
}
