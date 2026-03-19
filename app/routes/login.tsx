import { Form, useActionData, useNavigation, Link } from "react-router";
import { createSessionAuth } from "@/lib/session.server";

const KAPABLE_API = "https://api.kapable.dev";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const orgSlug = (formData.get("orgSlug") as string)?.trim() || "vantage";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const res = await fetch(`${KAPABLE_API}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, org_slug: orgSlug }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: (err as any).error?.message || `Login failed (${res.status})` };
    }

    const data = await res.json();
    const result = data as {
      session_token: string;
      user: { id: string; email: string; name: string; role: string };
      org: { id: string; name: string };
    };

    return createSessionAuth(
      result.session_token,
      result.user.id,
      result.user.email,
      result.user.name || result.user.email,
      result.user.role,
      result.org.id,
      result.org.name,
      "/dashboard",
    );
  } catch (err) {
    return { error: "Unable to connect to authentication service" };
  }
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/lovable-uploads/655f440e-cf4a-4a4a-9a15-f0dc1ce60a34.png"
            alt="Vantage logo"
            className="h-10 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your advisor account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <Form method="post" className="space-y-5">
            <input type="hidden" name="orgSlug" value="agileworks" />

            {actionData?.error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
                {actionData.error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition text-sm"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Powered by{" "}
              <a href="https://kapable.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">
                Kapable
              </a>
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center space-x-4 text-xs text-gray-400">
          <Link to="/terms-of-use" className="hover:text-gray-600">Terms of Use</Link>
          <Link to="/privacy-notice" className="hover:text-gray-600">Privacy Notice</Link>
          <Link to="/" className="hover:text-gray-600">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
