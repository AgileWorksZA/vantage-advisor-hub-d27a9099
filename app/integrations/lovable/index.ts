// Lovable auth integration — disabled after Kapable migration.
// OAuth is now handled by the Kapable auth system.

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: "google" | "apple", _opts?: SignInOptions) => {
      // TODO: Replace with Kapable OAuth flow
      console.warn("lovable.auth.signInWithOAuth is disabled — use Kapable auth instead");
      return { error: new Error("Lovable OAuth disabled — use Kapable auth") };
    },
  },
};
