import { useLocation } from "react-router";

const LANDING_PAGES = [
  "/dashboard",
  "/clients",
  "/portfolio",
  "/email",
  "/calendar",
  "/tasks",
  "/insights",
  "/practice",
  "/account-settings",
];

interface SubPageMapping {
  pattern: RegExp;
  parent: string;
  label: string;
}

const SUB_PAGE_MAPPINGS: SubPageMapping[] = [
  { pattern: /^\/clients\/[^/]+/, parent: "/clients", label: "Clients" },
  { pattern: /^\/email\/view\/[^/]+/, parent: "/email", label: "Messages" },
  { pattern: /^\/email\/compose/, parent: "/email", label: "Messages" },
  { pattern: /^\/command-center/, parent: "/dashboard", label: "Dashboard" },
  { pattern: /^\/administration/, parent: "/dashboard", label: "Dashboard" },
  { pattern: /^\/ai-assistant/, parent: "/dashboard", label: "Dashboard" },
];

export function useNavigationWarning() {
  const location = useLocation();
  const pathname = location.pathname;

  const isLandingPage = LANDING_PAGES.some(
    (lp) => pathname === lp || pathname === lp + "/"
  );

  let parentLandingPage = "/dashboard";
  let parentLandingLabel = "Dashboard";

  if (!isLandingPage) {
    const match = SUB_PAGE_MAPPINGS.find((m) => m.pattern.test(pathname));
    if (match) {
      parentLandingPage = match.parent;
      parentLandingLabel = match.label;
    }
  }

  return {
    isLandingPage,
    parentLandingPage,
    parentLandingLabel,
  };
}
