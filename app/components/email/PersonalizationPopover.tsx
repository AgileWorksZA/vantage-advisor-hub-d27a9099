import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface PersonalizationPopoverProps {
  onInsert: (variable: string) => void;
}

const personalizationVariables = [
  { variable: "{{first_name}}", label: "First Name", description: "Client's first name" },
  { variable: "{{surname}}", label: "Surname", description: "Client's surname" },
  { variable: "{{preferred_name}}", label: "Preferred Name", description: "Preferred name if set" },
  { variable: "{{title}}", label: "Title", description: "Mr/Mrs/Ms/Dr" },
  { variable: "{{email}}", label: "Email", description: "Primary email" },
  { variable: "{{cell_number}}", label: "Cell Number", description: "Cell phone" },
  { variable: "{{advisor}}", label: "Advisor", description: "Assigned advisor name" },
  { variable: "{{date_of_birth}}", label: "Date of Birth", description: "Date of birth" },
  { variable: "{{age}}", label: "Age", description: "Calculated age" },
];

export const PersonalizationPopover = ({ onInsert }: PersonalizationPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1 h-8" title="Insert personalization">
          <User className="w-4 h-4" />
          Personalize
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <p className="text-xs text-muted-foreground mb-2 px-2">Insert variable at cursor</p>
        <div className="space-y-1">
          {personalizationVariables.map((item) => (
            <button
              key={item.variable}
              type="button"
              onClick={() => onInsert(item.variable)}
              className="w-full flex flex-col items-start p-2 rounded-md hover:bg-muted text-left"
            >
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
