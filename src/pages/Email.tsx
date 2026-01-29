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
  Mail,
  ListTodo,
  LineChart,
  Building2,
  Plus,
  Search,
  Bell,
  LogOut,
  PenSquare,
  Inbox,
  Archive,
  RefreshCw,
  FileText,
  Send,
  Clock,
  XCircle,
  FolderArchive,
  Unlink,
  Paperclip,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const emailsData = [
  {
    id: 1,
    from: "Wei-Wei Wu",
    subject: "Re: Schedule your Momentic demo",
    receivedOn: "02/09/2025 03:10 PM",
    clients: "Wegner, C (Jonathan)",
    hasAttachment: false,
    isLink: false,
  },
  {
    id: 2,
    from: "Andre Grobbelaar",
    subject: "FW: BEE Certificate",
    receivedOn: "01/09/2025 10:51 AM",
    clients: "Andre Floris Grobbelaar + 2 more clients",
    hasAttachment: true,
    isLink: false,
  },
  {
    id: 3,
    from: "BrightTALK",
    subject: "Watch the latest recommendations from your network",
    receivedOn: "13/08/2025 08:16 AM",
    clients: "Wegner, E (Emile)",
    hasAttachment: false,
    isLink: false,
  },
  {
    id: 4,
    from: "Brandwatch Consumer Research",
    subject: "[Monthly newsletter] New analysis on each generation",
    receivedOn: "01/07/2025 02:29 PM",
    clients: "Wegner, E (Emile)",
    hasAttachment: false,
    isLink: false,
  },
  {
    id: 5,
    from: "Gerhard Richard Edens",
    subject: "Re: AI Agents from InnTelligence on Low-Ops",
    receivedOn: "02/06/2025 02:54 PM",
    clients: "Abrahams, MS (Moira)",
    hasAttachment: true,
    isLink: false,
  },
  {
    id: 6,
    from: "Kobus Sadie",
    subject: "Updates from All Company at Efficient Group Ltd",
    receivedOn: "27/01/2025 10:39 AM",
    clients: "Abrahams, MS (Moira)",
    hasAttachment: false,
    isLink: false,
  },
  {
    id: 7,
    from: "The MongoDB Team",
    subject: "The AI vector search tutorial you've been looking for",
    receivedOn: "04/12/2024 05:17 PM",
    clients: "",
    hasAttachment: false,
    isLink: true,
  },
  {
    id: 8,
    from: "Citywire New Model Adviser",
    subject: "Why FNZ's co-manufacturing label matters to advisers",
    receivedOn: "04/12/2024 01:00 PM",
    clients: "",
    hasAttachment: false,
    isLink: false,
  },
  {
    id: 9,
    from: "Bravura Solutions",
    subject: "Live tomorrow: Intro to Orchestrator: making work flow with intelligent automation",
    receivedOn: "04/12/2024 09:49 AM",
    clients: "",
    hasAttachment: true,
    isLink: false,
  },
  {
    id: 10,
    from: "Citywire New Model Adviser",
    subject: "Asset managers cannot play politics with clients' money",
    receivedOn: "04/12/2024 09:13 AM",
    clients: "",
    hasAttachment: false,
    isLink: true,
  },
  {
    id: 11,
    from: "Professional Adviser",
    subject: "FCA has 'near impossible' job to balance growth and consumer protection",
    receivedOn: "04/12/2024 08:59 AM",
    clients: "",
    hasAttachment: false,
    isLink: true,
  },
  {
    id: 12,
    from: "BrightTALK",
    subject: "Join your colleagues and peers at these presentations",
    receivedOn: "04/12/2024 08:17 AM",
    clients: "",
    hasAttachment: false,
    isLink: false,
  },
];

const folderItems = [
  { icon: Inbox, label: "Task Pool", count: 3, active: true },
  { icon: Inbox, label: "Inbox", count: null, active: false },
  { icon: FileText, label: "Draft", count: null, active: false },
  { icon: Send, label: "Sent", count: null, active: false },
  { icon: Clock, label: "Queue", count: null, active: false },
  { icon: XCircle, label: "Failed", count: null, active: false },
  { icon: FolderArchive, label: "Archived", count: null, active: false },
  { icon: Unlink, label: "Non-linked Archived", count: null, active: false },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const Email = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
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

  const toggleEmailSelection = (id: number) => {
    setSelectedEmails((prev) =>
      prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Adviser";
  const userEmail = user?.email || "user@example.com";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4">
          <Plus className="w-5 h-5" />
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 bg-muted/50 border-0" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">CZ</span>
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">DH</span>
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">EW</span>
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-medium">IN</span>
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">RS</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{userName}</span>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Email Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Email Folders Sidebar */}
          <div className="w-48 bg-background border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
            </div>

            {/* Action Buttons */}
            <div className="p-3 flex flex-wrap gap-2 border-b border-border">
              <Button size="sm" className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white">
                <PenSquare className="w-4 h-4 mr-1" />
                Compose
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Inbox className="w-3 h-3 mr-1" />
                Move to inbox
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Archive className="w-3 h-3 mr-1" />
                Move to archive
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh emails
              </Button>
            </div>

            {/* Folder List */}
            <div className="flex-1 py-2">
              {folderItems.map((folder) => (
                <button
                  key={folder.label}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                    folder.active
                      ? "text-[hsl(180,70%,45%)] bg-[hsl(180,70%,45%)]/10"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <folder.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{folder.label}</span>
                  {folder.count !== null && (
                    <span className="text-[hsl(180,70%,45%)] font-medium">{folder.count}</span>
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
                  {emailsData.map((email) => (
                    <tr
                      key={email.id}
                      className="border-b border-border hover:bg-muted/30 cursor-pointer"
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
                      <td className={`p-3 ${email.isLink ? "text-[hsl(180,70%,45%)]" : ""}`}>
                        {email.from}
                      </td>
                      <td className={`p-3 ${email.isLink ? "text-[hsl(180,70%,45%)]" : ""}`}>
                        {email.subject}
                      </td>
                      <td className={`p-3 ${email.isLink ? "text-[hsl(180,70%,45%)]" : "text-muted-foreground"}`}>
                        {email.receivedOn}
                      </td>
                      <td className="p-3 text-muted-foreground">{email.clients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2 p-3 border-t border-border text-sm text-muted-foreground">
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled>
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span>1 to 12 of 12</span>
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

export default Email;
