import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

interface ClientFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: { conditions: FilterCondition[] };
  onFilterChange: (filter: { conditions: FilterCondition[] }) => void;
}

const availableFields = [
  { value: "profile_type", label: "Profile Type" },
  { value: "client_type", label: "Client Type" },
  { value: "gender", label: "Gender" },
  { value: "language", label: "Language" },
  { value: "nationality", label: "Nationality" },
  { value: "advisor", label: "Advisor" },
  { value: "wealth_manager", label: "Wealth Manager" },
  { value: "rating", label: "Rating" },
  { value: "profession", label: "Profession" },
  { value: "industry", label: "Industry" },
  { value: "employer", label: "Employer" },
  { value: "tax_resident_country", label: "Tax Resident Country" },
];

const operators = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "starts_with", label: "starts with" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const profileTypes = ["Lead", "Prospect", "Client"];
const clientTypes = ["Individual", "Business", "Family"];
const genders = ["Male", "Female", "Other"];
const languages = ["English", "Afrikaans", "Zulu", "Xhosa", "Other"];

const getValueOptions = (field: string): string[] | null => {
  switch (field) {
    case "profile_type":
      return profileTypes;
    case "client_type":
      return clientTypes;
    case "gender":
      return genders;
    case "language":
      return languages;
    default:
      return null;
  }
};

export const ClientFilterDialog = ({
  open,
  onOpenChange,
  filter,
  onFilterChange,
}: ClientFilterDialogProps) => {
  const [localConditions, setLocalConditions] = useState<FilterCondition[]>([]);

  useEffect(() => {
    if (open) {
      setLocalConditions(filter.conditions.length > 0 ? [...filter.conditions] : [{ field: "", operator: "equals", value: "" }]);
    }
  }, [open, filter.conditions]);

  const addCondition = () => {
    setLocalConditions([...localConditions, { field: "", operator: "equals", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setLocalConditions(localConditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const updated = [...localConditions];
    updated[index] = { ...updated[index], ...updates };
    // Reset value if field changes
    if (updates.field) {
      updated[index].value = "";
    }
    setLocalConditions(updated);
  };

  const handleApply = () => {
    const validConditions = localConditions.filter(
      (c) => c.field && c.operator && (c.value || c.operator === "is_empty" || c.operator === "is_not_empty")
    );
    onFilterChange({ conditions: validConditions });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filter Recipients</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {localConditions.map((condition, index) => {
            const valueOptions = getValueOptions(condition.field);
            const needsValue = condition.operator !== "is_empty" && condition.operator !== "is_not_empty";

            return (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={condition.field}
                  onValueChange={(value) => updateCondition(index, { field: value })}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(index, { operator: value })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {needsValue && (
                  valueOptions ? (
                    <Select
                      value={condition.value}
                      onValueChange={(value) => updateCondition(index, { value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select value..." />
                      </SelectTrigger>
                      <SelectContent>
                        {valueOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={condition.value}
                      onChange={(e) => updateCondition(index, { value: e.target.value })}
                      placeholder="Enter value..."
                      className="flex-1"
                    />
                  )
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCondition(index)}
                  disabled={localConditions.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add condition
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
