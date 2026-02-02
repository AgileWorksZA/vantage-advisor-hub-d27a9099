import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const notificationCategories = [
  {
    title: "System Notifications",
    notifications: [
      { id: "variance_recon", label: "Variance recon notifications", enabled: true },
      { id: "entity_verification", label: "Entity verification emails", enabled: true },
      { id: "import_failure", label: "Import failure notifications", enabled: false },
    ]
  },
  {
    title: "Client Notifications",
    notifications: [
      { id: "client_portal_changes", label: "Client detail changes made on portal", enabled: true },
      { id: "client_user_changes", label: "Client detail changes made by user", enabled: false },
      { id: "review_date_due", label: "Receive review date due emails", enabled: true },
    ]
  },
  {
    title: "Communication",
    notifications: [
      { id: "sms_notifications", label: "Receive SMS notifications", enabled: true },
      { id: "email_notifications", label: "Receive email notifications", enabled: true },
      { id: "push_notifications", label: "Receive push notifications", enabled: false },
    ]
  },
  {
    title: "Workflow Notifications",
    notifications: [
      { id: "workflow_assigned", label: "Workflow assigned to me", enabled: true },
      { id: "workflow_completed", label: "Workflow completed", enabled: true },
      { id: "workflow_overdue", label: "Workflow overdue alerts", enabled: true },
    ]
  },
];

const defaultSignature = `Kind regards,

Danie Jordaan
Senior Financial Adviser
PSG Wealth | Tygervalley

Tel: +27 21 918 7300
Cell: +27 82 776 2245
Email: danie.jordaan@psg.co.za

PSG Wealth is an authorised financial services provider. FSP 728`;

export const CommunicationTabEnhanced = () => {
  const [notifications, setNotifications] = useState(
    notificationCategories.flatMap(cat => cat.notifications)
  );
  const [signature, setSignature] = useState(defaultSignature);

  const toggleNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, enabled: !n.enabled } : n
      )
    );
  };

  const getNotificationState = (id: string) => {
    return notifications.find(n => n.id === id)?.enabled || false;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Communication</h2>
        <Button>Save changes</Button>
      </div>

      {/* Notification Activation Section */}
      <div className="space-y-6">
        <h3 className="font-medium text-lg">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Manage which notifications you want to receive. Toggle each notification type on or off based on your preferences.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {notificationCategories.map((category) => (
            <Card key={category.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between"
                  >
                    <Label
                      htmlFor={notification.id}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {notification.label}
                    </Label>
                    <Switch
                      id={notification.id}
                      checked={getNotificationState(notification.id)}
                      onCheckedChange={() => toggleNotification(notification.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Original Communication Settings */}
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

      {/* Email Signature Section */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Email Signature</h3>
        <p className="text-sm text-muted-foreground">
          Configure your default email signature that will be appended to outgoing emails.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Edit Signature</Label>
            <Textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="Enter your email signature..."
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSignature(defaultSignature)}>
                Reset to Default
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/30 min-h-[200px]">
              <pre className="text-sm whitespace-pre-wrap font-sans">{signature}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Subscriptions with Override Email */}
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
};
