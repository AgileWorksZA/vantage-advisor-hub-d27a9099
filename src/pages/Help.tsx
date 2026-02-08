import { Button } from "@/components/ui/button";
import { BookOpen, Users, BarChart3, Mail, CalendarDays, CheckSquare, Bot, Settings, LifeBuoy, Shield, Briefcase } from "lucide-react";

const sections = [
  {
    icon: BookOpen,
    title: "Getting Started",
    content:
      "Welcome to Vantage — your all-in-one practice management platform built for financial advisors. Start by exploring the Dashboard for a snapshot of your practice, or head to Clients to manage your book of business.",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    content:
      "Your Dashboard provides a real-time overview of key practice metrics including AUM, client count, revenue, and upcoming tasks. Use the advisor filter to view data for specific team members, and the region selector to tailor reporting.",
  },
  {
    icon: Users,
    title: "Client Management",
    content:
      "The Clients module lets you manage individual and entity profiles, track relationships, store documents, and view a comprehensive 360° view of each client. You can add contacts, family members, and link related entities.",
  },
  {
    icon: Briefcase,
    title: "Portfolio Management",
    content:
      "View and analyse client investment portfolios, monitor mandate drift, and identify tax-loss harvesting opportunities. The portfolio module integrates with product data to give you a complete picture of client holdings.",
  },
  {
    icon: Mail,
    title: "Communication Tools",
    content:
      "Send and manage emails, SMS, WhatsApp messages, and push notifications from a single inbox. Link communications to clients and tasks for a complete audit trail. Create campaigns to reach multiple clients at once.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Meetings",
    content:
      "Schedule and manage client meetings, set reminders, and record meeting notes. The calendar integrates with your tasks and client records so everything stays connected.",
  },
  {
    icon: CheckSquare,
    title: "Tasks",
    content:
      "Create, assign, and track tasks across your practice. Filter by status, priority, assignee, or client. Link tasks to specific clients and set due dates to stay on top of your workflow.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    content:
      "The Vantage AI Assistant helps you identify opportunities, find at-risk clients, and surface actionable insights. Click the chat bubble on any page to ask questions about your practice data.",
  },
  {
    icon: Shield,
    title: "Command Centre",
    content:
      "The Command Centre surfaces intelligent nudges — compliance alerts, portfolio drift warnings, engagement reminders, and commission discrepancies — so you can act on what matters most.",
  },
  {
    icon: Settings,
    title: "Account Settings",
    content:
      "Manage your profile, change your password, update notification preferences, and configure your practice settings. Administrators can manage team members, roles, and system configuration.",
  },
  {
    icon: LifeBuoy,
    title: "Need More Help?",
    content:
      "If you need further assistance, contact our support team at support@vantage.co.za or book a one-on-one session with our onboarding specialists.",
  },
];

const Help = () => {
  const openCalendly = () => {
    const width = Math.floor(window.screen.width * 0.7);
    const height = Math.floor(window.screen.height * 0.7);
    const left = Math.floor((window.screen.width - width) / 2);
    const top = Math.floor((window.screen.height - height) / 2);

    window.open(
      "https://calendly.com/hello-vantage/30min",
      "calendly",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  return (
    <div className="min-h-screen">
      <header className="bg-background/80 backdrop-blur border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Vantage home">
            <img
              src="/lovable-uploads/7dc6d80a-2f1f-4523-af0c-88abbde31835.png"
              alt="Vantage logo"
              className="h-6 md:h-7 w-auto"
              loading="eager"
            />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/#features" className="text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="/#benefits" className="text-muted-foreground hover:text-foreground">
              Benefits
            </a>
            <a href="/#cases" className="text-muted-foreground hover:text-foreground">
              Case Studies
            </a>
          </nav>
          <Button onClick={openCalendly} variant="default" className="text-sm">
            Book a demo
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">Help & Documentation</h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about using Vantage to manage your practice effectively.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.title}
                  className="flex gap-4 p-6 rounded-xl border border-border bg-card"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-10 bg-foreground">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-background">
          <p>© {new Date().getFullYear()} Vantage. All rights reserved.</p>
          <nav className="flex gap-6">
            <a href="/terms-of-use" className="hover:text-background/80">
              Terms of use
            </a>
            <a href="/privacy-notice" className="hover:text-background/80">
              Privacy Notice
            </a>
            <a href="/paia-manual" className="hover:text-background/80">
              PAIA Manual
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Help;
