import { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  List, Database, Target, Megaphone, MessageSquare, FileText, 
  Package, TrendingUp, CreditCard, StickyNote, Zap, Settings, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSection {
  id: string;
  label: string;
  icon: React.ElementType;
  tabs?: { id: string; label: string }[];
}

export const adminSections: AdminSection[] = [
  { 
    id: "general-lists", 
    label: "General Lists", 
    icon: List,
    tabs: [
      { id: "advisor-codes", label: "Advisor Codes" },
      { id: "banks", label: "Banks" },
      { id: "currencies", label: "Currencies" },
      { id: "campaigns", label: "Campaigns" },
      { id: "corporate", label: "Corporate" },
      { id: "crm-details", label: "CRM Details" },
      { id: "ibase", label: "iBase" },
      { id: "locations", label: "Locations" },
      { id: "service", label: "Service" },
      { id: "sanction-lists", label: "Sanction Lists" },
      { id: "alternate-providers", label: "Alternate Providers" },
      { id: "sub-agents", label: "Sub Agents" },
      { id: "portfolio-categories", label: "Portfolio Categories" },
      { id: "acquisition-sources", label: "New Acquisition" },
      { id: "sources", label: "Sources" },
      { id: "wealth-sources", label: "Source of Wealth" },
      { id: "fund-sources", label: "Source of Funds" },
    ]
  },
  { 
    id: "data-integrations", 
    label: "Data Integrations", 
    icon: Database,
    tabs: [
      { id: "activity", label: "Activity" },
      { id: "queue", label: "Queue" },
      { id: "alerts", label: "Alerts" },
      { id: "imports", label: "Imports" },
      { id: "checks", label: "Checks" },
      { id: "provider-notifications", label: "Provider Notifications" },
      { id: "provider-contacts", label: "Provider Contacts" },
      { id: "log-backups", label: "Log Backups" },
      { id: "astute", label: "Astute" },
      { id: "fica", label: "FICA" },
    ]
  },
  { 
    id: "planning-tools", 
    label: "Planning Tools", 
    icon: Target,
    tabs: [
      { id: "bucket-settings", label: "Bucket Settings" },
      { id: "goal-categories", label: "Goal Categories" },
      { id: "risk-profiles", label: "Risk Profiles" },
    ]
  },
  { 
    id: "campaign-management", 
    label: "Campaign Management", 
    icon: Megaphone,
    tabs: [
      { id: "templates", label: "Templates" },
      { id: "automation", label: "Automation Rules" },
    ]
  },
  { 
    id: "communication", 
    label: "Communication", 
    icon: MessageSquare,
    tabs: [
      { id: "email", label: "Email Settings" },
      { id: "whatsapp", label: "WhatsApp" },
      { id: "sms", label: "SMS" },
      { id: "push", label: "Push Notifications" },
    ]
  },
  { 
    id: "documents", 
    label: "Documents", 
    icon: FileText,
    tabs: [
      { id: "types", label: "Document Types" },
      { id: "templates", label: "Templates" },
      { id: "signatures", label: "Signatures" },
      { id: "public-upload", label: "Public Upload" },
    ]
  },
  { 
    id: "products", 
    label: "Products", 
    icon: Package,
    tabs: [
      { id: "list", label: "Products List" },
      { id: "classification", label: "Classification" },
      { id: "benefits", label: "Benefits" },
      { id: "providers", label: "Providers" },
    ]
  },
  { 
    id: "funds", 
    label: "Funds & Instruments", 
    icon: TrendingUp,
    tabs: [
      { id: "instruments", label: "Instruments" },
      { id: "exchanges", label: "Exchanges" },
      { id: "sectors", label: "Sectors" },
      { id: "industries", label: "Industries" },
      { id: "unlisted", label: "Unlisted" },
    ]
  },
  { 
    id: "transactions", 
    label: "Transactions", 
    icon: CreditCard,
    tabs: [
      { id: "types", label: "Transaction Types" },
      { id: "processing", label: "Processing Rules" },
    ]
  },
  { 
    id: "notes-tasks", 
    label: "Notes & Tasks", 
    icon: StickyNote,
    tabs: [
      { id: "subjects", label: "Note Subjects" },
      { id: "task-types", label: "Task Types" },
      { id: "priorities", label: "Priorities" },
    ]
  },
  { 
    id: "events", 
    label: "Events", 
    icon: Zap,
    tabs: [
      { id: "list", label: "Events List" },
      { id: "notifications", label: "Notifications" },
      { id: "triggers", label: "Triggers" },
    ]
  },
  { 
    id: "system", 
    label: "System Settings", 
    icon: Settings,
    tabs: [
      { id: "general", label: "General" },
      { id: "audit", label: "Audit" },
      { id: "permissions", label: "Permissions" },
    ]
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { section } = useParams();
  const activeSection = section || "general-lists";

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <div className="w-56 border-r bg-card shrink-0">
        <div className="p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => navigate("/practice")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Practice
          </Button>
        </div>
        <nav className="p-2 space-y-1">
          {adminSections.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/administration/${item.id}`)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
