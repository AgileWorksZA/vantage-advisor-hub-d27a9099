import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  LayoutDashboard, Users, Briefcase, Mail, CalendarIcon, ListTodo, LineChart, Building2, Plus,
  Search, ArrowLeft, User as UserIcon, Settings, 
  Phone, FileText, MessageSquare, Shield, Activity, CreditCard, ShieldCheck, Users2, Building
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { RolesTab } from "@/components/practice/RolesTab";
import { TeamsTab } from "@/components/practice/TeamsTab";
import { BrokerCodesTab } from "@/components/practice/BrokerCodesTab";
import { CommunicationTabEnhanced } from "@/components/practice/CommunicationTabEnhanced";
import { ActivityLogTabEnhanced } from "@/components/practice/ActivityLogTabEnhanced";

// Sample personnel data
const personnelData = [
  { id: "1", name: "Barend Daniel Jordaan", initials: "BD", preferredName: "Danie", role: "Senior Adviser", email: "danie.jordaan@psg.co.za", team: "Danie Jordaan Financial Planning LTD", status: "Active" },
  { id: "2", name: "Mariska Comins", initials: "MC", preferredName: "Mariska", role: "Adviser", email: "mariska.comins@psg.co.za", team: "Mariska Comin Team", status: "Active" },
  { id: "3", name: "Johan van der Berg", initials: "JB", preferredName: "Johan", role: "Support", email: "johan.vdberg@psg.co.za", team: "myPractice & Test", status: "Active" },
  { id: "4", name: "Dale Abels", initials: "DA", preferredName: "Dale", role: "Adviser", email: "dale.abels@psg.co.za", team: "myPractice & Test", status: "Active" },
  { id: "5", name: "Kalpesh Abhangi", initials: "KA", preferredName: "Kalpesh", role: "Compliance", email: "kalpesh.abhangi@psg.co.za", team: "PSL Compliance team", status: "Active" },
  { id: "6", name: "Chad Alexander", initials: "CA", preferredName: "Chad", role: "Adviser", email: "chad.alexander@psg.co.za", team: "myPractice & Test", status: "Inactive" },
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

const settingsTabs = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "roles", label: "Roles", icon: ShieldCheck },
  { id: "teams", label: "Teams", icon: Users2 },
  { id: "broker-codes", label: "Broker Codes", icon: Building },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "integrations", label: "Integrations", icon: CreditCard },
  { id: "voip", label: "VoIP", icon: Phone },
  { id: "referrals", label: "Referrals", icon: Shield },
  { id: "mailbox", label: "Mailbox", icon: Mail },
  { id: "activity", label: "Activity Log", icon: Activity },
];

