import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientAvatarBadgeProps {
  id: string;
  initials: string;
  name: string;
  hasGreenDot?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const ClientAvatarBadge = ({
  id,
  initials,
  name,
  hasGreenDot = true,
  onRemove,
  className,
}: ClientAvatarBadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 bg-muted/50 border border-border rounded-md px-2 py-1",
        className
      )}
    >
      {/* Avatar with initials */}
      <div className="relative">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
          {initials}
        </div>
        {hasGreenDot && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Name */}
      <span className="text-sm text-foreground">{name}</span>

      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// Helper function to format client name as "Surname, I (FirstName)"
export const formatClientName = (
  firstName: string,
  surname: string,
  initials?: string | null
): string => {
  const initial = initials || firstName.charAt(0);
  return `${surname}, ${initial} (${firstName})`;
};

// Helper to get initials from name
export const getClientInitials = (firstName: string, surname: string): string => {
  return `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
};
