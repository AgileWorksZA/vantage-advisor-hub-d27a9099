import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdvisorFilter } from "@/components/dashboard/AdvisorFilter";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import { RegionSelector } from "@/components/dashboard/RegionSelector";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { ClientAutocompleteDropdown } from "@/components/clients/ClientAutocompleteDropdown";
import { ClientListItem } from "@/hooks/useClients";

interface AppHeaderProps {
  searchPlaceholder?: string;
  userName: string;
  userEmail?: string;
  onSignOut: () => void;
  onAccountSettings?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  enableClientSearch?: boolean;
}

export function AppHeader({
  searchPlaceholder = "Search clients...",
  userName,
  userEmail,
  onSignOut,
  onAccountSettings,
  searchValue,
  onSearchChange,
  enableClientSearch = true,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [internalSearch, setInternalSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use external or internal search state
  const currentSearch = searchValue !== undefined ? searchValue : internalSearch;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) onSearchChange(value);
    else setInternalSearch(value);
    setIsDropdownOpen(value.length >= 2);
  };

  const handleClientSelect = (client: ClientListItem) => {
    setIsDropdownOpen(false);
    setInternalSearch("");
    if (onSearchChange) onSearchChange("");
    navigate(`/clients/${client.id}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      <div className="relative w-96" ref={containerRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-10 bg-muted/50 border-0"
          value={currentSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => currentSearch.length >= 2 && setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {enableClientSearch && isDropdownOpen && (
          <ClientAutocompleteDropdown
            query={currentSearch}
            onSelect={handleClientSelect}
          />
        )}
      </div>
      <div className="flex items-center gap-4">
        <AdvisorFilter />
        <NotificationDropdown />
        <RegionSelector />
        <UserMenu
          userName={userName}
          userEmail={userEmail}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}
