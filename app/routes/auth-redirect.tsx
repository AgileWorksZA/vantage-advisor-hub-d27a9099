import { redirect } from "react-router";

// Redirect legacy /auth to /login
export function loader() {
  return redirect("/login");
}

export default function AuthRedirect() {
  return null;
}
