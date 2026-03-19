import { type RouteConfig, route, layout } from "@react-router/dev/routes";

export default [
  // Public routes
  route("/", "routes/_index.tsx"),
  route("/login", "routes/login.tsx"),
  route("/logout", "routes/logout.tsx"),
  route("/auth", "routes/auth-redirect.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/signup-confirmation", "routes/signup-confirmation.tsx"),
  route("/terms-of-use", "routes/terms-of-use.tsx"),
  route("/privacy-notice", "routes/privacy-notice.tsx"),
  route("/paia-manual", "routes/paia-manual.tsx"),
  route("/disclaimer", "routes/disclaimer.tsx"),
  route("/help", "routes/help.tsx"),

  // Kapable BFF proxy (must be before layout routes)
  route("/api/kapable/*", "routes/api.kapable.$.ts"),

  // Protected routes (wrapped in _app layout with auth guard)
  layout("routes/_app.tsx", [
    route("/dashboard", "routes/_app.dashboard.tsx"),
    route("/command-center", "routes/_app.command-center.tsx"),
    route("/clients", "routes/_app.clients.tsx"),
    route("/clients/:clientId", "routes/_app.clients_.$clientId.tsx"),
    route("/portfolio", "routes/_app.portfolio.tsx"),
    route("/email", "routes/_app.email.tsx"),
    route("/email/view/:id", "routes/_app.email-view.$id.tsx"),
    route("/email/compose", "routes/_app.email-compose.tsx"),
    route("/calendar", "routes/_app.calendar.tsx"),
    route("/insights", "routes/_app.insights.tsx"),
    route("/tasks", "routes/_app.tasks.tsx"),
    route("/practice", "routes/_app.practice.tsx"),
    route("/ai-assistant", "routes/_app.ai-assistant.tsx"),
    route("/administration", "routes/_app.administration.tsx"),
    route("/account-settings", "routes/_app.account-settings.tsx"),
    route("/notifications", "routes/_app.notifications.tsx"),
  ]),
] satisfies RouteConfig;
