import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  userName: string;
  userEmail?: string;
  onSignOut: () => void;
  onAccountSettings?: () => void;
}

export function UserMenu({ userName, userEmail, onSignOut, onAccountSettings }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  // Get initials from userName (first letter of first word)
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleSignOut = () => {
    setOpen(false);
    onSignOut();
  };

  const handleAccountSettings = () => {
    setOpen(false);
    onAccountSettings?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full p-0 hover:bg-transparent"
          title={userName}
        >
          <div className="h-9 w-9 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-base">
            {getInitial(userName)}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-popover border border-border shadow-lg" align="end">
        {/* User Info Header */}
        <div className="flex flex-col items-center py-4 border-b border-border">
          <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-2xl mb-2">
            {getInitial(userName)}
          </div>
          <span className="font-medium text-sm">{userName}</span>
          {userEmail && (
            <span className="text-xs text-purple-500">{userEmail}</span>
          )}
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={handleAccountSettings}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              "hover:bg-muted/50"
            )}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Account Settings</span>
          </button>
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              "hover:bg-muted/50"
            )}
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
