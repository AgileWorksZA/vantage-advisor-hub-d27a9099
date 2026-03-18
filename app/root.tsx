import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./app.css";

export function links() {
  return [
    { rel: "icon", href: "/lovable-uploads/655f440e-cf4a-4a4a-9a15-f0dc1ce60a34.png", type: "image/png" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap",
    },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Vantage | Investment Platform for Financial Advisers</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <ClientProviders><Outlet /></ClientProviders>;
}

// Client-only providers — these use localStorage which is not available during SSR.
// We lazy-load them so the SSR pass renders a minimal shell, then hydration activates them.
import { useEffect, useState, type ReactNode } from "react";

function ClientProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // During SSR and initial hydration, render children without client-only providers
    return <>{children}</>;
  }

  // Lazy-load providers only on the client
  return <ClientProvidersInner>{children}</ClientProvidersInner>;
}

// This component is only ever rendered on the client
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { RegionProvider } from "@/contexts/RegionContext";
import { PageContextProvider } from "@/contexts/PageContext";
import { AppModeProvider } from "@/contexts/AppModeContext";

const queryClient = new QueryClient();

function ClientProvidersInner({ children }: { children: ReactNode }) {
  return (
    <RegionProvider>
      <PageContextProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AppModeProvider>
                <Toaster />
                <Sonner />
                {children}
              </AppModeProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </PageContextProvider>
    </RegionProvider>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred. Please try refreshing the page.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Page not found" : "Error";
    details = error.status === 404
      ? "The page you're looking for doesn't exist."
      : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{message}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{details}</p>
      </div>
    </main>
  );
}
