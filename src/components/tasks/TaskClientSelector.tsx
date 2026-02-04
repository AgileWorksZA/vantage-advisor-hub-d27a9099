import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X, User, Users } from "lucide-react";
import { TaskClient } from "@/hooks/useTaskClients";

interface ClientOption {
  id: string;
  client: string; // This is the formatted name from ClientListItem
  email: string;
}

interface TaskClientSelectorProps {
  taskClients: TaskClient[];
  allClients: ClientOption[];
  onAddClient: (clientId: string, role: string) => Promise<any>;
  onRemoveClient: (taskClientId: string) => Promise<boolean>;
}

export function TaskClientSelector({
  taskClients,
  allClients,
  onAddClient,
  onRemoveClient,
}: TaskClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const linkedClientIds = new Set(taskClients.map((tc) => tc.client_id));

  const filteredClients = allClients.filter(
    (c) =>
      !linkedClientIds.has(c.id) &&
      c.client.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAddClient = async (client: ClientOption) => {
    const role = taskClients.length === 0 ? "Primary" : "Related";
    await onAddClient(client.id, role);
    setOpen(false);
    setSearchValue("");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Primary":
        return "bg-primary text-primary-foreground";
      case "CC":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Linked Clients</h3>
          <Badge variant="outline">{taskClients.length}</Badge>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <Command>
              <CommandInput
                placeholder="Search clients..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>No clients found.</CommandEmpty>
                <CommandGroup>
                  {filteredClients.slice(0, 10).map((client) => (
                    <CommandItem
                      key={client.id}
                      onSelect={() => handleAddClient(client)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{client.client}</div>
                        {client.email && (
                          <div className="text-xs text-muted-foreground">
                            {client.email}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {taskClients.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No clients linked to this task</p>
          <p className="text-sm">Add clients to track who this task relates to</p>
        </div>
      ) : (
        <div className="space-y-2">
          {taskClients.map((tc) => (
            <div
              key={tc.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{tc.client_name}</div>
                  {tc.client_email && (
                    <div className="text-sm text-muted-foreground">
                      {tc.client_email}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRoleBadgeColor(tc.role)}>{tc.role}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveClient(tc.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
