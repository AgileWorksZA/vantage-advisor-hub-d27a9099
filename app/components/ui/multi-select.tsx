import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export interface EnrichedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export interface MultiSelectGroup {
  label: string;
  options: EnrichedOption[];
}

interface MultiSelectProps {
  options?: EnrichedOption[];
  groups?: MultiSelectGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  renderTriggerLabel?: (selected: string[], allOptions: EnrichedOption[]) => React.ReactNode;
}

export function MultiSelect({
  options,
  groups,
  selected,
  onChange,
  placeholder = "Select...",
  className,
  renderTriggerLabel,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const allOptions = groups
    ? groups.flatMap(g => g.options)
    : options || [];

  const triggerContent = renderTriggerLabel
    ? renderTriggerLabel(selected, allOptions)
    : selected.length === 0
      ? <span className="text-muted-foreground">{placeholder}</span>
      : selected.length === allOptions.length
        ? <span>{placeholder} (all)</span>
        : <span>{placeholder} ({selected.length})</span>;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-w-[180px] h-10", className)}
        >
          {triggerContent}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0 bg-popover z-50" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            {groups ? (
              groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          selected.includes(option.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.icon && <span className="shrink-0">{option.icon}</span>}
                      <span className="truncate flex-1">{option.label}</span>
                      {option.subtitle && (
                        <span className="ml-auto text-[10px] text-muted-foreground whitespace-nowrap">
                          {option.subtitle}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>
                {(options || []).map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selected.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate flex-1">{option.label}</span>
                    {option.subtitle && (
                      <span className="ml-auto text-[10px] text-muted-foreground whitespace-nowrap">
                        {option.subtitle}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
