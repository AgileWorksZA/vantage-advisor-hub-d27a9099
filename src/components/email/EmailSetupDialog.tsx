import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Mail, Cloud, Settings, CheckCircle2, Loader2 } from "lucide-react";
import { useEmailSettings, EmailProvider, FetchMode } from "@/hooks/useEmailSettings";
import { cn } from "@/lib/utils";

interface EmailSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const providers = [
  {
    id: "gmail" as EmailProvider,
    name: "Gmail (Google SSO)",
    description: "Sign in with your Google account",
    icon: Mail,
    color: "text-red-500",
  },
  {
    id: "microsoft" as EmailProvider,
    name: "Microsoft 365 / Outlook",
    description: "Sign in with Microsoft account",
    icon: Cloud,
    color: "text-blue-500",
  },
  {
    id: "imap" as EmailProvider,
    name: "IMAP/POP3 (Other providers)",
    description: "Manual server configuration",
    icon: Settings,
    color: "text-muted-foreground",
  },
];

export const EmailSetupDialog = ({ open, onOpenChange }: EmailSetupDialogProps) => {
  const { settings, isConnected, saveSettings, disconnectEmail } = useEmailSettings();
  
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(
    settings?.provider || null
  );
  const [fetchMode, setFetchMode] = useState<FetchMode>(
    settings?.fetch_mode || "task_pool"
  );
  const [emailAddress, setEmailAddress] = useState(settings?.email_address || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // IMAP settings
  const [imapServer, setImapServer] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [imapPassword, setImapPassword] = useState("");

  const handleProviderSelect = (provider: EmailProvider) => {
    setSelectedProvider(provider);
    // For OAuth providers, we would initiate the OAuth flow here
    // For now, we'll just set the provider
  };

  const handleConnect = async () => {
    if (!selectedProvider || !emailAddress) return;

    setIsSubmitting(true);
    try {
      if (selectedProvider === "gmail" || selectedProvider === "microsoft") {
        // OAuth flow - for now just save the settings
        // In a real implementation, this would redirect to OAuth
        await saveSettings({
          provider: selectedProvider,
          email_address: emailAddress,
          fetch_mode: fetchMode,
          settings: { oauth_pending: true },
        });
      } else {
        // IMAP configuration
        await saveSettings({
          provider: "imap",
          email_address: emailAddress,
          fetch_mode: fetchMode,
          settings: {
            server: imapServer,
            port: parseInt(imapPort),
          },
        });
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsSubmitting(true);
    try {
      await disconnectEmail();
      setSelectedProvider(null);
      setEmailAddress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canConnect = selectedProvider && emailAddress && (
    selectedProvider !== "imap" || (imapServer && imapPort)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Setup</DialogTitle>
          <DialogDescription>
            Connect your email account to sync messages with the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose your email provider:</Label>
            <div className="space-y-2">
              {providers.map((provider) => {
                const isSelected = selectedProvider === provider.id;
                const isCurrentlyConnected = isConnected && settings?.provider === provider.id;
                
                return (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <provider.icon className={cn("w-5 h-5", provider.color)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{provider.name}</span>
                        {isCurrentlyConnected && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {provider.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Address Input */}
          {selectedProvider && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
          )}

          {/* IMAP Settings */}
          {selectedProvider === "imap" && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="imap-server">IMAP Server</Label>
                  <Input
                    id="imap-server"
                    placeholder="imap.example.com"
                    value={imapServer}
                    onChange={(e) => setImapServer(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imap-port">Port</Label>
                  <Input
                    id="imap-port"
                    placeholder="993"
                    value={imapPort}
                    onChange={(e) => setImapPort(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imap-password">Password</Label>
                <Input
                  id="imap-password"
                  type="password"
                  placeholder="••••••••"
                  value={imapPassword}
                  onChange={(e) => setImapPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Fetch Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Fetch mode:</Label>
            <RadioGroup
              value={fetchMode}
              onValueChange={(value) => setFetchMode(value as FetchMode)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="inbox" id="inbox-mode" />
                <Label htmlFor="inbox-mode" className="font-normal cursor-pointer">
                  Pull emails into Inbox folder
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="task_pool" id="taskpool-mode" />
                <Label htmlFor="taskpool-mode" className="font-normal cursor-pointer">
                  Collect from Task Pool folder in your mailbox
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isConnected && (
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isSubmitting}
              className="mr-auto"
            >
              Disconnect
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={!canConnect || isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isConnected ? "Update" : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