const Practice = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<typeof personnelData[0] | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";
  const filteredPersonnel = personnelData.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4"
          onClick={() => navigate("/command-center")}
          title="Practice Overview"
        >
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${
              item.path === "/practice"
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
          onAccountSettings={() => {}}
        />

        {/* Content - Scrollable */}
        <main className="flex-1 p-6 overflow-auto">
          {!selectedPerson ? (
            <PersonnelList 
              personnel={filteredPersonnel} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectPerson={setSelectedPerson} 
            />
          ) : (
            <PersonnelSettings 
              person={selectedPerson}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onBack={() => setSelectedPerson(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Personnel List Component
const PersonnelList = ({ 
  personnel, 
  searchQuery, 
  setSearchQuery, 
  onSelectPerson 
}: { 
  personnel: typeof personnelData; 
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectPerson: (p: typeof personnelData[0]) => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Practice Settings</h1>
        <p className="text-muted-foreground">Manage your practice personnel and their settings</p>
      </div>
      <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]">
        <Plus className="w-4 h-4 mr-2" />
        Add Team Member
      </Button>
    </div>

    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Team Members</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search team members..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Team</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {personnel.map((person, index) => (
                <tr key={person.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3">{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[hsl(180,70%,45%)] text-white text-xs flex items-center justify-center font-medium">
                        {person.initials}
                      </span>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-xs text-muted-foreground">"{person.preferredName}"</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{person.role}</td>
                  <td className="py-3 text-muted-foreground">{person.email}</td>
                  <td className="py-3 text-[hsl(180,70%,45%)]">{person.team}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      person.status === "Active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSelectPerson(person)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Personnel Settings Component
const PersonnelSettings = ({ 
  person, 
  activeTab, 
  setActiveTab, 
  onBack 
}: { 
  person: typeof personnelData[0];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBack: () => void;
}) => (
  <div>
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-[hsl(180,70%,45%)] text-white flex items-center justify-center font-medium">
          {person.initials}
        </span>
        <div>
          <h1 className="text-xl font-semibold">{person.name}</h1>
          <p className="text-sm text-muted-foreground">{person.role} • {person.team}</p>
        </div>
      </div>
    </div>

    <div className="flex gap-6">
      {/* Settings Sidebar */}
      <div className="w-48 space-y-1">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-[hsl(180,70%,45%)] text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="flex-1">
        <Card>
          <CardContent className="p-6">
            {activeTab === "profile" && <ProfileTab person={person} />}
            {activeTab === "roles" && <RolesTab />}
            {activeTab === "teams" && <TeamsTab />}
            {activeTab === "broker-codes" && <BrokerCodesTab />}
            {activeTab === "preferences" && <PreferencesTab />}
            {activeTab === "communication" && <CommunicationTabEnhanced />}
            {activeTab === "integrations" && <IntegrationsTab />}
            {activeTab === "voip" && <VoIPTab />}
            {activeTab === "referrals" && <ReferralsTab />}
            {activeTab === "mailbox" && <MailboxTab person={person} />}
            {activeTab === "activity" && <ActivityLogTabEnhanced />}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Profile Tab
const ProfileTab = ({ person }: { person: typeof personnelData[0] }) => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Profile</h2>
      <Button>Save changes</Button>
    </div>

    <div className="grid grid-cols-2 gap-8">
      {/* Identification Details */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Identification details</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Person type</Label>
            <div className="col-span-2">Individual</div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Identity number</Label>
            <Input className="col-span-2" defaultValue="7905245013084" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Gender</Label>
            <Select defaultValue="male">
              <SelectTrigger className="col-span-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Title</Label>
            <Select defaultValue="mr">
              <SelectTrigger className="col-span-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mr">Mr</SelectItem>
                <SelectItem value="mrs">Mrs</SelectItem>
                <SelectItem value="ms">Ms</SelectItem>
                <SelectItem value="dr">Dr</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Initials</Label>
            <Input className="col-span-2" defaultValue={person.initials} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">First names</Label>
            <Input className="col-span-2" defaultValue={person.name.split(" ").slice(0, -1).join(" ")} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Surname</Label>
            <Input className="col-span-2" defaultValue={person.name.split(" ").pop()} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Preferred name</Label>
            <Input className="col-span-2" defaultValue={person.preferredName} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Birthday</Label>
            <div className="col-span-2 text-muted-foreground">1979-05-24</div>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Contact details</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Home number</Label>
            <Input className="col-span-2" defaultValue="27 82 7762245" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Work number</Label>
            <Input className="col-span-2" defaultValue="27 21 9187300" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Work extension</Label>
            <Input className="col-span-2" defaultValue="9227835" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Cell number</Label>
            <Input className="col-span-2" defaultValue="27 82 7762245" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Fax number</Label>
            <Input className="col-span-2" defaultValue="27 86 6160994" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Email</Label>
            <Input className="col-span-2" defaultValue={person.email} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Work email</Label>
            <Input className="col-span-2" defaultValue={person.email} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Website</Label>
            <Input className="col-span-2" placeholder="Enter website" />
          </div>
        </div>
      </div>
    </div>

    {/* Address Section */}
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Residential address details</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Type</Label>
            <Select defaultValue="physical">
              <SelectTrigger className="col-span-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="postal">Postal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Street</Label>
            <Input className="col-span-2" defaultValue="4 KANNA" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">City / Suburb</Label>
            <Input className="col-span-2" defaultValue="Bellville" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Province</Label>
            <Input className="col-span-2" defaultValue="Western Cape" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Country</Label>
            <Input className="col-span-2" defaultValue="South Africa" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Postal Code</Label>
            <Input className="col-span-2" defaultValue="7530" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Postal address details</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right text-muted-foreground">Same as residential</Label>
            <div className="col-span-2">
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Preferences Tab
const PreferencesTab = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Preferences</h2>
      <Button>Save changes</Button>
    </div>

    <div className="space-y-6">
      <h3 className="font-medium text-lg">General</h3>
      <div className="grid gap-4 max-w-xl">
        <div className="grid grid-cols-2 items-center gap-4">
          <Label className="text-muted-foreground">Default starting page</Label>
          <Select defaultValue="tasks">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <Label className="text-muted-foreground">Reporting password for Excel files</Label>
          <div className="flex gap-2">
            <Input type="password" placeholder="Leave blank to keep current" />
            <Button variant="outline" size="sm">Use OTP</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <Label className="text-muted-foreground">SLA Rating to use</Label>
          <Select defaultValue="custom">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Rating</SelectItem>
              <SelectItem value="standard">Standard Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <Label className="text-muted-foreground">Hide cellphone nr on portal</Label>
          <Select defaultValue="no">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <Label className="text-muted-foreground">Portal login preference</Label>
          <Select defaultValue="mypsg">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mypsg">myPSG</SelectItem>
              <SelectItem value="ibase">iBase</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <Label className="text-muted-foreground">OTP delivery method</Label>
          <Select defaultValue="sms">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="app">Authenticator App</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <Label className="text-muted-foreground">Auto complete document workflows</Label>
          <Select defaultValue="no">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <h3 className="font-medium text-lg">Social</h3>
      <p className="text-sm text-muted-foreground">Control visibility of your social media details on portals.</p>
      <div className="grid gap-4 max-w-xl">
        {["Facebook", "LinkedIn", "Skype", "Twitter", "YouTube"].map((social) => (
          <div key={social} className="grid grid-cols-2 items-center gap-4">
            <Label className="text-muted-foreground">Hide {social} address on portal</Label>
            <Select defaultValue="yes">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Communication Tab
const CommunicationTab = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Communication</h2>
      <Button>Save changes</Button>
    </div>

    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3 className="font-medium text-lg">General</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">External leads</Label>
            <div className="flex items-center gap-2">
              <Select defaultValue="yes">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Allow public facing website leads</p>

          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Default filter</Label>
            <div className="flex items-center gap-2">
              <Select defaultValue="yes">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">+ Add filter</Button>
            </div>
          </div>
        </div>

        <h3 className="font-medium text-lg mt-6">Notification options</h3>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-muted-foreground">Delay import failure notifications on weekends</Label>
            <p className="text-xs text-muted-foreground">Import notifications generated after 17:00 on a Friday will be delayed until 07:00 on the following Monday</p>
          </div>
          <Select defaultValue="yes">
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-medium text-lg">SMS</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">SMS functionality</Label>
            <Select defaultValue="yes">
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">SMS local cost: 0.25 VAT Excl.</p>

          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Enable prospect SMS</Label>
            <Select defaultValue="no">
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <h3 className="font-medium text-lg mt-6">Client birthdays</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Enable birthday email</Label>
            <div className="flex items-center gap-2">
              <Select defaultValue="yes">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Enable birthday SMS</Label>
            <div className="flex items-center gap-2">
              <Select defaultValue="yes">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="font-medium text-lg">Notification subscriptions</h3>
      <p className="text-sm text-muted-foreground">
        To receive a notification, please tick the relevant checkbox. Entering an e-mail address per notification will override your own e-mail address as the recipient.
      </p>
      <div className="grid gap-3 max-w-xl">
        {[
          "Variance recon notifications",
          "Entity verification emails",
          "Client detail changes made on portal",
          "Client detail changes made by user",
          "Receive SMS notifications",
          "Import failure notifications",
          "Receive review date due emails"
        ].map((notification) => (
          <div key={notification} className="flex items-center gap-3">
            <Checkbox id={notification} />
            <Label htmlFor={notification} className="text-sm">{notification}</Label>
            <Input className="flex-1" placeholder="Override email (optional)" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Integrations Tab
const IntegrationsTab = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Integrations</h2>
      <Button>Save changes</Button>
    </div>

    <div className="space-y-6">
      <h3 className="font-medium text-lg">Astute Life</h3>
      <p className="text-sm text-muted-foreground">Please note that Astute life and risk updates will be charged to your Astute username at the normal cost.</p>
      <div className="grid gap-4 max-w-xl">
        <div className="flex items-center gap-4">
          <Label className="w-48 text-muted-foreground">Accept Astute disclaimer</Label>
          <span>Yes</span>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label className="text-muted-foreground">Astute username</Label>
          <Input className="col-span-2" defaultValue="DJordaan" />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label className="text-muted-foreground">Password</Label>
          <Input className="col-span-2" type="password" placeholder="Leave blank to keep current" />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label className="text-muted-foreground">Confirm password</Label>
          <Input className="col-span-2" type="password" />
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <h3 className="font-medium text-lg">PSG Securities</h3>
      <div className="grid gap-4 max-w-xl">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label className="text-muted-foreground">PSG Securities username</Label>
          <Input className="col-span-2" placeholder="Enter username" />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label className="text-muted-foreground">Password</Label>
          <Input className="col-span-2" type="password" placeholder="Enter password" />
        </div>
      </div>
    </div>
  </div>
);

// VoIP Tab
const VoIPTab = () => (
  <div className="space-y-8">
    <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">VoIP</h2>

    <div className="space-y-4">
      <h3 className="font-medium text-lg">Team members</h3>
      <p className="text-sm text-muted-foreground">
        Allow a team member to access your VoIP calls by clicking on the icon in the 'Access' column
      </p>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-muted-foreground">102 items</span>
        <Select defaultValue="selected">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="With selected items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="selected">With selected items</SelectItem>
            <SelectItem value="all">All items</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">Toggle all</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 p-3"><Checkbox /></th>
              <th className="w-10 p-3 text-left">#</th>
              <th className="w-20 p-3 text-left">Access</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Team</th>
            </tr>
          </thead>
          <tbody>
            {personnelData.slice(0, 5).map((member, index) => (
              <tr key={member.id} className="border-t">
                <td className="p-3"><Checkbox /></td>
                <td className="p-3">{index + 1}</td>
                <td className="p-3 text-red-500 font-bold">✕</td>
                <td className="p-3">{member.name}</td>
                <td className="p-3 text-[hsl(180,70%,45%)]">{member.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="font-medium text-lg">Access</h3>
      <p className="text-sm text-muted-foreground">You have access to the calls of the following user(s)</p>
      <div className="text-sm text-muted-foreground">7 items</div>
    </div>
  </div>
);

// Referrals Tab
const ReferralsTab = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Referrals</h2>
      <Button>Save changes</Button>
    </div>

    <p className="text-sm text-muted-foreground">
      These referrals will be displayed on the PFR page titled 'Planning your wealth with PSG'.
    </p>

    <div className="space-y-4">
      <h3 className="font-medium text-lg">General details</h3>
      <div className="grid gap-4 max-w-xl">
        {[
          "Fiduciary Services",
          "Investments",
          "Life and Risk",
          "Medical",
          "Short Term Insurance (Commercial)",
          "Short Term Insurance (Personal)",
          "Stockbroking"
        ].map((service) => (
          <div key={service} className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">{service}</Label>
            <Input className="col-span-2" placeholder="Start typing for options..." />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Mailbox Tab
const MailboxTab = ({ person }: { person: typeof personnelData[0] }) => (
  <div className="space-y-8">
    <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Mailbox settings</h2>

    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <p className="text-sm text-green-800">Account linked for:</p>
      <p className="text-sm text-green-600">{person.email}</p>
    </div>

    <div className="space-y-4">
      <h3 className="font-medium text-lg">Enable mailbox for myPractice</h3>
      <div className="flex items-center gap-4">
        <Button variant="outline">Save changes</Button>
        <Button variant="outline">Remove mailbox access</Button>
        <Button variant="outline">Clear mailbox error</Button>
      </div>
      <div className="flex items-center gap-4">
        <Label className="text-muted-foreground">Enable mailbox</Label>
        <Select defaultValue="yes">
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="font-medium text-lg">Team members</h3>
      <p className="text-sm text-muted-foreground">
        Allow a team member to access your mailbox by clicking on the icon in the 'Access' column
      </p>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 p-3"><Checkbox /></th>
              <th className="w-10 p-3 text-left">#</th>
              <th className="w-20 p-3 text-left">Access</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Team</th>
            </tr>
          </thead>
          <tbody>
            {personnelData.slice(0, 5).map((member, index) => (
              <tr key={member.id} className="border-t">
                <td className="p-3"><Checkbox /></td>
                <td className="p-3">{index + 1}</td>
                <td className="p-3 text-red-500 font-bold">✕</td>
                <td className="p-3">{member.name}</td>
                <td className="p-3 text-[hsl(180,70%,45%)]">{member.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Activity Log Tab
const ActivityLogTab = () => (
  <div className="space-y-8">
    <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Event log</h2>

    <div className="flex items-center gap-4">
      <Button variant="outline">
        <Activity className="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>

    <div className="flex items-center gap-4">
      <Label className="text-muted-foreground">Search By Date:</Label>
      <Input type="date" className="w-40" />
      <span>To</span>
      <Input type="date" className="w-40" />
    </div>

    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">0 items</span>
      <Button variant="outline" size="sm">
        <FileText className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>

    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Subtype</th>
            <th className="p-3 text-left">Entity name</th>
            <th className="p-3 text-left">Entity ID</th>
            <th className="p-3 text-left">Note</th>
            <th className="p-3 text-left">Active person</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={8} className="p-8 text-center text-muted-foreground">
              There are no items that match the given criteria
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default Practice;
