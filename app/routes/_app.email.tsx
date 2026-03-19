import { useEffect, useState, useMemo } from "react";
import { useRegion } from "@/contexts/RegionContext";
import { useNavigate, useSearchParams } from "react-router";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  Search,
  PenSquare,
  Inbox,
  RefreshCw,
  FileText,
  Send,
  Clock,
  XCircle,
  FolderArchive,
  Paperclip,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Settings,
  Lightbulb,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { useEmails, Email, EmailListItem } from "@/hooks/useEmails";
import { useEmailSettings } from "@/hooks/useEmailSettings";
import { CommunicationChannel } from "@/hooks/useCommunicationCampaigns";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmailSetupDialog } from "@/components/email/EmailSetupDialog";
import { EmailClientBadges } from "@/components/email/EmailClientBadges";
import { CommunicationTypeSelector } from "@/components/email/CommunicationTypeSelector";
import { ChatInterface } from "@/components/email/ChatInterface";
import { EmailViewDialog } from "@/components/email/EmailViewDialog";
import { cn } from "@/lib/utils";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";


type EmailFolder = Email["folder"];

const folderItems: { icon: React.ComponentType<any>; label: string; folder: EmailFolder | null; indent?: boolean }[] = [
  { icon: Inbox, label: "Inbox", folder: "Inbox" },
  { icon: Inbox, label: "Task Pool", folder: "Task Pool", indent: true },
  { icon: FileText, label: "Draft", folder: "Draft" },
  { icon: Send, label: "Sent", folder: "Sent" },
  { icon: Clock, label: "Queue", folder: "Queue" },
  { icon: XCircle, label: "Failed", folder: "Failed" },
  { icon: FolderArchive, label: "Archived", folder: "Archived" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: LineChart, label: "Portfolio", path: "/portfolio" },
  { icon: Mail, label: "Message", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Workflows", path: "/tasks" },
  { icon: Briefcase, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const EmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { email, name } = useKapableAuth();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState<EmailFolder | null>(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<CommunicationChannel>("Email");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [emailViewOpen, setEmailViewOpen] = useState(false);
  const [filterTasks, setFilterTasks] = useState(false);
  const [filterOpportunities, setFilterOpportunities] = useState(false);

  const contentFilter = filterTasks && filterOpportunities
    ? "has-both" as const
    : filterTasks
    ? "has-tasks" as const
    : filterOpportunities
    ? "has-opportunities" as const
    : "all" as const;

  const { settings: emailSettings, isConnected, loading: settingsLoading } = useEmailSettings();
  
  // Set default folder based on URL param, fetch_mode setting, or default
  useEffect(() => {
    const folderFromUrl = searchParams.get("folder") as EmailFolder | null;
    
    // If we have a folder in URL, always use it (for back navigation)
    if (folderFromUrl && folderItems.some(f => f.folder === folderFromUrl)) {
      if (activeFolder !== folderFromUrl) {
        setActiveFolder(folderFromUrl);
      }
    } else if (!settingsLoading && activeFolder === null) {
      // No URL param - set default based on fetch_mode
      if (emailSettings?.fetch_mode === "inbox") {
        setActiveFolder("Inbox");
      } else {
        // Default to Task Pool if fetch_mode is task_pool or no settings
        setActiveFolder("Task Pool");
      }
    }
  }, [settingsLoading, emailSettings?.fetch_mode, searchParams]);

  const { emails: rawEmails, loading: emailsLoading, isFetching, folderCounts, refetch, triggerFetch, moveToFolder, markAsRead } = useEmails(activeFolder, contentFilter);
  const { selectedRegion } = useRegion();

  // Map region code to country name for jurisdiction filtering
  const regionToCountry: Record<string, string> = {
    ZA: "South Africa",
    AU: "Australia",
    CA: "Canada",
    GB: "United Kingdom",
    US: "United States",
  };

  // Filter emails by jurisdiction (country_of_issue), not by advisor
  const emails = useMemo(() => {
    const selectedCountry = regionToCountry[selectedRegion];
    return rawEmails.filter(email => {
      // Emails not matched to any client remain visible
      if (!email.clientCountry) return true;
      // Emails matched to a client must match the selected jurisdiction
      return email.clientCountry === selectedCountry;
    });
  }, [rawEmails, selectedRegion]);

  const handleEmailClick = (email: EmailListItem) => {
    // Navigate to the full-page email view
    if (!email.isRead) {
      markAsRead([email.id], true);
    }
    navigate(`/email/view/${email.id}`);
  };

  const handleSignOut = () => {
    navigate("/logout");
  };

  const toggleEmailSelection = (id: string) => {
    setSelectedEmails((prev) =>
      prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]
    );
  };

  const userName = name || "Adviser";
  const userEmail = email || "adviser@vantage.co";

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4" onClick={() => navigate("/command-center")} title="Practice Overview">
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${
              item.path === "/email"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* Spacer to push logo to bottom */}
        <div className="flex-1" />
        
        {/* VANTAGE Logo - rotated to read bottom to top */}
        <div className="mb-2 overflow-visible">
          <img 
            src={vantageLogo} 
            alt="Vantage" 
            className="h-[96px] w-auto object-contain -rotate-90 origin-center"
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Sticky */}
        <AppHeader
          searchPlaceholder="Search..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/account-settings")}
        />

        {/* Header with Channel Tabs - OUTSIDE main, consistent position */}
        <div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-background">
          {/* Left side: Channel tabs */}
          <CommunicationTypeSelector value={activeChannel} onChange={setActiveChannel} />

          {/* Right side: Content filters, Date, Filter, Setup, Refresh */}
          <div className="flex items-center gap-2">
            <Button
              variant={filterTasks ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 gap-1.5",
                filterTasks && "bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white border-transparent"
              )}
              onClick={() => setFilterTasks(!filterTasks)}
            >
              <ListTodo className="w-4 h-4" />
              Tasks
            </Button>
            <Button
              variant={filterOpportunities ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 gap-1.5",
                filterOpportunities && "bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white border-transparent"
              )}
              onClick={() => setFilterOpportunities(!filterOpportunities)}
            >
              <Lightbulb className="w-4 h-4" />
              Opportunities
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="outline" size="sm" className="h-8">
              <Calendar className="w-4 h-4 mr-1" />
              Date selection
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Filter className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setSetupDialogOpen(true)}
              title="Communication Setup"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => triggerFetch()}
              disabled={isFetching}
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Communication Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Email Folders Sidebar - only show for Email channel */}
          {activeChannel === "Email" && (
            <div className="w-72 bg-background border-r border-border flex flex-col">
              {/* Search - Top position to align with other channels */}
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search emails..." className="pl-10 h-9" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 flex flex-wrap gap-2 border-b border-border">
                <Button 
                  size="sm" 
                  className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
                  onClick={() => navigate("/email/compose")}
                >
                  <PenSquare className="w-4 h-4 mr-1" />
                  Compose
                </Button>
              </div>

              {/* Folder List */}
              <div className="flex-1 py-2">
                {folderItems.map((folder) => (
                  <button
                    key={folder.label}
                    onClick={() => {
                      if (folder.folder) {
                        setActiveFolder(folder.folder);
                        triggerFetch();
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 py-2 text-sm",
                      folder.indent ? "pl-8 pr-4" : "px-4",
                      activeFolder === folder.folder
                        ? "text-[hsl(180,70%,45%)] bg-[hsl(180,70%,45%)]/10"
                        : "text-foreground hover:bg-muted/50"
                    )}
                  >
                    <folder.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{folder.label}</span>
                    {folder.folder && folderCounts[folder.folder] !== undefined && folderCounts[folder.folder] > 0 && (
                      <span className="text-[hsl(180,70%,45%)] font-medium">{folderCounts[folder.folder]}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Email Address - Below Archived with top border */}
              <div className="p-4">
                {isConnected && emailSettings?.email_address ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {emailSettings.email_address}
                  </p>
                ) : (
                  <button
                    onClick={() => setSetupDialogOpen(true)}
                    className="text-sm text-muted-foreground italic truncate text-left hover:text-foreground transition-colors"
                  >
                    No email linked
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Content based on active channel */}
            {activeChannel === "Email" ? (
              <>
                {/* Email Table */}
                <div className="flex-1 overflow-auto">
                  {emailsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 sticky top-0 z-10">
                         <tr className="border-b border-border">
                          <th className="w-10 py-1.5 px-3"></th>
                          <th className="w-10 py-1.5 px-3"></th>
                          <th className="text-left py-1.5 px-3 font-medium text-muted-foreground">From</th>
                          <th className="text-left py-1.5 px-3 font-medium text-muted-foreground">Subject</th>
                          <th className="text-left py-1.5 px-3 font-medium text-muted-foreground">
                            <div className="flex items-center gap-1">
                              Received on
                              <span className="text-xs">↓</span>
                            </div>
                          </th>
                          <th className="text-left py-1.5 px-3 font-medium text-muted-foreground">Clients</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emails.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-muted-foreground">
                              No emails in this folder.
                            </td>
                          </tr>
                        ) : (
                          emails.map((email) => (
                            <tr
                              key={email.id}
                              onClick={() => handleEmailClick(email)}
                              className={cn(
                                "border-b border-border hover:bg-muted/30 cursor-pointer transition-colors",
                                !email.isRead && "font-medium bg-muted/10"
                              )}
                            >
                               <td className="py-1.5 px-3" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedEmails.includes(email.id)}
                                  onCheckedChange={() => toggleEmailSelection(email.id)}
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                {email.hasAttachment && (
                                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                                )}
                              </td>
                              <td className="py-1.5 px-3">
                                {email.from}
                              </td>
                              <td className="py-1.5 px-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="truncate">{email.subject}</span>
                                </div>
                              </td>
                              <td className="py-1.5 px-3 text-muted-foreground">{email.receivedOn}</td>
                              <td className="py-1.5 px-3">
                                <EmailClientBadges clients={email.clients} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end gap-2 p-3 border-t border-border text-sm text-muted-foreground">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled>
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span>1 to {emails.length} of {emails.length}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled>
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              /* Chat Interface for WhatsApp/SMS/Push */
              <ChatInterface channel={activeChannel} contentFilter={contentFilter} />
            )}
          </div>
        </main>
      </div>

      {/* Communication Setup Dialog */}
      <EmailSetupDialog
        open={setupDialogOpen}
        onOpenChange={setSetupDialogOpen}
      />

      {/* Email View Dialog */}
      <EmailViewDialog
        open={emailViewOpen}
        onOpenChange={(open) => {
          setEmailViewOpen(open);
          if (!open) {
            // Refresh to update read status
            refetch();
          }
        }}
        emailId={selectedEmailId}
      />
      <GlobalAIChat currentPage="email" />
    </div>
  );
};

export default EmailPage;
