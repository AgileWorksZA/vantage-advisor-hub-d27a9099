import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
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
  Archive,
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
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { useEmails, Email } from "@/hooks/useEmails";
import { AppHeader } from "@/components/layout/AppHeader";

type EmailFolder = Email["folder"];

const folderItems: { icon: React.ComponentType<any>; label: string; folder: EmailFolder | null }[] = [
  { icon: Inbox, label: "Task Pool", folder: "Task Pool" },
  { icon: Inbox, label: "Inbox", folder: "Inbox" },
  { icon: FileText, label: "Draft", folder: "Draft" },
  { icon: Send, label: "Sent", folder: "Sent" },
  { icon: Clock, label: "Queue", folder: "Queue" },
  { icon: XCircle, label: "Failed", folder: "Failed" },
  { icon: FolderArchive, label: "Archived", folder: "Archived" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Briefcase, label: "Portfolio", path: "/portfolio" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const EmailPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState<EmailFolder>("Task Pool");

  const { emails, loading: emailsLoading, folderCounts, refetch, moveToFolder, markAsRead } = useEmails(activeFolder);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const toggleEmailSelection = (id: string) => {
    setSelectedEmails((prev) =>
      prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]
    );
  };

  const handleMoveToInbox = async () => {
    if (selectedEmails.length > 0) {
      await moveToFolder(selectedEmails, "Inbox");
      setSelectedEmails([]);
    }
  };

  const handleMoveToArchive = async () => {
    if (selectedEmails.length > 0) {
      await moveToFolder(selectedEmails, "Archived");
      setSelectedEmails([]);
    }
  };

  const loading = authLoading || emailsLoading;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

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
        <div className="mb-2">
          <img 
            src={vantageLogo} 
            alt="Vantage" 
            className="h-10 object-contain -rotate-90 origin-center"
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
          onAccountSettings={() => navigate("/practice")}
        />

        {/* Email Content - Scrollable */}
        <main className="flex-1 flex overflow-hidden">
          {/* Email Folders Sidebar */}
          <div className="w-48 bg-background border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
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
              <Button size="sm" variant="outline" className="text-xs" onClick={handleMoveToInbox} disabled={selectedEmails.length === 0}>
                <Inbox className="w-3 h-3 mr-1" />
                Move to inbox
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={handleMoveToArchive} disabled={selectedEmails.length === 0}>
                <Archive className="w-3 h-3 mr-1" />
                Move to archive
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => refetch()}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh emails
              </Button>
            </div>

            {/* Folder List */}
            <div className="flex-1 py-2">
              {folderItems.map((folder) => (
                <button
                  key={folder.label}
                  onClick={() => folder.folder && setActiveFolder(folder.folder)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                    activeFolder === folder.folder
                      ? "text-[hsl(180,70%,45%)] bg-[hsl(180,70%,45%)]/10"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <folder.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{folder.label}</span>
                  {folder.folder && folderCounts[folder.folder] !== undefined && folderCounts[folder.folder] > 0 && (
                    <span className="text-[hsl(180,70%,45%)] font-medium">{folderCounts[folder.folder]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Email List Header */}
            <div className="flex items-center justify-end gap-2 p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-48 h-8 text-sm" />
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <Calendar className="w-4 h-4 mr-1" />
                Date selection
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Email Table */}
            <div className="flex-1 overflow-auto">
              {emailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 sticky top-0">
                    <tr className="border-b border-border">
                      <th className="w-10 p-3"></th>
                      <th className="w-10 p-3"></th>
                      <th className="text-left p-3 font-medium text-muted-foreground">From</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Subject</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                          Received on
                          <span className="text-xs">↓</span>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Clients</th>
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
                          className={`border-b border-border hover:bg-muted/30 cursor-pointer ${!email.isRead ? "font-medium" : ""}`}
                        >
                          <td className="p-3">
                            <Checkbox
                              checked={selectedEmails.includes(email.id)}
                              onCheckedChange={() => toggleEmailSelection(email.id)}
                            />
                          </td>
                          <td className="p-3">
                            {email.hasAttachment && (
                              <Paperclip className="w-4 h-4 text-muted-foreground" />
                            )}
                          </td>
                          <td className="p-3">{email.from}</td>
                          <td className="p-3">{email.subject}</td>
                          <td className="p-3 text-muted-foreground">{email.receivedOn}</td>
                          <td className="p-3 text-muted-foreground">{email.clients}</td>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmailPage;
