import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MatchedClient {
  id: string;
  name: string; // Formatted as "Surname, I (FirstName)"
}

interface EmailClientBadgesProps {
  clients: MatchedClient[];
}

export const EmailClientBadges = ({ clients }: EmailClientBadgesProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (clients.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  const firstClient = clients[0];
  const remainingCount = clients.length - 1;

  return (
    <div className="flex items-center gap-1">
      <Link
        to={`/clients/${firstClient.id}`}
        className="text-[hsl(180,70%,45%)] hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {firstClient.name}
      </Link>
      
      {remainingCount > 0 && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="text-[hsl(180,70%,45%)] hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              + {remainingCount} more
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                All linked clients:
              </p>
              {clients.map((client) => (
                <Link
                  key={client.id}
                  to={`/clients/${client.id}`}
                  className="block text-sm text-[hsl(180,70%,45%)] hover:underline py-1"
                  onClick={() => setPopoverOpen(false)}
                >
                  {client.name}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
