import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
// Password change uses BFF proxy to Kapable auth API
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  User as UserIcon,
  Shield,
  Globe,
  Bell,
  Mail as MailIcon,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useRegion } from "@/contexts/RegionContext";
import { COMMON_TIMEZONES, getActiveTimezone, getTimezoneAbbreviation } from "@/lib/timezone-utils";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { checkPasswordLeaked } from "@/lib/password-security";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";

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

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be less than 72 characters")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number");

const settingsSections = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "security", label: "Security", icon: Shield },
  { id: "timezone", label: "Timezone & Regional", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "email", label: "Email Settings", icon: MailIcon },
];

const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { email, name } = useKapableAuth();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(searchParams.get("section") || "profile");
  const { selectedRegion } = useRegion();
  const { settings, isLoading: settingsLoading, upsertSettings } = useUserSettings();

  // Profile state
  const [displayName, setDisplayName] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Timezone state
  const [timezone, setTimezone] = useState("");
  const [dateFormat, setDateFormat] = useState("dd/MM/yyyy");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [defaultCalendarView, setDefaultCalendarView] = useState("month");

  // Notification state
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationTaskReminders, setNotificationTaskReminders] = useState(true);
  const [notificationCalendarReminders, setNotificationCalendarReminders] = useState(true);
  const [notificationClientUpdates, setNotificationClientUpdates] = useState(true);
  const [notificationComplianceAlerts, setNotificationComplianceAlerts] = useState(true);
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  const [notificationPushEnabled, setNotificationPushEnabled] = useState(false);
  const [notificationCriticalOnlySound, setNotificationCriticalOnlySound] = useState(false);

  // Email settings state
  const [emailSignature, setEmailSignature] = useState("");
  const [defaultFromPrimaryAdviser, setDefaultFromPrimaryAdviser] = useState(false);

  // Sync settings from DB on load
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.display_name || "");
      setTimezone(settings.timezone || "");
      setDateFormat(settings.date_format || "dd/MM/yyyy");
      setTimeFormat(settings.time_format || "24h");
      setDefaultCalendarView(settings.default_calendar_view || "month");
      setNotificationEmail(settings.notification_email ?? true);
      setNotificationTaskReminders(settings.notification_task_reminders ?? true);
      setNotificationCalendarReminders(settings.notification_calendar_reminders ?? true);
      setNotificationClientUpdates(settings.notification_client_updates ?? true);
      setNotificationComplianceAlerts(settings.notification_compliance_alerts ?? true);
      setNotificationSoundEnabled(settings.notification_sound_enabled ?? true);
      setNotificationPushEnabled(settings.notification_push_enabled ?? false);
      setNotificationCriticalOnlySound(settings.notification_critical_only_sound ?? false);
      setEmailSignature(settings.email_signature || "");
      setDefaultFromPrimaryAdviser(settings.default_from_primary_adviser ?? false);
    }
  }, [settings]);

  const handleSignOut = () => {
    navigate("/logout");
  };

  const handleSaveProfile = () => {
    upsertSettings.mutate({ display_name: displayName });
  };

  const handlePasswordUpdate = async () => {
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // Check if the password has been found in a data breach
      const isLeaked = await checkPasswordLeaked(newPassword);
      if (isLeaked) {
        setPasswordError("This password has been found in a known data breach. Please choose a different password to keep your account secure.");
        setIsUpdatingPassword(false);
        return;
      }

      const res = await fetch("/api/kapable-auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error?.message || "Failed to change password");
      }
      toast({ title: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveTimezone = () => {
    upsertSettings.mutate({
      timezone: timezone || null,
      date_format: dateFormat,
      time_format: timeFormat,
      default_calendar_view: defaultCalendarView,
    });
  };

  const handleSaveNotifications = () => {
    upsertSettings.mutate({
      notification_email: notificationEmail,
      notification_task_reminders: notificationTaskReminders,
      notification_calendar_reminders: notificationCalendarReminders,
      notification_client_updates: notificationClientUpdates,
      notification_compliance_alerts: notificationComplianceAlerts,
      notification_sound_enabled: notificationSoundEnabled,
      notification_push_enabled: notificationPushEnabled,
      notification_critical_only_sound: notificationCriticalOnlySound,
    });
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        toast({
          title: "Push notifications blocked",
          description: "Please enable notifications in your browser settings to use this feature.",
          variant: "destructive",
        });
        return;
      }
    }
    setNotificationPushEnabled(enabled);
  };

  const handleSaveEmailSettings = () => {
    upsertSettings.mutate({
      email_signature: emailSignature || null,
      default_from_primary_adviser: defaultFromPrimaryAdviser,
    });
  };

  const userName = name || "Adviser";
  const userEmail = email || "adviser@vantage.co";
  const activeTimezone = getActiveTimezone(settings?.timezone, selectedRegion);

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar */}
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
            className="w-full flex flex-col items-center py-2 text-xs gap-1 text-white/60 hover:bg-white/5 hover:text-white/80"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div className="mb-2 overflow-visible">
          <img src={vantageLogo} alt="Vantage" className="h-[80px] w-auto object-contain -rotate-90 origin-center" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader
          searchPlaceholder="Search settings..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => {}}
        />

        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-semibold mb-6">Account Settings</h1>

          <div className="flex gap-6">
            {/* Settings Sidebar */}
            <div className="w-48 space-y-1 shrink-0">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === section.id
                      ? "bg-[hsl(180,70%,45%)] text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 max-w-2xl">

              {/* Profile Section */}
              {activeSection === "profile" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-[hsl(180,70%,45%)]">Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input value={userEmail} readOnly className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                      />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={upsertSettings.isPending}>
                      {upsertSettings.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-[hsl(180,70%,45%)]">Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Choose a strong password with at least 8 characters, including uppercase, lowercase, and a number.
                    </p>
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-destructive">{passwordError}</p>
                    )}
                    <Button onClick={handlePasswordUpdate} disabled={isUpdatingPassword || !currentPassword || !newPassword}>
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking security...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Timezone & Regional Section */}
              {activeSection === "timezone" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-[hsl(180,70%,45%)]">Timezone & Regional Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                      <span className="text-muted-foreground">Current timezone: </span>
                      <span className="font-medium">
                        {activeTimezone} ({getTimezoneAbbreviation(activeTimezone)})
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label>Default Timezone</Label>
                      <Select value={timezone || ""} onValueChange={setTimezone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Use jurisdiction default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Use jurisdiction default</SelectItem>
                          {COMMON_TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        If not set, the default for your jurisdiction will be used
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select value={dateFormat} onValueChange={setDateFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                          <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                          <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select value={timeFormat} onValueChange={setTimeFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24-hour</SelectItem>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Default Calendar View</Label>
                      <Select value={defaultCalendarView} onValueChange={setDefaultCalendarView}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSaveTimezone} disabled={upsertSettings.isPending}>
                      {upsertSettings.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-[hsl(180,70%,45%)]">Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Master switch for all email notifications</p>
                      </div>
                      <Switch checked={notificationEmail} onCheckedChange={setNotificationEmail} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Task Reminders</Label>
                        <p className="text-xs text-muted-foreground">Notifications for upcoming and overdue tasks</p>
                      </div>
                      <Switch
                        checked={notificationTaskReminders}
                        onCheckedChange={setNotificationTaskReminders}
                        disabled={!notificationEmail}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Calendar Reminders</Label>
                        <p className="text-xs text-muted-foreground">Notifications for upcoming events</p>
                      </div>
                      <Switch
                        checked={notificationCalendarReminders}
                        onCheckedChange={setNotificationCalendarReminders}
                        disabled={!notificationEmail}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Client Updates</Label>
                        <p className="text-xs text-muted-foreground">Notifications when client data changes</p>
                      </div>
                      <Switch
                        checked={notificationClientUpdates}
                        onCheckedChange={setNotificationClientUpdates}
                        disabled={!notificationEmail}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compliance Alerts</Label>
                        <p className="text-xs text-muted-foreground">Important compliance-related notifications</p>
                      </div>
                      <Switch
                        checked={notificationComplianceAlerts}
                        onCheckedChange={setNotificationComplianceAlerts}
                        disabled={!notificationEmail}
                      />
                    </div>
                    <Separator />

                    <p className="text-sm font-medium text-foreground pt-1">Sound & Push Alerts</p>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notification Sound</Label>
                        <p className="text-xs text-muted-foreground">Play a sound when new notifications arrive</p>
                      </div>
                      <Switch checked={notificationSoundEnabled} onCheckedChange={setNotificationSoundEnabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Critical Alerts Only</Label>
                        <p className="text-xs text-muted-foreground">Only play sound for compliance and urgent alerts</p>
                      </div>
                      <Switch
                        checked={notificationCriticalOnlySound}
                        onCheckedChange={setNotificationCriticalOnlySound}
                        disabled={!notificationSoundEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Browser Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Show desktop notifications for new alerts</p>
                      </div>
                      <Switch checked={notificationPushEnabled} onCheckedChange={handlePushToggle} />
                    </div>

                    <Separator />
                    <Button onClick={handleSaveNotifications} disabled={upsertSettings.isPending}>
                      {upsertSettings.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Notifications
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Email Settings Section */}
              {activeSection === "email" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-[hsl(180,70%,45%)]">Email Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Signature</Label>
                      <Textarea
                        value={emailSignature}
                        onChange={(e) => setEmailSignature(e.target.value)}
                        placeholder="Enter your email signature..."
                        rows={5}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Default From as Primary Adviser</Label>
                        <p className="text-xs text-muted-foreground">
                          Send emails from the primary adviser's email by default
                        </p>
                      </div>
                      <Switch
                        checked={defaultFromPrimaryAdviser}
                        onCheckedChange={setDefaultFromPrimaryAdviser}
                      />
                    </div>
                    <Button onClick={handleSaveEmailSettings} disabled={upsertSettings.isPending}>
                      {upsertSettings.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Email Settings
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
      <GlobalAIChat currentPage="account-settings" />
    </div>
  );
};

export default AccountSettings;
