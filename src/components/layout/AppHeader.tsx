import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdvisorFilter } from "@/components/dashboard/AdvisorFilter";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import { RegionSelector } from "@/components/dashboard/RegionSelector";
import { UserMenu } from "@/components/dashboard/UserMenu";

interface AppHeaderProps {
  searchPlaceholder?: string;
  userName: string;
  userEmail?: string;
  onSignOut: () => void;
  onAccountSettings?: () => void;
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function AppHeader({
  searchPlaceholder = "Search...",
  userName,
  userEmail,
  onSignOut,
  onAccountSettings,
  selectedRegion = "ZA",
  onRegionChange,
  searchValue,
  onSearchChange,
}: AppHeaderProps) {
  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-10 bg-muted/50 border-0"
          value={searchValue}
          onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
        />
      </div>
      <div className="flex items-center gap-4">
        <AdvisorFilter />
        <NotificationDropdown />
        <RegionSelector
          selectedRegion={selectedRegion}
          onRegionChange={onRegionChange || (() => {})}
        />
        <UserMenu
          userName={userName}
          userEmail={userEmail}
          onSignOut={onSignOut}
          onAccountSettings={onAccountSettings}
        />
      </div>
    </header>
  );
}
